
import "./AdminAnalytics.css";
import { useEffect, useState } from "react";

import {
    getSalesOverview,
    getMonthlySales,
    getPaymentStatistics,
    getBestSellingFoods
} from "../services/analyticsService";

function AdminAnalytics() {
    const [overview, setOverview] = useState(null);
    const [today, setToday] = useState(null);
    const [monthlySales, setMonthlySales] = useState([]);
    const [paymentStatistics, setPaymentStatistics] = useState([]);
    const [bestSellingFoods, setBestSellingFoods] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    overviewData,
                    monthlyData,
                    paymentData,
                    bestSellingData
                ] = await Promise.all([
                    getSalesOverview(),
                    getMonthlySales(),
                    getPaymentStatistics(),
                    getBestSellingFoods()
                ]);

                setOverview(overviewData.overview);
                setToday(overviewData.today);
                setMonthlySales(monthlyData.sales || []);
                setPaymentStatistics(paymentData.statistics || []);
                setBestSellingFoods(bestSellingData.foods || []);

            } catch (err) {
                console.error("Analytics loading error:", err);
                setError("Unable to load sales analytics.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    if (loading) {
        return <div>Loading sales analytics...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const summaryCards = [
        {
            title: "Total Revenue",
            value: formatCurrency(overview?.total_revenue)
        },
        {
            title: "Total Orders",
            value: overview?.total_orders ?? 0
        },
        {
            title: "Today's Revenue",
            value: formatCurrency(today?.today_revenue)
        },
        {
            title: "Today's Orders",
            value: today?.today_orders ?? 0
        },
        {
            title: "Completed Orders",
            value: overview?.completed_orders ?? 0
        },
        {
            title: "Cancelled Orders",
            value: overview?.cancelled_orders ?? 0
        }
    ];

    return (
        <main className="admin-analytics-page">

            <header className="analytics-header">
                <div>
                    <h1>Sales & Revenue Analytics</h1>
                    <p>Monitor your FoodHub business performance.</p>
                </div>
            </header>

            {/* SUMMARY CARDS */}
            <section className="analytics-summary">
                {summaryCards.map((card) => (
                    <article
                        className="analytics-card"
                        key={card.title}
                    >
                        <h3>{card.title}</h3>
                        <p>{card.value}</p>
                    </article>
                ))}
            </section>

            {/* MONTHLY REVENUE */}
            <section className="analytics-section">
                <h2>Monthly Revenue</h2>

                {monthlySales.length === 0 ? (
                    <p>No monthly sales data available.</p>
                ) : (
                    <div className="analytics-table-wrapper">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>

                            <tbody>
                                {monthlySales.map((item) => (
                                    <tr key={item.month}>
                                        <td>{item.month}</td>
                                        <td>{item.total_orders}</td>
                                        <td>{formatCurrency(item.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* PAYMENT STATISTICS */}
            <section className="analytics-section">
                <h2>Payment Statistics</h2>

                <div className="analytics-table-wrapper">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Payment Method</th>
                                <th>Total Orders</th>
                                <th>Collected Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paymentStatistics.map((item) => (
                                <tr key={item.payment_method}>
                                    <td>
                                        {item.payment_method?.toUpperCase()}
                                    </td>
                                    <td>{item.total_orders}</td>
                                    <td>
                                        {formatCurrency(item.collected_amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* BEST-SELLING FOODS */}
            <section className="analytics-section">
                <h2>Best-Selling Foods</h2>
                <p>Top 10 foods based on quantity sold.</p>

                {bestSellingFoods.length === 0 ? (
                    <p>No food sales data available.</p>
                ) : (
                    <div className="analytics-table-wrapper">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Food Name</th>
                                    <th>Quantity Sold</th>
                                    <th>Total Orders</th>
                                    <th>Total Sales</th>
                                </tr>
                            </thead>

                            <tbody>
                                {bestSellingFoods.map((food) => (
                                    <tr key={food.food_id}>
                                        <td>{food.food_name}</td>
                                        <td>{food.total_quantity}</td>
                                        <td>{food.total_orders}</td>
                                        <td>
                                            {formatCurrency(food.total_sales)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ORDER STATUS BREAKDOWN */}
            <section className="analytics-section">
                <h2>Order Status Breakdown</h2>

                <div className="analytics-status-list">
                    <p>
                        Confirmed:{" "}
                        <strong>
                            {overview?.confirmed_orders ?? 0}
                        </strong>
                    </p>

                    <p>
                        Completed:{" "}
                        <strong>
                            {overview?.completed_orders ?? 0}
                        </strong>
                    </p>

                    <p>
                        Cancelled:{" "}
                        <strong>
                            {overview?.cancelled_orders ?? 0}
                        </strong>
                    </p>
                </div>
            </section>

        </main>
    );
}

export default AdminAnalytics;
