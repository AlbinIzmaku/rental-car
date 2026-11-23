const express = require("express");

const router = express.Router();

const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getAllCars,
  uploadCarImages,
} = require("../controllers/carController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", getAllCars);
//router.get("/", getCars);
router.get("/:id", getCarById);
router.post("/", protect, authorize("admin"), createCar);
router.put("/:id", protect, authorize("admin"), updateCar);
router.delete("/:id", protect, authorize("admin"), deleteCar);
router.post(
  "/:id/images",
  protect,
  authorize("admin"),
  upload.array("images", 10),
  uploadCarImages,
);

module.exports = router;
