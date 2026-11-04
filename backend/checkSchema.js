 const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "database", "foodhub.db");

const db = new Database(dbPath, {
    readonly: true,
    fileMustExist: true
});

const relatedTables = [
    "orders",
    "order_items",
    "payments",
    "invoices",
    "notifications"
];

for (const table of relatedTables) {
    console.log(`\n========== ${table.toUpperCase()} ==========`);

    const schema = db.prepare(`
        SELECT sql
        FROM sqlite_master
        WHERE type = 'table' AND name = ?
    `).get(table);

    console.log("\nTABLE SCHEMA:");
    console.log(schema ? schema.sql : "Table not found");

    const count = db.prepare(
        `SELECT COUNT(*) AS total FROM "${table}"`
    ).get();

    console.log("\nRECORD COUNT:", count.total);

    const objects = db.prepare(`
        SELECT type, name, sql
        FROM sqlite_master
        WHERE tbl_name = ?
        AND type IN ('index', 'trigger')
    `).all(table);

    console.log("\nINDEXES AND TRIGGERS:");
    console.log(objects);
}

console.log("\n========== FOREIGN KEY CHECK ==========");
console.log(db.pragma("foreign_key_check"));

db.close();