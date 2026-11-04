    
const db = require("./src/config/database");

try {
    const columns = db.prepare(
        "PRAGMA table_info(orders)"
    ).all();

    const refundColumnExists = columns.some(
        (column) => column.name === "refund_status"
    );

    if (refundColumnExists) {
        console.log("refund_status column already exists.");
    } else {
        db.exec(`
            ALTER TABLE orders
            ADD COLUMN refund_status TEXT DEFAULT 'not_required'
        `);

        console.log("refund_status column added successfully.");
    }

    console.log(
        "Existing orders:",
        db.prepare("SELECT COUNT(*) AS count FROM orders").get().count
    );

    console.log(
        "Refund status migration completed successfully!"
    );

} catch (error) {
    console.error("Refund migration failed:", error.message);
    process.exitCode = 1;
} finally {
    db.close();
}
