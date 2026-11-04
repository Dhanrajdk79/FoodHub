
import API from "./api";

// Customer: Get available foods
export const getFoods = async () => {
    const response = await API.get("/foods");
    return response.data;
};

// Get food categories
export const getCategories = async () => {
    const response = await API.get("/categories");
    return response.data;
};

// Admin: Get all foods, including unavailable items
export const getAdminFoods = async () => {
    const response = await API.get("/admin/foods");
    return response.data;
};

// Admin: Add food
export const addFood = async (foodData) => {
    const response = await API.post("/admin/foods", foodData);
    return response.data;
};

// Admin: Delete food
export const deleteFood = async (foodId) => {
    const response = await API.delete(`/admin/foods/${foodId}`);
    return response.data;
};

// Admin: Update food availability
export const updateFoodAvailability = async (foodId, isAvailable) => {
    const response = await API.patch(
        `/admin/foods/${foodId}/availability`,
        { is_available: isAvailable }
    );

    return response.data;
};
