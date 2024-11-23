const mongoose = require("mongoose");

// Define the Doctor schema
const doctorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true, // Removes extra spaces
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Validates a 10-digit phone number
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: [0, "Experience cannot be negative"],
    },
    feePerConsultation: {
      type: Number,
      required: true,
      min: [0, "Fee per consultation cannot be negative"],
    },
    timings: {
      type: [String], // Array of strings
      required: true,
      validate: {
        validator: function (v) {
          return v.every((time) =>
            /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)
          );
        },
        message: "Each timing must follow the HH:mm format (24-hour clock)",
      },
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"], // Restrict to specific values
    },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
doctorSchema.index({ status: 1 }); // For filtering by status
doctorSchema.index({ specialization: 1 }); // For filtering by specialization

// Compile the schema into a model
const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
