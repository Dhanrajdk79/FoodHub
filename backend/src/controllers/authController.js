
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Generate JWT token
const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

// Customer Registration
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const existingUser = User.findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const userId = User.createUser(
            name.trim(),
            normalizedEmail,
            phone || null,
            passwordHash
        );

        return res.status(201).json({
            success: true,
            message: "Registration successful!",
            user: {
                id: userId,
                name: name.trim(),
                email: normalizedEmail,
                role: "customer"
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
};

// Shared Login - Automatically detects customer/admin
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user by email
        const user = User.findUserByEmail(normalizedEmail);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify role from database
        if (!["customer", "admin"].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "Account role is not authorized"
            });
        }

        // Generate JWT
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

// Get logged-in user profile
const getProfile = (req, res) => {
    try {
        const user = User.findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch profile"
        });
    }
};

// Get all registered customers
const getAllCustomers = (req, res) => {
    try {
        const customers = User.getAllCustomers();

        return res.status(200).json({
            success: true,
            count: customers.length,
            customers
        });

    } catch (error) {
        console.error("Get customers error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch customers"
        });
    }
};

// Delete customer
const removeCustomer = (req, res) => {
    try {
        const customerId = Number(req.params.id);

        if (!Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }

        const result = User.deleteCustomer(customerId);

        if (result.notFound) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (result.hasOrders) {
            return res.status(409).json({
                success: false,
                message: "This customer has existing orders and cannot be deleted."
            });
        }

        if (!result.deleted) {
            return res.status(500).json({
                success: false,
                message: "Customer could not be deleted"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer deleted successfully"
        });

    } catch (error) {
        console.error("Delete customer error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to delete customer"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    getAllCustomers,
    removeCustomer
};
