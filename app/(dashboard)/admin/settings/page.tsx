'use client'

import * as React from 'react'
import { Settings, Bell, Shield, Database, Palette, Globe, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

export default function SettingsPage() {
  const [hasChanges, setHasChanges] = React.useState(false)
  const [settings, setSettings] = React.useState({
    hospitalName: 'مستشفى المملكة',
    hospitalNameEn: 'Kingdom Hospital',
    contactEmail: 'info@hospital.com',
    contactPhone: '920012345',
    address: 'الرياض، المملكة العربية السعودية',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    emailNotifications: true,
    pushNotifications: true,
    reportReminders: true,
    lowStaffAlerts: true,
    overCapacityAlerts: true,
    sessionTimeout: '30',
    passwordPolicy: 'strong',
    twoFactorAuth: false,
    autoBackup: true,
    backupFrequency: 'daily',
  })

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // Will save to Firebase
    console.log('Saving settings:', settings)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إعدادات النظام</h1>
          <p className="text-muted-foreground">تخصيص إعدادات النظام العامة</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 ml-2" />
            حفظ التغييرات
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>معلومات المستشفى الأساسية</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospitalName">اسم المستشفى (عربي)</Label>
              <Input
                id="hospitalName"
                value={settings.hospitalName}
                onChange={(e) => updateSetting('hospitalName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hospitalNameEn">اسم المستشفى (إنجليزي)</Label>
              <Input
                id="hospitalNameEn"
                value={settings.hospitalNameEn}
                onChange={(e) => updateSetting('hospitalNameEn', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSetting('contactEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">رقم الهاتف</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => updateSetting('contactPhone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => updateSetting('address', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>الإشعارات</CardTitle>
                <CardDescription>إعدادات التنبيهات والإشعارات</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إشعارات البريد الإلكتروني</Label>
                <p className="text-xs text-muted-foreground">
                  استلام التنبيهات عبر البريد
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>الإشعارات الفورية</Label>
                <p className="text-xs text-muted-foreground">
                  إشعارات المتصفح الفورية
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تذكير التقارير</Label>
                <p className="text-xs text-muted-foreground">
                  تذكير بتقارير الشفتات
                </p>
              </div>
              <Switch
                checked={settings.reportReminders}
                onCheckedChange={(checked) => updateSetting('reportReminders', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تنبيه نقص الكادر</Label>
                <p className="text-xs text-muted-foreground">
                  تنبيه عند انخفاض عدد الممرضين
                </p>
              </div>
              <Switch
                checked={settings.lowStaffAlerts}
                onCheckedChange={(checked) => updateSetting('lowStaffAlerts', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تنبيه تجاوز السعة</Label>
                <p className="text-xs text-muted-foreground">
                  تنبيه عند تجاوز سعة القسم
                </p>
              </div>
              <Switch
                checked={settings.overCapacityAlerts}
                onCheckedChange={(checked) => updateSetting('overCapacityAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>اللغة والمنطقة</CardTitle>
                <CardDescription>إعدادات اللغة والتوقيت</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اللغة الافتراضية</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المنطقة الزمنية</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => updateSetting('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Riyadh">الرياض (UTC+3)</SelectItem>
                  <SelectItem value="Asia/Dubai">دبي (UTC+4)</SelectItem>
                  <SelectItem value="Africa/Cairo">القاهرة (UTC+2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>الأمان</CardTitle>
                <CardDescription>إعدادات الحماية والأمان</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>مهلة انتهاء الجلسة (دقيقة)</Label>
              <Select
                value={settings.sessionTimeout}
                onValueChange={(value) => updateSetting('sessionTimeout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 دقيقة</SelectItem>
                  <SelectItem value="30">30 دقيقة</SelectItem>
                  <SelectItem value="60">ساعة</SelectItem>
                  <SelectItem value="120">ساعتان</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>سياسة كلمة المرور</Label>
              <Select
                value={settings.passwordPolicy}
                onValueChange={(value) => updateSetting('passwordPolicy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">أساسي (6 أحرف)</SelectItem>
                  <SelectItem value="medium">متوسط (8 أحرف + رقم)</SelectItem>
                  <SelectItem value="strong">قوي (10 أحرف + رموز)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>التحقق بخطوتين</Label>
                <p className="text-xs text-muted-foreground">
                  طلب رمز إضافي عند تسجيل الدخول
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>النسخ الاحتياطي</CardTitle>
                <CardDescription>إعدادات حفظ البيانات</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>النسخ الاحتياطي التلقائي</Label>
                  <p className="text-xs text-muted-foreground">
                    حفظ نسخة احتياطية تلقائياً
                  </p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>تكرار النسخ الاحتياطي</Label>
                <Select
                  value={settings.backupFrequency}
                  onValueChange={(value) => updateSetting('backupFrequency', value)}
                  disabled={!settings.autoBackup}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">كل ساعة</SelectItem>
                    <SelectItem value="daily">يومياً</SelectItem>
                    <SelectItem value="weekly">أسبوعياً</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
