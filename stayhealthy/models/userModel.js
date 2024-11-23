const mongoose = require("mongoose");

// Define notification sub-schema
const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true, // Removes extra spaces
    },
    date: {
      type: Date,
      default: Date.now, // Default to current timestamp
    },
  },
  { _id: false } // Prevent creation of a separate ID for notifications
);

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email uniqueness
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Validates email format
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    isDoctor: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    seenNotifications: {
      type: [notificationSchema],
      default: [],
    },
    unseenNotifications: {
      type: [notificationSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` timestamps
  }
);

// Create an index on email for unique and efficient querying
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
