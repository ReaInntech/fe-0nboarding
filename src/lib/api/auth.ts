import { apiFetch } from './config';
import { UserProfile } from './types';

export async function getProfile(token: string) {
  return apiFetch<UserProfile>('/me', { token });
}

export async function getRoles(token: string) {
  return apiFetch<any[]>('/me/roles', { token });
}

export async function registerUser(token: string, userData: { email: string; full_name: string }) {
  return apiFetch<UserProfile>('/register', {
    method: 'POST',
    token,
    body: JSON.stringify(userData),
    headers: { 'Content-Type': 'application/json' },
  });
}
