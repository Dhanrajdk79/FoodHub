 
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import API from "../services/api";
import "./Invoice.css";

function Invoice() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await API.get(`/orders/${id}`);
                setOrder(response.data.order);
            } catch (err) {
                setError("Unable to load invoice details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const formatDate = (date) => {
        if (!date) return "N/A";

        let value = date;
        if (typeof date === "string" &&
            !date.endsWith("Z") &&
            !date.includes("+")) {
            value += "Z";
        }

        return new Date(value).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata"
        });
    };

    if (loading) return <h2>Loading invoice...</h2>;
    if (error || !order) return <h2>{error || "Order not found"}</h2>;

    return (
        <div className="invoice-page">
            <div className="invoice-actions no-print">
                <button onClick={() => navigate("/my-orders")}>
                    <ArrowLeft size={18} /> Back to Orders
                </button>

                <button onClick={() => window.print()}>
                    <Printer size={18} /> Print Invoice
                </button>
            </div>

            <div className="invoice-container">
                <header className="invoice-header">
                    <div>
                        <h1>FoodHub</h1>
                        <p>Fresh Food. Happy Moments.</p>
                    </div>

                    <div className="invoice-title">
                        <h2>INVOICE</h2>
                        <p>{order.order_number}</p>
                    </div>
                </header>

                <hr />

                <section className="invoice-details">
                    <div>
                        <h3>Customer Details</h3>
                        <p>{order.customer_name}</p>
                        <p>{order.customer_phone}</p>
                    </div>

                    <div>
                        <h3>Order Details</h3>
                        <p>Order: {order.order_number}</p>
                        <p>Placed: {formatDate(order.created_at)}</p>
                        <p>Pickup: {formatDate(order.pickup_time)}</p>
                    </div>
                </section>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>

                    <tbody>
                        {order.items?.map((item) => (
                            <tr key={item.id}>
                                <td>{item.food_name}</td>
                                <td>₹{Number(item.price).toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td>₹{Number(item.subtotal).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="invoice-total">
                    <h2>
                        Total Amount: ₹
                        {Number(order.total_amount).toFixed(2)}
                    </h2>
                </div>

                <section className="invoice-payment">
                    <p>
                        <strong>Payment Method:</strong>{" "}
                        {order.payment_method === "cod"
                            ? "Cash on Pickup"
                            : order.payment_method}
                    </p>
                    <p>
                        <strong>Payment Status:</strong>{" "}
                        {order.payment_status}
                    </p>
                    <p>
                        <strong>Order Status:</strong>{" "}
                        {order.order_status}
                    </p>
                </section>

                <footer className="invoice-footer">
                    <h3>Thank you for choosing FoodHub!</h3>
                    <p>We look forward to serving you again.</p>
                </footer>
            </div>
        </div>
    );
}

export default Invoice;
