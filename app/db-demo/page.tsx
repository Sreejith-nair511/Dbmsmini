"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sqlCommands } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

export default function DatabaseDemo() {
  const { toast } = useToast();
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<any>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState("notes");

  // Load tables on mount
  useEffect(() => {
    setTables(sqlCommands.showTables());
  }, []);

  // Execute SQL command
  const executeCommand = () => {
    try {
      let output: any;
      
      // Parse and execute command
      if (command.toLowerCase().startsWith("select")) {
        // Simple SELECT parser for demo
        if (command.toLowerCase().includes("from")) {
          const tableName = command.split("from")[1].trim().split(" ")[0].replace(";", "");
          output = sqlCommands.select(tableName);
        } else {
          output = sqlCommands.select(selectedTable);
        }
      } else if (command.toLowerCase().startsWith("insert")) {
        // Simple INSERT parser for demo
        const tableName = command.split("into")[1].trim().split(" ")[0];
        const record = {
          title: "New Item",
          content: "Added via SQL command",
          date: new Date().toISOString().split('T')[0]
        };
        output = sqlCommands.insert(tableName, record);
        toast({
          title: "Success",
          description: `Inserted record with ID: ${output.id}`
        });
      } else if (command.toLowerCase().startsWith("show tables")) {
        output = sqlCommands.showTables();
      } else if (command.toLowerCase().startsWith("describe")) {
        const tableName = command.split("describe")[1].trim();
        output = sqlCommands.describe(tableName);
      } else if (command.toLowerCase().startsWith("clear")) {
        sqlCommands.clear();
        output = "Database cleared and reset to demo data";
        toast({
          title: "Success",
          description: "Database cleared"
        });
      } else {
        // Default to selecting from selected table
        output = sqlCommands.select(selectedTable);
      }
      
      setResult(output);
    } catch (error) {
      console.error("Error executing command:", error);
      toast({
        title: "Error",
        description: "Invalid command syntax",
        variant: "destructive"
      });
      setResult({ error: "Invalid command syntax" });
    }
  };

  // Insert a new note
  const insertNote = () => {
    const newNote = {
      title: "Demo Note",
      content: "This note was added through the database interface",
      date: new Date().toISOString().split('T')[0],
      category: "Demo"
    };
    
    const result = sqlCommands.insert("notes", newNote);
    toast({
      title: "Success",
      description: `Inserted note with ID: ${result.id}`
    });
    
    // Refresh data
    setResult(sqlCommands.select("notes"));
  };

  // Update first note
  const updateFirstNote = () => {
    const notes = sqlCommands.select("notes");
    if (notes.length > 0) {
      const firstNote = notes[0];
      sqlCommands.update(
        "notes", 
        (note: any) => note.id === firstNote.id,
        { title: "Updated: " + firstNote.title }
      );
      
      toast({
        title: "Success",
        description: `Updated note ID: ${firstNote.id}`
      });
      
      // Refresh data
      setResult(sqlCommands.select("notes"));
    }
  };

  // Delete last note
  const deleteLastNote = () => {
    const notes = sqlCommands.select("notes");
    if (notes.length > 0) {
      const lastNote = notes[notes.length - 1];
      sqlCommands.delete(
        "notes",
        (note: any) => note.id === lastNote.id
      );
      
      toast({
        title: "Success",
        description: `Deleted note ID: ${lastNote.id}`
      });
      
      // Refresh data
      setResult(sqlCommands.select("notes"));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Database Demo</h1>
        <p className="text-gray-300">PostgreSQL database with Prisma ORM</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SQL Command Interface */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">SQL Command Interface</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="command" className="text-gray-300">Enter SQL command:</Label>
              <Textarea
                id="command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g., SELECT * FROM notes; SHOW TABLES; DESCRIBE notes;"
                className="bg-black/30 text-white border-gray-700"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={executeCommand} className="bg-blue-600 hover:bg-blue-700">
                Execute
              </Button>
              <Button 
                onClick={() => setCommand("SELECT * FROM notes")} 
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                SELECT *
              </Button>
              <Button 
                onClick={() => setCommand("SHOW TABLES")} 
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                SHOW TABLES
              </Button>
            </div>
            
            <div className="pt-4">
              <h3 className="text-lg font-semibold text-white mb-2">Example Commands:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• SELECT * FROM notes</li>
                <li>• SHOW TABLES</li>
                <li>• DESCRIBE goals</li>
                <li>• INSERT INTO notes VALUES (...)</li>
                <li>• CLEAR (reset database)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Quick Database Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={insertNote} className="w-full glass-button justify-start" variant="ghost">
              INSERT New Note
            </Button>
            <Button onClick={updateFirstNote} className="w-full glass-button justify-start" variant="ghost">
              UPDATE First Note
            </Button>
            <Button onClick={deleteLastNote} className="w-full glass-button justify-start" variant="ghost">
              DELETE Last Note
            </Button>
            <Button 
              onClick={() => {
                setResult(sqlCommands.getAllData());
                toast({
                  title: "Success",
                  description: "Showing all database content"
                });
              }} 
              className="w-full glass-button justify-start" 
              variant="ghost"
            >
              SHOW All Data
            </Button>
            <Button 
              onClick={() => {
                sqlCommands.clear();
                setResult(null);
                toast({
                  title: "Success",
                  description: "Database reset to demo data"
                });
              }} 
              variant="destructive"
              className="w-full"
            >
              RESET Database
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      {result && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Query Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-black/30 p-4 rounded-lg text-sm text-green-400 overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Database Schema Info */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white">Database Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <div 
                key={table} 
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedTable === table 
                    ? "bg-blue-500/20 border border-blue-500/50" 
                    : "bg-white/5 hover:bg-white/10"
                }`}
                onClick={() => {
                  setSelectedTable(table);
                  setResult(sqlCommands.select(table));
                }}
              >
                <h3 className="font-semibold text-white capitalize">{table}</h3>
                <p className="text-sm text-gray-400">
                  Fields: {sqlCommands.describe(table).join(", ") || "None"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}