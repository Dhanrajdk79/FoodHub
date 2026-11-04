
const db = require("../config/database");

// Create order and save its items in one transaction
const createOrder = db.transaction((orderData, items) => {
    const orderResult = db.prepare(`
        INSERT INTO orders (
            user_id,
            order_number,
            customer_name,
            customer_phone,
            pickup_time,
            total_amount,
            order_status,
            payment_status,
            payment_method,
            payment_reference,
            refund_status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, 'not_required')
    `).run(
        orderData.userId,
        orderData.orderNumber,
        orderData.customerName,
        orderData.customerPhone,
        orderData.pickupTime,
        orderData.totalAmount,
        orderData.paymentStatus || "pending",
        orderData.paymentMethod || "cod",
        orderData.paymentReference || null
    );

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(`
        INSERT INTO order_items (
            order_id,
            food_id,
            food_name,
            price,
            quantity,
            subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
        insertItem.run(
            orderId,
            item.food_id,
            item.name,
            item.price,
            item.quantity,
            item.subtotal
        );
    }

    // Clear customer's cart after successful order creation
    const cart = db.prepare(`
        SELECT id FROM carts WHERE user_id = ?
    `).get(orderData.userId);

    if (cart) {
        db.prepare(`
            DELETE FROM cart_items WHERE cart_id = ?
        `).run(cart.id);
    }

    return orderId;
});

// CUSTOMER: Get all orders
const getOrdersByUserId = (userId) => {
    return db.prepare(`
        SELECT *
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    `).all(userId);
};

// CUSTOMER: Get one order with its items
const getOrderById = (orderId, userId) => {
    const order = db.prepare(`
        SELECT *
        FROM orders
        WHERE id = ? AND user_id = ?
    `).get(orderId, userId);

    if (!order) return null;

    const items = db.prepare(`
        SELECT *
        FROM order_items
        WHERE order_id = ?
    `).all(orderId);

    return { ...order, items };
};

// ADMIN: Get all orders with customer information
const getAllOrders = () => {
    return db.prepare(`
        SELECT
            orders.*,
            users.name AS account_customer_name,
            users.email AS customer_email
        FROM orders
        LEFT JOIN users ON orders.user_id = users.id
        ORDER BY orders.created_at DESC
    `).all();
};

// ADMIN: Get one order with food items
const getAdminOrderById = (orderId) => {
    const order = db.prepare(`
        SELECT
            orders.*,
            users.name AS account_customer_name,
            users.email AS customer_email
        FROM orders
        LEFT JOIN users ON orders.user_id = users.id
        WHERE orders.id = ?
    `).get(orderId);

    if (!order) return null;

    const items = db.prepare(`
        SELECT *
        FROM order_items
        WHERE order_id = ?
    `).all(orderId);

    return { ...order, items };
};

// ADMIN: Update order status and cancellation reason
const updateOrderStatus = (orderId, status, cancellationReason = null) => {
    return db.prepare(`
        UPDATE orders
        SET
            order_status = ?,
            cancellation_reason = ?,
            refund_status = CASE
                WHEN ? = 'cancelled'
                    AND payment_status = 'paid'
                    AND LOWER(payment_method) IN ('upi', 'card')
                THEN 'pending'
                ELSE 'not_required'
            END
        WHERE id = ?
    `).run(
        status,
        status === "cancelled" ? cancellationReason : null,
        status,
        orderId
    );
};

// CUSTOMER: Cancel own confirmed order
const cancelCustomerOrder = (orderId, userId, cancellationReason) => {
    return db.prepare(`
        UPDATE orders
        SET
            order_status = 'cancelled',
            cancellation_reason = ?,
            refund_status = CASE
                WHEN payment_status = 'paid'
                    AND LOWER(payment_method) IN ('upi', 'card')
                THEN 'pending'
                ELSE 'not_required'
            END
        WHERE id = ?
          AND user_id = ?
          AND order_status = 'confirmed'
    `).run(cancellationReason, orderId, userId);
};

// ADMIN: Update refund status
const updateRefundStatus = (orderId, refundStatus) => {
    return db.prepare(`
        UPDATE orders
        SET refund_status = ?
        WHERE id = ?
          AND order_status = 'cancelled'
          AND refund_status = 'pending'
    `).run(refundStatus, orderId);
};

// ADMIN: Delete one completed order
const deleteCompletedOrder = db.transaction((orderId) => {
    const order = db.prepare(`
        SELECT id, order_status
        FROM orders
        WHERE id = ?
    `).get(orderId);

    if (!order) {
        return { success: false, reason: "not_found" };
    }

    if (order.order_status !== "completed") {
        return { success: false, reason: "not_completed" };
    }

    db.prepare(`
        DELETE FROM order_items
        WHERE order_id = ?
    `).run(orderId);

    const result = db.prepare(`
        DELETE FROM orders
        WHERE id = ? AND order_status = 'completed'
    `).run(orderId);

    return {
        success: result.changes > 0,
        deletedCount: result.changes
    };
});

// ADMIN: Delete all completed orders
const deleteAllCompletedOrders = db.transaction(() => {
    db.prepare(`
        DELETE FROM order_items
        WHERE order_id IN (
            SELECT id
            FROM orders
            WHERE order_status = 'completed'
        )
    `).run();

    const deletedOrders = db.prepare(`
        DELETE FROM orders
        WHERE order_status = 'completed'
    `).run();

    return {
        success: true,
        deletedCount: deletedOrders.changes
    };
});

// Update payment information
const updatePaymentStatus = (
    orderId,
    paymentStatus,
    paymentReference
) => {
    return db.prepare(`
        UPDATE orders
        SET payment_status = ?,
            payment_reference = ?
        WHERE id = ?
    `).run(
        paymentStatus,
        paymentReference || null,
        orderId
    );
};

module.exports = {
    createOrder,
    getOrdersByUserId,
    getOrderById,
    getAllOrders,
    getAdminOrderById,
    updateOrderStatus,
    cancelCustomerOrder,
    updateRefundStatus,
    updatePaymentStatus,
    deleteCompletedOrder,
    deleteAllCompletedOrders
};
