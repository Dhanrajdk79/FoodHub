
import {
    LayoutDashboard,
    Utensils,
    ShoppingBag,
    Users,
    ChartNoAxesCombined
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Manage Food",
            description: "Add, delete and control food availability.",
            icon: Utensils,
            path: "/admin/food"
        },
        {
            title: "View Orders",
            description: "View customer orders and order details.",
            icon: ShoppingBag,
            path: "/admin/orders"
        },
        {
            title: "View Customers",
            description: "View registered FoodHub customers.",
            icon: Users,
            path: "/admin/customers"
        },
        {
            title: "Sales & Revenue Analytics",
            description: "Monitor revenue, sales and business performance.",
            icon: ChartNoAxesCombined,
            path: "/admin/analytics"
        }
    ];

    return (
        <main className="admin-dashboard">
            <div className="admin-dashboard-header">
                <div>
                    <p>FOODHUB ADMIN PANEL</p>
                    <h1>Admin Dashboard</h1>
                    <span>
                        Welcome! Manage your FoodHub store from here.
                    </span>
                </div>

                <LayoutDashboard size={42} />
            </div>

            <section className="admin-dashboard-cards">
                {sections.map((section) => {
                    const Icon = section.icon;

                    return (
                        <button
                            type="button"
                            className="admin-dashboard-card"
                            key={section.title}
                            onClick={() => navigate(section.path)}
                        >
                            <Icon size={30} />
                            <h3>{section.title}</h3>
                            <p>{section.description}</p>
                        </button>
                    );
                })}
            </section>
        </main>
    );
}

export default AdminDashboard;
