const Goal = require("../models/Goal");
const mongoose = require("mongoose");

// Add a new goal
const addGoal = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            type, 
            targetAmount, 
            targetDate, 
            priority, 
            category, 
            icon, 
            color,
            autoContribute,
            contributionAmount,
            contributionFrequency
        } = req.body;
        
        // Validate required fields
        if (!title || !type || !targetAmount || !targetDate) {
            return res.status(400).json({ message: "Title, type, target amount, and target date are required" });
        }

        // Validate target date is in the future
        if (new Date(targetDate) <= new Date()) {
            return res.status(400).json({ message: "Target date must be in the future" });
        }

        const goal = new Goal({
            userId: req.user.id,
            title,
            description,
            type,
            targetAmount,
            targetDate: new Date(targetDate),
            priority: priority || 'medium',
            category,
            icon: icon || '🎯',
            color: color || '#10B981',
            autoContribute: autoContribute || false,
            contributionAmount,
            contributionFrequency
        });

        await goal.save();
        res.status(201).json({ message: "Goal created successfully", goal });
    } catch (error) {
        console.error("Error creating goal:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all goals
const getAllGoals = async (req, res) => {
    try {
        const { type, isActive, priority } = req.query;
        
        let filter = { userId: req.user.id };
        
        if (type) filter.type = type;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (priority) filter.priority = priority;

        const goals = await Goal.find(filter).sort({ createdAt: -1 });
        
        // Calculate progress and additional info for each goal
        const goalsWithProgress = goals.map(goal => {
            const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            return {
                ...goal.toObject(),
                progress,
                remaining,
                daysLeft,
                isOverdue: daysLeft < 0,
                isCompleted: progress >= 100
            };
        });

        res.status(200).json(goalsWithProgress);
    } catch (error) {
        console.error("Error fetching goals:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get goal by ID
const getGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
        const remaining = goal.targetAmount - goal.currentAmount;
        const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        const goalWithProgress = {
            ...goal.toObject(),
            progress,
            remaining,
            daysLeft,
            isOverdue: daysLeft < 0,
            isCompleted: progress >= 100
        };

        res.status(200).json(goalWithProgress);
    } catch (error) {
        console.error("Error fetching goal:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update goal
const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        res.status(200).json({ message: "Goal updated successfully", goal });
    } catch (error) {
        console.error("Error updating goal:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete goal
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
        console.error("Error deleting goal:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add contribution to goal
const addContribution = async (req, res) => {
    try {
        const { amount, note } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Valid amount is required" });
        }

        const goal = await Goal.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        // Add milestone
        goal.milestone.push({
            amount,
            note,
            date: new Date()
        });

        // Update current amount
        goal.currentAmount += amount;

        await goal.save();

        const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
        
        res.status(200).json({ 
            message: "Contribution added successfully", 
            goal: {
                ...goal.toObject(),
                progress,
                remaining: goal.targetAmount - goal.currentAmount,
                isCompleted: progress >= 100
            }
        });
    } catch (error) {
        console.error("Error adding contribution:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get goal statistics
const getGoalStats = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id, isActive: true });
        
        let totalTargetAmount = 0;
        let totalCurrentAmount = 0;
        let completedGoals = 0;
        let overdueGoals = 0;
        let goalsByType = {};
        let goalsByPriority = {};

        goals.forEach(goal => {
            totalTargetAmount += goal.targetAmount;
            totalCurrentAmount += goal.currentAmount;
            
            const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            if (progress >= 100) completedGoals++;
            if (daysLeft < 0) overdueGoals++;
            
            // Group by type
            if (!goalsByType[goal.type]) {
                goalsByType[goal.type] = { count: 0, totalTarget: 0, totalCurrent: 0 };
            }
            goalsByType[goal.type].count++;
            goalsByType[goal.type].totalTarget += goal.targetAmount;
            goalsByType[goal.type].totalCurrent += goal.currentAmount;
            
            // Group by priority
            if (!goalsByPriority[goal.priority]) {
                goalsByPriority[goal.priority] = { count: 0, totalTarget: 0, totalCurrent: 0 };
            }
            goalsByPriority[goal.priority].count++;
            goalsByPriority[goal.priority].totalTarget += goal.targetAmount;
            goalsByPriority[goal.priority].totalCurrent += goal.currentAmount;
        });

        const overallProgress = totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0;

        res.status(200).json({
            totalGoals: goals.length,
            completedGoals,
            overdueGoals,
            activeGoals: goals.length - completedGoals,
            totalTargetAmount,
            totalCurrentAmount,
            totalRemaining: totalTargetAmount - totalCurrentAmount,
            overallProgress,
            goalsByType,
            goalsByPriority
        });
    } catch (error) {
        console.error("Error fetching goal stats:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get upcoming goal deadlines
const getUpcomingDeadlines = async (req, res) => {
    try {
        const currentDate = new Date();
        const futureDate = new Date();
        futureDate.setDate(currentDate.getDate() + 30); // Next 30 days

        const upcomingGoals = await Goal.find({
            userId: req.user.id,
            isActive: true,
            targetDate: {
                $gte: currentDate,
                $lte: futureDate
            }
        }).sort({ targetDate: 1 });

        const goalsWithDeadlines = upcomingGoals.map(goal => {
            const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            return {
                ...goal.toObject(),
                progress,
                daysLeft,
                urgency: daysLeft <= 7 ? 'high' : daysLeft <= 14 ? 'medium' : 'low'
            };
        });

        res.status(200).json(goalsWithDeadlines);
    } catch (error) {
        console.error("Error fetching upcoming deadlines:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    addGoal,
    getAllGoals,
    getGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    getGoalStats,
    getUpcomingDeadlines
};