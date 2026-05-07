'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { User, UserRole, RolePermissions, ROLE_PERMISSIONS } from '@/types'
import { isFirebaseConfigured, getFirebaseAuth } from '@/lib/firebase'
import {
  upsertPendingUser,
  getPendingUserById,
  type PendingUser,
} from '@/lib/pending-users'

interface AuthContextType {
  user: User | null
  pendingEntry: PendingUser | null
  isAuthenticated: boolean
  permissions: RolePermissions | null
  isLoading: boolean
  login: (user: User) => void
  loginWithGoogle: () => Promise<void>
  loginWithEmployeeCode: (
    employeeId: string,
    password: string,
  ) => Promise<{ success: boolean; mustChangePassword?: boolean; error?: string }>
  changePassword: (employeeId: string, newPassword: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: keyof RolePermissions) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

/* ─── Demo employees ─────────────────────────────────────── */
export const DEMO_EMPLOYEES: Array<{
  id: string
  employeeCode: string
  password: string
  name: string
  nameAr: string
  email: string
  role: UserRole
  department: string
}> = [
  { id: '1', employeeCode: 'EMP001', password: 'EMP001', name: 'Ahmed Mohammed',  nameAr: 'أحمد محمد',    email: 'admin@hospital.com',   role: 'admin',      department: 'الإدارة' },
  { id: '2', employeeCode: 'EMP002', password: 'EMP002', name: 'Sara Ahmed',      nameAr: 'سارة أحمد',    email: 'sara@hospital.com',    role: 'head_nurse', department: 'العناية المركزة' },
  { id: '3', employeeCode: 'EMP003', password: 'EMP003', name: 'Mohammed Ali',    nameAr: 'محمد علي',     email: 'mali@hospital.com',    role: 'supervisor', department: 'الطوارئ' },
  { id: '4', employeeCode: 'EMP004', password: 'EMP004', name: 'Fatima Hassan',   nameAr: 'فاطمة حسن',   email: 'fhassan@hospital.com', role: 'staff',      department: 'الباطنية' },
]

/* ─── localStorage keys ─── */
const LS_USER        = 'pronurse_user'
const LS_PWD_PREFIX  = 'pronurse_pwd_'
const LS_MUST_CHANGE = 'pronurse_must_change_'
const LS_PENDING_ID  = 'pronurse_pending_id'   // Google UID waiting approval

/* ─────────────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null)
  const [pendingEntry, setPendingEntry] = useState<PendingUser | null>(null)
  const [isLoading, setIsLoading]     = useState(true)
  const router = useRouter()

  /* ── Restore session on mount ── */
  useEffect(() => {
    // Restore approved user
    const stored = localStorage.getItem(LS_USER)
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }

    // Restore pending Google entry
    const pid = localStorage.getItem(LS_PENDING_ID)
    if (pid) {
      const entry = getPendingUserById(pid)
      if (entry) {
        if (entry.status === 'approved' && entry.role) {
          // Admin has approved while user was waiting — auto-login
          const approvedUser: User = {
            id: entry.id,
            name: entry.name,
            nameAr: entry.name,
            email: entry.email,
            role: entry.role,
            department: entry.department || 'عام',
          }
          setUser(approvedUser)
          localStorage.setItem(LS_USER, JSON.stringify(approvedUser))
          localStorage.removeItem(LS_PENDING_ID)
        } else if (entry.status === 'rejected') {
          localStorage.removeItem(LS_PENDING_ID)
        } else {
          setPendingEntry(entry)
        }
      }
    }

    if (isFirebaseConfigured()) {
      const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (_fbUser: FirebaseUser | null) => {
        setIsLoading(false)
      })
      return () => unsubscribe()
    } else {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const permissions = user ? ROLE_PERMISSIONS[user.role] : null

  const login = useCallback((userData: User) => {
    setUser(userData)
    localStorage.setItem(LS_USER, JSON.stringify(userData))
  }, [])

  /* ─── Google Sign-In ── */
  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      // Demo fallback: treat as admin (no approval needed in demo mode)
      const demo = DEMO_EMPLOYEES[0]
      const u: User = { id: demo.id, name: demo.name, nameAr: demo.nameAr, email: demo.email, role: demo.role, department: demo.department }
      setUser(u)
      localStorage.setItem(LS_USER, JSON.stringify(u))
      router.push('/dashboard')
      return
    }

