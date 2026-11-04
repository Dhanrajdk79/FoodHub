
const express = require("express");
const router = express.Router();

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// Food controller
const {
    getAdminFoods,
    createFood,
    removeFood,
    changeFoodAvailability
} = require("../controllers/foodController");

// Order controller
const {
    getAllOrders,
    getAdminOrderById,
    changeOrderStatus,
    deleteCompletedOrder,
    deleteAllCompletedOrders,
    changeRefundStatus
} = require("../controllers/orderController");

// Customer controller
const {
    getAllCustomers,
    removeCustomer
} = require("../controllers/authController");

// Notification controller
const {
    getNotifications,
    getUnreadNotificationCount,
        clearReadNotifications,
    markNotificationAsRead
} = require("../controllers/notificationController");

// Analytics controller
const {
    getSalesOverview,
    getMonthlySales,
    getPaymentStatistics,
    getBestSellingFoods
} = require("../controllers/analyticsController");

// Protect all admin routes
router.use(protect, adminOnly);


// =====================================
// FOOD MANAGEMENT
// =====================================

router.get("/foods", getAdminFoods);
router.post("/foods", createFood);
router.delete("/foods/:id", removeFood);
router.patch("/foods/:id/availability", changeFoodAvailability);


// =====================================
// ORDER MANAGEMENT
// =====================================

router.get("/orders", getAllOrders);
router.get("/orders/:id", getAdminOrderById);

router.patch("/orders/:id/status", changeOrderStatus);
router.patch("/orders/:id/refund", changeRefundStatus);

router.delete("/orders/completed", deleteAllCompletedOrders);
router.delete("/orders/:id", deleteCompletedOrder);


// =====================================
// CUSTOMER MANAGEMENT
// =====================================

router.get("/customers", getAllCustomers);
router.delete("/customers/:id", removeCustomer);


// =====================================
// ADMIN NOTIFICATIONS
// =====================================

router.get("/notifications", getNotifications);
router.delete("/notifications/read", clearReadNotifications);
router.get(
    "/notifications/unread-count",
    getUnreadNotificationCount
);

router.patch(
    "/notifications/:id/read",
    markNotificationAsRead
);


// =====================================
// SALES & REVENUE ANALYTICS
// =====================================

router.get("/analytics/overview", getSalesOverview);

router.get("/analytics/monthly", getMonthlySales);

router.get("/analytics/payments", getPaymentStatistics);

router.get(
    "/analytics/best-selling-foods",
    getBestSellingFoods
);


module.exports = router;
