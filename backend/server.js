require ("dotenv").config();
 const express =require("express");
 const cors = require("cors");
 const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const goalRoutes = require("./routes/goalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");



 const app = express();

 //MiddleWare to Handle Cors 
 app.use(cors({
    origin:process.env.CLIENT_URL || "*", 
    methods:["GET" , "POST" , "PUT" ,"DELETE"],
    allowedHeaders:["Content-Type" , "Authorization"],
 })
);

app.use(express.json());


connectDB();

app.use("/api/v1/auth" , authRoutes);
app.use("/api/v1/income" , incomeRoutes);
app.use("/api/v1/expense" ,expenseRoutes);
app.use("/api/v1/dashboard",dashboardRoutes);
app.use("/api/v1/budgets",budgetRoutes);
app.use("/api/v1/categories",categoryRoutes);
app.use("/api/v1/goals",goalRoutes);
app.use("/api/v1/notifications",notificationRoutes);

//Serve uploads 
app.use("/uploads" , express.static(path.join(__dirname,"uploads")));

const PORT = process.env.PORT || 5001 ; 
app.listen(PORT, ()=>console.log(`Server is Running on port ${PORT} .`));
