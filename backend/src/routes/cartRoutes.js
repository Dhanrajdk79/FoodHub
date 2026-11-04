
const express = require("express");
const router = express.Router();

const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem
} = require("../controllers/cartController");

const {
    protect
} = require("../middleware/authMiddleware");

// All cart routes require customer authentication
router.use(protect);

// Get customer's cart
router.get("/", getCart);

// Add food to cart
router.post("/add", addToCart);

// Update food quantity
router.put("/update/:foodId", updateCartItem);

// Remove food from cart
router.delete("/remove/:foodId", removeCartItem);

module.exports = router;
