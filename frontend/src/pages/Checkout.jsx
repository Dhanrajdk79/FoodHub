
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Clock,
    ShoppingBag,
    CheckCircle2,
    Banknote,
    Smartphone,
    CreditCard,
    ShieldCheck,
    MapPin,
    AlertCircle
} from "lucide-react";

import API from "../services/api";
import { placeOrder } from "../services/orderService";
import "./Checkout.css";

function generatePickupSlots() {
    const now = new Date();
    const minimumTime = new Date(now.getTime() + 15 * 60 * 1000);
    const firstSlot = new Date(minimumTime);

    firstSlot.setSeconds(0, 0);

    const remainder = firstSlot.getMinutes() % 15;
    let minutesToAdd = (15 - remainder) % 15;

    if (
        minutesToAdd === 0 &&
        (minimumTime.getSeconds() > 0 ||
            minimumTime.getMilliseconds() > 0)
    ) {
        minutesToAdd = 15;
    }

    firstSlot.setMinutes(firstSlot.getMinutes() + minutesToAdd);

    const slots = [];

    for (let i = 0; i < 48; i++) {
        const slot = new Date(firstSlot.getTime() + i * 15 * 60 * 1000);

        if (slot.toDateString() !== now.toDateString()) break;

        const localValue = new Date(
            slot.getTime() - slot.getTimezoneOffset() * 60000
        )
            .toISOString()
            .slice(0, 16);

        slots.push({
            value: localValue,
            label: slot.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            })
        });
    }

    return slots;
}

