const mongoose = require("mongoose");

const IncomeSchema =new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId ,ref:"User" , required:true},
    icon:{type:String},
    source:{type:String ,required:true},
    amount:{type:Number , required:true},
    date:{type:Date  ,default:Date.now},
    category:{type:String, default:"Other"},
    description:{type:String},
    tags:[{type:String}],
    isRecurring:{type:Boolean, default:false},
    recurringFrequency:{type:String, enum:['daily', 'weekly', 'monthly', 'yearly']},
}
,{timestamps:true}
);

module.exports = mongoose.model("Income" , IncomeSchema);

