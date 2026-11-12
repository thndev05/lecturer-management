import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, request } from './api';
import type { Admin } from './data';

const key = 'lecturer-access-token';
const storage = {
  get: async () =>
    Platform.OS === 'web' ? sessionStorage.getItem(key) : SecureStore.getItemAsync(key),
  set: async (token: string) => {
    if (Platform.OS === 'web') sessionStorage.setItem(key, token);
    else await SecureStore.setItemAsync(key, token);
  },
  remove: async () => {
    if (Platform.OS === 'web') sessionStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  },
};
type Auth = {
  admin: Admin | null;
  token: string | null;
  ready: boolean;
  error: unknown;
  retry: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  api: <T>(path: string, init?: RequestInit) => Promise<T>;
};
const Context = createContext<Auth>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
  const cache = useQueryClient();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const currentToken = useRef<string | null>(null);
  const logout = useCallback(async () => {
    currentToken.current = null;
    setToken(null);
    setAdmin(null);
    cache.clear();
    try {
      await storage.remove();
    } catch {
      throw new Error('storage');
    }
  }, [cache]);
  const restore = useCallback(
    async (saved: string | null) => {
      setError(null);
      try {
        if (saved) {
          const profile = await request<Admin>('/auth/me', saved);
          currentToken.current = saved;
          setToken(saved);
          setAdmin(profile);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          try {
            await logout();
          } catch (storageError) {
            setError(storageError);
          }
        } else setError(err);
      } finally {
        setReady(true);
      }
    },
    [logout],
  );
  const load = useCallback(() => {
    void storage
      .get()
      .then(restore)
      .catch((err) => {
        setError(err);
        setReady(true);
      });
  }, [restore]);
  useEffect(() => {
    load();
  }, [load]);
  const login = async (email: string, password: string) => {
    const result = await request<{ accessToken: string }>('/auth/login', null, {
      method: 'POST',
      body: JSON.stringify({ Email: email.trim(), Password: password }),
    });
    const profile = await request<Admin>('/auth/me', result.accessToken);
    try {
      await storage.set(result.accessToken);
    } catch {
      throw new Error('storage');
    }
    cache.clear();
    currentToken.current = result.accessToken;
    setToken(result.accessToken);
    setAdmin(profile);
    setError(null);
  };
  async function api<T>(path: string, init?: RequestInit) {
    const usedToken = token;
    try {
      return await request<T>(path, usedToken, init);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && currentToken.current === usedToken)
        await logout();
      throw err;
    }
  }
  return (
    <Context.Provider
      value={{
        admin,
        token,
        ready,
        error,
        retry: () => {
          setReady(false);
          load();
        },
        login,
        logout,
        api,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
