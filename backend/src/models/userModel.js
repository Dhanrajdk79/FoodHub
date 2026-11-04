
const db = require("../config/database");

// Find user by email
const findUserByEmail = (email) => {
    return db.prepare(`
        SELECT *
        FROM users
        WHERE email = ?
    `).get(email);
};

// Create customer account
const createUser = (name, email, phone, passwordHash) => {
    const query = `
        INSERT INTO users (
            name,
            email,
            phone,
            password_hash,
            role
        )
        VALUES (?, ?, ?, ?, 'customer')
    `;

    const result = db.prepare(query).run(
        name,
        email,
        phone || null,
        passwordHash
    );

    return result.lastInsertRowid;
};

// Create admin account
const createAdmin = (name, email, phone, passwordHash) => {
    const query = `
        INSERT INTO users (
            name,
            email,
            phone,
            password_hash,
            role
        )
        VALUES (?, ?, ?, ?, 'admin')
    `;

    const result = db.prepare(query).run(
        name,
        email,
        phone || null,
        passwordHash
    );

    return result.lastInsertRowid;
};

// Count existing admin accounts
const countAdmins = () => {
    return db.prepare(`
        SELECT COUNT(*) AS total
        FROM users
        WHERE role = 'admin'
    `).get().total;
};

// Find user by ID
const findUserById = (id) => {
    return db.prepare(`
        SELECT id, name, email, phone, role
        FROM users
        WHERE id = ?
    `).get(id);
};

// Get all customers
const getAllCustomers = () => {
    return db.prepare(`
        SELECT
            id,
            name,
            email,
            phone,
            created_at
        FROM users
        WHERE role = 'customer'
        ORDER BY created_at DESC
    `).all();
};

// Delete customer only if no orders exist
const deleteCustomer = (customerId) => {
    const customer = db.prepare(`
        SELECT id
        FROM users
        WHERE id = ? AND role = 'customer'
    `).get(customerId);

    if (!customer) {
        return { deleted: false, notFound: true };
    }

    const existingOrders = db.prepare(`
        SELECT COUNT(*) AS total
        FROM orders
        WHERE user_id = ?
    `).get(customerId).total;

    if (existingOrders > 0) {
        return { deleted: false, hasOrders: true };
    }

    const result = db.prepare(`
        DELETE FROM users
        WHERE id = ? AND role = 'customer'
    `).run(customerId);

    return { deleted: result.changes > 0 };
};

module.exports = {
    findUserByEmail,
    createUser,
    createAdmin,
    countAdmins,
    findUserById,
    findById: findUserById,
    getAllCustomers,
    deleteCustomer
};
