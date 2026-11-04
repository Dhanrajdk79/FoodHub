
const express = require("express");
const router = express.Router();

const {
    placeOrder,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

// All customer order routes require authentication
router.use(protect);

// Place a new order
router.post("/", placeOrder);

// Get logged-in customer's orders
router.get("/my-orders", getMyOrders);

// Cancel an order
router.patch("/:id/cancel", cancelMyOrder);

// Get one customer's order
router.get("/:id", getMyOrderById);

module.exports = router;
