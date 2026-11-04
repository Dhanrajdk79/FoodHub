
const Food = require("../models/foodModel");

// Customer: Get available foods
const getFoods = (req, res) => {
    try {
        const foods = Food.getAllFoods();

        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (error) {
        console.error("Get foods error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch food items"
        });
    }
};

// Admin: Get all foods
const getAdminFoods = (req, res) => {
    try {
        const foods = Food.getAllFoodsForAdmin();

        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (error) {
        console.error("Get admin foods error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch food items"
        });
    }
};

// Admin: Add food
const createFood = (req, res) => {
    try {
        const { name, description, price, image, category_id } = req.body;

        if (!name || price === undefined || !category_id) {
            return res.status(400).json({
                success: false,
                message: "Name, price and category are required"
            });
        }

        const parsedPrice = Number(price);
        const parsedCategoryId = Number(category_id);

        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0 ||
            !Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid price and category"
            });
        }

        const food = Food.addFood({
            name: name.trim(),
            description,
            price: parsedPrice,
            image,
            category_id: parsedCategoryId
        });

        return res.status(201).json({
            success: true,
            message: "Food added successfully",
            data: food
        });
    } catch (error) {
        console.error("Add food error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to add food"
        });
    }
};

// Admin: Delete food
const removeFood = (req, res) => {
    try {
        const result = Food.deleteFood(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Food item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Food deleted successfully"
        });
    } catch (error) {
        console.error("Delete food error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not delete food. It may be linked to an existing order."
        });
    }
};

// Admin: Update availability
const changeFoodAvailability = (req, res) => {
    try {
        const { is_available } = req.body;

        if (typeof is_available !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_available must be true or false"
            });
        }

        const result = Food.updateFoodAvailability(
            req.params.id,
            is_available
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Food item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Food availability updated successfully"
        });
    } catch (error) {
        console.error("Availability update error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update food availability"
        });
    }
};

module.exports = {
    getFoods,
    getAdminFoods,
    createFood,
    removeFood,
    changeFoodAvailability
};
