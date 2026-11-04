const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "database", "foodhub.db");
const db = new Database(dbPath);

let migrationStarted = false;

try {
    // Disable foreign keys before starting the transaction.
    db.pragma("foreign_keys = OFF");

    const migrate = db.transaction(() => {
        // Create the replacement orders table.
        db.exec(`
            CREATE TABLE orders_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                address_id INTEGER,
                total_amount REAL NOT NULL CHECK(total_amount >= 0),

                order_status TEXT DEFAULT 'confirmed'
                    CHECK(order_status IN (
                        'confirmed',
                        'completed',
                        'cancelled'
                    )),

                payment_status TEXT DEFAULT 'pending'
                    CHECK(payment_status IN (
                        'pending',
                        'paid',
                        'failed',
                        'refunded'
                    )),

                payment_method TEXT
                    CHECK(payment_method IN (
                        'online',
                        'cod',
                        'upi',
                        'card'
                    )),

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                order_number TEXT,
                customer_name TEXT,
                customer_phone TEXT,
                pickup_time DATETIME,
                payment_reference TEXT,

                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(address_id) REFERENCES addresses(id)
                    ON DELETE SET NULL
            );
        `);

        // Copy all existing orders without changing their IDs or statuses.
        db.exec(`
            INSERT INTO orders_new (
                id,
                user_id,
                address_id,
                total_amount,
                order_status,
                payment_status,
                payment_method,
                created_at,
                order_number,
                customer_name,
                customer_phone,
                pickup_time,
                payment_reference
            )
            SELECT
                id,
                user_id,
                address_id,
                total_amount,
                order_status,
                payment_status,
                payment_method,
                created_at,
                order_number,
                customer_name,
                customer_phone,
                pickup_time,
                payment_reference
            FROM orders;
        `);

        // Replace the original table.
        db.exec(`DROP TABLE orders;`);
        db.exec(`ALTER TABLE orders_new RENAME TO orders;`);

        // Verify all 12 orders are preserved.
        const orderCount = db.prepare(
            "SELECT COUNT(*) AS total FROM orders"
        ).get().total;

        const itemCount = db.prepare(
            "SELECT COUNT(*) AS total FROM order_items"
        ).get().total;

        if (orderCount !== 12 || itemCount !== 23) {
            throw new Error(
                `Record verification failed: orders=${orderCount}, items=${itemCount}`
            );
        }
    });

    migrate();
    migrationStarted = true;

    // Re-enable foreign keys and verify relationships.
    db.pragma("foreign_keys = ON");

    const foreignKeyErrors = db.pragma("foreign_key_check");

    if (foreignKeyErrors.length > 0) {
        throw new Error(
            "Foreign-key verification failed: " +
            JSON.stringify(foreignKeyErrors)
        );
    }

    console.log("\nSUCCESS: Migration completed!");
    console.log("Allowed statuses: confirmed, completed, cancelled");
    console.log("Orders preserved: 12");
    console.log("Order items preserved: 23");
    console.log("Foreign-key check: PASSED");

} catch (error) {
    console.error("\nMIGRATION FAILED:");
    console.error(error.message);

    if (migrationStarted) {
        console.error(
            "The table migration committed. Do not rerun it; inspect the database."
        );
    }

    process.exitCode = 1;

} finally {
    // Ensure foreign keys are enabled before closing.
    db.pragma("foreign_keys = ON");
    db.close();
}