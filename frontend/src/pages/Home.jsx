
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    ShoppingBag,
    ShoppingCart,
    Utensils,
    Clock,
    CheckCircle
} from "lucide-react";

import { getFoods, getCategories } from "../services/foodService";
import { addToCart } from "../services/cartService";
import { useAuth } from "../context/AuthContext";

import "./Home.css";

function Home() {
    const { isAuthenticated } = useAuth();

    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [addingFoodId, setAddingFoodId] = useState(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [foodResponse, categoryResponse] = await Promise.all([
                    getFoods(),
                    getCategories()
                ]);

                setFoods(foodResponse.data);
                setCategories(categoryResponse.data);
            } catch (error) {
                console.error("Home page loading error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const handleAddToCart = async (food) => {
        if (!isAuthenticated) {
            setMessage("Please login before adding food to your cart.");
            return;
        }

        try {
            setAddingFoodId(food.id);
            setMessage("");

            await addToCart(food.id, 1);

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

    const featuredFoods = foods
        .filter((food) => food.is_available !== 0)
        .slice(0, 4);

    const categoryEmojis = {
        Pizza: "🍕",
        Burger: "🍔",
        Indian: "🍛",
        Chinese: "🥡",
        Beverages: "🥤"
    };

    return (
        <main className="home-page">

            {/* Hero Section */}
            <section className="home-hero">

                <div className="home-hero-content">
                    <span className="home-hero-label">
                        WELCOME TO FOODHUB
                    </span>

                    <h1>
                        Delicious Food.
                        <br />
                        <span>Happy Moments.</span>
                    </h1>

                    <p>
                        Discover your favourite meals, order online
                        and enjoy convenient restaurant pickup.
                    </p>

                    <div className="home-hero-actions">
                        <Link to="/shop" className="home-primary-button">
                            Explore Menu
                            <ArrowRight size={18} />
                        </Link>

                        <Link to="/cart" className="home-secondary-button">
                            <ShoppingCart size={18} />
                            View Cart
                        </Link>
                    </div>
                </div>

                <div className="home-hero-visual">
                    <div className="home-hero-food-circle">
                        <span>🍔</span>
                        <span>🍕</span>
                        <span>🍟</span>
                    </div>

                    <div className="home-hero-floating">
                        <span>✨</span>
                        Fresh & Delicious
                    </div>
                </div>

            </section>

            {/* Benefits */}
            <section className="home-benefits">

                <div className="home-benefit">
                    <ShoppingBag size={23} />
                    <div>
                        <h3>Easy Ordering</h3>
                        <p>Simple online ordering</p>
                    </div>
                </div>

                <div className="home-benefit">
                    <Clock size={23} />
                    <div>
                        <h3>Quick Pickup</h3>
                        <p>Choose your pickup time</p>
                    </div>
                </div>

                <div className="home-benefit">
                    <CheckCircle size={23} />
                    <div>
                        <h3>Fresh Food</h3>
                        <p>Prepared with care</p>
                    </div>
                </div>

            </section>

            {/* Categories */}
            <section className="home-section">

                <div className="home-section-heading">
                    <div>
                        <span className="home-section-label">
                            FIND YOUR FAVOURITE
                        </span>
                        <h2>Explore Categories</h2>
                    </div>

                    <Link to="/shop" className="home-view-link">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="home-category-grid">

                    {categories.map((category) => (
                        <Link
                            to="/shop"
                            className="home-category-card"
                            key={category.id}
                        >
                            <span className="home-category-emoji">
                                {categoryEmojis[category.name] || "🍽️"}
                            </span>

                            <h3>{category.name}</h3>
                            <span>Explore <ArrowRight size={14} /></span>
                        </Link>
                    ))}

                </div>

                {categories.length === 0 && !loading && (
                    <p className="home-empty-message">
                        Categories are currently unavailable.
                    </p>
                )}

            </section>

            {/* Featured Foods */}
            <section className="home-section home-featured-section">

                <div className="home-section-heading">
                    <div>
                        <span className="home-section-label">
                            HANDPICKED FOR YOU
                        </span>
                        <h2>Popular Food Items</h2>
                    </div>

                    <Link to="/shop" className="home-view-link">
                        View All Foods <ArrowRight size={16} />
                    </Link>
                </div>

                {loading ? (
                    <p className="home-empty-message">
                        Loading delicious food...
                    </p>
                ) : (
                    <div className="home-featured-grid">

                        {featuredFoods.map((food) => (
                            <article
                                className="home-food-card"
                                key={food.id}
                            >
                                <div className="home-food-image">
                                    <span>🍽️</span>
                                </div>

                                <div className="home-food-info">
                                    <span className="home-food-category">
                                        {food.category_name}
                                    </span>

                                    <h3>{food.name}</h3>

                                    <p>
                                        {food.description ||
                                            "Freshly prepared and delicious."}
                                    </p>

                                    <div className="home-food-footer">
                                        <strong>₹{food.price}</strong>

                                        <button
                                            onClick={() => handleAddToCart(food)}
                                            disabled={
                                                !isAuthenticated ||
                                                addingFoodId === food.id
                                            }
                                        >
                                            {addingFoodId === food.id
                                                ? "Adding..."
                                                : "Add to Cart"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}

                    </div>
                )}

                {!loading && featuredFoods.length === 0 && (
                    <p className="home-empty-message">
                        No featured food items available right now.
                    </p>
                )}

                {message && (
                    <p className="home-message">
                        {message}
                        {!isAuthenticated && (
                            <> <Link to="/login">Login here</Link>.</>
                        )}
                    </p>
                )}

            </section>

            {/* Final Call to Action */}
            <section className="home-cta">

                <div>
                    <span>YOUR NEXT MEAL IS WAITING</span>
                    <h2>Ready to order something delicious?</h2>
                    <p>Explore our complete menu and choose your favourites.</p>
                </div>

                <Link to="/shop" className="home-cta-button">
                    Order Now <ArrowRight size={18} />
                </Link>

            </section>

        </main>
    );
}

export default Home;
