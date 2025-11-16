"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/components/providers";
import { useToast } from "@/hooks/use-toast";
import { sqlCommands } from "@/lib/db";
import { Download, Plus, Edit, Trash2, User, Shield } from "lucide-react";

export default function UserManagement() {
  const { toast } = useToast();
  const { user: currentUser, setUser } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    isOnboarded: false
  });
  const [errors, setErrors] = useState({
    name: "",
    email: ""
  });

  // Load users on mount
  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    try {
      const userData = sqlCommands.select("users");
      setUsers(userData);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "" };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });

    // Clear error when user starts typing
    if (name === "name" || name === "email") {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingUser) {
        // Update existing user
        const result = sqlCommands.update(
          "users",
          (user: any) => user.id === editingUser.id,
          formData
        );
        
        if (result > 0) {
          toast({
            title: "Success",
            description: "User updated successfully"
          });
        } else {
          throw new Error("Failed to update user");
        }
      } else {
        // Create new user
        const result = sqlCommands.insert("users", {
          ...formData
        });
        
        toast({
          title: "Success",
          description: `User created successfully with ID: ${result.id}`
        });
      }
      
      // Reset form and refresh data
      setFormData({ name: "", email: "", isOnboarded: false });
      setErrors({ name: "", email: "" });
      setEditingUser(null);
      setIsDialogOpen(false);
      refreshUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      isOnboarded: user.isOnboarded
    });
    setErrors({ name: "", email: "" });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: number) => {
    try {
      const result = sqlCommands.delete("users", (user: any) => user.id === userId);
      
      if (result > 0) {
        toast({
          title: "Success",
          description: "User deleted successfully"
        });
        refreshUsers();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    try {
      // Get all data
      const allData = sqlCommands.getAllData();
      
      // Convert to CSV format
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add headers for each table
      Object.keys(allData).forEach(tableName => {
        csvContent += `\n${tableName.toUpperCase()} TABLE\n`;
        
        if (allData[tableName].length > 0) {
          // Add column headers
          const headers = Object.keys(allData[tableName][0]).join(",");
          csvContent += headers + "\n";
          
          // Add data rows
          allData[tableName].forEach((row: any) => {
            const values = Object.values(row).map(value => 
              typeof value === "string" ? `"${value}"` : value
            ).join(",");
            csvContent += values + "\n";
          });
        } else {
          csvContent += "No data\n";
        }
        
        csvContent += "\n";
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "study_mate_data_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Data exported to CSV successfully"
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleDataPrivacy = () => {
    try {
      // For demo purposes, we'll show a message about data privacy
      toast({
        title: "Data Privacy Information",
        description: "All user data is stored locally in your browser and is never sent to any server. You can export or delete your data at any time."
      });
    } catch (error) {
      console.error("Error handling data privacy:", error);
      toast({
        title: "Error",
        description: "Failed to process data privacy request",
        variant: "destructive"
      });
    }
  };

  const openAddUserDialog = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", isOnboarded: false });
    setErrors({ name: "", email: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-300">Manage user profiles and export data</p>
      </div>

      {/* User Management Actions */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Manage Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddUserDialog} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-0 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingUser ? "Edit User" : "Add New User"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter user name"
                      className={`bg-black/30 text-white border-gray-700 ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter user email"
                      className={`bg-black/30 text-white border-gray-700 ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      id="isOnboarded"
                      name="isOnboarded"
                      type="checkbox"
                      checked={formData.isOnboarded}
                      onChange={handleInputChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isOnboarded" className="text-gray-300">
                      User is onboarded
                    </Label>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="border-gray-700 text-white hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500">
                      {editingUser ? "Update User" : "Create User"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={exportToCSV} className="bg-gradient-to-r from-green-500 to-teal-500">
                <Download className="h-4 w-4 mr-2" />
                Export All Data to CSV
              </Button>
              <Button onClick={handleDataPrivacy} className="bg-gradient-to-r from-blue-500 to-indigo-500">
                <Shield className="h-4 w-4 mr-2" />
                Data Privacy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white">User Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">ID</TableHead>
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Onboarded</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-white">{user.id}</TableCell>
                      <TableCell className="text-white">{user.name}</TableCell>
                      <TableCell className="text-white">{user.email}</TableCell>
                      <TableCell className="text-white">
                        {user.isOnboarded ? (
                          <span className="text-green-500">Yes</span>
                        ) : (
                          <span className="text-red-500">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(user)}
                            className="glass-button text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(user.id)}
                            className="glass-button text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No users found. Add a new user to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Information */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white">Database Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-white font-semibold">Total Users</h3>
              <p className="text-2xl font-bold text-purple-500">{users.length}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-white font-semibold">Onboarded Users</h3>
              <p className="text-2xl font-bold text-green-500">
                {users.filter(u => u.isOnboarded).length}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-white font-semibold">Tables</h3>
              <p className="text-2xl font-bold text-blue-500">
                {sqlCommands.showTables().length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}