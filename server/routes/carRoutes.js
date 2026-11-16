const express = require("express");

const router = express.Router();

const { createCar } = require("../controllers/carController");

router.post("/", createCar);

module.exports = router;
