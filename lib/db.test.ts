// Simple test to verify database implementation
import { sqlCommands } from "./db";

console.log("=== Database Implementation Test ===");

// Test 1: Show tables
console.log("\n1. Showing tables:");
const tables = sqlCommands.showTables();
console.log(tables);

// Test 2: Describe a table
console.log("\n2. Describing 'notes' table:");
const notesFields = sqlCommands.describe("notes");
console.log(notesFields);

// Test 3: Select all from notes
console.log("\n3. Selecting all notes:");
const allNotes = sqlCommands.select("notes");
console.log(`Found ${allNotes.length} notes`);

// Test 4: Insert a new note
console.log("\n4. Inserting a new note:");
const newNote = {
  title: "Test Note",
  content: "This is a test note for the database demo",
  date: "2024-01-20",
  category: "Test"
};
const insertedNote = sqlCommands.insert("notes", newNote);
console.log(`Inserted note with ID: ${insertedNote.id}`);

// Test 5: Select updated notes
console.log("\n5. Selecting notes after insert:");
const updatedNotes = sqlCommands.select("notes");
console.log(`Found ${updatedNotes.length} notes`);

// Test 6: Update a note
console.log("\n6. Updating first note:");
if (updatedNotes.length > 0) {
  const firstNoteId = updatedNotes[0].id;
  const updatedCount = sqlCommands.update(
    "notes",
    (note: any) => note.id === firstNoteId,
    { title: "Updated: " + updatedNotes[0].title }
  );
  console.log(`Updated ${updatedCount} note(s)`);
}

// Test 7: Delete a note
console.log("\n7. Deleting last note:");
if (updatedNotes.length > 0) {
  const lastNoteId = updatedNotes[updatedNotes.length - 1].id;
  const deletedCount = sqlCommands.delete(
    "notes",
    (note: any) => note.id === lastNoteId
  );
  console.log(`Deleted ${deletedCount} note(s)`);
}

// Test 8: Final count
console.log("\n8. Final note count:");
const finalNotes = sqlCommands.select("notes");
console.log(`Found ${finalNotes.length} notes`);

console.log("\n=== Test Complete ===");