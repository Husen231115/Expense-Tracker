const xlsx = require("xlsx");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Category = require("../models/Category");
const { createNotification } = require("./notificationController");

//Add User Expense 
exports.addExpense = async(req,res)=>{
const userId =req.user.id ; 

try{
    const{icon , category , amount , date, description, tags, isRecurring, recurringFrequency, attachments}= req.body;
    //Validation :Checksource for missing fields
    if(!category || !amount || !date){
        return res.status(400).json({message:"All Fields Are Required ."});
    }

    // Validate amount is positive
    if(amount <= 0){
        return res.status(400).json({message:"Amount must be positive."});
    }

    // Check if category exists
    const categoryExists = await Category.findOne({
        userId,
        name: category,
        type: 'expense'
    });

    if(!categoryExists){
        return res.status(400).json({message:"Category not found. Please create the category first."});
    }

    const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date:new Date(date),
            description,
            tags: tags || [],
            isRecurring: isRecurring || false,
            recurringFrequency,
            attachments: attachments || []
    });
    await newExpense.save();

    // Check budget alerts after adding expense
    await checkBudgetAlert(userId, category, amount);

    res.status(201).json({
        message: "Expense added successfully",
        expense: newExpense
    });

}catch(error){
    console.error("Error adding expense:", error);
    res.status(500).json({message:"Server Error", error: error.message});
}}

// Helper function to check budget alerts
const checkBudgetAlert = async (userId, category, amount) => {
    try {
        const currentDate = new Date();
        const budget = await Budget.findOne({
            userId,
            category,
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });

        if (budget) {
            // Calculate total spent in this budget period
            const totalSpent = await Expense.aggregate([
                {
                    $match: {
                        userId,
                        category,
                        date: {
                            $gte: budget.startDate,
                            $lte: budget.endDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            const spent = totalSpent.length > 0 ? totalSpent[0].total : 0;
            const percentageUsed = Math.round((spent / budget.amount) * 100);

            // Update budget spent amount
            await Budget.findByIdAndUpdate(budget._id, { spent });

            // Create notification if threshold exceeded
            if (percentageUsed >= budget.alertThreshold) {
                await createNotification(userId, {
                    title: 'Budget Alert',
                    message: `Your ${category} budget is ${percentageUsed}% spent (${spent}/${budget.amount})`,
                    type: 'budget_alert',
                    priority: percentageUsed >= 100 ? 'high' : 'medium',
                    relatedId: budget._id,
                    relatedType: 'budget',
                    actionUrl: `/budgets/${budget._id}`
                });
            }
        }
    } catch (error) {
        console.error("Error checking budget alert:", error);
    }
};

// GET ALL Expense Source 
exports.getAllExpense = async(req,res)=>{
    const userId= req.user.id ;
    try{
        const { category, startDate, endDate, tags, search, page = 1, limit = 10 } = req.query;
        
        let filter = { userId };
        
        if (category) filter.category = category;
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (tags) {
            filter.tags = { $in: tags.split(',') };
        }
        if (search) {
            filter.$or = [
                { category: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const expenses = await Expense.find(filter)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Expense.countDocuments(filter);

        res.json({
            expenses,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    }catch(err){
        console.error("Error fetching expenses:", err);
        res.status(500).json({message:"Server Error", error: err.message});
    }

}

//Delete User Expense 
exports.deleteExpense = async(req,res)=>{
    try{
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if(!expense){
            return res.status(404).json({message:"Expense not found"});
        }

        await Expense.findByIdAndDelete(req.params.id);
        res.json({message:'Expense deleted successfully'});
    }catch(err){
        console.error("Error deleting expense:", err);
        res.status(500).json({message:"Server Error", error: err.message});
    }
};



//Download Excel  
exports.downloadExpenseExcel = async(req,res)=>{
        const  userId =req.user.id ; 
        try{
            const { startDate, endDate, category } = req.query;
            
            let filter = { userId };
            if (startDate && endDate) {
                filter.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (category) {
                filter.category = category;
            }

            const expenses =  await  Expense.find(filter).sort({date:-1});
            
            if(expenses.length === 0){
                return res.status(404).json({message:"No expenses found for the selected criteria"});
            }

            //Prepare data for Excel 
            const data = expenses.map((item)=>({
                Category: item.category,
                Amount: item.amount,
                Date: item.date.toLocaleDateString(),
                Description: item.description || '',
                Tags: item.tags ? item.tags.join(', ') : '',
                IsRecurring: item.isRecurring ? 'Yes' : 'No',
                RecurringFrequency: item.recurringFrequency || ''
            }));

            const wb = xlsx.utils.book_new(); 
            const ws = xlsx.utils.json_to_sheet(data);
            xlsx.utils.book_append_sheet(wb,ws,"Expenses");
            
            const filename = `expense_details_${new Date().toISOString().split('T')[0]}.xlsx`;
            xlsx.writeFile(wb , filename);
            
            res.download(filename, (err) => {
                if (err) {
                    console.error("Error downloading file:", err);
                    res.status(500).json({message:"Error downloading file"});
                }
                // Delete the temporary file
                const fs = require('fs');
                fs.unlink(filename, (unlinkErr) => {
                    if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr);
                });
            });
        }catch(err){
            console.error("Error generating Excel file:", err);
            res.status(500).json({message:"Server Error", error: err.message});
        }
}
