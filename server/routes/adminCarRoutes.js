const express = require("express");
const router = express.Router();

const {
  getAllCarsAdmin,
  getCarByIdAdmin,
  deleteCarAdmin,
} = require("../controllers/adminCarController");

const { createCar, updateCar } = require("../controllers/carController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/", getAllCarsAdmin);
router.get("/:id", getCarByIdAdmin);
router.post("/", createCar);
router.put("/:id", updateCar);
router.delete("/:id", deleteCarAdmin);

module.exports = router;
