"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers";
import { sqlCommands } from "@/lib/db";
import { Footer } from "@/components/footer";
import { User, Mail, FileText, Calendar, Award } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useApp();
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({
    sessions: 0,
    notes: 0,
    goals: 0,
    streak: 0
  });

  useEffect(() => {
    // Load user data from database
    const users = sqlCommands.select("users");
    if (users.length > 0) {
      setUserData(users[0]);
    }
    
    // Load stats
    const sessions = sqlCommands.select("sessions");
    const notes = sqlCommands.select("notes");
    const goals = sqlCommands.select("goals");
    
    setStats({
      sessions: sessions.length,
      notes: notes.length,
      goals: goals.length,
      streak: 7 // Simulated streak
    });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="glass-card p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">My Profile</h1>
        <p className="text-gray-300 text-sm md:text-base">View and manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-0">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 md:w-20 md:h-20" />
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white">{userData?.name || user?.name || "User"}</h2>
                      <p className="text-gray-400 text-sm md:text-base">{userData?.bio || "No bio available"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-gray-300 text-sm">
                        <Mail className="h-4 w-4" />
                        <span>{userData?.email || user?.email || "No email provided"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-300 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Joined Jan 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Link href="/settings">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-sm md:text-base">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Card */}
        <Card className="glass-card border-0">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Award className="h-5 w-5" />
              Study Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400 text-xs md:text-sm">Sessions</p>
                <p className="text-white text-xl font-bold">{stats.sessions}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400 text-xs md:text-sm">Notes</p>
                <p className="text-white text-xl font-bold">{stats.notes}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400 text-xs md:text-sm">Goals</p>
                <p className="text-white text-xl font-bold">{stats.goals}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-400 text-xs md:text-sm">Streak</p>
                <p className="text-white text-xl font-bold">{stats.streak} days</p>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                  style={{ width: "75%" }}
                ></div>
              </div>
              <p className="text-gray-400 text-xs mt-1">75% of weekly goal (8 sessions)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card border-0">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="mt-1 w-2 h-2 rounded-full bg-purple-500"></div>
              <div>
                <p className="text-white font-medium">Completed Focus Session</p>
                <p className="text-gray-400 text-sm">25 minutes of React study</p>
                <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="mt-1 w-2 h-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-white font-medium">Created New Note</p>
                <p className="text-gray-400 text-sm">JavaScript ES6 Features</p>
                <p className="text-gray-500 text-xs mt-1">Yesterday</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-white font-medium">Achieved Goal</p>
                <p className="text-gray-400 text-sm">Complete React Course</p>
                <p className="text-gray-500 text-xs mt-1">Jan 15, 2024</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}