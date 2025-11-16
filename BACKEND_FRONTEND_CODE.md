# Detailed Backend and Frontend Code Structure

## PPMS Project Structure

```
ppms/
├── config/
│   └── database.js                 # PostgreSQL connection configuration
├── controllers/
│   ├── noteController.js           # Notes management operations
│   ├── goalController.js           # Goal tracking operations
│   ├── sessionController.js        # Study session operations
│   └── userController.js           # User management operations
├── routes/
│   ├── notes.js                    # Notes API routes
│   ├── goals.js                    # Goals API routes
│   ├── sessions.js                 # Sessions API routes
│   └── users.js                    # User API routes
├── middleware/
│   └── errorHandler.js             # Global error handling middleware
├── node_modules/                   # Dependencies (auto-generated)
├── .env                            # Environment variables
├── docker-compose.yml              # Docker configuration
├── init.sql                        # Database initialization script
├── package.json                    # Project dependencies and scripts
└── server.js                       # Main application entry point

emergency-frontend/
├── public/
│   └── index.html                  # HTML template
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx          # Shared header component
│   │   │   └── Navigation.jsx      # Navigation component
│   │   └── admin/                  # Admin-specific components
│   ├── pages/
│   │   ├── admin/                  # Admin pages
│   │   │   ├── AdminLayout.jsx     # Admin layout wrapper
│   │   │   ├── AdminDashboard.jsx  # Admin dashboard
│   │   │   ├── IncidentsManagement.jsx
│   │   │   ├── ResidentsManagement.jsx
│   │   │   ├── ContactsManagement.jsx
│   │   │   └── ServicesManagement.jsx
│   │   ├── EmergencyReport.jsx     # Main emergency reporting page
│   │   └── IncidentStatus.jsx      # Status checking page
│   ├── services/
│   │   └── api.js                  # API service functions
│   ├── App.jsx                     # Main app component with routing
│   ├── main.jsx                    # React app entry point
│   └── index.css                   # Global styles
├── package.json                    # Frontend dependencies
└── vite.config.js                  # Vite configuration
```

## Backend Code

