
import API from "./api";

// CUSTOMER: Place a new order
export const placeOrder = async (orderData) => {
    const response = await API.post("/orders", orderData);
    return response.data;
};

// CUSTOMER: Get logged-in customer's orders
export const getMyOrders = async () => {
    const response = await API.get("/orders/my-orders");
    return response.data;
};

// CUSTOMER: Get individual customer order
export const getMyOrderById = async (orderId) => {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
};

// CUSTOMER: Cancel own confirmed order with reason
export const cancelMyOrder = async (orderId, cancellationReason) => {
    const response = await API.patch(
        `/orders/${orderId}/cancel`,
        {
            cancellationReason
        }
    );

    return response.data;
};

// ADMIN: Get all customer orders
export const getAllOrders = async () => {
    const response = await API.get("/admin/orders");
    return response.data;
};

// ADMIN: Get individual order details
export const getAdminOrderById = async (orderId) => {
    const response = await API.get(`/admin/orders/${orderId}`);
    return response.data;
};

// ADMIN: Update order status with cancellation reason
export const updateOrderStatus = async (
    orderId,
    orderStatus,
    cancellationReason = null
) => {
    const response = await API.patch(
        `/admin/orders/${orderId}/status`,
        {
            order_status: orderStatus,
            cancellationReason
        }
    );

    return response.data;
};

// ADMIN: Update refund status
export const updateRefundStatus = async (orderId, refundStatus) => {
    const response = await API.patch(
        `/admin/orders/${orderId}/refund`,
        {
            refund_status: refundStatus
        }
    );

    return response.data;
};

// ADMIN: Delete one completed order
export const deleteCompletedOrder = async (orderId) => {
    const response = await API.delete(`/admin/orders/${orderId}`);
    return response.data;
};

// ADMIN: Delete all completed orders
export const deleteAllCompletedOrders = async () => {
    const response = await API.delete("/admin/orders/completed");
    return response.data;
};
