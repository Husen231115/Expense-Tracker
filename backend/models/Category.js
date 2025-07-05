const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId , ref :"User" , required:true},
    name:{type:String , required:true},
    type:{type:String, enum:['income', 'expense'], required:true},
    icon:{type:String},
    color:{type:String, default:"#3B82F6"},
    description:{type:String},
    isDefault:{type:Boolean, default:false}, // System default categories
    isActive:{type:Boolean, default:true},
    parentCategory:{type:mongoose.Schema.Types.ObjectId, ref:"Category"}, // For subcategories
    budget:{type:Number}, // Default budget for this category
},
{timestamps:true});

// Index for faster queries
CategorySchema.index({ userId: 1, type: 1 });

module.exports= mongoose.model("Category" , CategorySchema);