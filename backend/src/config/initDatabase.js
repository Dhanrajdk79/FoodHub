
const db = require("./database");

const createTables = `
    -- 1. Users
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer'
            CHECK(role IN ('customer', 'admin')),
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Addresses
    CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        address_line TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. Categories
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        image TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Foods
    CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL CHECK(price >= 0),
        image TEXT,
        is_available INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id)
            ON DELETE RESTRICT
    );

    -- 5. Carts
    CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 6. Cart Items
    CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        food_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        UNIQUE(cart_id, food_id),
        FOREIGN KEY(cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY(food_id) REFERENCES foods(id) ON DELETE CASCADE
    );

    -- 7. Orders
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        address_id INTEGER,
        total_amount REAL NOT NULL CHECK(total_amount >= 0),
        order_status TEXT DEFAULT 'pending'
            CHECK(order_status IN (
                'pending', 'confirmed', 'preparing',
                'out_for_delivery', 'delivered', 'cancelled'
            )),
        payment_status TEXT DEFAULT 'pending'
            CHECK(payment_status IN (
                'pending', 'paid', 'failed', 'refunded'
            )),
        payment_method TEXT
            CHECK(payment_method IN ('online', 'cod')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(address_id) REFERENCES addresses(id)
            ON DELETE SET NULL
    );

    -- 8. Order Items
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        food_id INTEGER,
        food_name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY(food_id) REFERENCES foods(id) ON DELETE SET NULL
    );

    -- 9. Payments
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        provider TEXT,
        provider_order_id TEXT UNIQUE,
        provider_payment_id TEXT UNIQUE,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'created'
            CHECK(status IN ('created', 'success', 'failed', 'refunded')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(id)
    );

    -- 10. Invoices
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL UNIQUE,
        invoice_number TEXT NOT NULL UNIQUE,
        total_amount REAL NOT NULL,
        pdf_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(id)
    );

    -- 11. Notifications
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_id INTEGER,
        notification_type TEXT NOT NULL
            CHECK(notification_type IN ('sms', 'email')),
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(order_id) REFERENCES orders(id)
    );

    -- Indexes for faster queries
    CREATE INDEX IF NOT EXISTS idx_foods_category
    ON foods(category_id);

    CREATE INDEX IF NOT EXISTS idx_orders_user
    ON orders(user_id);

    CREATE INDEX IF NOT EXISTS idx_orders_status
    ON orders(order_status);

    CREATE INDEX IF NOT EXISTS idx_order_items_order
    ON order_items(order_id);

    CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id);
`;

try {
    db.exec(createTables);

    console.log("\nFoodHub Database Initialized!");
    console.log("All tables created successfully!");
} catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
}
