const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(express.json());
const carRoutes = require("./routes/carRoutes");

app.use("/api/cars", carRoutes);

app.get("/", (req, res) => {
  res.send("Car Rental API is running!");
});
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo DB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

app.listen(PORT, () => {
  connectDB();
  console.log(`App listening on port ${PORT}`);
});
