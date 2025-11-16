// Simple test to verify database implementation works
console.log("Testing database implementation...");

// Simple in-memory database implementation for demo purposes
class SimpleDB {
  constructor() {
    this.data = {
      notes: [],
      goals: [],
      sessions: [],
      users: []
    };
    this.initializeDemoData();
  }

  // Initialize with some demo data
  initializeDemoData() {
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
  }

  // SQL-like SELECT operation
  select(table, condition) {
    const tableData = this.data[table] || [];
    if (condition) {
      return tableData.filter(condition);
    }
    return [...tableData]; // Return a copy
  }

  // SQL-like INSERT operation
  insert(table, record) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    
    // Generate ID if not provided
    if (!record.id) {
      const maxId = Math.max(0, ...this.data[table].map(item => item.id || 0));
      record.id = maxId + 1;
    }
    
    this.data[table].push(record);
    return record;
  }

  // SQL-like UPDATE operation
  update(table, condition, updates) {
    const tableData = this.data[table] || [];
    let count = 0;
    
    for (let i = 0; i < tableData.length; i++) {
      if (condition(tableData[i])) {
        this.data[table][i] = { ...tableData[i], ...updates };
        count++;
      }
    }
    
    return count;
  }

  // SQL-like DELETE operation
  delete(table, condition) {
    const tableData = this.data[table] || [];
    const initialLength = tableData.length;
    
    this.data[table] = tableData.filter(item => !condition(item));
    
    return initialLength - this.data[table].length;
  }

  // Get all tables
  getTables() {
    return Object.keys(this.data);
  }

  // Get table info (like DESCRIBE in SQL)
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
  }

  // Get raw data (for debugging)
  getData() {
    return { ...this.data };
  }
}

// Test the database
const db = new SimpleDB();

console.log("1. Available tables:", db.getTables());
console.log("2. Notes table fields:", db.describe("notes"));
console.log("3. Number of notes:", db.select("notes").length);

// Insert a new note
const newNote = {
  title: "Test Note",
  content: "This is a test note for the database demo",
  date: "2024-01-20",
  category: "Test"
};
const insertedNote = db.insert("notes", newNote);
console.log("4. Inserted note with ID:", insertedNote.id);

// Update a note
const updatedCount = db.update(
  "notes",
  (note) => note.id === 1,
  { title: "Updated React Hooks" }
);
console.log("5. Updated notes count:", updatedCount);

// Delete a note
const deletedCount = db.delete(
  "notes",
  (note) => note.id === 3
);
console.log("6. Deleted notes count:", deletedCount);

console.log("7. Final note count:", db.select("notes").length);
console.log("8. Test completed successfully!");