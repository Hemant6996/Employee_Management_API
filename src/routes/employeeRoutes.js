const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const {
  createEmployee,
  getEmployees,
  deleteEmployee,
  updateEmployee,
} = require("../controllers/employeeController");

router.get("/", protect, getEmployees);
router.post("/", protect, authorize("admin"), createEmployee);
router.put("/:id",protect, authorize("admin"), updateEmployee);
router.delete("/:id", protect, authorize("admin"), deleteEmployee);

module.exports = router;