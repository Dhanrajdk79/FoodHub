
const db = require("./database");

// Categories
const categories = [
    ["Pizza", "Delicious Italian pizzas"],
    ["Burger", "Fresh and tasty burgers"],
    ["Indian", "Traditional Indian food"],
    ["Chinese", "Chinese cuisine"],
    ["Beverages", "Refreshing drinks"]
];

// Food items: name, description, price, category
const foods = [
    ["Margherita Pizza", "Classic cheese pizza", 199, "Pizza"],
    ["Farmhouse Pizza", "Loaded vegetable pizza", 299, "Pizza"],
    ["Veg Burger", "Fresh vegetable burger", 99, "Burger"],
    ["Cheese Burger", "Burger with extra cheese", 149, "Burger"],
    ["Paneer Tikka", "Grilled paneer with spices", 249, "Indian"],
    ["Veg Biryani", "Aromatic vegetable biryani", 179, "Indian"],
    ["Veg Noodles", "Stir-fried vegetable noodles", 149, "Chinese"],
    ["Fried Rice", "Chinese-style fried rice", 159, "Chinese"],
    ["Cold Coffee", "Chilled creamy coffee", 99, "Beverages"],
    ["Mojito", "Refreshing mint drink", 89, "Beverages"]
];

const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (name, description)
    VALUES (?, ?)
`);

const insertFood = db.prepare(`
    INSERT INTO foods (name, description, price, category_id)
    SELECT ?, ?, ?, id
    FROM categories
    WHERE name = ?
    AND NOT EXISTS (
        SELECT 1 FROM foods WHERE name = ?
    )
`);

const seedDatabase = db.transaction(() => {
    for (const category of categories) {
        insertCategory.run(...category);
    }

    for (const food of foods) {
        insertFood.run(
            food[0],
            food[1],
            food[2],
            food[3],
            food[0]
        );
    }
});

try {
    seedDatabase();
    console.log("FoodHub sample data inserted successfully!");
} catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
}
