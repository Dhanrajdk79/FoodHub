
import API from "./api";

// Register a new customer
export const registerUser = async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
};

// Shared login for customers and admins
export const loginUser = async (credentials) => {
    const response = await API.post("/auth/login", credentials);

    const data = response.data;

    if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
};

// Get logged-in user profile
export const getProfile = async () => {
    const response = await API.get("/auth/profile");
    return response.data;
};

// Logout
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
