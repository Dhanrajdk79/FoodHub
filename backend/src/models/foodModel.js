
const db = require("../config/database");

// Get available foods for customers
const getAllFoods = () => {
    const query = `
        SELECT
            foods.id,
            foods.name,
            foods.description,
            foods.price,
            foods.image,
            foods.is_available,
            categories.name AS category_name
        FROM foods
        INNER JOIN categories
            ON foods.category_id = categories.id
        WHERE foods.is_available = 1
        ORDER BY foods.id DESC
    `;

    return db.prepare(query).all();
};

// Get all foods for admin (including unavailable foods)
const getAllFoodsForAdmin = () => {
    const query = `
        SELECT
            foods.id,
            foods.name,
            foods.description,
            foods.price,
            foods.image,
            foods.category_id,
            foods.is_available,
            categories.name AS category_name
        FROM foods
        INNER JOIN categories
            ON foods.category_id = categories.id
        ORDER BY foods.id DESC
    `;

    return db.prepare(query).all();
};

// Add a new food item
const addFood = (food) => {
    const query = `
        INSERT INTO foods
            (name, description, price, image, category_id, is_available)
        VALUES
            (@name, @description, @price, @image, @category_id, @is_available)
    `;

    const result = db.prepare(query).run({
        name: food.name,
        description: food.description || "",
        price: food.price,
        image: food.image || "",
        category_id: food.category_id,
        is_available: food.is_available === false ? 0 : 1
    });

    return db.prepare(`
        SELECT * FROM foods WHERE id = ?
    `).get(result.lastInsertRowid);
};

// Delete a food item
const deleteFood = (id) => {
    const query = `DELETE FROM foods WHERE id = ?`;
    return db.prepare(query).run(id);
};

// Change food availability
const updateFoodAvailability = (id, isAvailable) => {
    const query = `
        UPDATE foods
        SET is_available = ?
        WHERE id = ?
    `;

    return db.prepare(query).run(isAvailable ? 1 : 0, id);
};

module.exports = {
    getAllFoods,
    getAllFoodsForAdmin,
    addFood,
    deleteFood,
    updateFoodAvailability
};
