const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId , ref :"User" , required:true},
    icon:{type:String},
    category:{type:String , required:true},
    amount:{type:Number  , required:true},
    date:{type:Date, default:Date.now},
    description:{type:String},
    tags:[{type:String}],
    isRecurring:{type:Boolean, default:false},
    recurringFrequency:{type:String, enum:['daily', 'weekly', 'monthly', 'yearly']},
    attachments:[{type:String}],
},
{timestamps:true});

module.exports= mongoose.model("Expense" , ExpenseSchema);