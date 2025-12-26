'use client'

import Layout from "@/components/kokonutui/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useState } from "react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(false)

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-cyan-500">Appearance</CardTitle>
              <CardDescription>Customize how the application looks and feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-cyan-500">Notifications</CardTitle>
              <CardDescription>Configure your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about job updates and refunds.</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-cyan-500">Data & Privacy</CardTitle>
              <CardDescription>Manage your data and privacy settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto-save Changes</Label>
                  <p className="text-sm text-muted-foreground">Automatically save changes as you make them.</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-cyan-500">Account</CardTitle>
              <CardDescription>Manage your account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Account Status</Label>
                  <p className="text-sm text-muted-foreground">Your account is active and in good standing.</p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
