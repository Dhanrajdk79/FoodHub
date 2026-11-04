const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(__dirname, "database", "foodhub.db"),
    { readonly: true }
);

for (const table of [
    "orders",
    "order_items",
    "payments",
    "invoices",
    "notifications"
]) {
    const result = db.prepare(
        `SELECT COUNT(*) AS total FROM "${table}"`
    ).get();

    console.log(`${table}: ${result.total}`);
}

const schema = db.prepare(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table' AND name = 'orders'
`).get();

console.log("\nCurrent order status constraint:");
console.log(schema.sql);

console.log("\nForeign key errors:");
console.log(db.pragma("foreign_key_check"));

db.close();