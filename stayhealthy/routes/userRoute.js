const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authmiddleware = require("../middlewares/authmiddleware");

// Register Route
router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(400)
        .send({ message: "User already exists", success: false });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).send({
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).send({
      message: "Error creating user",
      success: false,
      error: error.message,
    });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .send({ message: "User does not exist", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .send({ message: "Password is incorrect", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).send({
      message: "Login successful",
      success: true,
      data: token,
    });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).send({
      message: "Error logging in",
      success: false,
      error: error.message,
    });
  }
});

// Get User Info by ID Route
router.post("/get-user-info-by-id", authmiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .send({ message: "User does not exist", success: false });
    }

    res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting user info:", error.message);
    res.status(500).send({
      message: "Error getting user info",
      success: false,
      error: error.message,
    });
  }
});

// Apply Doctor Route
router.post("/apply-doctor", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      address,
      specialization,
      experience,
      feePerConsultation,
      website,
      timings, // Lowercase for frontend match
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !address ||
      !specialization ||
      !experience ||
      !feePerConsultation ||
      !timings // Include timings validation
    ) {
      return res.status(400).send({
        message: "All fields are required",
        success: false,
      });
    }
    console.log("Request Body:", req.body); 
    console.log("Received Request Body:", req.body);
    const newDoctor = new Doctor({
      FirstName: firstName,
      LastName: lastName,
      PhoneNumber: phoneNumber,
      Address: address,
      Specialization: specialization,
      Experience: experience,
      FeePerConsultation: feePerConsultation,
      Website: website,
      Timings: timings, 
      ...req.body,// Pass timings directly
      status: "pending",
    });

    await newDoctor.save();

    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      return res.status(404).send({
        message: "Admin user not found",
        success: false,
      });
    }

    const unseenNotifications = adminUser.unseenNotifications || [];
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
      data: {
        doctorId: newDoctor._id,
        name: `${newDoctor.firstName} ${newDoctor.lastName}`,
      },
      onClickPath: "/admin/doctors",
    });

    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });

    res.send({
      success: true,
      message: "Doctor account applied successfully!",
    });
  } catch (error) {
    console.error("Error applying doctor account:", error);
    res.status(500).send({
      message: "Error applying doctor account",
      success: false,
      error: error.message,
    });
  }
});

router.get("/get-doctors", authmiddleware, async (req, res) => {
  try {
    // Fetch all doctors from the database
    const doctors = await Doctor.find({});

    // Log all doctors' details in the server console
    doctors.forEach(doctor => {
      console.log(`
        First Name: ${doctor.firstName}
        Last Name: ${doctor.lastName}
        Phone Number: ${doctor.phoneNumber}
        Website: ${doctor.website}
        Specialization: ${doctor.specialization}
        Timing: ${doctor.timings}
      `);
    });

    // Respond with the doctor data
    res.status(200).send({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error.message);
    res.status(500).send({
      message: "Error fetching doctors",
      success: false,
      error: error.message,
    });
  }
});

router.post("/mark-all-notifications-as-seen", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const unseenNotifications = user.unseenNotifications;
    const seenNotifications =  user.seenNotifications;
    seenNotifications.push(...unseenNotifications); 
    user.unseenNotifications = [];
    user.seenNotifications = seenNotifications;
    const updatedUser = await user.save();
    res.status(200)
      .send({
        success: true,
        message: "All notifications marked as seen",
        data: updatedUser,
      })
  } catch (error) {
    console.error("Error applying doctor account:", error.message);
    res.status(500).send({
      message: "Error applying doctor account",
      success: false,
      error: error.message,
    });
  }
});

router.post("/delete-all-notifications", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200)
      .send({
        success: true,
        message: "All notifications are deleted",
        data: updatedUser,
      })
  } catch (error) {
    console.error("Error applying doctor account:", error.message);
    res.status(500).send({
      message: "Error applying doctor account",
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
