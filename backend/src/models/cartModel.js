
const db = require("../config/database");

// Find customer's cart
const getCartByUserId = (userId) => {
    return db.prepare(`
        SELECT id, user_id
        FROM carts
        WHERE user_id = ?
    `).get(userId);
};

// Create a new cart
const createCart = (userId) => {
    const result = db.prepare(`
        INSERT INTO carts (user_id)
        VALUES (?)
    `).run(userId);

    return result.lastInsertRowid;
};

// Get or create cart
const getOrCreateCart = (userId) => {
    let cart = getCartByUserId(userId);

    if (!cart) {
        const cartId = createCart(userId);

        cart = {
            id: cartId,
            user_id: userId
        };
    }

    return cart;
};

// Get cart items
const getCartItems = (cartId) => {
    return db.prepare(`
        SELECT
            ci.id,
            ci.food_id,
            ci.quantity,
            f.name,
            f.price,
            f.image,
            (f.price * ci.quantity) AS subtotal
        FROM cart_items ci
        INNER JOIN foods f ON ci.food_id = f.id
        WHERE ci.cart_id = ?
        ORDER BY ci.id DESC
    `).all(cartId);
};

// Add food to cart
const addItemToCart = (cartId, foodId, quantity) => {
    db.prepare(`
        INSERT INTO cart_items (cart_id, food_id, quantity)
        VALUES (?, ?, ?)
        ON CONFLICT(cart_id, food_id)
        DO UPDATE SET quantity = quantity + excluded.quantity
    `).run(cartId, foodId, quantity);

    return getCartItems(cartId);
};

// Update item quantity
const updateItemQuantity = (cartId, foodId, quantity) => {
    if (quantity <= 0) {
        db.prepare(`
            DELETE FROM cart_items
            WHERE cart_id = ? AND food_id = ?
        `).run(cartId, foodId);
    } else {
        db.prepare(`
            UPDATE cart_items
            SET quantity = ?
            WHERE cart_id = ? AND food_id = ?
        `).run(quantity, cartId, foodId);
    }

    return getCartItems(cartId);
};

// Remove item from cart
const removeItemFromCart = (cartId, foodId) => {
    db.prepare(`
        DELETE FROM cart_items
        WHERE cart_id = ? AND food_id = ?
    `).run(cartId, foodId);

    return getCartItems(cartId);
};

module.exports = {
    getCartByUserId,
    createCart,
    getOrCreateCart,
    getCartItems,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart
};
