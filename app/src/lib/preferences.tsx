import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import i18n from './i18n';

export const light = {
  bg: '#F7F9FC',
  card: '#FFFFFF',
  text: '#172033',
  muted: '#69758B',
  border: '#E5EAF2',
  primary: '#4F46E5',
  soft: '#EEEDFF',
  danger: '#C53048',
  success: '#187A61',
};
const dark = {
  bg: '#101624',
  card: '#192234',
  text: '#F1F4FC',
  muted: '#A7B3C9',
  border: '#303D54',
  primary: '#A49EFF',
  soft: '#2C2852',
  danger: '#FF91A3',
  success: '#6ED6B5',
};
type Mode = 'system' | 'light' | 'dark';
const Context = createContext({
  colors: light,
  isDark: false,
  mode: 'system' as Mode,
  language: 'vi',
  ready: false,
  storageError: false,
  setLanguage: async (_value: string) => {},
  setMode: async (_value: Mode) => {},
});
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, updateMode] = useState<Mode>('system');
  const [language, updateLanguage] = useState('vi');
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    void AsyncStorage.getItem('lecturer-preferences')
      .then(async (raw) => {
        if (raw) {
          const saved = JSON.parse(raw);
          if (['system', 'light', 'dark'].includes(saved.mode)) updateMode(saved.mode);
          if (['vi', 'en'].includes(saved.language)) {
            updateLanguage(saved.language);
            await i18n.changeLanguage(saved.language);
          }
        }
      })
      .catch(() => setStorageError(true))
      .finally(() => setReady(true));
  }, []);
  async function persist(nextMode: Mode, nextLanguage: string) {
    try {
      await AsyncStorage.setItem(
        'lecturer-preferences',
        JSON.stringify({ mode: nextMode, language: nextLanguage }),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  const isDark = mode === 'dark' || (mode === 'system' && system === 'dark');
  return (
    <Context.Provider
      value={{
        colors: isDark ? dark : light,
        isDark,
        mode,
        language,
        ready,
        storageError,
        setMode: async (value) => {
          updateMode(value);
          await persist(value, language);
        },
        setLanguage: async (value) => {
          updateLanguage(value);
          await i18n.changeLanguage(value);
          await persist(mode, value);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
