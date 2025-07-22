'use client'

import { useEffect, useState } from 'react'
import { clientAccount } from '@/lib/appwrite-client'
import { Models } from 'appwrite'

interface AppwriteUser extends Models.User<Models.Preferences> {}

export function useAppwriteAuth() {
  const [user, setUser] = useState<AppwriteUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const currentUser = await clientAccount.get()
        setUser(currentUser)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await clientAccount.createEmailPasswordSession(email, password)
      const user = await clientAccount.get()
      setUser(user)
      return { success: true }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const logout = async () => {
    try {
      await clientAccount.deleteSession('current')
      setUser(null)
      return { success: true }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      await clientAccount.create('unique()', email, password, name)
      return await login(email, password)
    } catch (error: any) {
      return { error: error.message }
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  }
}
