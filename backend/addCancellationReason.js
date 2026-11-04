const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "database", "foodhub.db");
const db = new Database(dbPath);

try {
    const columns = db.pragma("table_info(orders)");

    const columnExists = columns.some(
        column => column.name === "cancellation_reason"
    );

    if (!columnExists) {
        db.exec(`
            ALTER TABLE orders
            ADD COLUMN cancellation_reason TEXT DEFAULT NULL
        `);

        console.log("Cancellation reason column added!");
    } else {
        console.log("Cancellation reason column already exists.");
    }

    console.log("\nUpdated orders table:");
    console.table(db.pragma("table_info(orders)"));

} catch (error) {
    console.error("Migration failed:", error.message);
} finally {
    db.close();
}