
import { useEffect, useState } from "react";
import {
    getAllOrders,
    getAdminOrderById,
    updateOrderStatus,
    updateRefundStatus,
    deleteCompletedOrder,
    deleteAllCompletedOrders
} from "../services/orderService";

import "./ManageOrders.css";

const ORDER_STATUSES = [
    "confirmed",
    "completed",
    "cancelled"
];

function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [updatingRefund, setUpdatingRefund] = useState(null);
    const [deletingOrder, setDeletingOrder] = useState(null);
    const [deletingAll, setDeletingAll] = useState(false);

    const completedOrders = orders.filter(
        (order) => order.order_status === "completed"
    );

    const loadOrders = async () => {
        try {
            setError("");
            const response = await getAllOrders();
            setOrders(response.orders || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to load orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleViewDetails = async (orderId) => {
        try {
            setDetailsLoading(true);
            setSelectedOrder(null);
            setError("");
            setSuccess("");

            const response = await getAdminOrderById(orderId);
            setSelectedOrder(response.order);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load order details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        let cancellationReason = null;

        if (newStatus === "cancelled") {
            cancellationReason = window.prompt(
                "Please enter the reason for cancelling this order:"
            );

            if (cancellationReason === null) return;

            cancellationReason = cancellationReason.trim();

            if (!cancellationReason) {
                setError("Cancellation reason is required.");
                return;
            }

            if (cancellationReason.length > 500) {
                setError(
                    "Cancellation reason cannot exceed 500 characters."
                );
                return;
            }
        }

        try {
            setUpdatingOrder(orderId);
            setError("");
            setSuccess("");

            await updateOrderStatus(
                orderId,
                newStatus,
                cancellationReason
            );

            await loadOrders();

            if (selectedOrder?.id === orderId) {
                const response = await getAdminOrderById(orderId);
                setSelectedOrder(response.order);
            }

            setSuccess(
                newStatus === "cancelled"
                    ? "Order cancelled and reason saved successfully."
                    : "Order status updated successfully."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update order status."
            );
        } finally {
            setUpdatingOrder(null);
        }
    };

    // ADMIN: Mark a pending refund as refunded
    const handleRefundUpdate = async (orderId) => {
        const confirmed = window.confirm(
            "Have you successfully processed the actual refund outside FoodHub? Confirm to mark this refund as refunded."
        );

        if (!confirmed) return;

        try {
            setUpdatingRefund(orderId);
            setError("");
            setSuccess("");

            await updateRefundStatus(orderId, "refunded");

            await loadOrders();

            if (selectedOrder?.id === orderId) {
                const response = await getAdminOrderById(orderId);
                setSelectedOrder(response.order);
            }

            setSuccess("Refund status updated to Refunded successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update refund status."
            );
        } finally {
            setUpdatingRefund(null);
        }
    };

    const handleDeleteOrder = async (order) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete order ${order.order_number}?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setDeletingOrder(order.id);
            setError("");
            setSuccess("");

            await deleteCompletedOrder(order.id);

            setOrders((previousOrders) =>
                previousOrders.filter((item) => item.id !== order.id)
            );

            if (selectedOrder?.id === order.id) {
                setSelectedOrder(null);
            }

            setSuccess(
                `Order ${order.order_number} deleted successfully.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete completed order."
            );
        } finally {
            setDeletingOrder(null);
        }
    };

    const handleDeleteAllCompleted = async () => {
        if (completedOrders.length === 0) {
            setError("There are no completed orders to delete.");
            return;
        }

        const confirmed = window.confirm(
            `Permanently delete all ${completedOrders.length} completed orders?`
        );

        if (!confirmed) return;

        try {
            setDeletingAll(true);
            setError("");
            setSuccess("");

            const response = await deleteAllCompletedOrders();

            setOrders((previousOrders) =>
                previousOrders.filter(
                    (order) => order.order_status !== "completed"
                )
            );

            if (selectedOrder?.order_status === "completed") {
                setSelectedOrder(null);
            }

            setSuccess(
                response.message || "Completed orders deleted successfully."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete completed orders."
            );
        } finally {
            setDeletingAll(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not available";

        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    const getStatusClass = (status) => {
        return `order-status status-${status}`;
    };

    const getRefundStatus = (status) => {
        return status || "not_required";
    };

    if (loading) {
        return <div className="orders-loading">Loading orders...</div>;
    }

    return (
        <main className="manage-orders-page">
            <header className="manage-orders-header">
                <div>
                    <p className="admin-eyebrow">FOODHUB ADMIN PANEL</p>
                    <h1>Manage Orders</h1>
                    <p>View customer orders and manage their status.</p>
                </div>

                <div className="orders-count">
                    <strong>{orders.length}</strong>
                    <span>Total Orders</span>
                </div>
            </header>

            {error && (
                <div className="orders-error">{error}</div>
            )}

            {success && (
                <div className="orders-success">{success}</div>
            )}

            <section className="orders-table-section">
                <div className="orders-section-heading">
                    <div>
                        <h2>Customer Orders</h2>
                        <p className="completed-orders-count">
                            Completed orders: {completedOrders.length}
                        </p>
                    </div>

                    <div className="orders-heading-actions">
                        <button
                            type="button"
                            onClick={loadOrders}
                            className="refresh-orders-button"
                            disabled={deletingAll}
                        >
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteAllCompleted}
                            className="delete-all-orders-button"
                            disabled={
                                completedOrders.length === 0 ||
                                deletingAll ||
                                deletingOrder !== null
                            }
                        >
                            {deletingAll
                                ? "Deleting..."
                                : "Delete All Completed"}
                        </button>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        No customer orders found.
                    </div>
                ) : (
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Pickup Time</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Refund</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>{order.order_number}</strong>
                                            <small>#{order.id}</small>
                                        </td>

                                        <td>
                                            {order.customer_name ||
                                                order.account_customer_name ||
                                                "Customer"}
                                        </td>

                                        <td>
                                            {order.customer_phone || "N/A"}
                                        </td>

                                        <td>
                                            {formatDate(order.pickup_time)}
                                        </td>

                                        <td>
                                            ₹{Number(order.total_amount).toFixed(2)}
                                        </td>

                                        <td>
                                            <select
                                                className={getStatusClass(
                                                    order.order_status
                                                )}
                                                value={order.order_status}
                                                disabled={
                                                    updatingOrder === order.id ||
                                                    order.order_status !== "confirmed"
                                                }
                                                onChange={(event) =>
                                                    handleStatusChange(
                                                        order.id,
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                {ORDER_STATUSES.map((status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status.toUpperCase()}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <span className={`refund-status refund-${getRefundStatus(order.refund_status)}`}>
                                                {getRefundStatus(order.refund_status).replace("_", " ").toUpperCase()}
                                            </span>

                                            {order.order_status === "cancelled" &&
                                                order.refund_status === "pending" && (
                                                    <button
                                                        type="button"
                                                        className="refund-action-button"
                                                        onClick={() =>
                                                            handleRefundUpdate(order.id)
                                                        }
                                                        disabled={updatingRefund === order.id}
                                                    >
                                                        {updatingRefund === order.id
                                                            ? "Updating..."
                                                            : "Mark Refunded"}
                                                    </button>
                                                )}
                                        </td>

                                        <td>
                                            <div className="order-action-buttons">
                                                <button
                                                    type="button"
                                                    className="view-order-button"
                                                    onClick={() =>
                                                        handleViewDetails(order.id)
                                                    }
                                                >
                                                    View Details
                                                </button>

                                                {order.order_status === "completed" && (
                                                    <button
                                                        type="button"
                                                        className="delete-order-button"
                                                        onClick={() =>
                                                            handleDeleteOrder(order)
                                                        }
                                                        disabled={
                                                            deletingOrder === order.id ||
                                                            deletingAll
                                                        }
                                                    >
                                                        {deletingOrder === order.id
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {detailsLoading && (
                <p className="orders-loading">
                    Loading order details...
                </p>
            )}

            {selectedOrder && (
                <section className="order-details-section">
                    <div className="order-details-header">
                        <div>
                            <h2>Order Details</h2>
                            <p>{selectedOrder.order_number}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedOrder(null)}
                            className="close-details-button"
                        >
                            Close
                        </button>
                    </div>

                    <div className="order-customer-details">
                        <p>
                            <strong>Customer:</strong>{" "}
                            {selectedOrder.customer_name ||
                                selectedOrder.account_customer_name}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {selectedOrder.customer_email || "N/A"}
                        </p>

                        <p>
                            <strong>Phone:</strong>{" "}
                            {selectedOrder.customer_phone || "N/A"}
                        </p>

                        <p>
                            <strong>Pickup:</strong>{" "}
                            {formatDate(selectedOrder.pickup_time)}
                        </p>

                        <p>
                            <strong>Payment:</strong>{" "}
                            {selectedOrder.payment_method || "N/A"}
                        </p>

                        <p>
                            <strong>Payment Status:</strong>{" "}
                            {selectedOrder.payment_status || "N/A"}
                        </p>

                        <p>
                            <strong>Refund Status:</strong>{" "}
                            {getRefundStatus(selectedOrder.refund_status).toUpperCase()}
                        </p>

                        <p>
                            <strong>Order Status:</strong>{" "}
                            {selectedOrder.order_status?.toUpperCase()}
                        </p>

                        {selectedOrder.order_status === "cancelled" && (
                            <p>
                                <strong>Cancellation Reason:</strong>{" "}
                                {selectedOrder.cancellation_reason ||
                                    "No reason provided."}
                            </p>
                        )}
                    </div>

                    {selectedOrder.order_status === "cancelled" &&
                        selectedOrder.refund_status === "pending" && (
                            <button
                                type="button"
                                className="refund-action-button"
                                onClick={() =>
                                    handleRefundUpdate(selectedOrder.id)
                                }
                                disabled={updatingRefund === selectedOrder.id}
                            >
                                {updatingRefund === selectedOrder.id
                                    ? "Updating..."
                                    : "Mark Refund as Completed"}
                            </button>
                        )}

                    <h3>Ordered Food Items</h3>

                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Food</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>

                            <tbody>
                                {(selectedOrder.items || []).map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.food_name}</td>
                                        <td>
                                            ₹{Number(item.price).toFixed(2)}
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>
                                            ₹{Number(item.subtotal).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="order-details-total">
                        Total: ₹
                        {Number(selectedOrder.total_amount).toFixed(2)}
                    </div>

                    {selectedOrder.order_status === "completed" && (
                        <button
                            type="button"
                            className="delete-order-button details-delete-button"
                            onClick={() => handleDeleteOrder(selectedOrder)}
                            disabled={
                                deletingOrder === selectedOrder.id ||
                                deletingAll
                            }
                        >
                            {deletingOrder === selectedOrder.id
                                ? "Deleting..."
                                : "Delete This Completed Order"}
                        </button>
                    )}
                </section>
            )}
        </main>
    );
}

export default ManageOrders;
 