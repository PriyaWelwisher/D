const express = require("express");
const authmiddleware = require("../middlewares/authmiddleware");
const { 
    getAllUsersController, 
    getAllDoctorsController, 
    changeAccountStatusController 
} = require("../controllers/adminCtrl");
const Doctor = require("../models/doctorModel");
const router = express.Router();



router.get("/getAllUsers", authmiddleware, getAllUsersController);
router.get("/getAllDoctors", authmiddleware, getAllDoctorsController);
router.post("/changeAccountStatus", authmiddleware, changeAccountStatusController);



module.exports = router;