    const provider = new GoogleAuthProvider()
    const result   = await signInWithPopup(getFirebaseAuth(), provider)
    const fbUser   = result.user

    // Check if already approved
    const existing = getPendingUserById(fbUser.uid)
    if (existing?.status === 'approved' && existing.role) {
      const u: User = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email || 'User',
        nameAr: fbUser.displayName || fbUser.email || 'مستخدم',
        email: fbUser.email || '',
        role: existing.role,
        department: existing.department || 'عام',
      }
      setUser(u)
      localStorage.setItem(LS_USER, JSON.stringify(u))
      router.push('/dashboard')
      return
    }

    if (existing?.status === 'rejected') {
      await signOut(getFirebaseAuth())
      throw new Error('تم رفض طلبك من قِبَل المدير')
    }

    // First time or still pending → register & redirect to waiting page
    const entry = upsertPendingUser({
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email || 'User',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || undefined,
    })

    localStorage.setItem(LS_PENDING_ID, fbUser.uid)
    setPendingEntry(entry)
    router.push('/pending-approval')
  }, [router])

  /* ─── Employee Code Login ── */
  const loginWithEmployeeCode = useCallback(async (
    employeeId: string,
    password: string,
  ): Promise<{ success: boolean; mustChangePassword?: boolean; error?: string }> => {
    const emp = DEMO_EMPLOYEES.find(
      (e) => e.employeeCode.toLowerCase() === employeeId.toLowerCase()
    )
    if (!emp) return { success: false, error: 'كود الموظف غير موجود' }

    const storedPwd = localStorage.getItem(LS_PWD_PREFIX + emp.id) || emp.employeeCode
    if (password !== storedPwd) return { success: false, error: 'كلمة المرور غير صحيحة' }

    const mustChange = !localStorage.getItem(LS_PWD_PREFIX + emp.id)
    const u: User = { id: emp.id, name: emp.name, nameAr: emp.nameAr, email: emp.email, role: emp.role, department: emp.department }
    setUser(u)
    localStorage.setItem(LS_USER, JSON.stringify(u))
    if (mustChange) localStorage.setItem(LS_MUST_CHANGE + emp.id, '1')

    return { success: true, mustChangePassword: mustChange }
  }, [])

  /* ─── Change Password ── */
  const changePassword = useCallback(async (employeeId: string, newPassword: string) => {
    const emp = DEMO_EMPLOYEES.find((e) => e.id === employeeId)
    if (!emp) return
    localStorage.setItem(LS_PWD_PREFIX + emp.id, newPassword)
    localStorage.removeItem(LS_MUST_CHANGE + emp.id)
  }, [])

  /* ─── Logout ── */
  const logout = useCallback(() => {
    setUser(null)
    setPendingEntry(null)
    localStorage.removeItem(LS_USER)
    localStorage.removeItem(LS_PENDING_ID)
    if (isFirebaseConfigured()) signOut(getFirebaseAuth()).catch(() => {})
    router.push('/login')
  }, [router])

  const hasPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      if (!permissions) return false
      return permissions[permission]
    },
    [permissions]
  )

  return (
    <AuthContext.Provider value={{
      user, pendingEntry, isAuthenticated: !!user,
      permissions, isLoading,
      login, loginWithGoogle, loginWithEmployeeCode, changePassword, logout, hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function useRole(): UserRole | null {
  const { user } = useAuth()
  return user?.role || null
}

export function RequirePermission({
  permission, children, fallback = null,
}: {
  permission: keyof RolePermissions
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasPermission } = useAuth()
  if (!hasPermission(permission)) return fallback
  return <>{children}</>
}
