
const db = require("../config/database");

// Get overall sales statistics
const getSalesOverview = () => {
    return db.prepare(`
        SELECT
            COUNT(*) AS total_orders,

            SUM(
                CASE WHEN order_status = 'completed'
                THEN 1 ELSE 0 END
            ) AS completed_orders,

            SUM(
                CASE WHEN order_status = 'cancelled'
                THEN 1 ELSE 0 END
            ) AS cancelled_orders,

            SUM(
                CASE WHEN order_status = 'confirmed'
                THEN 1 ELSE 0 END
            ) AS confirmed_orders,

            COALESCE(SUM(
                CASE
                    WHEN order_status != 'cancelled'
                    AND payment_status = 'paid'
                    THEN total_amount
                    ELSE 0
                END
            ), 0) AS total_revenue

        FROM orders
    `).get();
};

// Get today's sales
const getTodaySales = () => {
    return db.prepare(`
        SELECT
            COUNT(*) AS today_orders,

            COALESCE(SUM(total_amount), 0) AS today_revenue

        FROM orders

        WHERE DATE(created_at) = DATE('now', 'localtime')
        AND order_status != 'cancelled'
        AND payment_status = 'paid'
    `).get();
};

// Get monthly sales
const getMonthlySales = () => {
    return db.prepare(`
        SELECT
            strftime('%Y-%m', created_at) AS month,

            COUNT(*) AS total_orders,

            COALESCE(SUM(total_amount), 0) AS revenue

        FROM orders

        WHERE order_status != 'cancelled'
        AND payment_status = 'paid'

        GROUP BY strftime('%Y-%m', created_at)

        ORDER BY month DESC
        LIMIT 12
    `).all();
};

// Get payment method statistics
const getPaymentStatistics = () => {
    return db.prepare(`
        SELECT
            payment_method,

            COUNT(*) AS total_orders,

            COALESCE(SUM(
                CASE WHEN payment_status = 'paid'
                AND order_status != 'cancelled'
                THEN total_amount ELSE 0 END
            ), 0) AS collected_amount

        FROM orders

        GROUP BY payment_method
    `).all();
};


// Get best-selling food items
const getBestSellingFoods = () => {
    return db.prepare(`
        SELECT
            oi.food_id,
            oi.food_name,
            SUM(oi.quantity) AS total_quantity,
            COUNT(DISTINCT oi.order_id) AS total_orders,
            SUM(oi.subtotal) AS total_sales

        FROM order_items oi

        INNER JOIN orders o
            ON oi.order_id = o.id

        WHERE o.order_status != 'cancelled'

        GROUP BY oi.food_id, oi.food_name

        ORDER BY total_quantity DESC

        LIMIT 10
    `).all();
};

module.exports = {
    getSalesOverview,
    getTodaySales,
    getMonthlySales,
    getPaymentStatistics,
    getBestSellingFoods
};
