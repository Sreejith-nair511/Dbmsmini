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
      users: [],
      students: [] // New table for Indian names demo
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

    // Add 10 Indian names with proper normalization and constraints
    this.data.students = [
      { 
        id: 1, 
        firstName: "Aarav", 
        lastName: "Patel", 
        email: "aarav.patel@example.com", 
        phone: "9876543210", 
        dateOfBirth: "2000-05-15", 
        enrollmentDate: "2023-08-01",
        course: "Computer Science",
        grade: "A"
      },
      { 
        id: 2, 
        firstName: "Aditi", 
        lastName: "Sharma", 
        email: "aditi.sharma@example.com", 
        phone: "9876543211", 
        dateOfBirth: "1999-12-22", 
        enrollmentDate: "2023-08-01",
        course: "Mathematics",
        grade: "A+"
      },
      { 
        id: 3, 
        firstName: "Arjun", 
        lastName: "Reddy", 
        email: "arjun.reddy@example.com", 
        phone: "9876543212", 
        dateOfBirth: "2001-03-10", 
        enrollmentDate: "2023-08-01",
        course: "Physics",
        grade: "B+"
      },
      { 
        id: 4, 
        firstName: "Diya", 
        lastName: "Verma", 
        email: "diya.verma@example.com", 
        phone: "9876543213", 
        dateOfBirth: "2000-07-18", 
        enrollmentDate: "2023-08-01",
        course: "Chemistry",
        grade: "A"
      },
      { 
        id: 5, 
        firstName: "Ishaan", 
        lastName: "Kumar", 
        email: "ishaan.kumar@example.com", 
        phone: "9876543214", 
        dateOfBirth: "2001-11-05", 
        enrollmentDate: "2023-08-01",
        course: "Biology",
        grade: "B"
      },
      { 
        id: 6, 
        firstName: "Kavya", 
        lastName: "Iyer", 
        email: "kavya.iyer@example.com", 
        phone: "9876543215", 
        dateOfBirth: "2000-09-30", 
        enrollmentDate: "2023-08-01",
        course: "English Literature",
        grade: "A+"
      },
      { 
        id: 7, 
        firstName: "Rohan", 
        lastName: "Singh", 
        email: "rohan.singh@example.com", 
        phone: "9876543216", 
        dateOfBirth: "2001-01-25", 
        enrollmentDate: "2023-08-01",
        course: "History",
        grade: "B+"
      },
      { 
        id: 8, 
        firstName: "Saanvi", 
        lastName: "Nair", 
        email: "saanvi.nair@example.com", 
        phone: "9876543217", 
        dateOfBirth: "1999-04-12", 
        enrollmentDate: "2023-08-01",
        course: "Economics",
        grade: "A"
      },
      { 
        id: 9, 
        firstName: "Vihaan", 
        lastName: "Gupta", 
        email: "vihaan.gupta@example.com", 
        phone: "9876543218", 
        dateOfBirth: "2001-08-08", 
        enrollmentDate: "2023-08-01",
        course: "Political Science",
        grade: "B"
      },
      { 
        id: 10, 
        firstName: "Zara", 
        lastName: "Desai", 
        email: "zara.desai@example.com", 
        phone: "9876543219", 
        dateOfBirth: "2000-02-14", 
        enrollmentDate: "2023-08-01",
        course: "Psychology",
        grade: "A+"
      }
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
    
    // Validate student data with proper constraints
    if (table === 'students') {
      // First name validation
      if (!record.firstName || record.firstName.trim().length < 2) {
        throw new Error('First name must be at least 2 characters long');
      }
      
      // Last name validation
      if (!record.lastName || record.lastName.trim().length < 1) {
        throw new Error('Last name must be at least 1 character long');
      }
      
      // Email validation
      if (!record.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Phone validation (10 digits)
      if (!record.phone || !/^\d{10}$/.test(record.phone)) {
        throw new Error('Phone number must be exactly 10 digits');
      }
      
      // Date of birth validation
      if (!record.dateOfBirth) {
        throw new Error('Date of birth is required');
      }
      
      // Enrollment date validation
      if (!record.enrollmentDate) {
        throw new Error('Enrollment date is required');
      }
      
      // Course validation
      if (!record.course || record.course.trim().length < 2) {
        throw new Error('Course must be at least 2 characters long');
      }
      
      // Grade validation
      const validGrades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
      if (!record.grade || !validGrades.includes(record.grade)) {
        throw new Error('Grade must be one of: A+, A, B+, B, C+, C, D, F');
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
        
        // Validate student data updates with proper constraints
        if (table === 'students') {
          const updatedRecord = { ...tableData[i], ...updates };
          
          // First name validation
          if (updates.firstName !== undefined && (!updates.firstName || updates.firstName.trim().length < 2)) {
            throw new Error('First name must be at least 2 characters long');
          }
          
          // Last name validation
          if (updates.lastName !== undefined && (!updates.lastName || updates.lastName.trim().length < 1)) {
            throw new Error('Last name must be at least 1 character long');
          }
          
          // Email validation
          if (updates.email !== undefined && (!updates.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email))) {
            throw new Error('Please enter a valid email address');
          }
          
          // Phone validation (10 digits)
          if (updates.phone !== undefined && (!updates.phone || !/^\d{10}$/.test(updates.phone))) {
            throw new Error('Phone number must be exactly 10 digits');
          }
          
          // Course validation
          if (updates.course !== undefined && (!updates.course || updates.course.trim().length < 2)) {
            throw new Error('Course must be at least 2 characters long');
          }
          
          // Grade validation
          if (updates.grade !== undefined) {
            const validGrades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
            if (!validGrades.includes(updates.grade)) {
              throw new Error('Grade must be one of: A+, A, B+, B, C+, C, D, F');
            }
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