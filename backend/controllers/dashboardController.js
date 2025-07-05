const Income = require("../models/Income");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const Notification = require("../models/Notification");
const {isValidObjectId , Types} = require("mongoose");

//Dashboard Data 
exports.getDashboardData= async(req , res)=>{
    try{
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        // Get current date ranges
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const last30Days = new Date(Date.now() - 30*24*60*60*1000);
        const last60Days = new Date(Date.now() - 60*24*60*60*1000);
        const last12Months = new Date(Date.now() - 365*24*60*60*1000);

        // Fetch total income & expenses
        const totalIncome = await Income.aggregate([
            {$match:{userId:userObjectId}},
            {$group:{_id:null , total: {$sum:"$amount"}}},
        ]);

        const totalExpense = await Expense.aggregate([
            {$match:{userId:userObjectId}},
            {$group:{_id:null , total:{$sum:"$amount"}}},
        ]);

        // Monthly stats
        const monthlyIncome = await Income.aggregate([
            {$match:{userId:userObjectId, date:{$gte:startOfMonth, $lte:endOfMonth}}},
            {$group:{_id:null , total: {$sum:"$amount"}}},
        ]);

        const monthlyExpense = await Expense.aggregate([
            {$match:{userId:userObjectId, date:{$gte:startOfMonth, $lte:endOfMonth}}},
            {$group:{_id:null , total:{$sum:"$amount"}}},
        ]);

        // Category-wise expense breakdown
        const expensesByCategory = await Expense.aggregate([
            {$match:{userId:userObjectId, date:{$gte:last30Days}}},
            {$group:{_id:"$category", total:{$sum:"$amount"}, count:{$sum:1}}},
            {$sort:{total:-1}},
            {$limit:10}
        ]);

        // Category-wise income breakdown
        const incomeByCategory = await Income.aggregate([
            {$match:{userId:userObjectId, date:{$gte:last30Days}}},
            {$group:{_id:"$category", total:{$sum:"$amount"}, count:{$sum:1}}},
            {$sort:{total:-1}},
            {$limit:10}
        ]);

        // Monthly trends (last 12 months)
        const monthlyTrends = await Promise.all([
            Income.aggregate([
                {$match:{userId:userObjectId, date:{$gte:last12Months}}},
                {$group:{
                    _id:{
                        year:{$year:"$date"},
                        month:{$month:"$date"}
                    },
                    totalIncome:{$sum:"$amount"}
                }},
                {$sort:{"_id.year":1, "_id.month":1}}
            ]),
            Expense.aggregate([
                {$match:{userId:userObjectId, date:{$gte:last12Months}}},
                {$group:{
                    _id:{
                        year:{$year:"$date"},
                        month:{$month:"$date"}
                    },
                    totalExpense:{$sum:"$amount"}
                }},
                {$sort:{"_id.year":1, "_id.month":1}}
            ])
        ]);

        // Budget summary
        const budgetSummary = await Budget.aggregate([
            {$match:{userId:userObjectId, isActive:true}},
            {$group:{
                _id:null,
                totalBudget:{$sum:"$amount"},
                totalSpent:{$sum:"$spent"},
                budgetCount:{$sum:1}
            }}
        ]);

        // Active goals summary
        const goalSummary = await Goal.aggregate([
            {$match:{userId:userObjectId, isActive:true}},
            {$group:{
                _id:null,
                totalTargetAmount:{$sum:"$targetAmount"},
                totalCurrentAmount:{$sum:"$currentAmount"},
                goalCount:{$sum:1}
            }}
        ]);

        // Upcoming goals (next 30 days)
        const upcomingGoals = await Goal.find({
            userId,
            isActive:true,
            targetDate:{$gte:currentDate, $lte:new Date(Date.now() + 30*24*60*60*1000)}
        }).sort({targetDate:1}).limit(5);

        // Recent notifications
        const recentNotifications = await Notification.find({
            userId,
            isRead:false
        }).sort({createdAt:-1}).limit(5);

        // Budget alerts
        const budgetAlerts = await Budget.find({
            userId,
            isActive:true,
            $expr:{$gte:[{$divide:["$spent","$amount"]}, {$divide:["$alertThreshold",100]}]}
        }).limit(5);

        // Fetch recent transactions
        const recentTransactions = [
            ...(await Income.find({userId}).sort({date:-1}).limit(10)).map(
                (txn)=>({
                    ...txn.toObject(),
                    type:"income",
                })
            ),
            ...(await Expense.find({userId}).sort({date:-1}).limit(10)).map(
                (txn)=>({
                    ...txn.toObject(),
                    type:"expense",
                })
            ),
        ].sort((a,b)=>b.date - a.date).slice(0,10);

        // Calculate savings rate
        const currentMonthIncome = monthlyIncome[0]?.total || 0;
        const currentMonthExpense = monthlyExpense[0]?.total || 0;
        const savingsRate = currentMonthIncome > 0 ? Math.round(((currentMonthIncome - currentMonthExpense) / currentMonthIncome) * 100) : 0;

        // Financial health score (basic calculation)
        const totalIncomeAmount = totalIncome[0]?.total || 0;
        const totalExpenseAmount = totalExpense[0]?.total || 0;
        const totalBudgetAmount = budgetSummary[0]?.totalBudget || 0;
        const totalGoalProgress = goalSummary[0] ? (goalSummary[0].totalCurrentAmount / goalSummary[0].totalTargetAmount) * 100 : 0;
        
        let healthScore = 50; // Base score
        if (totalIncomeAmount > totalExpenseAmount) healthScore += 20;
        if (savingsRate > 20) healthScore += 15;
        if (totalBudgetAmount > 0) healthScore += 10;
        if (totalGoalProgress > 50) healthScore += 5;
        healthScore = Math.min(100, Math.max(0, healthScore));

        // Final Response 
        res.json({
            // Basic financial data
            totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            
            // Monthly data
            monthlyIncome: monthlyIncome[0]?.total || 0,
            monthlyExpense: monthlyExpense[0]?.total || 0,
            monthlyBalance: (monthlyIncome[0]?.total || 0) - (monthlyExpense[0]?.total || 0),
            savingsRate,
            
            // Category breakdowns
            expensesByCategory,
            incomeByCategory,
            
            // Trends
            monthlyTrends: {
                income: monthlyTrends[0],
                expense: monthlyTrends[1]
            },
            
            // Budget data
            budgetSummary: budgetSummary[0] || {totalBudget:0, totalSpent:0, budgetCount:0},
            budgetAlerts: budgetAlerts.map(budget => ({
                ...budget.toObject(),
                percentageUsed: Math.round((budget.spent / budget.amount) * 100)
            })),
            
            // Goal data
            goalSummary: goalSummary[0] || {totalTargetAmount:0, totalCurrentAmount:0, goalCount:0},
            upcomingGoals: upcomingGoals.map(goal => ({
                ...goal.toObject(),
                progress: Math.round((goal.currentAmount / goal.targetAmount) * 100),
                daysLeft: Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
            })),
            
            // Notifications
            recentNotifications,
            unreadNotificationCount: recentNotifications.length,
            
            // Transactions
            recentTransactions,
            
            // Financial health
            financialHealthScore: healthScore,
            
            // Quick stats
            stats: {
                totalTransactions: recentTransactions.length,
                activeBudgets: budgetSummary[0]?.budgetCount || 0,
                activeGoals: goalSummary[0]?.goalCount || 0,
                budgetUtilization: budgetSummary[0] ? Math.round((budgetSummary[0].totalSpent / budgetSummary[0].totalBudget) * 100) : 0,
                goalProgress: Math.round(totalGoalProgress)
            }
        });
    }catch(err){
        console.error("Dashboard error:", err);
        res.status(500).json({message:"Server Error", error: err.message});
    }
}