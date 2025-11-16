"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, Filter, Search, Plus } from "lucide-react";
import { useApp } from "@/components/providers";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function SessionsPage() {
  const { user } = useApp();
  const [sessions, setSessions] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [newSessionSubject, setNewSessionSubject] = useState("");
  const [newSessionDuration, setNewSessionDuration] = useState(25);

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("studySessions");
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
        setFilteredSessions(parsedSessions);
      } catch (e) {
        console.log("Failed to parse saved sessions");
      }
    }
  }, []);

  // Filter sessions based on search and filter criteria
  useEffect(() => {
    let result = sessions;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(session => 
        session.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== "all") {
      result = result.filter(session => session.type === filterType);
    }
    
    setFilteredSessions(result);
  }, [searchTerm, filterType, sessions]);

  const handleAddSession = () => {
    if (!newSessionSubject.trim()) return;
    
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      duration: newSessionDuration * 60, // Convert minutes to seconds
      subject: newSessionSubject,
      type: "work"
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    setFilteredSessions(updatedSessions);
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
    
    // Reset form
    setNewSessionSubject("");
    setNewSessionDuration(25);
  };

  const handleDeleteSession = (id: number) => {
    const updatedSessions = sessions.filter(session => session.id !== id);
    setSessions(updatedSessions);
    setFilteredSessions(updatedSessions);
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
  };

  // Calculate statistics
  const totalSessions = sessions.length;
  const totalStudyTime = sessions.reduce((total, session) => total + (session.type === "work" ? session.duration : 0), 0);
  const totalStudyHours = Math.floor(totalStudyTime / 3600);
  const totalStudyMinutes = Math.floor((totalStudyTime % 3600) / 60);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Study Sessions</h1>
        <p className="text-gray-300">Manage and track all your study sessions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{totalSessions}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <BookOpen className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Study Time</p>
                <p className="text-2xl font-bold text-white">{totalStudyHours}h {totalStudyMinutes}m</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. Session</p>
                <p className="text-2xl font-bold text-white">
                  {totalSessions > 0 ? Math.floor(totalStudyTime / totalSessions / 60) : 0} min
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Session */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Subject</label>
              <Input
                placeholder="What did you study?"
                value={newSessionSubject}
                onChange={(e) => setNewSessionSubject(e.target.value)}
                className="glass-card border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Duration (minutes)</label>
              <Input
                type="number"
                min="1"
                max="120"
                value={newSessionDuration}
                onChange={(e) => setNewSessionDuration(parseInt(e.target.value) || 25)}
                className="glass-card border-white/20 text-white"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddSession}
                className="bg-gradient-to-r from-purple-500 to-pink-500 w-full"
              >
                Add Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-card border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                className={filterType === "all" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "glass-button border-white/20"}
              >
                All
              </Button>
              <Button
                variant={filterType === "work" ? "default" : "outline"}
                onClick={() => setFilterType("work")}
                className={filterType === "work" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "glass-button border-white/20"}
              >
                Work
              </Button>
              <Button
                variant={filterType === "break" ? "default" : "outline"}
                onClick={() => setFilterType("break")}
                className={filterType === "break" ? "bg-gradient-to-r from-green-500 to-blue-500" : "glass-button border-white/20"}
              >
                Break
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSessions.length > 0 ? (
            <div className="space-y-3">
              {[...filteredSessions].reverse().map((session) => (
                <div key={session.id} className="p-4 rounded-lg bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h4 className="text-white font-medium">{session.subject}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {session.date}
                      </span>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(session.duration / 60)} min
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={session.type === "work" 
                          ? "bg-purple-500/20 text-purple-300" 
                          : "bg-green-500/20 text-green-300"}
                      >
                        {session.type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSession(session.id)}
                    className="glass-button text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No sessions found</p>
              <p className="text-sm mt-1">Try changing your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}