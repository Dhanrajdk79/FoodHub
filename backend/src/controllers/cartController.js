
const Cart = require("../models/cartModel");
const db = require("../config/database");

// Get customer's cart
const getCart = (req, res) => {
    try {
        const userId = req.user.id;

        const cart = Cart.getOrCreateCart(userId);
        const items = Cart.getCartItems(cart.id);

        const totalItems = items.reduce(
            (total, item) => total + item.quantity,
            0
        );

        const totalPrice = items.reduce(
            (total, item) => total + item.subtotal,
            0
        );

        return res.status(200).json({
            success: true,
            cart: {
                cartId: cart.id,
                items,
                totalItems,
                totalPrice
            }
        });

    } catch (error) {
        console.error("Get cart error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch cart"
        });
    }
};

// Add food to cart
const addToCart = (req, res) => {
    try {
        const userId = req.user.id;
        const { foodId, quantity = 1 } = req.body;

        if (!Number.isInteger(foodId) || foodId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid foodId is required"
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        // Verify food exists and is available
        const food = db.prepare(`
            SELECT id
            FROM foods
            WHERE id = ? AND is_available = 1
        `).get(foodId);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found or unavailable"
            });
        }

        const cart = Cart.getOrCreateCart(userId);

        const items = Cart.addItemToCart(
            cart.id,
            foodId,
            quantity
        );

        return res.status(200).json({
            success: true,
            message: "Food added to cart",
            items
        });

    } catch (error) {
        console.error("Add to cart error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to add food to cart"
        });
    }
};

// Update cart item quantity
const updateCartItem = (req, res) => {
    try {
        const userId = req.user.id;
        const foodId = Number(req.params.foodId);
        const { quantity } = req.body;

        if (!Number.isInteger(foodId) || foodId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid food ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be zero or a positive integer"
            });
        }

        const cart = Cart.getCartByUserId(userId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const items = Cart.updateItemQuantity(
            cart.id,
            foodId,
            quantity
        );

        return res.status(200).json({
            success: true,
            message: quantity === 0
                ? "Item removed from cart"
                : "Cart quantity updated",
            items
        });

    } catch (error) {
        console.error("Update cart error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update cart"
        });
    }
};

// Remove food from cart
const removeCartItem = (req, res) => {
    try {
        const userId = req.user.id;
        const foodId = Number(req.params.foodId);

        const cart = Cart.getCartByUserId(userId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const items = Cart.removeItemFromCart(
            cart.id,
            foodId
        );

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            items
        });

    } catch (error) {
        console.error("Remove cart item error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to remove cart item"
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem
};
