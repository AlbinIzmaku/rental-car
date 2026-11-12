const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/cars", (req, res) => {
  res.send("Car 1");
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
