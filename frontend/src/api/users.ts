import type { User, UserFormData } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body = data as { message?: string | string[] };
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? `Request failed with status ${response.status}`);
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`);
  return handleResponse<User[]>(response);
}

export async function getUser(id: number): Promise<User> {
  const response = await fetch(`${API_URL}/users/${id}`);
  return handleResponse<User>(response);
}

export async function createUser(data: UserFormData): Promise<User> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<User>(response);
}

export async function updateUser(
  id: number,
  data: Partial<UserFormData>,
): Promise<User> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<User>(response);
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}
