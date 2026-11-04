
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
    ShoppingCart,
    UserRound,
    Utensils,
    ClipboardList,
    LogOut,
    LogIn,
    LayoutDashboard
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import AdminNotifications from "./AdminNotifications";
import "./Navbar.css";

function Navbar() {
    const {
        user,
        logout,
        isAuthenticated,
        isAdmin
    } = useAuth();

    const navigate = useNavigate();

    const navClass = ({ isActive }) =>
        `nav-link ${isActive ? "active" : ""}`;

    const handleLogout = () => {
        const confirmLogout = window.confirm(
            "Are you sure you want to logout?"
        );

        if (confirmLogout) {
            logout();
            navigate("/");
        }
    };

    return (
        <header className="main-navbar">
            <div className="navbar-container">

                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🍔</span>
                    <span>
                        Food<span>Hub</span>
                    </span>
                </Link>

                <nav className="navbar-links">
                    {isAdmin ? (
                        <>
                            <NavLink
                                to="/admin/dashboard"
                                className={navClass}
                            >
                                <LayoutDashboard size={17} />
                                Admin Dashboard
                            </NavLink>

                            <AdminNotifications />
                        </>
                    ) : (
                        <>
                            <NavLink to="/" className={navClass}>
                                Home
                            </NavLink>

                            <NavLink to="/shop" className={navClass}>
                                <Utensils size={17} />
                                Shop
                            </NavLink>

                            <NavLink to="/cart" className={navClass}>
                                <ShoppingCart size={17} />
                                Cart
                            </NavLink>

                            {isAuthenticated && (
                                <NavLink
                                    to="/my-orders"
                                    className={navClass}
                                >
                                    <ClipboardList size={17} />
                                    My Orders
                                </NavLink>
                            )}
                        </>
                    )}
                </nav>

                <div className="navbar-account">
                    {isAuthenticated ? (
                        <>
                            <span className="navbar-user">
                                <UserRound size={17} />
                                {user?.name || "User"}
                            </span>

                            <button
                                type="button"
                                className="logout-button"
                                onClick={handleLogout}
                            >
                                <LogOut size={17} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="login-button">
                            <LogIn size={17} />
                            Login
                        </Link>
                    )}
                </div>

            </div>
        </header>
    );
}

export default Navbar;
