
const Category = require("../models/categoryModel");

const getCategories = (req, res) => {
    try {
        const categories = Category.getAllCategories();

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {
        console.error("Get categories error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
};

module.exports = {
    getCategories
};