function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [demoUpiId, setDemoUpiId] = useState("");
    const [demoCardNumber, setDemoCardNumber] = useState("");

    const [pickupSlots, setPickupSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [successOrder, setSuccessOrder] = useState(null);

    useEffect(() => {
        let active = true;

        const loadCheckout = async () => {
            try {
                const response = await API.get("/cart");

                if (active && response.data.success) {
                    setCart(response.data.cart?.items || []);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load your cart. Please try again."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadCheckout();

        const slots = generatePickupSlots();
        setPickupSlots(slots);

        if (slots.length > 0) {
            setPickupTime(slots[0].value);
        }

        return () => {
            active = false;
        };
    }, []);

    const totalAmount = useMemo(
        () =>
            cart.reduce(
                (total, item) => total + Number(item.subtotal || 0),
                0
            ),
        [cart]
    );

    const totalItems = useMemo(
        () =>
            cart.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0
            ),
        [cart]
    );

    const selectedPaymentLabel = {
        cod: "Cash on Pickup",
        upi: "UPI (Demo)",
        card: "Card (Demo)"
    }[paymentMethod];

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError("");

        if (cart.length === 0) {
            setError("Your cart is empty. Add an item before checkout.");
            return;
        }

        if (!customerName.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(customerPhone.trim())) {
            setError("Enter a valid 10-digit Indian mobile number.");
            return;
        }

        if (!pickupTime) {
            setError("Please choose a pickup time.");
            return;
        }

        const selectedTime = new Date(pickupTime);

        if (selectedTime.getTime() < Date.now() + 15 * 60 * 1000) {
            setError("Choose a pickup time at least 15 minutes from now.");
            return;
        }

        if (selectedTime.toDateString() !== new Date().toDateString()) {
            setError("Please choose a pickup time for today.");
            return;
        }

        if (paymentMethod === "upi" && !demoUpiId.trim()) {
            setError("Please enter the demo UPI ID.");
            return;
        }

        if (paymentMethod === "card" && !/^\d{16}$/.test(demoCardNumber)) {
            setError("Enter the 16-digit demo card number.");
            return;
        }

        const orderData = {
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            pickupTime: selectedTime.toISOString(),
            paymentMethod
        };

        if (paymentMethod === "upi") {
            orderData.demoUpiId = demoUpiId.trim();
        }

        if (paymentMethod === "card") {
            orderData.demoCardNumber = demoCardNumber;
        }

        try {
            setPlacingOrder(true);

            const result = await placeOrder(orderData);

            if (result.success && result.order) {
                setSuccessOrder(result.order);
                setCart([]);
            } else {
                setError(result.message || "Unable to place your order.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Order failed. Please try again."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="checkout-loading">
                <div className="checkout-spinner" />
                <p>Preparing your checkout...</p>
            </div>
        );
    }

    if (successOrder) {
        const paymentStatus = String(
            successOrder.payment_status || "pending"
        ).toLowerCase();

        const paymentLabel =
            paymentStatus === "paid" ? "Paid (Demo)" : "Pending";

        return (
            <div className="checkout-page">
                <div className="checkout-success-card">
                    <div className="success-icon">
                        <CheckCircle2 size={42} />
                    </div>

                    <span className="success-eyebrow">ORDER CONFIRMED</span>
                    <h1>Your order is placed!</h1>
                    <p className="success-subtitle">
                        Thank you for choosing FoodHub.
                    </p>

                    <div className="success-order-number">
                        <span>Order number</span>
                        <strong>{successOrder.order_number}</strong>
                    </div>

                    <div className="success-total">
                        ₹{Number(successOrder.total_amount).toFixed(2)}
                    </div>

                    <div className="success-details">
                        <div>
                            <span>Pickup time</span>
                            <strong>
                                {successOrder.pickup_time
                                    ? new Date(
                                        successOrder.pickup_time
                                    ).toLocaleString("en-IN")
                                    : "Not available"}
                            </strong>
                        </div>

                        <div>
                            <span>Order status</span>
                            <strong className="status-confirmed">
                                {successOrder.order_status}
                            </strong>
                        </div>

                        <div>
                            <span>Payment method</span>
                            <strong>
                                {successOrder.payment_method || selectedPaymentLabel}
                            </strong>
                        </div>

                        <div>
                            <span>Payment status</span>
                            <strong>{paymentLabel}</strong>
                        </div>

                        {successOrder.payment_reference && (
                            <div className="reference-row">
                                <span>Transaction reference</span>
                                <strong>
                                    {successOrder.payment_reference}
                                </strong>
                            </div>
                        )}
                    </div>

                    {paymentStatus === "paid" && (
                        <p className="demo-disclaimer">
                            This was a simulated payment. No real money was charged.
                        </p>
                    )}

                    <div className="success-actions">
                        <button
                            className="checkout-primary-btn"
                            onClick={() => navigate("/my-orders")}
                        >
                            View My Orders
                        </button>

                        <button
                            className="checkout-secondary-btn"
                            onClick={() => navigate("/")}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-empty">
                    <ShoppingBag size={48} />
                    <h2>Your cart is empty</h2>
                    <p>Add something delicious before checking out.</p>
                    <button
                        className="checkout-primary-btn"
                        onClick={() => navigate("/shop")}
                    >
                        Explore Food Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <button
                    type="button"
                    className="checkout-back"
                    onClick={() => navigate("/cart")}
                >
                    <ArrowLeft size={18} />
                    Back to cart
                </button>

                <div className="checkout-heading">
                    <span className="checkout-eyebrow">ALMOST THERE</span>
                    <h1>Complete your order</h1>
                    <p>Confirm your pickup details and payment method.</p>
                </div>

                <form
                    className="checkout-grid"
                    onSubmit={handlePlaceOrder}
                >
                    <div className="checkout-main">
                        <section className="checkout-card">
                            <div className="checkout-section-heading">
                                <div className="section-icon">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h2>Pickup details</h2>
                                    <p>Where and when should we prepare your order?</p>
                                </div>
                            </div>

                            <div className="checkout-fields">
                                <div className="checkout-field">
                                    <label htmlFor="customerName">
                                        Full name
                                    </label>
                                    <input
                                        id="customerName"
                                        type="text"
                                        placeholder="Enter your name"
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
                                        }
                                        maxLength={80}
                                        autoComplete="name"
                                        required
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label htmlFor="customerPhone">
                                        Mobile number
                                    </label>
                                    <input
                                        id="customerPhone"
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        value={customerPhone}
                                        onChange={(e) =>
                                            setCustomerPhone(
                                                e.target.value.replace(/\D/g, "").slice(0, 10)
                                            )
                                        }
                                        pattern="[6-9][0-9]{9}"
                                        maxLength={10}
                                        autoComplete="tel"
                                        required
                                    />
                                </div>

                                <div className="checkout-field full-width">
                                    <label htmlFor="pickupTime">
                                        Pickup time
                                    </label>
                                    <div className="checkout-select-wrap">
                                        <Clock size={18} />
                                        <select
                                            id="pickupTime"
                                            value={pickupTime}
                                            onChange={(e) =>
                                                setPickupTime(e.target.value)
                                            }
                                            required
                                            disabled={pickupSlots.length === 0}
                                        >
                                            {pickupSlots.length === 0 && (
                                                <option value="">
                                                    No pickup slots available
                                                </option>
                                            )}

                                            {pickupSlots.map((slot) => (
                                                <option
                                                    key={slot.value}
                                                    value={slot.value}
                                                >
                                                    {slot.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <small className="field-hint">
                                        Pickup slots are available every 15 minutes.
                                    </small>
                                </div>
                            </div>
                        </section>

                        <section className="checkout-card">
                            <div className="checkout-section-heading">
                                <div className="section-icon">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h2>Payment method</h2>
                                    <p>Choose how you want to pay.</p>
                                </div>
                            </div>

                            <div className="checkout-payment-options">
                                <label
                                    className={`checkout-payment-option ${
                                        paymentMethod === "cod" ? "active" : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => setPaymentMethod("cod")}
                                    />
                                    <span className="payment-option-icon">
                                        <Banknote size={22} />
                                    </span>
                                    <span className="payment-option-copy">
                                        <strong>Cash on Pickup</strong>
                                        <small>Pay when you collect your order</small>
                                    </span>
                                    <span className="payment-radio" />
                                </label>

                                <label
                                    className={`checkout-payment-option ${
                                        paymentMethod === "upi" ? "active" : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="upi"
                                        checked={paymentMethod === "upi"}
                                        onChange={() => setPaymentMethod("upi")}
                                    />
                                    <span className="payment-option-icon">
                                        <Smartphone size={22} />
                                    </span>
                                    <span className="payment-option-copy">
                                        <strong>UPI</strong>
                                        <small>Demo payment simulation</small>
                                    </span>
                                    <span className="payment-radio" />
                                </label>

                                <label
                                    className={`checkout-payment-option ${
                                        paymentMethod === "card" ? "active" : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === "card"}
                                        onChange={() => setPaymentMethod("card")}
                                    />
                                    <span className="payment-option-icon">
                                        <CreditCard size={22} />
                                    </span>
                                    <span className="payment-option-copy">
                                        <strong>Card</strong>
                                        <small>Demo card simulation</small>
                                    </span>
                                    <span className="payment-radio" />
                                </label>
                            </div>

                            {paymentMethod === "upi" && (
                                <div className="checkout-demo-field">
                                    <label htmlFor="demoUpiId">Demo UPI ID</label>
                                    <input
                                        id="demoUpiId"
                                        type="text"
                                        placeholder="Enter demo UPI ID"
                                        value={demoUpiId}
                                        onChange={(e) =>
                                            setDemoUpiId(e.target.value)
                                        }
                                        autoComplete="off"
                                    />
                                    <small>
                                        Use the demo UPI ID provided for your test.
                                    </small>
                                </div>
                            )}

                            {paymentMethod === "card" && (
                                <div className="checkout-demo-field">
                                    <label htmlFor="demoCardNumber">
                                        Demo card number
                                    </label>
                                    <input
                                        id="demoCardNumber"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="16-digit demo card number"
                                        value={demoCardNumber}
                                        onChange={(e) =>
                                            setDemoCardNumber(
                                                e.target.value.replace(/\D/g, "").slice(0, 16)
                                            )
                                        }
                                        maxLength={16}
                                        autoComplete="off"
                                    />
                                    <small>
                                        Enter only the fixed demo card number. Never use real card details.
                                    </small>
                                </div>
                            )}

                            {paymentMethod !== "cod" && (
                                <div className="checkout-demo-notice">
                                    <ShieldCheck size={18} />
                                    <span>
                                        Demo mode only. No real payment or card charge will occur.
                                    </span>
                                </div>
                            )}
                        </section>

                        {error && (
                            <div className="checkout-alert" role="alert">
                                <AlertCircle size={19} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <aside className="checkout-sidebar">
                        <div className="checkout-card order-summary-card">
                            <div className="summary-heading">
                                <div>
                                    <h2>Order summary</h2>
                                    <p>{totalItems} items in your order</p>
                                </div>
                                <ShoppingBag size={22} />
                            </div>

                            <div className="summary-items">
                                {cart.map((item) => (
                                    <div className="summary-item" key={item.id}>
                                        <div className="summary-item-info">
                                            <strong>{item.name}</strong>
                                            <span>Qty: {item.quantity}</span>
                                        </div>
                                        <strong>
                                            ₹{Number(item.subtotal).toFixed(2)}
                                        </strong>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-total-row">
                                <span>Items</span>
                                <span>{totalItems}</span>
                            </div>

                            <div className="summary-total-row">
                                <span>Subtotal</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="summary-grand-total">
                                <span>Total payable</span>
                                <strong>₹{totalAmount.toFixed(2)}</strong>
                            </div>

                            <div className="summary-payment">
                                <span>Payment</span>
                                <strong>{selectedPaymentLabel}</strong>
                            </div>

                            <button
                                type="submit"
                                className="checkout-primary-btn place-order-btn"
                                disabled={
                                    placingOrder ||
                                    cart.length === 0 ||
                                    pickupSlots.length === 0
                                }
                            >
                                {placingOrder
                                    ? "Processing order..."
                                    : `Place order · ₹${totalAmount.toFixed(2)}`}
                            </button>

                            <div className="checkout-secure-note">
                                <ShieldCheck size={16} />
                                <span>Secure order processing</span>
                            </div>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
}

export default Checkout;
