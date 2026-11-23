const express = require("express");

const app = express();

app.use(express.json());

const carRoutes = require("./routes/carRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

app.use("/api/cars", carRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Car Rental API is running!",
  });
});

module.exports = app;
