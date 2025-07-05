const express = require("express");
const { protect } = require("../middleware/authMiddleWare");

const {
    addGoal,
    getAllGoals,
    getGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    getGoalStats,
    getUpcomingDeadlines
} = require("../controllers/goalController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Goal CRUD routes
router.post("/", addGoal);
router.get("/", getAllGoals);
router.get("/stats", getGoalStats);
router.get("/upcoming", getUpcomingDeadlines);
router.get("/:id", getGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);
router.post("/:id/contribute", addContribution);

module.exports = router;