
const db = require("../config/database");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const { sendOrderConfirmation } = require("../services/emailService");

const eventBus = require("../eventBus");
// PLACE ORDER WITH COD OR DEMO ONLINE PAYMENT
const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            customerName,
            customerPhone,
            pickupTime,
            paymentMethod = "cod",
            demoUpiId,
            demoCardNumber
        } = req.body;

        // Validate customer details
        if (!customerName || !customerPhone) {
            return res.status(400).json({
                success: false,
                message: "Customer name and phone number are required."
            });
        }

        if (!/^[6-9]\d{9}$/.test(customerPhone)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit Indian mobile number."
            });
        }

        // Validate pickup time
        if (
            !pickupTime ||
            new Date(pickupTime).getTime() < Date.now() + 15 * 60 * 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Pickup time must be at least 15 minutes from now."
            });
        }

        // Validate payment method
        if (!["cod", "upi", "card"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method."
            });
        }

        // Get customer's cart
        const cart = db.prepare(`
            SELECT id FROM carts WHERE user_id = ?
        `).get(userId);

        if (!cart) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });
        }

        const items = db.prepare(`
            SELECT
                cart_items.food_id,
                cart_items.quantity,
                foods.name,
                foods.price,
                foods.is_available
            FROM cart_items
            JOIN foods ON cart_items.food_id = foods.id
            WHERE cart_items.cart_id = ?
        `).all(cart.id);

        if (items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });
        }

        // Check food availability
        for (const item of items) {
            if (!item.is_available) {
                return res.status(400).json({
                    success: false,
                    message: `${item.name} is currently unavailable.`
                });
            }
        }

        // Calculate total on the server
        const orderItems = items.map((item) => ({
            food_id: item.food_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        }));

        const totalAmount = orderItems.reduce(
            (total, item) => total + item.subtotal,
            0
        );

        // DEMO PAYMENT SIMULATION
        let paymentStatus = "pending";
        let paymentReference = null;

        if (paymentMethod === "upi") {
            if (!demoUpiId) {
                return res.status(400).json({
                    success: false,
                    message: "Enter a demo UPI ID."
                });
            }

            if (demoUpiId === "fail@foodhub") {
                return res.status(402).json({
                    success: false,
                    paymentStatus: "failed",
                    message: "Demo UPI payment failed. Please try again."
                });
            }

            if (demoUpiId !== "success@foodhub") {
                return res.status(400).json({
                    success: false,
                    message: "Use success@foodhub or fail@foodhub for this demo."
                });
            }

            paymentStatus = "paid";
        }

        if (paymentMethod === "card") {
            if (!demoCardNumber) {
                return res.status(400).json({
                    success: false,
                    message: "Enter a demo card number."
                });
            }

            const normalizedCard = String(demoCardNumber).replace(/\s/g, "");

            if (normalizedCard === "4000000000000002") {
                return res.status(402).json({
                    success: false,
                    paymentStatus: "failed",
                    message: "Demo card payment declined. Please try again."
                });
            }

            if (normalizedCard !== "4111111111111111") {
                return res.status(400).json({
                    success: false,
                    message: "Use the approved demo card number shown on the checkout page."
                });
            }

            paymentStatus = "paid";
        }

        // Generate demo transaction reference
        if (paymentMethod === "upi" || paymentMethod === "card") {
            paymentReference = `DEMO-${Date.now()}-${Math.floor(
                Math.random() * 10000
            )}`;
        }

        // Generate order number
        const orderNumber = `FH${Date.now()}`;

        // Create order
        const orderId = Order.createOrder(
            {
                userId,
                orderNumber,
                customerName,
                customerPhone,
                pickupTime,
                totalAmount,
                paymentStatus,
                paymentMethod,
                paymentReference
            },
            orderItems
        );

        const order = Order.getOrderById(orderId, userId);
        // Notify admin about the newly created order
eventBus.emit("order:created", {
    id: order.id,
    order_number: order.order_number,
    customer_name: order.customer_name,
    total_amount: order.total_amount
});

        // Send confirmation email
        try {
            const user = User.findById(userId);

            if (user && user.email) {
                await sendOrderConfirmation(user.email, order);
            }
        } catch (emailError) {
            console.error(
                "Order confirmation email failed:",
                emailError.message
            );
        }

        return res.status(201).json({
            success: true,
            message:
                paymentMethod === "cod"
                    ? "Pickup order placed successfully. Pay at pickup."
                    : "Demo payment successful and order placed!",
            order
        });

    } catch (error) {
        console.error("Place order error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to place order. Please try again."
        });
    }
};


// CUSTOMER: GET MY ORDERS
const getMyOrders = (req, res) => {
    try {
        const orders = Order.getOrdersByUserId(req.user.id);

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch your orders."
        });
    }
};


