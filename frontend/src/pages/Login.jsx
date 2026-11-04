
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    User,
    Phone,
    UtensilsCrossed
} from "lucide-react";

import { loginUser, registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const switchMode = (registerMode) => {
        setIsRegister(registerMode);
        setMessage("");
        setMessageType("");
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");

        if (loading) return;

        setLoading(true);

        try {
            // CUSTOMER REGISTRATION
            if (isRegister) {
                if (formData.password !== formData.confirmPassword) {
                    setMessage("Passwords do not match.");
                    setMessageType("error");
                    return;
                }

                if (formData.password.length < 8) {
                    setMessage("Password must contain at least 8 characters.");
                    setMessageType("error");
                    return;
                }

                if (!/^\d{10}$/.test(formData.phone)) {
                    setMessage("Enter a valid 10-digit phone number.");
                    setMessageType("error");
                    return;
                }

                const response = await registerUser({
                    name: formData.name.trim(),
                    phone: formData.phone,
                    email: formData.email.trim(),
                    password: formData.password
                });

                if (response.success) {
                    setMessage("Account created successfully! Please login.");
                    setMessageType("success");

                    setIsRegister(false);

                    setFormData({
                        name: "",
                        phone: "",
                        email: formData.email,
                        password: "",
                        confirmPassword: ""
                    });
                } else {
                    setMessage(response.message || "Registration failed.");
                    setMessageType("error");
                }

                return;
            }

            // SHARED CUSTOMER / ADMIN LOGIN
            const response = await loginUser({
                email: formData.email.trim(),
                password: formData.password
            });

            if (response.success && response.user) {
                login(response.user);

                // Role is returned by the backend
                if (response.user.role === "admin") {
                    navigate("/admin/dashboard", { replace: true });
                } else if (response.user.role === "customer") {
                    navigate("/", { replace: true });
                } else {
                    setMessage("Your account role is not recognized.");
                    setMessageType("error");
                }
            } else {
                setMessage(response.message || "Login failed.");
                setMessageType("error");
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );

            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* LEFT BRANDING SECTION */}
            <div className="login-brand-section">
                <Link to="/" className="login-brand-logo">
                    <div className="brand-icon">
                        <UtensilsCrossed size={25} />
                    </div>
                    <span>Food<span>Hub</span></span>
                </Link>

                <div className="login-brand-content">
                    <span className="brand-tagline">
                        FRESH FOOD. HAPPY MOOD.
                    </span>

                    <h1>
                        Good food,
                        <br />
                        good times,
                        <br />
                        <span>always.</span>
                    </h1>

                    <p>
                        Your favourite meals are just a few clicks away.
                        Sign in and enjoy a delicious experience with FoodHub.
                    </p>
                </div>

                <div className="login-brand-footer">
                    <span>Freshly prepared. Always delicious.</span>
                </div>
            </div>

            {/* RIGHT FORM SECTION */}
            <div className="login-form-section">

                <div className="login-form-card">

                    <div className="mobile-login-logo">
                        <div className="brand-icon">
                            <UtensilsCrossed size={22} />
                        </div>
                        <span>Food<span>Hub</span></span>
                    </div>

                    <div className="login-heading">
                        <span className="login-eyebrow">
                            WELCOME TO FOODHUB
                        </span>

                        <h2>
                            {isRegister
                                ? "Create your account"
                                : "Welcome back!"}
                        </h2>

                        <p>
                            {isRegister
                                ? "Join us and discover your favourite food."
                                : "Enter your details to continue your food journey."}
                        </p>
                    </div>

                    {/* LOGIN / REGISTER TABS */}
                    <div className="login-tabs">
                        <button
                            type="button"
                            className={!isRegister ? "active" : ""}
                            onClick={() => switchMode(false)}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className={isRegister ? "active" : ""}
                            onClick={() => switchMode(true)}
                        >
                            Register
                        </button>
                    </div>

                    {/* MESSAGE */}
                    {message && (
                        <div className={`login-alert ${messageType}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">

                        {isRegister && (
                            <>
                                <div className="login-input-group">
                                    <label>Full Name</label>

                                    <div className="login-input-wrapper">
                                        <User size={18} />

                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="login-input-group">
                                    <label>Phone Number</label>

                                    <div className="login-input-wrapper">
                                        <Phone size={18} />

                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="10-digit phone number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="login-input-group">
                            <label>Email Address</label>

                            <div className="login-input-wrapper">
                                <Mail size={18} />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-input-group">
                            <label>Password</label>

                            <div className="login-input-wrapper">
                                <LockKeyhole size={18} />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {isRegister && (
                            <div className="login-input-group">
                                <label>Confirm Password</label>

                                <div className="login-input-wrapper">
                                    <LockKeyhole size={18} />

                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        {showConfirmPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Please wait..."
                                : isRegister
                                    ? "Create Account"
                                    : "Sign In"}

                            {!loading && <ArrowRight size={19} />}
                        </button>

                    </form>

                    <div className="login-bottom-text">
                        {isRegister
                            ? "Already have an account?"
                            : "Don't have an account?"}

                        <button
                            type="button"
                            onClick={() => switchMode(!isRegister)}
                        >
                            {isRegister ? "Sign In" : "Create Account"}
                        </button>
                    </div>

                    <p className="login-security-note">
                        Secure login powered by FoodHub
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Login;
