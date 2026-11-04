
const db = require("./src/config/database");

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS admin_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL DEFAULT 'new_order',
            order_id INTEGER,
            order_number TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            total_amount REAL NOT NULL,
            is_read INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log("SUCCESS: Admin notifications table created!");

    const table = db.prepare(`
        PRAGMA table_info(admin_notifications)
    `).all();

    console.log("\nTable columns:");

    table.forEach((column) => {
        console.log(`- ${column.name}`);
    });

} catch (error) {
    console.error("Migration failed:", error.message);
} finally {
    db.close();
}
