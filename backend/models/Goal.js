const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId , ref :"User" , required:true},
    title:{type:String , required:true},
    description:{type:String},
    type:{type:String, enum:['savings', 'debt', 'investment', 'purchase'], required:true},
    targetAmount:{type:Number  , required:true},
    currentAmount:{type:Number, default:0},
    targetDate:{type:Date, required:true},
    isActive:{type:Boolean, default:true},
    priority:{type:String, enum:['low', 'medium', 'high'], default:'medium'},
    category:{type:String}, // Related category
    icon:{type:String},
    color:{type:String, default:"#10B981"},
    milestone:[{
        amount:{type:Number, required:true},
        date:{type:Date, default:Date.now},
        note:{type:String}
    }],
    autoContribute:{type:Boolean, default:false},
    contributionAmount:{type:Number}, // Auto contribution amount
    contributionFrequency:{type:String, enum:['daily', 'weekly', 'monthly']},
},
{timestamps:true});

// Calculate progress percentage
GoalSchema.virtual('progress').get(function() {
    return this.targetAmount > 0 ? Math.round((this.currentAmount / this.targetAmount) * 100) : 0;
});

// Index for faster queries
GoalSchema.index({ userId: 1, isActive: 1 });

module.exports= mongoose.model("Goal" , GoalSchema);