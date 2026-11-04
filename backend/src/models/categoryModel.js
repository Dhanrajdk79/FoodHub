
const db = require("../config/database");

const getAllCategories = () => {
    const query = `
        SELECT
            id,
            name,
            description,
            image
        FROM categories
        WHERE is_active = 1
        ORDER BY name ASC
    `;

    return db.prepare(query).all();
};

module.exports = {
    getAllCategories
};
