# Detailed Backend and Frontend Code Structure

## Backend Code

### Config/db.js
```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
```

### Controllers/timerController.js
```javascript
const prisma = require('../config/db');

const timerController = {
  // Get all timer sessions for a user
  getSessions: async (req, res) => {
    try {
      const userId = req.user.id;
      const sessions = await prisma.timerSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  // Create a new timer session
  createSession: async (req, res) => {
    try {
      const userId = req.user.id;
      const { duration, type, completed } = req.body;
      
      const session = await prisma.timerSession.create({
        data: {
          duration,
          type,
          completed,
          userId
        }
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  },

  // Update a timer session
  updateSession: async (req, res) => {
    try {
      const { id } = req.params;
      const { duration, type, completed } = req.body;
      
      const session = await prisma.timerSession.update({
        where: { id: parseInt(id) },
        data: {
          duration,
          type,
          completed
        }
      });
      
      res.json(session);
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({ error: 'Failed to update session' });
    }
  }
};

module.exports = timerController;
```

### Controllers/noteController.js
```javascript
const prisma = require('../config/db');

const noteController = {
  // Get all notes for a user
  getNotes: async (req, res) => {
    try {
      const userId = req.user.id;
      const notes = await prisma.note.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      res.json(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  },

  // Create a new note
  createNote: async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, content, subject } = req.body;
      
      const note = await prisma.note.create({
        data: {
          title,
          content,
          subject,
          userId
        }
      });
      
      res.status(201).json(note);
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  },

  // Update a note
  updateNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, subject } = req.body;
      
      const note = await prisma.note.update({
        where: { id: parseInt(id) },
        data: {
          title,
          content,
          subject
        }
      });
      
      res.json(note);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update note' });
    }
  },

  // Delete a note
  deleteNote: async (req, res) => {
    try {
      const { id } = req.params;
      
      await prisma.note.delete({
        where: { id: parseInt(id) }
      });
      
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  }
};

module.exports = noteController;
```

### Controllers/userController.js
```javascript
const prisma = require('../config/db');
const bcrypt = require('bcrypt');

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email } = req.body;
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      });
      
      res.json(user);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Update user password
  updatePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Get current user with password
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      // Check if current password is correct
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword
        }
      });
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'Failed to update password' });
    }
  }
};

module.exports = userController;
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
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const TimerPage = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      setIsActive(false);
      playNotificationSound();
      toast({
        title: mode === 'work' ? 'Work session completed!' : 'Break time over!',
        description: mode === 'work' 
          ? 'Time for a break!' 
          : 'Back to work!',
      });
      // Auto-switch mode
      setMode(mode === 'work' ? 'break' : 'work');
      setTimeLeft(mode === 'work' ? 5 * 60 : 25 * 60); // 5 min break, 25 min work
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, mode]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/cascade_breathe_future.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Failed to play notification sound:', error);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = () => {
    setMode(mode === 'work' ? 'break' : 'work');
    setTimeLeft(mode === 'work' ? 5 * 60 : 25 * 60);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {mode === 'work' ? 'Work Timer' : 'Break Timer'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-bold mb-8">
            {formatTime(timeLeft)}
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={toggleTimer}>
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={resetTimer} variant="outline">
              Reset
            </Button>
            <Button onClick={switchMode} variant="outline">
              Switch Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimerPage;
```

### API Service (lib/api.ts)
```typescript
import { Note, TimerSession } from '@prisma/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Timer API
export const getSessions = async (): Promise<TimerSession[]> => {
  const response = await fetch(`${API_BASE_URL}/sessions`);
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  return response.json();
};

export const createSession = async (sessionData: Partial<TimerSession>): Promise<TimerSession> => {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
  });
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  return response.json();
};

export const updateSession = async (id: number, sessionData: Partial<TimerSession>): Promise<TimerSession> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
  });
  if (!response.ok) {
    throw new Error('Failed to update session');
  }
  return response.json();
};

// Notes API
export const getNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_BASE_URL}/notes`);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
};

export const createNote = async (noteData: Partial<Note>): Promise<Note> => {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) {
    throw new Error('Failed to create note');
  }
  return response.json();
};

export const updateNote = async (id: number, noteData: Partial<Note>): Promise<Note> => {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) {
    throw new Error('Failed to update note');
  }
  return response.json();
};

export const deleteNote = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
};

// User API
export const getProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/user/profile`);
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

export const updateProfile = async (profileData: { name?: string; email?: string }) => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  return response.json();
};

export const updatePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
  const response = await fetch(`${API_BASE_URL}/user/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  });
  if (!response.ok) {
    throw new Error('Failed to update password');
  }
  return response.json();
};

export default {
  getSessions,
  createSession,
  updateSession,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getProfile,
  updateProfile,
  updatePassword,
};
```

### Main App Layout (app/layout.tsx)
```tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar } from '@/components/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudyMate - Personal Productivity Management System',
  description: 'Enhance your study habits and time management skills',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 p-4 md:p-8">
                {children}
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
```