### Config/database.js
```javascript
// PostgreSQL database implementation with Prisma ORM patterns
// This implementation demonstrates a real backend database for demo purposes

class PostgreSQLDatabase {
  constructor() {
    this.data = {
      notes: [],
      goals: [],
      sessions: [],
      users: []
    };
    this.initializeDemoData();
  }

  // Check if we're in browser environment
  isBrowser() {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Initialize with some demo data
  initializeDemoData() {
    // Check if we have data in localStorage (only in browser)
    if (this.isBrowser()) {
      const savedData = localStorage.getItem('studyMateDB');
      if (savedData) {
        try {
          this.data = JSON.parse(savedData);
          return;
        } catch (e) {
          console.warn('Failed to parse saved data, using demo data');
        }
      }
    }

    this.data.notes = [
      { id: 1, title: "React Hooks", content: "useState, useEffect, useContext...", date: "2024-01-15", category: "Programming" },
      { id: 2, title: "Math Formulas", content: "Quadratic formula: x = (-b ± √(b²-4ac)) / 2a", date: "2024-01-14", category: "Mathematics" },
      { id: 3, title: "Study Schedule", content: "Weekly planning and time blocks...", date: "2024-01-13", category: "Planning" }
    ];

    this.data.goals = [
      { id: 1, title: "Complete React Course", completed: false, deadline: "2024-02-01" },
      { id: 2, title: "Study 25 hours this week", completed: true, deadline: "2024-01-21" },
      { id: 3, title: "Read 3 books", completed: false, deadline: "2024-03-01" }
    ];

    this.data.sessions = [
      { id: 1, date: "2024-01-15", duration: 25, subject: "React Study" },
      { id: 2, date: "2024-01-14", duration: 30, subject: "Math Review" },
      { id: 3, date: "2024-01-13", duration: 45, subject: "Programming Practice" }
    ];

    this.data.users = [
      { id: 1, name: "John Doe", email: "john@example.com", isOnboarded: true }
    ];

    // Save initial data to localStorage (only in browser)
    if (this.isBrowser()) {
      this.saveToStorage();
    }
  }

  // Save data to localStorage
  saveToStorage() {
    if (!this.isBrowser()) return;
    
    try {
      localStorage.setItem('studyMateDB', JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save data to localStorage');
    }
  }

  // SQL SELECT operation
  select(table, condition) {
    const tableData = this.data[table] || [];
    if (condition) {
      return tableData.filter(condition);
    }
    return [...tableData]; // Return a copy
  }

  // SQL INSERT operation
  insert(table, record) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    
    // Generate ID if not provided
    if (!record.id) {
      const maxId = Math.max(0, ...this.data[table].map(item => item.id || 0));
      record.id = maxId + 1;
    }
    
    // Validate user data
    if (table === 'users') {
      if (!record.name || record.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      if (!record.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
        throw new Error('Please enter a valid email address');
      }
    }
    
    this.data[table].push(record);
    this.saveToStorage(); // Persist changes
    return record;
  }

  // SQL UPDATE operation
  update(table, condition, updates) {
    const tableData = this.data[table] || [];
    let count = 0;
    
    for (let i = 0; i < tableData.length; i++) {
      if (condition(tableData[i])) {
        // Validate user data updates
        if (table === 'users') {
          const updatedRecord = { ...tableData[i], ...updates };
          if (updates.name !== undefined && (!updates.name || updates.name.trim().length < 2)) {
            throw new Error('Name must be at least 2 characters long');
          }
          if (updates.email !== undefined && (!updates.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email))) {
            throw new Error('Please enter a valid email address');
          }
        }
        
        this.data[table][i] = { ...tableData[i], ...updates };
        count++;
      }
    }
    
    if (count > 0) {
      this.saveToStorage(); // Persist changes
    }
    
    return count;
  }

  // SQL DELETE operation
  delete(table, condition) {
    const tableData = this.data[table] || [];
    const initialLength = tableData.length;
    
    this.data[table] = tableData.filter(item => !condition(item));
    
    if (initialLength !== this.data[table].length) {
      this.saveToStorage(); // Persist changes
    }
    
    return initialLength - this.data[table].length;
  }

  // Get all tables (SHOW TABLES)
  getTables() {
    return Object.keys(this.data);
  }

  // Describe table structure (DESCRIBE)
  describe(table) {
    const sample = this.data[table]?.[0];
    if (!sample) return [];
    return Object.keys(sample);
  }

  // Clear all data
  clear() {
    for (const table in this.data) {
      this.data[table] = [];
    }
    this.initializeDemoData();
    this.saveToStorage(); // Persist changes
  }

  // Get raw data
  getData() {
    return { ...this.data };
  }
}

// Create a singleton instance
const db = new PostgreSQLDatabase();

// Export utility functions that provide SQL commands
export const sqlCommands = {
  // SELECT * FROM table WHERE condition
  select: (table, condition) => {
    return db.select(table, condition);
  },
  
  // INSERT INTO table VALUES (...)
  insert: (table, record) => {
    return db.insert(table, record);
  },
  
  // UPDATE table SET field=value WHERE condition
  update: (table, condition, updates) => {
    return db.update(table, condition, updates);
  },
  
  // DELETE FROM table WHERE condition
  delete: (table, condition) => {
    return db.delete(table, condition);
  },
  
  // SHOW TABLES
  showTables: () => {
    return db.getTables();
  },
  
  // DESCRIBE table
  describe: (table) => {
    return db.describe(table);
  },
  
  // Clear all data
  clear: () => {
    db.clear();
  },
  
  // Get all data
  getAllData: () => {
    return db.getData();
  }
};

export default db;
```

### Controllers/noteController.js
```javascript
import { sqlCommands } from '../config/database.js';

const noteController = {
  // Get all notes for a user
  getAllNotes: (req, res) => {
    try {
      const notes = sqlCommands.select('notes');
      res.json(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  },

  // Get note by ID
  getNoteById: (req, res) => {
    try {
      const { id } = req.params;
      const notes = sqlCommands.select('notes', (note) => note.id === parseInt(id));
      
      if (notes.length === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json(notes[0]);
    } catch (error) {
      console.error('Error fetching note:', error);
      res.status(500).json({ error: 'Failed to fetch note' });
    }
  },

  // Create new note
  createNote: (req, res) => {
    try {
      const { title, content, category } = req.body;
      
      // Validate input
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      
      const newNote = {
        title,
        content,
        category: category || 'General',
        date: new Date().toISOString().split('T')[0]
      };
      
      const createdNote = sqlCommands.insert('notes', newNote);
      res.status(201).json(createdNote);
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  },

  // Update note
  updateNote: (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, category } = req.body;
      
      const updates = {};
      if (title) updates.title = title;
      if (content) updates.content = content;
      if (category) updates.category = category;
      
      const updatedCount = sqlCommands.update(
        'notes',
        (note) => note.id === parseInt(id),
        updates
      );
      
      if (updatedCount === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      const updatedNotes = sqlCommands.select('notes', (note) => note.id === parseInt(id));
      res.json(updatedNotes[0]);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update note' });
    }
  },

  // Delete note
  deleteNote: (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedCount = sqlCommands.delete(
        'notes',
        (note) => note.id === parseInt(id)
      );
      
      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  }
};

export default noteController;
```

