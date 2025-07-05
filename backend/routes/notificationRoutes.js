const express = require("express");
const { protect } = require("../middleware/authMiddleWare");

const {
    getAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationStats,
    checkBudgetAlerts,
    checkGoalReminders,
    cleanupExpiredNotifications
} = require("../controllers/notificationController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Notification CRUD routes
router.get("/", getAllNotifications);
router.get("/stats", getNotificationStats);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);

// Notification management routes
router.post("/check-budget-alerts", checkBudgetAlerts);
router.post("/check-goal-reminders", checkGoalReminders);
router.delete("/cleanup-expired", cleanupExpiredNotifications);

module.exports = router;