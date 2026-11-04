
import api from "./api";

// Get sales overview
export const getSalesOverview = async () => {
    const response = await api.get("/admin/analytics/overview");
    return response.data;
};

// Get monthly sales
export const getMonthlySales = async () => {
    const response = await api.get("/admin/analytics/monthly");
    return response.data;
};

// Get payment statistics
export const getPaymentStatistics = async () => {
    const response = await api.get("/admin/analytics/payments");
    return response.data;
};

// Get best-selling foods
export const getBestSellingFoods = async () => {
    const response = await api.get(
        "/admin/analytics/best-selling-foods"
    );
    return response.data;
};
