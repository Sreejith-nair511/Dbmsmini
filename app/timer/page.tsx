"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, Volume2, VolumeX, Bot, Plus, List } from "lucide-react"
import { useApp } from "@/components/providers"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function TimerPage() {
  const { user, timerSettings, setTimerSettings } = useApp()
  const { toast } = useToast()
  const [timeLeft, setTimeLeft] = useState(timerSettings.workDuration) // Use work duration from settings
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState<"work" | "break">("work")
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])
  const [newSessionSubject, setNewSessionSubject] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Use timer settings for durations
  const totalTime = sessionType === "work" ? timerSettings.workDuration : timerSettings.breakDuration

  // Initialize audio element
  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio("/cascade_breathe_future.mp3");
    
    // Load saved sessions
    const savedSessions = localStorage.getItem("studySessions");
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.log("Failed to parse saved sessions");
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Session completed
      if (sessionType === "work") {
        setSessionsCompleted((prev) => prev + 1)
        // Save completed session
        const completedSession = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          duration: timerSettings.workDuration,
          subject: newSessionSubject || "General Study",
          type: "work"
        }
        const updatedSessions = [...sessions, completedSession];
        setSessions(updatedSessions);
        localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
        
        setSessionType("break")
        setTimeLeft(timerSettings.breakDuration)
      } else {
        setSessionType("work")
        setTimeLeft(timerSettings.workDuration)
      }
      setIsActive(false)

      // Play notification sound and show toast
      if (soundEnabled) {
        try {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play failed:", e));
          }
        } catch (e) {
          console.log("Audio play failed:", e);
        }
      }
      
      // Show notification toast
      toast({
        title: sessionType === "work" ? "Work Session Completed!" : "Break Time Over!",
        description: sessionType === "work" 
          ? `Great job! Take a ${Math.floor(timerSettings.breakDuration / 60)}-minute break.` 
          : "Break's over! Time to get back to work.",
      })
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft, sessionType, soundEnabled, timerSettings, toast, sessions, newSessionSubject])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(sessionType === "work" ? timerSettings.workDuration : timerSettings.breakDuration)
  }

  const switchSession = (type: "work" | "break") => {
    setIsActive(false)
    setSessionType(type)
    setTimeLeft(type === "work" ? timerSettings.workDuration : timerSettings.breakDuration)
  }

  const startNewSession = () => {
    if (!newSessionSubject.trim()) {
      toast({
        title: "Session Subject Required",
        description: "Please enter a subject for your study session.",
        variant: "destructive"
      })
      return;
    }
    
    setIsActive(true)
    setSessionType("work")
    setTimeLeft(timerSettings.workDuration)
    
    toast({
      title: "New Session Started",
      description: `Started a new session on "${newSessionSubject}"`,
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="glass-card p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Focus Time, {user?.name}! 🎯</h1>
            <p className="text-gray-300 text-sm md:text-base">Stay focused and productive with Pomodoro technique</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs md:text-sm">
              Sessions: {sessionsCompleted}
            </Badge>
            <Button variant="ghost" size="icon" className="glass-button" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-0">
            <CardContent className="p-4 md:p-8">
              <div className="flex flex-col items-center space-y-6 md:space-y-8">
                {/* Session Type Selector */}
                <div className="flex gap-2">
                  <Button
                    variant={sessionType === "work" ? "default" : "ghost"}
                    className={`text-sm md:text-base ${sessionType === "work" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "glass-button"}`}
                    onClick={() => switchSession("work")}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Work
                  </Button>
                  <Button
                    variant={sessionType === "break" ? "default" : "ghost"}
                    className={`text-sm md:text-base ${sessionType === "break" ? "bg-gradient-to-r from-green-500 to-blue-500" : "glass-button"}`}
                    onClick={() => switchSession("break")}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    Break
                  </Button>
                </div>

                {/* New Session Input */}
                <div className="w-full max-w-md">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSessionSubject}
                      onChange={(e) => setNewSessionSubject(e.target.value)}
                      placeholder="What are you studying?"
                      className="flex-1 glass-card border-white/20 text-white placeholder:text-gray-400 px-4 py-2 rounded-lg text-sm md:text-base"
                      onKeyPress={(e) => e.key === 'Enter' && startNewSession()}
                    />
                    <Button 
                      onClick={startNewSession}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Circular Progress */}
                <div className="relative">
                  <svg className="timer-circle w-48 h-48 md:w-64 md:h-64" viewBox="0 0 250 250">
                    {/* Background circle */}
                    <circle cx="125" cy="125" r="120" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                    {/* Progress circle */}
                    <circle
                      cx="125"
                      cy="125"
                      r="120"
                      stroke={sessionType === "work" ? "#a855f7" : "#10b981"}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="progress-ring"
                      style={{
                        filter: isActive ? "drop-shadow(0 0 10px currentColor)" : "none",
                      }}
                    />
                  </svg>

                  {/* Timer display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-4xl md:text-6xl font-bold text-white ${isActive ? "pulse-glow" : ""}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-gray-400 text-base md:text-lg mt-2 capitalize">{sessionType} Session</div>
                    {newSessionSubject && (
                      <div className="text-purple-300 text-sm mt-1 truncate max-w-[200px]">
                        {newSessionSubject}
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3 md:gap-4">
                  <Button
                    size="lg"
                    onClick={toggleTimer}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 md:px-8 text-sm md:text-base"
                  >
                    {isActive ? <Pause className="h-4 w-4 md:h-5 md:w-5 mr-2" /> : <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />}
                    {isActive ? "Pause" : "Start"}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    onClick={resetTimer} 
                    className="glass-button px-6 md:px-8 text-sm md:text-base"
                  >
                    <RotateCcw className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Settings - Updated to show only name */}
        <div className="space-y-4 md:space-y-6">
          {/* User Name Only */}
          <Card className="glass-card border-0">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white">{user?.name || "User"}</h2>
              </div>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card className="glass-card border-0">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-white text-lg">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm md:text-base">Sessions Completed</span>
                <span className="text-white font-semibold">{sessionsCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm md:text-base">Focus Time</span>
                <span className="text-white font-semibold">
                  {Math.floor((sessionsCompleted * timerSettings.workDuration) / 60)} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm md:text-base">Break Time</span>
                <span className="text-white font-semibold">
                  {Math.floor((sessionsCompleted * timerSettings.breakDuration) / 60)} min
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <Card className="glass-card border-0">
            <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-lg">Quick Settings</CardTitle>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="glass-button">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm md:text-base">Work Duration</span>
                  <span className="text-white font-semibold">
                    {Math.floor(timerSettings.workDuration / 60)}:{(timerSettings.workDuration % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm md:text-base">Break Duration</span>
                  <span className="text-white font-semibold">
                    {Math.floor(timerSettings.breakDuration / 60)}:{(timerSettings.breakDuration % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm md:text-base">Auto-start Breaks</span>
                  <span className="text-white font-semibold">
                    {timerSettings.autoStartBreaks ? "On" : "Off"}
                  </span>
                </div>
              </div>
              <Link href="/settings">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-sm md:text-base">
                  Customize Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="glass-card border-0">
            <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <List className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
              <Link href="/progress">
                <Button variant="ghost" size="sm" className="glass-button text-xs">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {sessions.length > 0 ? (
                  sessions.slice(-5).reverse().map((session) => (
                    <div key={session.id} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                      <div>
                        <p className="text-white text-sm font-medium truncate max-w-[120px]">{session.subject}</p>
                        <p className="text-gray-400 text-xs">{session.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">{Math.floor(session.duration / 60)}m</p>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                          {session.type}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">No sessions yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}