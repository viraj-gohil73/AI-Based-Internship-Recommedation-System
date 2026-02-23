import mongoose from "mongoose";
import Notification from "../models/Notification.js";

const toClientNotification = (notification) => ({
  _id: notification._id,
  id: notification._id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  read: Boolean(notification.read),
  readAt: notification.readAt || null,
  entityType: notification.entityType || null,
  entityId: notification.entityId || null,
  metadata: notification.metadata || {},
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const getScope = (req) => ({
  recipientModel: req.notificationUser.recipientModel,
  recipientId: req.notificationUser.id,
});

export const getMyNotifications = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit || 50);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 200)
      : 50;

    const query = getScope(req);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      ...query,
      read: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      data: notifications.map(toClientNotification),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const getMyUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      ...getScope(req),
      read: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: "Invalid notification id" });
    }

    const query = {
      _id: notificationId,
      ...getScope(req),
    };

    const notification = await Notification.findOneAndUpdate(
      query,
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: toClientNotification(notification),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to mark notification" });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        ...getScope(req),
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to mark notifications" });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany(getScope(req));

    return res.status(200).json({
      success: true,
      message: "All notifications cleared",
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to clear notifications" });
  }
};
