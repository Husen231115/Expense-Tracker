const Notification = require("../models/Notification");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const mongoose = require("mongoose");

// Get all notifications for a user
const getAllNotifications = async (req, res) => {
    try {
        const { isRead, type, priority } = req.query;
        
        let filter = { userId: req.user.id };
        
        if (isRead !== undefined) filter.isRead = isRead === 'true';
        if (type) filter.type = type;
        if (priority) filter.priority = priority;

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50); // Limit to 50 most recent notifications

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get notification stats
const getNotificationStats = async (req, res) => {
    try {
        const totalNotifications = await Notification.countDocuments({ userId: req.user.id });
        const unreadNotifications = await Notification.countDocuments({ userId: req.user.id, isRead: false });
        
        const notificationsByType = await Notification.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        const notificationsByPriority = await Notification.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            totalNotifications,
            unreadNotifications,
            readNotifications: totalNotifications - unreadNotifications,
            notificationsByType,
            notificationsByPriority
        });
    } catch (error) {
        console.error("Error fetching notification stats:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create notification (internal function)
const createNotification = async (userId, notificationData) => {
    try {
        const notification = new Notification({
            userId,
            ...notificationData
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

// Check and create budget alerts
const checkBudgetAlerts = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();
        
        // Get all active budgets
        const budgets = await Budget.find({
            userId,
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });

        let alertsCreated = 0;

        for (const budget of budgets) {
            const percentageUsed = Math.round((budget.spent / budget.amount) * 100);
            
            // Check if budget exceeded threshold
            if (percentageUsed >= budget.alertThreshold) {
                // Check if alert already exists for this budget
                const existingAlert = await Notification.findOne({
                    userId,
                    type: 'budget_alert',
                    relatedId: budget._id,
                    isRead: false
                });

                if (!existingAlert) {
                    await createNotification(userId, {
                        title: 'Budget Alert',
                        message: `Your ${budget.category} budget is ${percentageUsed}% spent (${budget.spent}/${budget.amount})`,
                        type: 'budget_alert',
                        priority: percentageUsed >= 100 ? 'high' : 'medium',
                        relatedId: budget._id,
                        relatedType: 'budget',
                        actionUrl: `/budgets/${budget._id}`,
                        metadata: {
                            category: budget.category,
                            percentageUsed,
                            spent: budget.spent,
                            amount: budget.amount
                        }
                    });
                    alertsCreated++;
                }
            }
        }

        res.status(200).json({ 
            message: `${alertsCreated} budget alerts created`,
            alertsCreated
        });
    } catch (error) {
        console.error("Error checking budget alerts:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Check and create goal reminders
const checkGoalReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();
        const futureDate = new Date();
        futureDate.setDate(currentDate.getDate() + 7); // Next 7 days

        // Get goals approaching deadline
        const upcomingGoals = await Goal.find({
            userId,
            isActive: true,
            targetDate: {
                $gte: currentDate,
                $lte: futureDate
            }
        });

        let remindersCreated = 0;

        for (const goal of upcomingGoals) {
            const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            
            // Check if reminder already exists
            const existingReminder = await Notification.findOne({
                userId,
                type: 'goal_progress',
                relatedId: goal._id,
                isRead: false
            });

            if (!existingReminder) {
                await createNotification(userId, {
                    title: 'Goal Reminder',
                    message: `Your goal "${goal.title}" is ${daysLeft} days away and ${progress}% complete`,
                    type: 'goal_progress',
                    priority: daysLeft <= 3 ? 'high' : 'medium',
                    relatedId: goal._id,
                    relatedType: 'goal',
                    actionUrl: `/goals/${goal._id}`,
                    metadata: {
                        title: goal.title,
                        daysLeft,
                        progress,
                        targetAmount: goal.targetAmount,
                        currentAmount: goal.currentAmount
                    }
                });
                remindersCreated++;
            }
        }

        res.status(200).json({ 
            message: `${remindersCreated} goal reminders created`,
            remindersCreated
        });
    } catch (error) {
        console.error("Error checking goal reminders:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Clean up expired notifications
const cleanupExpiredNotifications = async (req, res) => {
    try {
        const currentDate = new Date();
        
        const result = await Notification.deleteMany({
            userId: req.user.id,
            expiresAt: { $lt: currentDate }
        });

        res.status(200).json({ 
            message: `${result.deletedCount} expired notifications cleaned up`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error cleaning up expired notifications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationStats,
    createNotification,
    checkBudgetAlerts,
    checkGoalReminders,
    cleanupExpiredNotifications
};