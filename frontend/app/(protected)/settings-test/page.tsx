"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from 'react'
import { settingsService } from '@/app/services/settingsService'
import { useToast } from "@/hooks/use-toast"
import { Loader2, Settings2, ArrowLeft, Save, RefreshCw } from "lucide-react"

export default function SettingsTestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const userId = 1 // Hardcoded for testing

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [theme, setTheme] = useState<string>("LIGHT")
  const [language, setLanguage] = useState<string>("VI")
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true)

  // Load settings from backend
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await settingsService.getSettings(userId)
      
      if (data.theme) setTheme(data.theme)
      if (data.language) setLanguage(data.language)
      if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled)
      
      console.log('✅ Settings loaded:', data)
      toast({
        title: "Settings Loaded",
        description: "Your settings have been loaded successfully.",
      })
    } catch (error) {
      console.error('❌ Failed to load settings:', error)
      toast({
        title: "Error",
        description: "Failed to load settings. Using defaults.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save settings to backend
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      
      const settingsData = {
        theme,
        language,
        notificationsEnabled,
      }
      
      console.log('📤 Saving settings:', settingsData)
      
      const result = await settingsService.updateSettings(userId, settingsData)
      
      console.log('✅ Settings saved:', result)
      
      toast({
        title: "✅ Success",
        description: "Settings saved successfully!",
      })
    } catch (error) {
      console.error('❌ Failed to save settings:', error)
      toast({
        title: "❌ Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Test individual API calls
  const testThemeAPI = async () => {
    try {
      console.log('🧪 Testing Theme API...')
      await settingsService.updateTheme(userId, theme)
      toast({
        title: "Theme API Test",
        description: "Theme updated via PATCH endpoint",
      })
    } catch (error) {
      console.error('❌ Theme API failed:', error)
      toast({
        title: "Error",
        description: "Theme API test failed",
        variant: "destructive",
      })
    }
  }

  const testLanguageAPI = async () => {
    try {
      console.log('🧪 Testing Language API...')
      await settingsService.updateLanguage(userId, language)
      toast({
        title: "Language API Test",
        description: "Language updated via PATCH endpoint",
      })
    } catch (error) {
      console.error('❌ Language API failed:', error)
      toast({
        title: "Error",
        description: "Language API test failed",
        variant: "destructive",
      })
    }
  }

  const testNotificationsAPI = async () => {
    try {
      console.log('🧪 Testing Notifications API...')
      await settingsService.toggleNotifications(userId, notificationsEnabled)
      toast({
        title: "Notifications API Test",
        description: "Notifications updated via PATCH endpoint",
      })
    } catch (error) {
      console.error('❌ Notifications API failed:', error)
      toast({
        title: "Error",
        description: "Notifications API test failed",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mb-4 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <Settings2 className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Settings Test Page</h1>
              <p className="text-gray-600">Test and verify your settings functionality</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Settings Form */}
          <div className="space-y-6">
            {/* Main Settings Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  User Settings
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Configure your preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Theme Setting */}
                <div className="space-y-3">
                  <Label htmlFor="theme" className="text-base font-semibold flex items-center gap-2">
                    🎨 Theme
                  </Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme" className="w-full h-12 text-base">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LIGHT">☀️ Light</SelectItem>
                      <SelectItem value="DARK">🌙 Dark</SelectItem>
                      <SelectItem value="AUTO">🔄 Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Current: <span className="font-semibold">{theme}</span>
                  </p>
                </div>

                {/* Language Setting */}
                <div className="space-y-3">
                  <Label htmlFor="language" className="text-base font-semibold flex items-center gap-2">
                    🌍 Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="w-full h-12 text-base">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EN">🇬🇧 English</SelectItem>
                      <SelectItem value="VI">🇻🇳 Tiếng Việt</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Current: <span className="font-semibold">{language === 'EN' ? 'English' : 'Tiếng Việt'}</span>
                  </p>
                </div>

                {/* Notifications Setting */}
                <div className="space-y-3">
                  <Label htmlFor="notifications" className="text-base font-semibold flex items-center gap-2">
                    🔔 Notifications
                  </Label>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium">Enable Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        {notificationsEnabled ? 'Notifications are ON' : 'Notifications are OFF'}
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleSaveChanges} 
                    disabled={isSaving}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save All Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Test Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  🧪 API Testing
                </CardTitle>
                <CardDescription className="text-green-100">
                  Test individual API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Button 
                  onClick={testThemeAPI}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="mr-2">🎨</span>
                  Test Theme API (PATCH)
                </Button>
                
                <Button 
                  onClick={testLanguageAPI}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="mr-2">🌍</span>
                  Test Language API (PATCH)
                </Button>
                
                <Button 
                  onClick={testNotificationsAPI}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <span className="mr-2">🔔</span>
                  Test Notifications API (PATCH)
                </Button>

                <Button 
                  onClick={loadSettings}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Settings (GET)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Info & Status */}
          <div className="space-y-6">
            {/* Current Settings Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle>📊 Current Configuration</CardTitle>
                <CardDescription className="text-purple-100">
                  Real-time settings display
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <dl className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
                    <dd className="font-bold text-lg">{userId}</dd>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <dt className="text-sm font-medium text-muted-foreground">Theme</dt>
                    <dd className="font-bold text-lg">{theme}</dd>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <dt className="text-sm font-medium text-muted-foreground">Language</dt>
                    <dd className="font-bold text-lg">{language === 'EN' ? 'English' : 'Tiếng Việt'}</dd>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <dt className="text-sm font-medium text-muted-foreground">Notifications</dt>
                    <dd className="font-bold text-lg">
                      {notificationsEnabled ? (
                        <span className="text-green-600">✅ Enabled</span>
                      ) : (
                        <span className="text-red-600">❌ Disabled</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Testing Instructions */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle>📝 Testing Instructions</CardTitle>
                <CardDescription className="text-orange-100">
                  How to test this page
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>Change one or more settings using the dropdowns/switch</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>Click "Save All Changes" button</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>Check for success toast notification</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">4.</span>
                    <span>Verify "Current Configuration" updates</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">5.</span>
                    <span>Refresh page (F5) to verify persistence</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">6.</span>
                    <span>Use API Test buttons to test individual endpoints</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">7.</span>
                    <span>Check browser Console (F12) for logs</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">8.</span>
                    <span>Check Network tab for API requests</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* API Endpoints Reference */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle>🔗 API Endpoints</CardTitle>
                <CardDescription className="text-cyan-100">
                  Available endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <span className="text-green-600 font-bold">GET</span> /api/users/1/settings
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <span className="text-blue-600 font-bold">PUT</span> /api/users/1/settings
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                    <span className="text-purple-600 font-bold">PATCH</span> /api/users/1/settings/theme
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                    <span className="text-purple-600 font-bold">PATCH</span> /api/users/1/settings/language
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                    <span className="text-purple-600 font-bold">PATCH</span> /api/users/1/settings/notifications
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

