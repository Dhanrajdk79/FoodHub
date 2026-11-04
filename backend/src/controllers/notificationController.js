 
const Notification = require("../models/notificationModel");

// ADMIN: Get all notifications
const getNotifications = (req, res) => {
    try {
        const notifications = Notification.getAllNotifications();

        return res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        console.error("Get notifications error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch notifications."
        });
    }
};

// ADMIN: Get unread notification count
const getUnreadNotificationCount = (req, res) => {
    try {
        const count = Notification.getUnreadCount();

        return res.status(200).json({
            success: true,
            unreadCount: count
        });

    } catch (error) {
        console.error("Unread notification count error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch unread notification count."
        });
    }
};

// ADMIN: Mark notification as read
const markNotificationAsRead = (req, res) => {
    try {
        const notificationId = Number(req.params.id);

        if (!Number.isInteger(notificationId) || notificationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID."
            });
        }

        const result = Notification.markAsRead(notificationId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read."
        });

    } catch (error) {
        console.error("Mark notification as read error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update notification."
        });
    }
};

// ADMIN: Clear all read notifications
const clearReadNotifications = (req, res) => {
    try {
        const result = Notification.clearReadNotifications();

        return res.status(200).json({
            success: true,
            message: "All read notifications cleared successfully.",
            deletedCount: result.changes
        });

    } catch (error) {
        console.error("Clear read notifications error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to clear read notifications."
        });
    }
};

module.exports = {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    clearReadNotifications
};
