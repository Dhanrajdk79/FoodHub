
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "../../database/foodhub.db");

console.log("Database path:", dbPath);

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

console.log("Database file exists:", fs.existsSync(dbPath));
console.log("FoodHub SQLite Database connected successfully!");

module.exports = db;
