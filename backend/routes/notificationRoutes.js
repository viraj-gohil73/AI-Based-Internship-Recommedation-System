import express from "express";
import {
  clearAllNotifications,
  getMyNotifications,
  getMyUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import { notificationAuth } from "../middlewares/notificationAuth.js";

const router = express.Router();

router.use(notificationAuth);
router.get("/", getMyNotifications);
router.get("/unread-count", getMyUnreadCount);
router.delete("/clear-all", clearAllNotifications);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/:notificationId/read", markNotificationAsRead);

export default router;
