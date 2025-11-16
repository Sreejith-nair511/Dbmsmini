# SQL Command Examples for Database Demo

## Basic Queries

### Show All Tables
```sql
SHOW TABLES
```

### Describe Table Structure
```sql
DESCRIBE notes
DESCRIBE goals
DESCRIBE sessions
DESCRIBE users
```

### Select All Records
```sql
SELECT * FROM notes
SELECT * FROM goals
SELECT * FROM sessions
SELECT * FROM users
```

### Select with Conditions
```sql
SELECT * FROM notes WHERE category = "Programming"
SELECT * FROM goals WHERE completed = false
SELECT * FROM sessions WHERE duration > 30
```

## Data Manipulation

### Insert New Records
```sql
INSERT INTO notes (title, content, date, category) VALUES ("New Note", "Note content", "2024-01-20", "Demo")
INSERT INTO goals (title, completed, deadline) VALUES ("Demo Goal", false, "2024-02-01")
INSERT INTO sessions (date, duration, subject) VALUES ("2024-01-20", 25, "Demo Session")
```

### Update Existing Records
```sql
UPDATE notes SET title = "Updated Title" WHERE id = 1
UPDATE goals SET completed = true WHERE id = 2
UPDATE sessions SET duration = 45 WHERE id = 3
UPDATE users SET name = "Updated Name" WHERE id = 1
```

### Delete Records
```sql
DELETE FROM notes WHERE id = 1
DELETE FROM goals WHERE completed = true
DELETE FROM sessions WHERE duration < 30
DELETE FROM users WHERE id = 1
```

## Advanced Queries

### Count Records
```sql
SELECT COUNT(*) FROM notes
SELECT COUNT(*) FROM goals WHERE completed = true
```

### Order Results
```sql
SELECT * FROM notes ORDER BY date DESC
SELECT * FROM sessions ORDER BY duration ASC
```

### Limit Results
```sql
SELECT * FROM notes LIMIT 5
SELECT * FROM goals LIMIT 3
```

## System Commands

### Reset Database
```sql
CLEAR
```

### View All Data
```sql
SHOW ALL DATA
```

## Demo Script

### 1. Initial State
```sql
SHOW TABLES
DESCRIBE notes
SELECT * FROM notes
```

### 2. Add New Data
```sql
INSERT INTO notes (title, content, date, category) VALUES ("Demo Note 1", "This is the first demo note", "2024-01-20", "Demo")
INSERT INTO notes (title, content, date, category) VALUES ("Demo Note 2", "This is the second demo note", "2024-01-21", "Demo")
SELECT * FROM notes
```

### 3. Modify Data
```sql
UPDATE notes SET title = "Updated Demo Note" WHERE id = (SELECT MAX(id) FROM notes)
SELECT * FROM notes
```

### 4. Remove Data
```sql
DELETE FROM notes WHERE category = "Demo"
SELECT * FROM notes
```

### 5. Reset Demo
```sql
CLEAR
SELECT * FROM notes
```

## Quick Action Buttons Equivalent

### INSERT New Note
Equivalent to:
```sql
INSERT INTO notes (title, content, date, category) VALUES ("Demo Note", "This note was added through the database interface", "2024-01-20", "Demo")
```

### UPDATE First Note
Equivalent to:
```sql
UPDATE notes SET title = "Updated: [Original Title]" WHERE id = [First Note ID]
```

### DELETE Last Note
Equivalent to:
```sql
DELETE FROM notes WHERE id = [Last Note ID]
```

### SHOW All Data
Equivalent to:
```sql
SELECT * FROM notes;
SELECT * FROM goals;
SELECT * FROM sessions;
SELECT * FROM users;
```

### RESET Database
Equivalent to:
```sql
CLEAR
```

These examples demonstrate the full range of SQL-like functionality available in the frontend database implementation for your personal productivity management system demo.