
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ShoppingBag,
    Plus,
    Minus,
    Trash2,
    ArrowRight,
    ShoppingCart
} from "lucide-react";

import {
    getCart,
    updateCartItem,
    removeCartItem
} from "../services/cartService";

import { useAuth } from "../context/AuthContext";

import "./Cart.css";

function Cart() {
    const { isAuthenticated } = useAuth();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [message, setMessage] = useState("");

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getCart();
            setCart(response.cart.items || []);
        } catch (error) {
            console.error("Cart loading error:", error);
            setMessage(
                error.response?.data?.message ||
                "Unable to load your cart."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart([]);
            setLoading(false);
        }
    }, [isAuthenticated, fetchCart]);

    const handleQuantityChange = async (foodId, quantity) => {
        if (quantity < 1) return;

        try {
            setUpdatingId(foodId);
            setMessage("");

            await updateCartItem(foodId, quantity);
            await fetchCart();
        } catch (error) {
            console.error("Quantity update error:", error);
            setMessage(
                error.response?.data?.message ||
                "Unable to update quantity."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (foodId) => {
        try {
            setUpdatingId(foodId);
            setMessage("");

            await removeCartItem(foodId);
            await fetchCart();

            setMessage("Item removed from your cart.");
        } catch (error) {
            console.error("Remove item error:", error);
            setMessage(
                error.response?.data?.message ||
                "Unable to remove item."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const totalItems = cart.reduce(
        (total, item) => total + Number(item.quantity),
        0
    );

    const totalPrice = cart.reduce(
        (total, item) => total + Number(item.subtotal),
        0
    );

    if (loading) {
        return (
            <div className="cart-loading">
                <h2>Loading your cart...</h2>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="cart-page">
                <div className="cart-empty">
                    <ShoppingCart size={55} />
                    <h2>Please login to view your cart</h2>
                    <p>Your saved food items will appear here after login.</p>
                    <Link to="/login" className="cart-primary-button">
                        Login
                    </Link>
                </div>
            </main>
        );
    }

    if (cart.length === 0) {
        return (
            <main className="cart-page">
                <div className="cart-empty">
                    <ShoppingBag size={60} />
                    <h2>Your cart is empty!</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>

                    <Link to="/shop" className="cart-primary-button">
                        Explore Menu
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">

            <div className="cart-heading">
                <div>
                    <span className="cart-eyebrow">YOUR FOOD SELECTION</span>
                    <h1>My Cart</h1>
                    <p>
                        {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
                    </p>
                </div>

                <Link to="/shop" className="cart-continue-link">
                    Continue Shopping
                </Link>
            </div>

            {message && (
                <div className="cart-message">
                    {message}
                </div>
            )}

            <div className="cart-layout">

                <section className="cart-items-section">

                    {cart.map((item) => (
                        <article className="cart-product" key={item.id}>

                            <div className="cart-product-image">
                                🍽️
                            </div>

                            <div className="cart-product-info">
                                <h3>{item.name}</h3>
                                <p>₹{Number(item.price).toFixed(2)} per item</p>

                                <button
                                    className="cart-remove-button"
                                    onClick={() => handleRemove(item.food_id)}
                                    disabled={updatingId === item.food_id}
                                >
                                    <Trash2 size={15} />
                                    Remove
                                </button>
                            </div>

                            <div className="cart-product-actions">

                                <div className="cart-quantity-control">
                                    <button
                                        onClick={() =>
                                            handleQuantityChange(
                                                item.food_id,
                                                Number(item.quantity) - 1
                                            )
                                        }
                                        disabled={
                                            updatingId === item.food_id ||
                                            Number(item.quantity) <= 1
                                        }
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={15} />
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        onClick={() =>
                                            handleQuantityChange(
                                                item.food_id,
                                                Number(item.quantity) + 1
                                            )
                                        }
                                        disabled={updatingId === item.food_id}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={15} />
                                    </button>
                                </div>

                                <strong className="cart-item-subtotal">
                                    ₹{Number(item.subtotal).toFixed(2)}
                                </strong>

                            </div>

                        </article>
                    ))}

                </section>

                <aside className="cart-summary">

                    <h2>Order Summary</h2>

                    <div className="cart-summary-row">
                        <span>Total Items</span>
                        <strong>{totalItems}</strong>
                    </div>

                    <div className="cart-summary-row">
                        <span>Subtotal</span>
                        <strong>₹{totalPrice.toFixed(2)}</strong>
                    </div>

                    <div className="cart-summary-row">
                        <span>Pickup Charges</span>
                        <strong>Free</strong>
                    </div>

                    <div className="cart-summary-divider" />

                    <div className="cart-summary-total">
                        <span>Total Amount</span>
                        <strong>₹{totalPrice.toFixed(2)}</strong>
                    </div>

                    <Link to="/checkout" className="cart-checkout-button">
                        Proceed to Checkout
                        <ArrowRight size={18} />
                    </Link>

                    <p className="cart-pickup-note">
                        Your order will be prepared for pickup.
                    </p>

                </aside>

            </div>

        </main>
    );
}

export default Cart;
