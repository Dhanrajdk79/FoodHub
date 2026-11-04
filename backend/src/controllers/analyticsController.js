
const Analytics = require("../models/analyticsModel");

// Get overall sales overview
const getSalesOverview = (req, res) => {
    try {
        const overview = Analytics.getSalesOverview();
        const today = Analytics.getTodaySales();

        res.status(200).json({
            success: true,
            overview,
            today
        });
    } catch (error) {
        console.error("Sales overview error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch sales overview"
        });
    }
};

// Get monthly sales
const getMonthlySales = (req, res) => {
    try {
        const sales = Analytics.getMonthlySales();

        res.status(200).json({
            success: true,
            sales
        });
    } catch (error) {
        console.error("Monthly sales error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch monthly sales"
        });
    }
};

// Get payment statistics
const getPaymentStatistics = (req, res) => {
    try {
        const statistics = Analytics.getPaymentStatistics();

        res.status(200).json({
            success: true,
            statistics
        });
    } catch (error) {
        console.error("Payment statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch payment statistics"
        });
    }
};


// Get best-selling food items
const getBestSellingFoods = (req, res) => {
    try {
        const foods = Analytics.getBestSellingFoods();

        res.status(200).json({
            success: true,
            foods
        });
    } catch (error) {
        console.error("Best-selling foods error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch best-selling foods"
        });
    }
};

module.exports = {
    getSalesOverview,
    getMonthlySales,
    getPaymentStatistics,
    getBestSellingFoods
};
