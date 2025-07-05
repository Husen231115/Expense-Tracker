const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId , ref :"User" , required:true},
    category:{type:String , required:true},
    amount:{type:Number  , required:true},
    spent:{type:Number, default:0},
    period:{type:String, enum:['weekly', 'monthly', 'yearly'], required:true},
    startDate:{type:Date, required:true},
    endDate:{type:Date, required:true},
    isActive:{type:Boolean, default:true},
    alertThreshold:{type:Number, default:80}, // Alert when 80% of budget is spent
    description:{type:String},
    rollover:{type:Boolean, default:false}, // Allow unused budget to rollover
},
{timestamps:true});

module.exports= mongoose.model("Budget" , BudgetSchema);