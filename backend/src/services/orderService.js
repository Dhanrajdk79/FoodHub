
import API from "./api";

// Admin: Get all customer orders
export const getAllOrders = async () => {
    const response = await API.get("/admin/orders");
    return response.data;
};

// Admin: Get individual order details
export const getAdminOrderById = async (orderId) => {
    const response = await API.get(`/admin/orders/${orderId}`);
    return response.data;
};

// Admin: Update order status
export const updateOrderStatus = async (orderId, orderStatus) => {
    const response = await API.patch(
        `/admin/orders/${orderId}/status`,
        { order_status: orderStatus }
    );

    return response.data;
};
