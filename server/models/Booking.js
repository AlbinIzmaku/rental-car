const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

bookingSchema.pre("validate", function () {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    this.invalide("endDate", "End date must be after start date");
  }
});

bookingSchema.index({
  car: 1,
  startDate: 1,
  endDate: 1,
  status: 1,
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
