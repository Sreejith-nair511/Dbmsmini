"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { sqlCommands } from "@/lib/db"

interface AppContextType {
  user: { name: string; email: string; isOnboarded: boolean } | null
  setUser: (user: { name: string; email: string; isOnboarded: boolean } | null) => void
  theme: {
    mode: "study" | "focus" | "relax"
    gradient: string
    primary: string
    secondary: string
  }
  setTheme: (theme: any) => void
  notes: any[]
  setNotes: (notes: any[]) => void
  goals: any[]
  setGoals: (goals: any[]) => void
  sessions: any[]
  setSessions: (sessions: any[]) => void
  // Timer settings
  timerSettings: {
    workDuration: number
    breakDuration: number
    longBreakDuration: number
    autoStartBreaks: boolean
  }
  setTimerSettings: (settings: any) => void
  // Database methods
  db: typeof sqlCommands
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within Providers")
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string; isOnboarded: boolean } | null>(null)
  const [theme, setTheme] = useState({
    mode: "study" as "study" | "focus" | "relax",
    gradient: "from-purple-900 via-blue-900 to-indigo-900",
    primary: "purple",
    secondary: "pink",
  })
  const [notes, setNotes] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [timerSettings, setTimerSettings] = useState({
    workDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
    longBreakDuration: 15 * 60, // 15 minutes in seconds
    autoStartBreaks: false,
  })

  // Load data from our database on mount
  useEffect(() => {
    refreshDataFromDB()
    
    // Load user from database or create default user
    loadUserFromDB()
  }, [])

  // Function to refresh data from our database
  const refreshDataFromDB = () => {
    setNotes(sqlCommands.select("notes"))
    setGoals(sqlCommands.select("goals"))
    setSessions(sqlCommands.select("sessions"))
  }

  // Load user from database or create default user
  const loadUserFromDB = () => {
    const users = sqlCommands.select("users")
    if (users.length > 0) {
      // Use the first user as the current user
      const firstUser = users[0];
      setUser({
        name: firstUser.name,
        email: firstUser.email,
        isOnboarded: firstUser.isOnboarded
      })
    } else {
      // Create default user if none exists
      const defaultUser = {
        name: "John Doe",
        email: "john@example.com",
        isOnboarded: true
      }
      sqlCommands.insert("users", { id: 1, ...defaultUser })
      setUser(defaultUser)
    }
  }

  // Update user in both state and database
  const updateUser = (newUser: { name: string; email: string; isOnboarded: boolean } | null) => {
    setUser(newUser)
    if (newUser) {
      // Update user in database
      const users = sqlCommands.select("users")
      if (users.length > 0) {
        sqlCommands.update(
          "users",
          (user: any) => user.id === users[0].id,
          newUser
        )
      } else {
        sqlCommands.insert("users", { id: 1, ...newUser })
      }
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser: updateUser,
        theme,
        setTheme,
        notes,
        setNotes,
        goals,
        setGoals,
        sessions,
        setSessions,
        timerSettings,
        setTimerSettings,
        db: sqlCommands
      }}
    >
      {children}
    </AppContext.Provider>
  )
}