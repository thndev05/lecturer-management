import { useQuery } from '@tanstack/react-query';
import { useAuth } from './auth';
import { ApiError } from './api';
import type { Lecturer } from './data';
export function useLecturers() {
  const { api, token } = useAuth();
  return useQuery({
    queryKey: ['lecturers', token],
    queryFn: () => api<Lecturer[]>('/giang-vien'),
    enabled: !!token,
    retry: (count, error) => !(error instanceof ApiError && error.status === 401) && count < 1,
  });
}
