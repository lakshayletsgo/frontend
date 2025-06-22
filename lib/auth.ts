import type { NextRequest } from "next/server"
import type { User } from "./api"

// Define the base URL for your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export type AuthUser = User

const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt_token');
  }
  return null;
}

const setStoredToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', token);
  }
}

const removeStoredToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt_token');
  }
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Invalid email or password')
  }

  if (data.token) {
    setStoredToken(data.token);
  }

  return data.user
}

export async function register(userData: { email: string; password: string; name: string }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Registration failed' }))
      throw new Error(data.error || 'Registration failed')
    }

    const data = await response.json()
    if (data.token) {
      setStoredToken(data.token);
    }
    return data.user
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export async function logout() {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Logout failed')
    }

    removeStoredToken();
    return true
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
}
