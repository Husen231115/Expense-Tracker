const express = require("express");
const { protect } = require("../middleware/authMiddleWare");

const {
    addCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats
} = require("../controllers/categoryController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Category CRUD routes
router.post("/", addCategory);
router.get("/", getAllCategories);
router.get("/stats", getCategoryStats);
router.get("/:id", getCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;