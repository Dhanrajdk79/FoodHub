
const db = require("./src/config/database");

try {
    const columns = db.prepare(
        "PRAGMA table_info(foods)"
    ).all();

    const columnNames = columns.map(column => column.name);

    if (!columnNames.includes("stock_quantity")) {
        db.exec(`
            ALTER TABLE foods
            ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0
        `);

        console.log("Added stock_quantity column.");
    } else {
        console.log("stock_quantity already exists.");
    }

    if (!columnNames.includes("low_stock_threshold")) {
        db.exec(`
            ALTER TABLE foods
            ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 5
        `);

        console.log("Added low_stock_threshold column.");
    } else {
        console.log("low_stock_threshold already exists.");
    }

    console.log("SUCCESS: Inventory database migration completed!");

} catch (error) {
    console.error("Inventory migration failed:", error);
} finally {
    db.close();
}
