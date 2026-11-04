const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getProfile
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Customer registration
router.post("/register", registerUser);

// Shared login - automatically detects customer/admin
router.post("/login", loginUser);

// Protected user profile
router.get("/profile", protect, getProfile);

module.exports = router;