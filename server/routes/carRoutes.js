const express = require("express");

const router = express.Router();

const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getAllCars,
} = require("../controllers/carController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getAllCars);
//router.get("/", getCars);
router.get("/:id", getCarById);
router.post("/", protect, authorize("admin"), createCar);
router.put("/:id", protect, authorize("admin"), updateCar);
router.delete("/:id", protect, authorize("admin"), deleteCar);

module.exports = router;
