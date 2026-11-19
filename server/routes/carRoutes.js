const express = require("express");

const router = express.Router();

const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getAllCars
} = require("../controllers/carController");

router.get("/", getAllCars)
//router.get("/", getCars);
router.get("/:id", getCarById);
router.post("/", createCar);
router.put("/:id", updateCar);
router.delete("/:id", deleteCar);


module.exports = router;
