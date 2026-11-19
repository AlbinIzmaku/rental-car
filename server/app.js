const express = require("express");

const app = express();

app.use(express.json());

const carRoutes = require("./routes/carRoutes");

app.use("/api/cars", carRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Car Rental API is running!",
  });
});

module.exports = app;
