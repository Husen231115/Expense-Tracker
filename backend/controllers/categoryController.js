const Category = require("../models/Category");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

// Default categories to seed for new users
const defaultCategories = [
    // Income categories
    { name: "Salary", type: "income", icon: "💰", color: "#10B981", isDefault: true },
    { name: "Freelance", type: "income", icon: "💻", color: "#059669", isDefault: true },
    { name: "Investment", type: "income", icon: "📈", color: "#047857", isDefault: true },
    { name: "Business", type: "income", icon: "🏢", color: "#065F46", isDefault: true },
    { name: "Gift", type: "income", icon: "🎁", color: "#064E3B", isDefault: true },
    { name: "Other Income", type: "income", icon: "💵", color: "#0F766E", isDefault: true },
    
    // Expense categories
    { name: "Food & Dining", type: "expense", icon: "🍕", color: "#EF4444", isDefault: true },
    { name: "Transportation", type: "expense", icon: "🚗", color: "#F97316", isDefault: true },
    { name: "Shopping", type: "expense", icon: "🛍️", color: "#8B5CF6", isDefault: true },
    { name: "Entertainment", type: "expense", icon: "🎬", color: "#EC4899", isDefault: true },
    { name: "Bills & Utilities", type: "expense", icon: "💡", color: "#3B82F6", isDefault: true },
    { name: "Healthcare", type: "expense", icon: "🏥", color: "#14B8A6", isDefault: true },
    { name: "Education", type: "expense", icon: "📚", color: "#F59E0B", isDefault: true },
    { name: "Travel", type: "expense", icon: "✈️", color: "#6366F1", isDefault: true },
    { name: "Groceries", type: "expense", icon: "🛒", color: "#84CC16", isDefault: true },
    { name: "Other Expenses", type: "expense", icon: "📊", color: "#6B7280", isDefault: true }
];

// Seed default categories for a user
const seedDefaultCategories = async (userId) => {
    try {
        // Check if user already has categories
        const existingCategories = await Category.find({ userId });
        if (existingCategories.length > 0) {
            return existingCategories;
        }

        // Create default categories
        const categories = await Promise.all(
            defaultCategories.map(async (category) => {
                const newCategory = new Category({
                    ...category,
                    userId
                });
                return await newCategory.save();
            })
        );

        return categories;
    } catch (error) {
        console.error("Error seeding default categories:", error);
        throw error;
    }
};

// Add a new category
const addCategory = async (req, res) => {
    try {
        const { name, type, icon, color, description, parentCategory, budget } = req.body;
        
        // Validate required fields
        if (!name || !type) {
            return res.status(400).json({ message: "Name and type are required" });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({
            userId: req.user.id,
            name: { $regex: new RegExp(name, 'i') },
            type
        });

        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = new Category({
            userId: req.user.id,
            name,
            type,
            icon: icon || (type === 'income' ? '💰' : '📊'),
            color: color || '#3B82F6',
            description,
            parentCategory,
            budget
        });

        await category.save();
        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const { type, isActive } = req.query;
        
        let filter = { userId: req.user.id };
        
        if (type) filter.type = type;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const categories = await Category.find(filter)
            .populate('parentCategory', 'name')
            .sort({ type: 1, name: 1 });

        // If no categories found, seed default categories
        if (categories.length === 0) {
            const seededCategories = await seedDefaultCategories(req.user.id);
            return res.status(200).json(seededCategories);
        }

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get category by ID
const getCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            userId: req.user.id
        }).populate('parentCategory', 'name');

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        ).populate('parentCategory', 'name');

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Check if category is being used in transactions
        const expenseCount = await Expense.countDocuments({
            userId: req.user.id,
            category: category.name
        });

        const incomeCount = await Income.countDocuments({
            userId: req.user.id,
            category: category.name
        });

        if (expenseCount > 0 || incomeCount > 0) {
            return res.status(400).json({ 
                message: "Cannot delete category that is being used in transactions",
                usageCount: expenseCount + incomeCount
            });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get category statistics
const getCategoryStats = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        if (type === 'expense' || !type) {
            const expenseStats = await Expense.aggregate([
                {
                    $match: {
                        userId: req.user.id,
                        ...dateFilter
                    }
                },
                {
                    $group: {
                        _id: "$category",
                        totalAmount: { $sum: "$amount" },
                        count: { $sum: 1 },
                        avgAmount: { $avg: "$amount" }
                    }
                },
                {
                    $sort: { totalAmount: -1 }
                }
            ]);

            const totalExpenses = expenseStats.reduce((sum, cat) => sum + cat.totalAmount, 0);
            
            const expenseStatsWithPercentage = expenseStats.map(stat => ({
                ...stat,
                percentage: totalExpenses > 0 ? Math.round((stat.totalAmount / totalExpenses) * 100) : 0
            }));

            if (type === 'expense') {
                return res.status(200).json({
                    type: 'expense',
                    total: totalExpenses,
                    categories: expenseStatsWithPercentage
                });
            }
        }

        if (type === 'income' || !type) {
            const incomeStats = await Income.aggregate([
                {
                    $match: {
                        userId: req.user.id,
                        ...dateFilter
                    }
                },
                {
                    $group: {
                        _id: "$category",
                        totalAmount: { $sum: "$amount" },
                        count: { $sum: 1 },
                        avgAmount: { $avg: "$amount" }
                    }
                },
                {
                    $sort: { totalAmount: -1 }
                }
            ]);

            const totalIncome = incomeStats.reduce((sum, cat) => sum + cat.totalAmount, 0);
            
            const incomeStatsWithPercentage = incomeStats.map(stat => ({
                ...stat,
                percentage: totalIncome > 0 ? Math.round((stat.totalAmount / totalIncome) * 100) : 0
            }));

            if (type === 'income') {
                return res.status(200).json({
                    type: 'income',
                    total: totalIncome,
                    categories: incomeStatsWithPercentage
                });
            }
        }

        // Return both if no type specified
        const expenseStats = await Expense.aggregate([
            { $match: { userId: req.user.id, ...dateFilter } },
            { $group: { _id: "$category", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
            { $sort: { totalAmount: -1 } }
        ]);

        const incomeStats = await Income.aggregate([
            { $match: { userId: req.user.id, ...dateFilter } },
            { $group: { _id: "$category", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
            { $sort: { totalAmount: -1 } }
        ]);

        res.status(200).json({
            expenses: expenseStats,
            income: incomeStats
        });
    } catch (error) {
        console.error("Error fetching category stats:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    addCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats,
    seedDefaultCategories
};