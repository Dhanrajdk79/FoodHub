
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Define database directory and file path
const dbDirectory = path.join(__dirname, "../../database");
const dbPath = path.join(dbDirectory, "foodhub.db");

// Create database directory if it does not exist
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

console.log("Database path:", dbPath);

// Connect to SQLite database
const db = new Database(dbPath);

// Enable foreign keys and WAL mode
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

console.log("Database file exists:", fs.existsSync(dbPath));
console.log("FoodHub SQLite Database connected successfully!");

module.exports = db;
