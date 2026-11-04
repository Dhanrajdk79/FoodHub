
const db = require("./database");

const foods = db.prepare(`
    SELECT
        foods.id,
        foods.name AS food_name,
        foods.price,
        categories.name AS category_name
    FROM foods
    INNER JOIN categories
        ON foods.category_id = categories.id
    ORDER BY categories.name, foods.name
`).all();

console.table(foods);

console.log("Total Food Items:", foods.length);
