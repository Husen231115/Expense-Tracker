const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const mongoose = require("mongoose");

// Add a new budget
const addBudget = async (req, res) => {
    try {
        const { category, amount, period, startDate, endDate, alertThreshold, description, rollover } = req.body;
        
        // Validate required fields
        if (!category || !amount || !period || !startDate || !endDate) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Check if budget already exists for this category and period
        const existingBudget = await Budget.findOne({
            userId: req.user.id,
            category,
            period,
            isActive: true,
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) }
        });

        if (existingBudget) {
            return res.status(400).json({ message: "Budget already exists for this category and period" });
        }

        const budget = new Budget({
            userId: req.user.id,
            category,
            amount,
            period,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            alertThreshold: alertThreshold || 80,
            description,
            rollover: rollover || false
        });

        await budget.save();
        res.status(201).json({ message: "Budget created successfully", budget });
    } catch (error) {
        console.error("Error creating budget:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all budgets
const getAllBudgets = async (req, res) => {
    try {
        const { period, category, isActive } = req.query;
        
        let filter = { userId: req.user.id };
        
        if (period) filter.period = period;
        if (category) filter.category = category;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const budgets = await Budget.find(filter).sort({ createdAt: -1 });
        
        // Calculate actual spent amount for each budget
        const budgetsWithSpent = await Promise.all(
            budgets.map(async (budget) => {
                const expenses = await Expense.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(req.user.id),
                            category: budget.category,
                            date: {
                                $gte: budget.startDate,
                                $lte: budget.endDate
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSpent: { $sum: "$amount" }
                        }
                    }
                ]);

                const actualSpent = expenses.length > 0 ? expenses[0].totalSpent : 0;
                
                // Update budget with actual spent amount
                await Budget.findByIdAndUpdate(budget._id, { spent: actualSpent });
                
                return {
                    ...budget.toObject(),
                    spent: actualSpent,
                    remaining: budget.amount - actualSpent,
                    percentageUsed: Math.round((actualSpent / budget.amount) * 100)
                };
            })
        );

        res.status(200).json(budgetsWithSpent);
    } catch (error) {
        console.error("Error fetching budgets:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get budget by ID
const getBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        // Calculate actual spent amount
        const expenses = await Expense.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    category: budget.category,
                    date: {
                        $gte: budget.startDate,
                        $lte: budget.endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$amount" }
                }
            }
        ]);

        const actualSpent = expenses.length > 0 ? expenses[0].totalSpent : 0;
        
        const budgetWithSpent = {
            ...budget.toObject(),
            spent: actualSpent,
            remaining: budget.amount - actualSpent,
            percentageUsed: Math.round((actualSpent / budget.amount) * 100)
        };

        res.status(200).json(budgetWithSpent);
    } catch (error) {
        console.error("Error fetching budget:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update budget
const updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );

        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        res.status(200).json({ message: "Budget updated successfully", budget });
    } catch (error) {
        console.error("Error updating budget:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete budget
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        res.status(200).json({ message: "Budget deleted successfully" });
    } catch (error) {
        console.error("Error deleting budget:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get budget summary
const getBudgetSummary = async (req, res) => {
    try {
        const currentDate = new Date();
        
        // Get all active budgets
        const budgets = await Budget.find({
            userId: req.user.id,
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });

        let totalBudget = 0;
        let totalSpent = 0;
        let budgetAlerts = [];

        // Calculate spent amounts and check for alerts
        const budgetSummary = await Promise.all(
            budgets.map(async (budget) => {
                const expenses = await Expense.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(req.user.id),
                            category: budget.category,
                            date: {
                                $gte: budget.startDate,
                                $lte: budget.endDate
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSpent: { $sum: "$amount" }
                        }
                    }
                ]);

                const actualSpent = expenses.length > 0 ? expenses[0].totalSpent : 0;
                const percentageUsed = Math.round((actualSpent / budget.amount) * 100);
                
                totalBudget += budget.amount;
                totalSpent += actualSpent;

                // Check for budget alerts
                if (percentageUsed >= budget.alertThreshold) {
                    budgetAlerts.push({
                        budgetId: budget._id,
                        category: budget.category,
                        percentageUsed,
                        amount: budget.amount,
                        spent: actualSpent,
                        remaining: budget.amount - actualSpent
                    });
                }

                return {
                    ...budget.toObject(),
                    spent: actualSpent,
                    remaining: budget.amount - actualSpent,
                    percentageUsed
                };
            })
        );

        res.status(200).json({
            totalBudget,
            totalSpent,
            totalRemaining: totalBudget - totalSpent,
            overallPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
            budgets: budgetSummary,
            alerts: budgetAlerts,
            alertCount: budgetAlerts.length
        });
    } catch (error) {
        console.error("Error fetching budget summary:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    addBudget,
    getAllBudgets,
    getBudget,
    updateBudget,
    deleteBudget,
    getBudgetSummary
};