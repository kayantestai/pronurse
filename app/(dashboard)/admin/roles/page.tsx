'use client'

import * as React from 'react'
import { Shield, Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ROLE_PERMISSIONS, type UserRole, type RolePermissions } from '@/types'

const roleLabels: Record<UserRole, string> = {
  admin: 'مدير النظام',
  head_nurse: 'رئيس التمريض',
  supervisor: 'مشرف',
  staff: 'موظف',
}

const permissionLabels: Record<keyof RolePermissions, { label: string; description: string }> = {
  canViewDashboard: { label: 'عرض لوحة التحكم', description: 'الوصول إلى لوحة التحكم الرئيسية' },
  canCreateReports: { label: 'إنشاء التقارير', description: 'إنشاء تقارير المناوبات' },
  canApproveReports: { label: 'اعتماد التقارير', description: 'اعتماد ومراجعة التقارير' },
  canManageStaff: { label: 'إدارة الموظفين', description: 'إضافة وتعديل بيانات الموظفين' },
  canManageDepartments: { label: 'إدارة الأقسام', description: 'إدارة أقسام المستشفى' },
  canViewAnalytics: { label: 'عرض التحليلات', description: 'الوصول إلى التقارير التحليلية' },
  canManageUsers: { label: 'إدارة المستخدمين', description: 'إدارة حسابات المستخدمين' },
  canManageRoles: { label: 'إدارة الصلاحيات', description: 'تعديل صلاحيات الأدوار' },
  canViewAuditLogs: { label: 'عرض سجل العمليات', description: 'الوصول إلى سجل العمليات' },
  canExportData: { label: 'تصدير البيانات', description: 'تصدير البيانات والتقارير' },
}

export default function RolesPage() {
  const [permissions, setPermissions] = React.useState(ROLE_PERMISSIONS)
  const [hasChanges, setHasChanges] = React.useState(false)

  const togglePermission = (role: UserRole, permission: keyof RolePermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission],
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // Will save to Firebase
    console.log('Saving permissions:', permissions)
    setHasChanges(false)
  }

  const handleReset = () => {
    setPermissions(ROLE_PERMISSIONS)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الصلاحيات</h1>
          <p className="text-muted-foreground">تحكم في صلاحيات كل دور</p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              إلغاء التغييرات
            </Button>
            <Button onClick={handleSave}>حفظ التغييرات</Button>
          </div>
        )}
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(Object.keys(roleLabels) as UserRole[]).map((role) => (
          <Card key={role}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{roleLabels[role]}</CardTitle>
                  <CardDescription>
                    {role === 'admin' && 'صلاحيات كاملة على النظام'}
                    {role === 'head_nurse' && 'إدارة التمريض والتقارير'}
                    {role === 'supervisor' && 'إشراف على الشفتات'}
                    {role === 'staff' && 'صلاحيات أساسية'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(permissionLabels) as (keyof RolePermissions)[]).map(
                (permission, index) => (
                  <React.Fragment key={permission}>
                    {index > 0 && <Separator />}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">
                          {permissionLabels[permission].label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {permissionLabels[permission].description}
                        </p>
                      </div>
                      <Switch
                        checked={permissions[role][permission]}
                        onCheckedChange={() => togglePermission(role, permission)}
                        disabled={role === 'admin'} // Admin always has all permissions
                      />
                    </div>
                  </React.Fragment>
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>نظرة عامة على الصلاحيات</CardTitle>
          <CardDescription>مقارنة الصلاحيات بين الأدوار المختلفة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-semibold text-sm">الصلاحية</th>
                  {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                    <th key={role} className="text-center py-3 px-4 font-semibold text-sm">
                      {roleLabels[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(permissionLabels) as (keyof RolePermissions)[]).map(
                  (permission) => (
                    <tr key={permission} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium text-sm">
                        {permissionLabels[permission].label}
                      </td>
                      {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                        <td key={role} className="py-3 px-4 text-center">
                          {permissions[role][permission] ? (
                            <div className="flex justify-center">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                                <Check className="h-4 w-4 text-success" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                <X className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
