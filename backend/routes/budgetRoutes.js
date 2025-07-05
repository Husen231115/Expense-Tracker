const express = require("express");
const { protect } = require("../middleware/authMiddleWare");

const {
    addBudget,
    getAllBudgets,
    getBudget,
    updateBudget,
    deleteBudget,
    getBudgetSummary
} = require("../controllers/budgetController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Budget CRUD routes
router.post("/", addBudget);
router.get("/", getAllBudgets);
router.get("/summary", getBudgetSummary);
router.get("/:id", getBudget);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;