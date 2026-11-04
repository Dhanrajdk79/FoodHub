 
const db = require("../config/database");

// Get all admin notifications
const getAllNotifications = () => {
    return db.prepare(`
        SELECT *
        FROM admin_notifications
        ORDER BY created_at DESC
    `).all();
};

// Get unread notification count
const getUnreadCount = () => {
    const result = db.prepare(`
        SELECT COUNT(*) AS count
        FROM admin_notifications
        WHERE is_read = 0
    `).get();

    return result.count;
};

// Mark one notification as read
const markAsRead = (notificationId) => {
    return db.prepare(`
        UPDATE admin_notifications
        SET is_read = 1
        WHERE id = ?
    `).run(notificationId);
};

// Delete all read notifications
const clearReadNotifications = () => {
    return db.prepare(`
        DELETE FROM admin_notifications
        WHERE is_read = 1
    `).run();
};

module.exports = {
    getAllNotifications,
    getUnreadCount,
    markAsRead,
    clearReadNotifications
};