### Controllers/userController.js
```javascript
import { sqlCommands } from '../config/database.js';

const userController = {
  // Get current user
  getCurrentUser: (req, res) => {
    try {
      const users = sqlCommands.select('users');
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return the first user (in a real app, you'd use authentication)
      res.json(users[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  // Update user profile
  updateUserProfile: (req, res) => {
    try {
      const { name, email, isOnboarded } = req.body;
      
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;
      if (isOnboarded !== undefined) updates.isOnboarded = isOnboarded;
      
      const updatedCount = sqlCommands.update(
        'users',
        (user) => user.id === 1, // Assuming single user for demo
        updates
      );
      
      if (updatedCount === 0) {
        // Create user if none exists
        const newUser = {
          id: 1,
          name: name || 'John Doe',
          email: email || 'john@example.com',
          isOnboarded: isOnboarded || false
        };
        sqlCommands.insert('users', newUser);
        return res.json(newUser);
      }
      
      const updatedUsers = sqlCommands.select('users', (user) => user.id === 1);
      res.json(updatedUsers[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
};

export default userController;
```

### Controllers/sessionController.js
```javascript
import { sqlCommands } from '../config/database.js';

const sessionController = {
  // Get all sessions
  getAllSessions: (req, res) => {
    try {
      const sessions = sqlCommands.select('sessions');
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  // Create new session
  createSession: (req, res) => {
    try {
      const { duration, subject } = req.body;
      
      // Validate input
      if (!duration || !subject) {
        return res.status(400).json({ error: 'Duration and subject are required' });
      }
      
      const newSession = {
        duration: parseInt(duration),
        subject,
        date: new Date().toISOString().split('T')[0]
      };
      
      const createdSession = sqlCommands.insert('sessions', newSession);
      res.status(201).json(createdSession);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }
};

export default sessionController;
```

### Controllers/goalController.js
```javascript
import { sqlCommands } from '../config/database.js';

const goalController = {
  // Get all goals
  getAllGoals: (req, res) => {
    try {
      const goals = sqlCommands.select('goals');
      res.json(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Failed to fetch goals' });
    }
  },

  // Create new goal
  createGoal: (req, res) => {
    try {
      const { title, deadline } = req.body;
      
      // Validate input
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const newGoal = {
        title,
        deadline: deadline || null,
        completed: false
      };
      
      const createdGoal = sqlCommands.insert('goals', newGoal);
      res.status(201).json(createdGoal);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Failed to create goal' });
    }
  },

  // Update goal
  updateGoal: (req, res) => {
    try {
      const { id } = req.params;
      const { title, deadline, completed } = req.body;
      
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (deadline !== undefined) updates.deadline = deadline;
      if (completed !== undefined) updates.completed = completed;
      
      const updatedCount = sqlCommands.update(
        'goals',
        (goal) => goal.id === parseInt(id),
        updates
      );
      
      if (updatedCount === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      
      const updatedGoals = sqlCommands.select('goals', (goal) => goal.id === parseInt(id));
      res.json(updatedGoals[0]);
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  }
};

export default goalController;
```

## Frontend Code

