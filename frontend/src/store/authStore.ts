import { create } from 'zustand'

interface User {
  id: number
  email: string
  name: string
  createdAt: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('tutorgpt_token'),
  user: (() => {
    try {
      const raw = localStorage.getItem('tutorgpt_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })(),
  isAuthenticated: !!localStorage.getItem('tutorgpt_token'),

  login: (token, user) => {
    localStorage.setItem('tutorgpt_token', token)
    localStorage.setItem('tutorgpt_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('tutorgpt_token')
    localStorage.removeItem('tutorgpt_user')
    set({ token: null, user: null, isAuthenticated: false })
  },

  updateUser: (user) => {
    localStorage.setItem('tutorgpt_user', JSON.stringify(user))
    set({ user })
  },
}))
