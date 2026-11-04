
import API from "./api";

// Get logged-in customer's cart
export const getCart = async () => {
    const response = await API.get("/cart");
    return response.data;
};

// Add food to cart
export const addToCart = async (foodId, quantity = 1) => {
    const response = await API.post("/cart/add", {
        foodId,
        quantity
    });

    return response.data;
};

// Update cart quantity
export const updateCartItem = async (foodId, quantity) => {
    const response = await API.put(`/cart/update/${foodId}`, {
        quantity
    });

    return response.data;
};

// Remove food from cart
export const removeCartItem = async (foodId) => {
    const response = await API.delete(`/cart/remove/${foodId}`);
    return response.data;
};
