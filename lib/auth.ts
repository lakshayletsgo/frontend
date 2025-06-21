import type { NextRequest } from "next/server"
import type { User } from "./api"

// Define the base URL for your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export type AuthUser = User

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
    return data.user
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Logout failed')
    }

    // Clear any client-side state or cookies if needed
    return true
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
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
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
