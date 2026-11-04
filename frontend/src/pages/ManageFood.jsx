
import { useEffect, useState } from "react";
import {
    getAdminFoods,
    getCategories,
    addFood,
    deleteFood,
    updateFoodAvailability
} from "../services/foodService";

import "./ManageFood.css";

function ManageFood() {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        image: "",
        category_id: ""
    });

    // Load food and categories
    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [foodResponse, categoryResponse] =
                await Promise.all([
                    getAdminFoods(),
                    getCategories()
                ]);

            setFoods(foodResponse.data || []);
            setCategories(categoryResponse.data || []);

        } catch (err) {
            console.error("Loading error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load food items."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handle form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Add food
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await addFood({
                ...formData,
                price: Number(formData.price),
                category_id: Number(formData.category_id)
            });

            setMessage("Food added successfully!");

            setFormData({
                name: "",
                description: "",
                price: "",
                image: "",
                category_id: ""
            });

            await loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to add food."
            );
        } finally {
            setSaving(false);
        }
    };

    // Toggle availability
    const handleAvailability = async (food) => {
        try {
            setError("");
            setMessage("");

            await updateFoodAvailability(
                food.id,
                !Boolean(food.is_available)
            );

            setMessage("Food availability updated successfully!");

            await loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update availability."
            );
        }
    };

    // Delete food
    const handleDelete = async (food) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${food.name}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await deleteFood(food.id);

            setMessage("Food deleted successfully!");

            await loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete food."
            );
        }
    };

    return (
        <main className="manage-food-page">

            <div className="manage-food-header">
                <div>
                    <p>FOODHUB ADMIN PANEL</p>
                    <h1>Manage Food</h1>
                    <span>
                        Add, manage and control food availability.
                    </span>
                </div>

                <div className="food-total">
                    <span>Total Food Items</span>
                    <strong>{foods.length}</strong>
                </div>
            </div>

            {message && (
                <div className="admin-success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="admin-error-message">
                    {error}
                </div>
            )}

            {/* Add Food Form */}
            <section className="add-food-section">
                <h2>Add New Food</h2>

                <form onSubmit={handleSubmit}>
                    <div className="food-form-grid">

                        <div className="food-form-group">
                            <label>Food Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter food name"
                                required
                            />
                        </div>

                        <div className="food-form-group">
                            <label>Price (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Enter price"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="food-form-group">
                            <label>Category *</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select category
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="food-form-group">
                            <label>Image URL</label>
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="Enter image URL"
                            />
                        </div>

                        <div className="food-form-group food-description">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter food description"
                                rows="3"
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="add-food-btn"
                        disabled={saving}
                    >
                        {saving ? "Adding..." : "+ Add Food"}
                    </button>
                </form>
            </section>

            {/* Food List */}
            <section className="food-list-section">
                <div className="food-list-heading">
                    <h2>All Food Items</h2>

                    <button
                        type="button"
                        onClick={loadData}
                        className="refresh-food-btn"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p className="food-loading">Loading food items...</p>
                ) : foods.length === 0 ? (
                    <p className="food-loading">
                        No food items found.
                    </p>
                ) : (
                    <div className="food-table-wrapper">
                        <table className="admin-food-table">
                            <thead>
                                <tr>
                                    <th>Food</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Availability</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {foods.map((food) => (
                                    <tr key={food.id}>
                                        <td>
                                            <div className="admin-food-info">
                                                {food.image ? (
                                                    <img
                                                        src={food.image}
                                                        alt={food.name}
                                                    />
                                                ) : (
                                                    <div className="food-image-placeholder">
                                                        🍽️
                                                    </div>
                                                )}

                                                <div>
                                                    <strong>{food.name}</strong>
                                                    <small>{food.description}</small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{food.category_name}</td>

                                        <td>₹{Number(food.price).toFixed(2)}</td>

                                        <td>
                                            <button
                                                type="button"
                                                className={`availability-btn ${
                                                    food.is_available
                                                        ? "available"
                                                        : "unavailable"
                                                }`}
                                                onClick={() =>
                                                    handleAvailability(food)
                                                }
                                            >
                                                {food.is_available
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="delete-food-btn"
                                                onClick={() =>
                                                    handleDelete(food)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

        </main>
    );
}

export default ManageFood;
