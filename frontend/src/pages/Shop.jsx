
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Plus } from "lucide-react";

import { getFoods, getCategories } from "../services/foodService";
import { addToCart as addFoodToCart } from "../services/cartService";
import { useAuth } from "../context/AuthContext";

import "./Shop.css";

function Shop() {
    const { isAuthenticated } = useAuth();

    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [addingFoodId, setAddingFoodId] = useState(null);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const [foodResponse, categoryResponse] = await Promise.all([
                    getFoods(),
                    getCategories()
                ]);

                setFoods(foodResponse.data);
                setCategories(categoryResponse.data);
            } catch (error) {
                console.error("Shop loading error:", error);
                setMessage("Unable to load food items. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, []);

    const handleAddToCart = async (food) => {
        if (!isAuthenticated) {
            setMessage("Please login before adding food to your cart.");
            return;
        }

        try {
            setAddingFoodId(food.id);
            setMessage("");

            await addFoodToCart(food.id, 1);

            setMessage(`${food.name} added to your cart!`);
        } catch (error) {
            console.error("Add to cart error:", error);

            setMessage(
                error.response?.data?.message ||
                "Unable to add this item to your cart."
            );
        } finally {
            setAddingFoodId(null);
        }
    };

    const filteredFoods =
        selectedCategory === "All"
            ? foods
            : foods.filter(
                (food) => food.category_name === selectedCategory
            );

    if (loading) {
        return (
            <div className="shop-loading">
                <h2>Loading our menu...</h2>
            </div>
        );
    }

    return (
        <main className="shop-page">

            <section className="shop-heading">
                <div>
                    <span className="shop-eyebrow">FRESH • TASTY • DELIVERED TO PICKUP</span>
                    <h1>Explore Our Menu</h1>
                    <p>Find your favourites and add them to your cart.</p>
                </div>

                <Link to="/cart" className="shop-cart-link">
                    <ShoppingCart size={19} />
                    View Cart
                </Link>
            </section>

            <section className="shop-categories">
                <button
                    className={selectedCategory === "All" ? "selected" : ""}
                    onClick={() => setSelectedCategory("All")}
                >
                    All Foods
                </button>

                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={
                            selectedCategory === category.name ? "selected" : ""
                        }
                        onClick={() => setSelectedCategory(category.name)}
                    >
                        {category.name}
                    </button>
                ))}
            </section>

            {message && (
                <div className="shop-message">
                    {message}
                    {!isAuthenticated && (
                        <> <Link to="/login">Login here</Link>.</>
                    )}
                </div>
            )}

            <section className="shop-food-grid">
                {filteredFoods.length === 0 ? (
                    <p className="shop-empty">No food items found in this category.</p>
                ) : (
                    filteredFoods.map((food) => (
                        <article className="shop-food-card" key={food.id}>

                            <div className="shop-food-image">
                                <span>🍽️</span>
                            </div>

                            <div className="shop-food-details">
                                <span className="shop-food-category">
                                    {food.category_name}
                                </span>

                                <h3>{food.name}</h3>

                                <p>
                                    {food.description || "Freshly prepared and delicious."}
                                </p>

                                <div className="shop-food-bottom">
                                    <strong>₹{food.price}</strong>

                                    <button
                                        onClick={() => handleAddToCart(food)}
                                        disabled={
                                            !isAuthenticated ||
                                            addingFoodId === food.id ||
                                            food.is_available === 0
                                        }
                                    >
                                        <Plus size={16} />
                                        {addingFoodId === food.id
                                            ? "Adding..."
                                            : food.is_available === 0
                                                ? "Unavailable"
                                                : "Add"}
                                    </button>
                                </div>
                            </div>

                        </article>
                    ))
                )}
            </section>

            {!isAuthenticated && (
                <p className="shop-login-note">
                    <Link to="/login">Login</Link> to add food items to your cart.
                </p>
            )}

        </main>
    );
}

export default Shop;
