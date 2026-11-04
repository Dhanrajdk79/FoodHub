 
import api from "./api";

// Get all admin notifications
export const getAdminNotifications = async () => {
    const response = await api.get("/admin/notifications");
    return response.data;
};

// Get unread notification count
export const getUnreadNotificationCount = async () => {
    const response = await api.get("/admin/notifications/unread-count");
    return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
    const response = await api.patch(
        `/admin/notifications/${notificationId}/read`
    );

    return response.data;
};

// Clear all read notifications
export const clearReadNotifications = async () => {
    const response = await api.delete("/admin/notifications/read");
    return response.data;
};
