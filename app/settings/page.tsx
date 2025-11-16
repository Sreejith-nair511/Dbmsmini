"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Palette, Clock, Shield, Download, Trash2, Bot } from "lucide-react"
import { useApp } from "@/components/providers"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { sqlCommands } from "@/lib/db"
import Link from "next/link"

export default function SettingsPage() {
  const { theme, setTheme, user, setUser, timerSettings, setTimerSettings } = useApp()
  const [selectedMode, setSelectedMode] = useState(theme.mode)
  const { toast } = useToast()
  
  // Local state for form values
  const [workDuration, setWorkDuration] = useState(timerSettings.workDuration)
  const [breakDuration, setBreakDuration] = useState(timerSettings.breakDuration)
  const [longBreakDuration, setLongBreakDuration] = useState(timerSettings.longBreakDuration)
  const [autoStartBreaks, setAutoStartBreaks] = useState(timerSettings.autoStartBreaks)
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [bio, setBio] = useState("")

  // Initialize form values when user data changes
  useEffect(() => {
    setName(user?.name || "")
    setEmail(user?.email || "")
    // Load bio from users table
    const users = sqlCommands.select("users")
    if (users.length > 0 && users[0].bio) {
      setBio(users[0].bio)
    }
  }, [user])

  // Save profile settings
  const saveProfileSettings = () => {
    try {
      // Update user in context
      setUser({
        ...user,
        name: name,
        email: email,
        isOnboarded: user?.isOnboarded || true
      } as { name: string; email: string; isOnboarded: boolean })
      
      // Update user in database
      const users = sqlCommands.select("users")
      if (users.length > 0) {
        sqlCommands.update(
          "users",
          (u: any) => u.id === users[0].id,
          { name: name, email: email, bio: bio }
        )
      } else {
        sqlCommands.insert("users", { 
          id: 1, 
          name: name, 
          email: email, 
          bio: bio,
          isOnboarded: true 
        })
      }
      
      toast({
        title: "Profile Saved",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      })
    }
  }

  // Save timer settings
  const saveTimerSettings = () => {
    setTimerSettings({
      workDuration: workDuration,
      breakDuration: breakDuration,
      longBreakDuration: longBreakDuration,
      autoStartBreaks: autoStartBreaks,
    })
    
    toast({
      title: "Settings Saved",
      description: "Your timer settings have been updated successfully.",
    })
  }

  // Export data to CSV
  const exportData = () => {
    try {
      // Get all data
      const allData = sqlCommands.getAllData()
      
      // Convert to CSV format
      let csvContent = "data:text/csv;charset=utf-8,"
      
      // Add headers for each table
      Object.keys(allData).forEach(tableName => {
        csvContent += `\n${tableName.toUpperCase()} TABLE\n`
        
        if (allData[tableName].length > 0) {
          // Add column headers
          const headers = Object.keys(allData[tableName][0]).join(",")
          csvContent += headers + "\n"
          
          // Add data rows
          allData[tableName].forEach((row: any) => {
            const values = Object.values(row).map(value => 
              typeof value === "string" ? `"${value}"` : value
            ).join(",")
            csvContent += values + "\n"
          })
        } else {
          csvContent += "No data\n"
        }
        
        csvContent += "\n"
      })
      
      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "study_mate_data_export.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Success",
        description: "Data exported to CSV successfully"
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      })
    }
  }

  // Show privacy information
  const showPrivacyInfo = () => {
    toast({
      title: "Data Privacy Information",
      description: "All user data is stored locally in your browser and is never sent to any server. You can export or delete your data at any time."
    })
  }

  // Delete account
  const deleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.")) {
      try {
        // Clear all data
        sqlCommands.clear()
        
        toast({
          title: "Account Deleted",
          description: "Your account and all associated data have been permanently deleted."
        })
        
        // Refresh the page to reset the app
        window.location.reload()
      } catch (error) {
        console.error("Error deleting account:", error)
        toast({
          title: "Error",
          description: "Failed to delete account",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="glass-card p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Settings</h1>
        <p className="text-gray-300 text-sm md:text-base">Customize your StudyMate experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Profile Settings */}
        <Card className="glass-card border-0">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white text-sm md:text-base">
                Name
              </Label>
              <Input 
                id="username" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="glass-card border-white/20 text-white" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm md:text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-card border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white text-sm md:text-base">
                Bio
              </Label>
              <Input
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="glass-card border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-sm md:text-base"
              onClick={saveProfileSettings}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-card border-0">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm md:text-base">Study Reminders</p>
                <p className="text-gray-400 text-xs md:text-sm">Get notified when it's time to study</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm md:text-base">Goal Deadlines</p>
                <p className="text-gray-400 text-xs md:text-sm">Reminders for upcoming deadlines</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm md:text-base">Achievement Alerts</p>
                <p className="text-gray-400 text-xs md:text-sm">Celebrate your accomplishments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm md:text-base">Weekly Reports</p>
                <p className="text-gray-400 text-xs md:text-sm">Summary of your weekly progress</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Timer Settings */}
        <Card className="glass-card border-0">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              Pomodoro Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="space-y-2">
              <Label htmlFor="work-duration" className="text-white text-sm md:text-base">
                Work Duration (minutes)
              </Label>
              <Input
                id="work-duration"
                type="number"
                value={workDuration / 60}
                onChange={(e) => setWorkDuration(parseInt(e.target.value) * 60 || 0)}
                min="1"
                max="60"
                className="glass-card border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-duration" className="text-white text-sm md:text-base">
                Short Break (minutes)
              </Label>
              <Input
                id="break-duration"
                type="number"
                value={breakDuration / 60}
                onChange={(e) => setBreakDuration(parseInt(e.target.value) * 60 || 0)}
                min="1"
                max="30"
                className="glass-card border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="long-break" className="text-white text-sm md:text-base">
                Long Break (minutes)
              </Label>
              <Input
                id="long-break"
                type="number"
                value={longBreakDuration / 60}
                onChange={(e) => setLongBreakDuration(parseInt(e.target.value) * 60 || 0)}
                min="1"
                max="60"
                className="glass-card border-white/20 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm md:text-base">Auto-start breaks</p>
                <p className="text-gray-400 text-xs md:text-sm">Automatically start break timer</p>
              </div>
              <Switch checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />
            </div>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-sm md:text-base"
              onClick={saveTimerSettings}
            >
              Save Timer Settings
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="glass-card border-0">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Palette className="h-4 w-4 md:h-5 md:w-5" />
              Appearance & Themes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4 md:p-6">
            {/* Study Modes */}
            <div className="space-y-3">
              <Label className="text-white font-medium text-sm md:text-base">Study Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: "study", label: "Study", icon: "📚", gradient: "from-blue-500 to-purple-500" },
                  { mode: "focus", label: "Focus", icon: "🎯", gradient: "from-orange-500 to-red-500" },
                  { mode: "relax", label: "Relax", icon: "🧘", gradient: "from-green-500 to-teal-500" },
                ].map((item) => (
                  <Button
                    key={item.mode}
                    variant={selectedMode === item.mode ? "default" : "ghost"}
                    className={`h-14 md:h-16 flex-col gap-1 text-xs md:text-sm ${
                      selectedMode === item.mode ? `bg-gradient-to-r ${item.gradient}` : "glass-button"
                    }`}
                    onClick={() => {
                      setSelectedMode(item.mode as any)
                      setTheme({ ...theme, mode: item.mode as any })
                    }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Themes */}
            <div className="space-y-3">
              <Label className="text-white font-medium text-sm md:text-base">Color Themes</Label>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {[
                  {
                    name: "Purple Dream",
                    gradient: "from-purple-900 via-blue-900 to-indigo-900",
                    primary: "purple",
                    secondary: "pink",
                  },
                  {
                    name: "Ocean Breeze",
                    gradient: "from-blue-900 via-cyan-900 to-teal-900",
                    primary: "blue",
                    secondary: "cyan",
                  },
                  {
                    name: "Sunset Glow",
                    gradient: "from-orange-900 via-red-900 to-pink-900",
                    primary: "orange",
                    secondary: "red",
                  },
                  {
                    name: "Forest Calm",
                    gradient: "from-green-900 via-emerald-900 to-teal-900",
                    primary: "green",
                    secondary: "emerald",
                  },
                  {
                    name: "Royal Gold",
                    gradient: "from-yellow-900 via-orange-900 to-red-900",
                    primary: "yellow",
                    secondary: "orange",
                  },
                  {
                    name: "Mystic Night",
                    gradient: "from-gray-900 via-purple-900 to-black",
                    primary: "gray",
                    secondary: "purple",
                  },
                ].map((themeOption) => (
                  <Button
                    key={themeOption.name}
                    variant="ghost"
                    className={`h-16 md:h-20 p-2 md:p-3 glass-button hover:scale-105 transition-all ${
                      theme.gradient === themeOption.gradient ? "ring-2 ring-white" : ""
                    }`}
                    onClick={() => setTheme({ ...theme, ...themeOption })}
                  >
                    <div className={`w-full h-full rounded-lg bg-gradient-to-br ${themeOption.gradient} flex items-center justify-center`}>
                      <span className="text-white text-xs md:text-sm font-medium">{themeOption.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm md:text-base">Dark Mode</p>
                  <p className="text-gray-400 text-xs md:text-sm">Always enabled for better focus</p>
                </div>
                <Switch defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm md:text-base">Animations</p>
                  <p className="text-gray-400 text-xs md:text-sm">Smooth transitions and effects</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm md:text-base">Sound Effects</p>
                  <p className="text-gray-400 text-xs md:text-sm">Notification and timer sounds</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-sm md:text-base">Apply Theme Changes</Button>
          </CardContent>
        </Card>
      </div>

      {/* Data & Privacy */}
      <Card className="glass-card border-0">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Shield className="h-4 w-4 md:h-5 md:w-5" />
            Data & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Button 
              variant="ghost" 
              className="glass-button justify-start h-auto p-3 md:p-4"
              onClick={exportData}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="h-4 w-4" />
                  <span className="font-medium text-sm md:text-base">Export Data</span>
                </div>
                <p className="text-gray-400 text-xs md:text-sm">Download your study data</p>
              </div>
            </Button>

            <Button 
              variant="ghost" 
              className="glass-button justify-start h-auto p-3 md:p-4"
              onClick={showPrivacyInfo}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium text-sm md:text-base">Privacy Settings</span>
                </div>
                <p className="text-gray-400 text-xs md:text-sm">Manage your privacy</p>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="glass-button justify-start h-auto p-3 md:p-4 hover:bg-red-500/10 hover:text-red-400"
              onClick={deleteAccount}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Trash2 className="h-4 w-4" />
                  <span className="font-medium text-sm md:text-base">Delete Account</span>
                </div>
                <p className="text-gray-400 text-xs md:text-sm">Permanently delete account</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack Information */}
      <Card className="glass-card border-0">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Bot className="h-4 w-4 md:h-5 md:w-5" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-white font-medium mb-2">Frontend</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Next.js 15.2.4 (App Router)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Shadcn/UI Components</li>
                <li>• Lucide React Icons</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Backend & Database</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Prisma ORM</li>
                <li>• PostgreSQL Database</li>
                <li>• SQL Commands</li>
                <li>• REST API</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="glass-card border-0">
        <CardContent className="p-4 md:p-6">
          <div className="text-center space-y-2">
            <h3 className="text-white font-semibold text-lg">StudyMate v1.0.0</h3>
            <p className="text-gray-400 text-sm">Built with ❤️ for students worldwide</p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-sm">
              <Button variant="link" className="text-purple-400 hover:text-purple-300 p-0 text-xs md:text-sm">
                Terms of Service
              </Button>
              <Button variant="link" className="text-purple-400 hover:text-purple-300 p-0 text-xs md:text-sm">
                Privacy Policy
              </Button>
              <Button variant="link" className="text-purple-400 hover:text-purple-300 p-0 text-xs md:text-sm">
                Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Footer />
    </div>
  )
}