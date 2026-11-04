
import API from "./api";

// Get all registered customers
export const getAllCustomers = async () => {
    const response = await API.get("/admin/customers");
    return response.data;
};

// Delete a customer
export const deleteCustomer = async (customerId) => {
    const response = await API.delete(`/admin/customers/${customerId}`);
    return response.data;
};
