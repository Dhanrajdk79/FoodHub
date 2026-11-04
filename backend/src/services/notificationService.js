
const db = require("../config/database");
const eventBus = require("../eventBus");

// Save a notification whenever a new order is created
eventBus.on("order:created", (order) => {
    try {
        const result = db.prepare(`
            INSERT INTO admin_notifications (
                type,
                order_id,
                order_number,
                customer_name,
                total_amount
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            "new_order",
            order.id,
            order.order_number,
            order.customer_name,
            order.total_amount
        );

        console.log(
            `Admin notification created. ID: ${result.lastInsertRowid}`
        );

    } catch (error) {
        console.error(
            "Admin notification error:",
            error.message
        );
    }
});

console.log("Admin notification service initialized.");

module.exports = {};
