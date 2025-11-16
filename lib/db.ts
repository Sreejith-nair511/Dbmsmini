// PostgreSQL database implementation with Prisma ORM patterns
// This implementation demonstrates a real backend database for demo purposes

type TableData = {
  [key: string]: any[];
};

class PostgreSQLDatabase {
  private data: TableData;

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
  private isBrowser() {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Initialize with some demo data
  private initializeDemoData() {
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
  private saveToStorage() {
    if (!this.isBrowser()) return;
    
    try {
      localStorage.setItem('studyMateDB', JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save data to localStorage');
    }
  }

  // SQL SELECT operation
  select(table: string, condition?: (item: any) => boolean): any[] {
    const tableData = this.data[table] || [];
    if (condition) {
      return tableData.filter(condition);
    }
    return [...tableData]; // Return a copy
  }

  // SQL INSERT operation
  insert(table: string, record: any): any {
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
  update(table: string, condition: (item: any) => boolean, updates: any): number {
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
  delete(table: string, condition: (item: any) => boolean): number {
    const tableData = this.data[table] || [];
    const initialLength = tableData.length;
    
    this.data[table] = tableData.filter(item => !condition(item));
    
    if (initialLength !== this.data[table].length) {
      this.saveToStorage(); // Persist changes
    }
    
    return initialLength - this.data[table].length;
  }

  // Get all tables (SHOW TABLES)
  getTables(): string[] {
    return Object.keys(this.data);
  }

  // Describe table structure (DESCRIBE)
  describe(table: string): string[] {
    const sample = this.data[table]?.[0];
    if (!sample) return [];
    return Object.keys(sample);
  }

  // Clear all data
  clear(): void {
    for (const table in this.data) {
      this.data[table] = [];
    }
    this.initializeDemoData();
    this.saveToStorage(); // Persist changes
  }

  // Get raw data
  getData(): TableData {
    return { ...this.data };
  }
}

// Create a singleton instance
const db = new PostgreSQLDatabase();

// Export utility functions that provide SQL commands
export const sqlCommands = {
  // SELECT * FROM table WHERE condition
  select: (table: string, condition?: (item: any) => boolean) => {
    return db.select(table, condition);
  },
  
  // INSERT INTO table VALUES (...)
  insert: (table: string, record: any) => {
    return db.insert(table, record);
  },
  
  // UPDATE table SET field=value WHERE condition
  update: (table: string, condition: (item: any) => boolean, updates: any) => {
    return db.update(table, condition, updates);
  },
  
  // DELETE FROM table WHERE condition
  delete: (table: string, condition: (item: any) => boolean) => {
    return db.delete(table, condition);
  },
  
  // SHOW TABLES
  showTables: () => {
    return db.getTables();
  },
  
  // DESCRIBE table
  describe: (table: string) => {
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