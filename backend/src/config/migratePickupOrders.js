
const db = require("./database");

try {
    // Check existing columns before adding new ones
    const columns = db.prepare(`
        PRAGMA table_info(orders)
    `).all();

    const existingColumns = columns.map(column => column.name);

    // Add pickup-related columns
    if (!existingColumns.includes("order_number")) {
        db.exec(`
            ALTER TABLE orders
            ADD COLUMN order_number TEXT
        `);
    }

    if (!existingColumns.includes("customer_name")) {
        db.exec(`
            ALTER TABLE orders
            ADD COLUMN customer_name TEXT
        `);
    }

    if (!existingColumns.includes("customer_phone")) {
        db.exec(`
            ALTER TABLE orders
            ADD COLUMN customer_phone TEXT
        `);
    }

    if (!existingColumns.includes("pickup_time")) {
        db.exec(`
            ALTER TABLE orders
            ADD COLUMN pickup_time DATETIME
        `);
    }

    // Add an index for order numbers
    db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS
        idx_orders_order_number
        ON orders(order_number)
    `);

    console.log("Pickup order migration completed successfully!");

} catch (error) {
    console.error("Pickup order migration failed:", error.message);
    process.exitCode = 1;
}