// CUSTOMER: GET ONE ORDER
const getMyOrderById = (req, res) => {
    try {
        const order = Order.getOrderById(req.params.id, req.user.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch order."
        });
    }
};


// ADMIN: GET ALL ORDERS
const getAllOrders = (req, res) => {
    try {
        const orders = Order.getAllOrders();

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch orders."
        });
    }
};


// ADMIN: GET ONE ORDER
const getAdminOrderById = (req, res) => {
    try {
        const order = Order.getAdminOrderById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get admin order error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch order."
        });
    }
};


// ADMIN: UPDATE ORDER STATUS
const changeOrderStatus = (req, res) => {
    try {
        // Accept both frontend request formats
        const status = req.body.order_status || req.body.status;

        const allowedStatuses = [
            "confirmed",
            "completed",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status."
            });
        }

        // Check whether the order exists
        const order = Order.getAdminOrderById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Only confirmed orders can be updated
        if (order.order_status !== "confirmed") {
            return res.status(400).json({
                success: false,
                message: "Only confirmed orders can be updated."
            });
        }

        // Validate cancellation reason
        let cancellationReason = null;

        if (status === "cancelled") {
            cancellationReason = String(
                req.body.cancellationReason || ""
            ).trim();

            if (!cancellationReason) {
                return res.status(400).json({
                    success: false,
                    message: "Cancellation reason is required."
                });
            }

            if (cancellationReason.length > 500) {
                return res.status(400).json({
                    success: false,
                    message: "Cancellation reason cannot exceed 500 characters."
                });
            }
        }

        // Update status and cancellation reason
        const result = Order.updateOrderStatus(
            req.params.id,
            status,
            cancellationReason
        );

        if (!result || result.changes === 0) {
            return res.status(400).json({
                success: false,
                message: "Unable to update order status."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            order_status: status,
            cancellation_reason: cancellationReason
        });

    } catch (error) {
        console.error("Update order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update order status.",
            error: error.message
        });
    }
};


// ADMIN: DELETE ONE COMPLETED ORDER
const deleteCompletedOrder = (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const result = Order.deleteCompletedOrder(orderId);

        if (!result.success) {
            return res.status(
                result.reason === "not_found" ? 404 : 400
            ).json({
                success: false,
                message:
                    result.reason === "not_found"
                        ? "Order not found."
                        : "Only completed orders can be deleted."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Completed order deleted successfully."
        });

    } catch (error) {
        console.error("Delete completed order error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete order."
        });
    }
};


// ADMIN: DELETE ALL COMPLETED ORDERS
const deleteAllCompletedOrders = (req, res) => {
    try {
        const result = Order.deleteAllCompletedOrders();

        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} completed order(s) deleted successfully.`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error("Delete all completed orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete completed orders."
        });
    }
};


// CUSTOMER: CANCEL OWN CONFIRMED ORDER
const cancelMyOrder = (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const cancellationReason = String(
            req.body.cancellationReason || ""
        ).trim();

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        if (!cancellationReason) {
            return res.status(400).json({
                success: false,
                message: "Cancellation reason is required."
            });
        }

        if (cancellationReason.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Cancellation reason cannot exceed 500 characters."
            });
        }

        // Verify that this order belongs to the logged-in customer
        const order = Order.getOrderById(orderId, req.user.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (order.order_status !== "confirmed") {
            return res.status(400).json({
                success: false,
                message: "Only confirmed orders can be cancelled."
            });
        }

        const result = Order.cancelCustomerOrder(
            orderId,
            req.user.id,
            cancellationReason
        );

        if (result.changes === 0) {
            return res.status(400).json({
                success: false,
                message: "Unable to cancel this order."
            });
        }

        const updatedOrder = Order.getOrderById(
            orderId,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully.",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Customer cancellation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel order."
        });
    }
};


// ADMIN: UPDATE REFUND STATUS
const changeRefundStatus = (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const refundStatus = req.body.refund_status;

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        if (refundStatus !== "refunded") {
            return res.status(400).json({
                success: false,
                message: "Invalid refund status."
            });
        }

        const order = Order.getAdminOrderById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            order.order_status !== "cancelled" ||
            order.refund_status !== "pending"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only cancelled orders with pending refunds can be updated."
            });
        }

        const result = Order.updateRefundStatus(
            orderId,
            refundStatus
        );

        if (result.changes === 0) {
            return res.status(400).json({
                success: false,
                message: "Unable to update refund status."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Refund status updated successfully.",
            refund_status: "refunded"
        });

    } catch (error) {
        console.error("Refund status update error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update refund status."
        });
    }
};


module.exports = {
    placeOrder,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    getAllOrders,
    getAdminOrderById,
    changeOrderStatus,
    changeRefundStatus,
    deleteCompletedOrder,
    deleteAllCompletedOrders
};
