
import { useEffect, useState } from "react";

import {
    getAllCustomers,
    deleteCustomer
} from "../services/customerService";

import "./ManageCustomers.css";

function ManageCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getAllCustomers();

            if (result.success) {
                setCustomers(result.customers || []);
            } else {
                setError(result.message || "Unable to load customers.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load customers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDeleteCustomer = async (customer) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${customer.name}?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(customer.id);
            setMessage("");
            setError("");

            const result = await deleteCustomer(customer.id);

            if (result.success) {
                setCustomers((previousCustomers) =>
                    previousCustomers.filter(
                        (item) => item.id !== customer.id
                    )
                );

                setMessage(result.message);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete customer."
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="manage-customers">
            <div className="customers-header">
                <div>
                    <h2>Manage Customers</h2>
                    <p>View and manage registered FoodHub customers.</p>
                </div>

                <button
                    onClick={fetchCustomers}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            <div className="customers-summary">
                <div className="customer-summary-card">
                    <h3>{customers.length}</h3>
                    <p>Total Registered Customers</p>
                </div>
            </div>

            {message && (
                <p className="customers-success">{message}</p>
            )}

            {error && (
                <p className="customers-error">{error}</p>
            )}

            {loading ? (
                <p className="customers-message">
                    Loading customers...
                </p>
            ) : customers.length === 0 ? (
                <p className="customers-message">
                    No customers registered yet.
                </p>
            ) : (
                <div className="customers-table-wrapper">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Registration Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{customer.id}</td>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>
                                        {customer.phone || "Not provided"}
                                    </td>
                                    <td>
                                        {customer.created_at
                                            ? new Date(
                                                customer.created_at
                                            ).toLocaleDateString()
                                            : "Not available"}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="delete-customer-btn"
                                            onClick={() =>
                                                handleDeleteCustomer(customer)
                                            }
                                            disabled={
                                                deletingId === customer.id
                                            }
                                        >
                                            {deletingId === customer.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ManageCustomers;
