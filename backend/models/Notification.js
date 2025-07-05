const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId , ref :"User" , required:true},
    title:{type:String , required:true},
    message:{type:String , required:true},
    type:{type:String, enum:['budget_alert', 'bill_reminder', 'goal_progress', 'savings_alert', 'spending_alert'], required:true},
    priority:{type:String, enum:['low', 'medium', 'high'], default:'medium'},
    isRead:{type:Boolean, default:false},
    actionUrl:{type:String}, // URL to navigate when clicked
    relatedId:{type:mongoose.Schema.Types.ObjectId}, // Related budget/goal/expense ID
    relatedType:{type:String}, // Type of related object
    scheduledFor:{type:Date}, // For scheduled notifications
    sentAt:{type:Date},
    expiresAt:{type:Date}, // Auto-delete after this date
    metadata:{type:Object}, // Additional data for the notification
},
{timestamps:true});

// Index for faster queries
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ scheduledFor: 1 });

module.exports= mongoose.model("Notification" , NotificationSchema);