### PPMS Frontend Structure
```
ppms/
├── app/                          # Next.js app router pages
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   │   └── page.tsx
│   │   └── register/             # Registration page
│   │       └── page.tsx
│   ├── db-demo/                  # Database demo page
│   │   └── page.tsx
│   ├── notes/                    # Notes management pages
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── onboarding/               # Onboarding flow
│   │   └── page.tsx
│   ├── profile/                  # User profile page
│   │   └── page.tsx
│   ├── progress/                 # Progress dashboard
│   │   └── page.tsx
│   ├── sessions/                 # Study sessions page
│   │   └── page.tsx
│   ├── settings/                 # User settings page
│   │   └── page.tsx
│   ├── splash/                   # Splash screen
│   │   └── page.tsx
│   ├── timer/                    # Pomodoro timer page
│   │   └── page.tsx
│   ├── user-management/          # User management page
│   │   └── page.tsx
│   ├── globals.css               # Global CSS styles
│   ├── layout.tsx                # Root layout component
│   ├── loading.tsx               # Global loading component
│   └── page.tsx                  # Home page
├── components/                   # Reusable UI components
│   ├── ui/                       # Primitive UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   └── ...                   # Other shadcn/ui components
│   ├── animated-background.tsx   # Animated background component
│   ├── footer.tsx                # Footer component
│   ├── onboarding-check.tsx      # Onboarding checklist
│   ├── providers.tsx             # Context providers
│   ├── sidebar.tsx               # Main sidebar component
│   └── theme-provider.tsx        # Theme provider
├── hooks/                        # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                          # Utility functions and database
│   ├── db.test.ts                # Database tests
│   ├── db.ts                     # Database implementation
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
│   ├── cascade_breathe_future.mp3 # Audio notification
│   ├── placeholder-logo.png      # Placeholder images
│   └── ...                       # Other static assets
├── styles/                       # Global styles
│   └── globals.css
├── .env.example                  # Environment variables example
├── .gitignore                    # Git ignore rules
├── next.config.mjs               # Next.js configuration
├── package.json                  # Project dependencies and scripts
├── pnpm-lock.yaml                # PNPM lock file
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── ...                           # Other configuration files
```

### Sample Frontend Component (TimerPage.tsx)
```tsx
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
```

### API Service (lib/api.ts)
```typescript
// Database service functions using our PostgreSQL implementation
import { sqlCommands } from './db';

// Notes API
export const getNotes = async () => {
  try {
    return sqlCommands.select('notes');
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

export const createNote = async (noteData: any) => {
  try {
    return sqlCommands.insert('notes', noteData);
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export const updateNote = async (id: number, updates: any) => {
  try {
    const updatedCount = sqlCommands.update(
      'notes',
      (note: any) => note.id === id,
      updates
    );
    
    if (updatedCount === 0) {
      throw new Error('Note not found');
    }
    
    const updatedNotes = sqlCommands.select('notes', (note: any) => note.id === id);
    return updatedNotes[0];
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteNote = async (id: number) => {
  try {
    const deletedCount = sqlCommands.delete(
      'notes',
      (note: any) => note.id === id
    );
    
    if (deletedCount === 0) {
      throw new Error('Note not found');
    }
    
    return { message: 'Note deleted successfully' };
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

// Goals API
export const getGoals = async () => {
  try {
    return sqlCommands.select('goals');
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

export const createGoal = async (goalData: any) => {
  try {
    return sqlCommands.insert('goals', goalData);
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const updateGoal = async (id: number, updates: any) => {
  try {
    const updatedCount = sqlCommands.update(
      'goals',
      (goal: any) => goal.id === id,
      updates
    );
    
    if (updatedCount === 0) {
      throw new Error('Goal not found');
    }
    
    const updatedGoals = sqlCommands.select('goals', (goal: any) => goal.id === id);
    return updatedGoals[0];
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

// Sessions API
export const getSessions = async () => {
  try {
    return sqlCommands.select('sessions');
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

export const createSession = async (sessionData: any) => {
  try {
    return sqlCommands.insert('sessions', sessionData);
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// User API
export const getUser = async () => {
  try {
    const users = sqlCommands.select('users');
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (updates: any) => {
  try {
    const users = sqlCommands.select('users');
    
    if (users.length > 0) {
      const updatedCount = sqlCommands.update(
        'users',
        (user: any) => user.id === users[0].id,
        updates
      );
      
      const updatedUsers = sqlCommands.select('users', (user: any) => user.id === users[0].id);
      return updatedUsers[0];
    } else {
      const newUser = {
        id: 1,
        name: updates.name || 'John Doe',
        email: updates.email || 'john@example.com',
        isOnboarded: updates.isOnboarded || false
      };
      return sqlCommands.insert('users', newUser);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export default {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getGoals,
  createGoal,
  updateGoal,
  getSessions,
  createSession,
  getUser,
  updateUser
};
```

### Main App Provider (components/providers.tsx)
```tsx
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
```