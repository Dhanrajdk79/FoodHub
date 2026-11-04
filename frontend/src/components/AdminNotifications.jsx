 
import { useEffect, useState } from "react";
import { Bell, Check, ShoppingBag, X, Trash2 } from "lucide-react";

import {
    getAdminNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    clearReadNotifications
} from "../services/notificationService";

import "./AdminNotifications.css";

function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const [notificationData, countData] = await Promise.all([
                getAdminNotifications(),
                getUnreadNotificationCount()
            ]);

            setNotifications(notificationData.notifications || []);
            setUnreadCount(countData.unreadCount || 0);
        } catch (err) {
            console.error("Notification fetch error:", err);
            setError("Unable to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const intervalId = setInterval(fetchNotifications, 30000);

        return () => clearInterval(intervalId);
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notificationId
                        ? { ...item, is_read: 1 }
                        : item
                )
            );

            setUnreadCount((previous) => Math.max(0, previous - 1));
        } catch (err) {
            console.error("Mark as read error:", err);
            setError("Unable to mark notification as read.");
        }
    };

    // Clear only read notifications
    const handleClearReadNotifications = async () => {
        const readCount = notifications.filter(
            (item) => item.is_read
        ).length;

        if (readCount === 0) {
            setError("There are no read notifications to clear.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to permanently delete ${readCount} read notification(s)? Unread notifications will remain.`
        );

        if (!confirmed) return;

        try {
            setClearing(true);
            setError("");
            setSuccessMessage("");

            const response = await clearReadNotifications();

            await fetchNotifications();

            setSuccessMessage(
                response.deletedCount > 0
                    ? `${response.deletedCount} read notification(s) cleared successfully.`
                    : "No read notifications were found."
            );
        } catch (err) {
            console.error("Clear notifications error:", err);
            setError("Unable to clear read notifications.");
        } finally {
            setClearing(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date.replace(" ", "T") + "Z").toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    };

    const readCount = notifications.filter(
        (item) => item.is_read
    ).length;

    return (
        <div className="admin-notification-container">
            <button
                type="button"
                className="admin-notification-bell"
                onClick={() => {
                    setIsOpen((previous) => !previous);
                    if (!isOpen) fetchNotifications();
                }}
                aria-label="Admin notifications"
            >
                <Bell size={23} />

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <button
                        type="button"
                        className="notification-backdrop"
                        aria-label="Close notifications"
                        onClick={() => setIsOpen(false)}
                    />

                    <section className="admin-notification-panel">
                        <header className="notification-panel-header">
                            <div>
                                <h2>Notifications</h2>
                                <p>{unreadCount} unread notifications</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                            >
                                <X size={21} />
                            </button>
                        </header>

                        {!loading && notifications.length > 0 && (
                            <div className="notification-actions">
                                <button
                                    type="button"
                                    className="clear-read-button"
                                    onClick={handleClearReadNotifications}
                                    disabled={clearing || readCount === 0}
                                >
                                    <Trash2 size={16} />
                                    {clearing
                                        ? "Clearing..."
                                        : `Clear Read (${readCount})`}
                                </button>
                            </div>
                        )}

                        {loading && (
                            <p className="notification-message">
                                Loading notifications...
                            </p>
                        )}

                        {error && (
                            <p className="notification-error">{error}</p>
                        )}

                        {successMessage && (
                            <p className="notification-success">
                                {successMessage}
                            </p>
                        )}

                        {!loading && !error && notifications.length === 0 && (
                            <div className="notification-empty">
                                <Bell size={35} />
                                <p>No notifications yet.</p>
                            </div>
                        )}

                        {!loading && notifications.length > 0 && (
                            <div className="notification-list">
                                {notifications.map((item) => (
                                    <article
                                        key={item.id}
                                        className={`notification-item ${
                                            item.is_read ? "read" : "unread"
                                        }`}
                                    >
                                        <div className="notification-icon">
                                            <ShoppingBag size={21} />
                                        </div>

                                        <div className="notification-content">
                                            <strong>New order received</strong>

                                            <p>Order #{item.order_number}</p>
                                            <p>Customer: {item.customer_name}</p>

                                            <p className="notification-amount">
                                                Amount: ₹
                                                {Number(item.total_amount).toFixed(2)}
                                            </p>

                                            <small>
                                                {formatDate(item.created_at)}
                                            </small>

                                            {!item.is_read && (
                                                <button
                                                    type="button"
                                                    className="mark-read-button"
                                                    onClick={() =>
                                                        handleMarkAsRead(item.id)
                                                    }
                                                >
                                                    <Check size={15} />
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>

                                        {!item.is_read && (
                                            <span className="unread-dot" />
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default AdminNotifications;
