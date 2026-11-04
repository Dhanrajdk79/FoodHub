
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cartRoutes = require("./routes/cartRoutes");

const foodRoutes = require("./routes/foodRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const app = express();
require("./services/notificationService");
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to FoodHub API"
    });
});

app.use("/api/foods", foodRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
module.exports = app;
