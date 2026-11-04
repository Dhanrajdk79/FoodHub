
import "./MyOrders.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Package,
    Clock,
    ShoppingBag,
    RefreshCw,
    Printer,
    CreditCard,
    Wallet
} from "lucide-react";

import {
    getMyOrders,
    cancelMyOrder
} from "../services/orderService";

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [cancellingOrder, setCancellingOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyOrders();
            setOrders(response.orders || []);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load your orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (order) => {
        const cancellationReason = window.prompt(
            `Why do you want to cancel order ${order.order_number}?`
        );

        if (cancellationReason === null) return;

        const trimmedReason = cancellationReason.trim();

        if (!trimmedReason) {
            setError("Cancellation reason is required.");
            return;
        }

        if (trimmedReason.length > 500) {
            setError("Cancellation reason cannot exceed 500 characters.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmed) return;

        try {
            setCancellingOrder(order.id);
            setError("");
            setSuccess("");

            const response = await cancelMyOrder(
                order.id,
                trimmedReason
            );

            const updatedOrder = response.order;

            if (updatedOrder) {
                setOrders((previousOrders) =>
                    previousOrders.map((item) =>
                        item.id === order.id
                            ? { ...item, ...updatedOrder }
                            : item
                    )
                );
            } else {
                await fetchOrders();
            }

            setSuccess(
                "Your order has been cancelled successfully."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to cancel your order."
            );
        } finally {
            setCancellingOrder(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not available";

        let normalizedDate = date;

        if (
            typeof date === "string" &&
            /^\d{4}-\d{2}-\d{2}[ T]/.test(date) &&
            !/(Z|[+-]\d{2}:\d{2})$/i.test(date)
        ) {
            normalizedDate = date.replace(" ", "T") + "Z";
        }

        const parsedDate = new Date(normalizedDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata"
        });
    };

    const formatStatus = (status) => {
        if (!status) return "Unknown";

        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const formatPaymentMethod = (method) => {
        const methods = {
            cod: "Cash on Pickup",
            upi: "UPI",
            card: "Card",
            online: "Online Payment"
        };

        return methods[method?.toLowerCase()] || "Not available";
    };

    const formatPaymentStatus = (status) => {
        const statuses = {
            paid: "Paid",
            pending: "Pending",
            failed: "Failed",
            refunded: "Refunded"
        };

        return statuses[status?.toLowerCase()] || "Unknown";
    };

    const formatRefundStatus = (status) => {
        return formatStatus(status || "not_required");
    };

    const getRefundStyle = (status) => {
        const styles = {
            pending: {
                backgroundColor: "#fff2d9",
                color: "#996000"
            },
            refunded: {
                backgroundColor: "#e5f5f2",
                color: "#147767"
            },
            not_required: {
                backgroundColor: "#f0f0f0",
                color: "#666"
            }
        };

        return {
            display: "inline-block",
            padding: "7px 11px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "700",
            ...styles[status?.toLowerCase()] || styles.not_required
        };
    };

    if (loading) {
        return (
            <div className="my-orders-message">
                <RefreshCw className="loading-icon" size={25} />
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <div className="my-orders-container">

                <div className="my-orders-header">
                    <div>
                        <span className="orders-eyebrow">
                            YOUR FOODHUB ACCOUNT
                        </span>
                        <h1>My Orders</h1>
                        <p>Track your orders and payment information.</p>
                    </div>

                    <button
                        onClick={fetchOrders}
                        className="refresh-orders"
                        disabled={loading}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="orders-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        style={{
                            backgroundColor: "#e5f5f2",
                            color: "#147767",
                            border: "1px solid #bce5dc",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}
                    >
                        {success}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-orders-icon">
                            <ShoppingBag size={38} />
                        </div>

                        <h2>No orders yet</h2>
                        <p>
                            You haven't placed any orders.
                            Explore our menu and order something delicious!
                        </p>

                        <Link to="/shop">
                            Explore Food Menu
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="orders-count">
                            <Package size={18} />
                            <span>
                                You have <strong>{orders.length}</strong>{" "}
                                {orders.length === 1 ? "order" : "orders"}
                            </span>
                        </div>

                        <div className="orders-list">
                            {orders.map((order) => (
                                <div className="order-card" key={order.id}>

                                    <div className="order-card-header">
                                        <div>
                                            <span className="order-label">
                                                ORDER NUMBER
                                            </span>
                                            <h3>
                                                {order.order_number || `#${order.id}`}
                                            </h3>
                                        </div>

                                        <span
                                            className={`order-status status-${(
                                                order.order_status || "unknown"
                                            ).toLowerCase()}`}
                                        >
                                            {formatStatus(order.order_status)}
                                        </span>
                                    </div>

                                    <div className="order-details">
                                        <div className="order-detail-item">
                                            <Clock size={17} />
                                            <div>
                                                <span>Order Placed</span>
                                                <strong>
                                                    {formatDate(order.created_at)}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="order-detail-item">
                                            <Package size={17} />
                                            <div>
                                                <span>Pickup Time</span>
                                                <strong>
                                                    {formatDate(order.pickup_time)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    {order.order_status?.toLowerCase() === "cancelled" && (
                                        <div
                                            style={{
                                                marginTop: "16px",
                                                padding: "14px 16px",
                                                backgroundColor: "#fff3f0",
                                                border: "1px solid #ffd5cc",
                                                borderRadius: "8px"
                                            }}
                                        >
                                            <strong
                                                style={{
                                                    display: "block",
                                                    color: "#c0392b",
                                                    marginBottom: "6px"
                                                }}
                                            >
                                                Cancellation Reason
                                            </strong>

                                            <p style={{ margin: 0, color: "#444" }}>
                                                {order.cancellation_reason?.trim() ||
                                                    "No cancellation reason provided."}
                                            </p>
                                        </div>
                                    )}

                                    <div className="order-payment-details">
                                        <div className="payment-detail-item">
                                            <div className="payment-detail-label">
                                                <CreditCard size={17} />
                                                <span>Payment Method</span>
                                            </div>
                                            <strong>
                                                {formatPaymentMethod(
                                                    order.payment_method
                                                )}
                                            </strong>
                                        </div>

                                        <div className="payment-detail-item">
                                            <div className="payment-detail-label">
                                                <Wallet size={17} />
                                                <span>Payment Status</span>
                                            </div>

                                            <span
                                                className={`payment-status payment-${(
                                                    order.payment_status || "unknown"
                                                ).toLowerCase()}`}
                                            >
                                                {formatPaymentStatus(
                                                    order.payment_status
                                                )}
                                            </span>
                                        </div>

                                        <div className="payment-detail-item">
                                            <div className="payment-detail-label">
                                                <Wallet size={17} />
                                                <span>Refund Status</span>
                                            </div>

                                            <span style={getRefundStyle(order.refund_status)}>
                                                {formatRefundStatus(order.refund_status)}
                                            </span>
                                        </div>
                                    </div>

                                    {order.order_status?.toLowerCase() === "confirmed" && (
                                        <button
                                            type="button"
                                            onClick={() => handleCancelOrder(order)}
                                            disabled={cancellingOrder === order.id}
                                            style={{
                                                marginTop: "18px",
                                                padding: "10px 16px",
                                                border: "none",
                                                borderRadius: "7px",
                                                backgroundColor: "#b52d2d",
                                                color: "#fff",
                                                fontWeight: "600",
                                                cursor: cancellingOrder === order.id
                                                    ? "not-allowed"
                                                    : "pointer",
                                                opacity: cancellingOrder === order.id
                                                    ? 0.6
                                                    : 1
                                            }}
                                        >
                                            {cancellingOrder === order.id
                                                ? "Cancelling..."
                                                : "Cancel Order"}
                                        </button>
                                    )}

                                    <div className="order-card-footer">
                                        <div>
                                            <span>Total Amount</span>
                                            <h3>
                                                ₹{Number(
                                                    order.total_amount || 0
                                                ).toFixed(2)}
                                            </h3>
                                        </div>

                                        <Link
                                            to={`/invoice/${order.id}`}
                                            className="print-invoice-button"
                                        >
                                            <Printer size={17} />
                                            View / Print Invoice
                                        </Link>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

export default MyOrders;
