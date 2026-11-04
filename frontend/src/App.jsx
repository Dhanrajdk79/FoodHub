
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Invoice from "./pages/Invoice";

import AdminDashboard from "./pages/AdminDashboard";
import ManageFood from "./pages/ManageFood";
import ManageOrders from "./pages/ManageOrders";
import ManageCustomers from "./pages/ManageCustomers";
import AdminAnalytics from "./pages/AdminAnalytics";

// Customer route protection
function ProtectedCustomer({ children }) {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

// Admin route protection
function ProtectedAdmin({ children }) {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/login" element={<Login />} />

                {/* Customer protected routes */}
                <Route
                    path="/cart"
                    element={
                        <ProtectedCustomer>
                            <Cart />
                        </ProtectedCustomer>
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <ProtectedCustomer>
                            <Checkout />
                        </ProtectedCustomer>
                    }
                />

                <Route
                    path="/my-orders"
                    element={
                        <ProtectedCustomer>
                            <MyOrders />
                        </ProtectedCustomer>
                    }
                />

                <Route
                    path="/invoice/:id"
                    element={
                        <ProtectedCustomer>
                            <Invoice />
                        </ProtectedCustomer>
                    }
                />

                {/* Admin protected routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedAdmin>
                            <AdminDashboard />
                        </ProtectedAdmin>
                    }
                />

                <Route
                    path="/admin/food"
                    element={
                        <ProtectedAdmin>
                            <ManageFood />
                        </ProtectedAdmin>
                    }
                />

                <Route
                    path="/admin/orders"
                    element={
                        <ProtectedAdmin>
                            <ManageOrders />
                        </ProtectedAdmin>
                    }
                />

                <Route
                    path="/admin/customers"
                    element={
                        <ProtectedAdmin>
                            <ManageCustomers />
                        </ProtectedAdmin>
                    }
                />

                <Route
                    path="/admin/analytics"
                    element={
                        <ProtectedAdmin>
                            <AdminAnalytics />
                        </ProtectedAdmin>
                    }
                />

                {/* Unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
