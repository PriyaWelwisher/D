const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");

const getAllUsersController = async (req, res) => {
    try {
        const users = await userModel.find({});
        res.status(200).send({
            success: true,
            message: "Users Data List",
            data: users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while fetching users",
            error,
        });
    }
};

const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        res.status(200).send({
            success: true,
            message: "Doctors Data List",
            data: doctors,
        });
    } catch (error) {
        console.log( error);
        res.status(500).send({
            success: false,
            message: "Error while getting doctors data",
            error,
        });
    }
};

const changeAccountStatusController = async (req, res) => {
    try {
        let { doctorId, status } = req.body;
        status = status.toLowerCase();

        
        const validStatuses = ["approved", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).send({
                success: false,
                message: "Invalid status value",
            });
        }
        // Validate the doctor exists
        const doctor = await doctorModel.findByIdAndUpdate(doctorId,{status}, {new: true});
        if (!doctor) {
            return res.status(400).send({
                success: false,
                message: "Doctor not found",
            });
        }

        
        

        // Validate the user linked to the doctor
        const user = await userModel.findById(doctor.userId);
        if (user) {
            

        // Add a new notification
        user.unseenNotifications.push({
            type: "doctor-account-request-updated",
            message: `Your Doctor Account Request has been ${status}`,
            onClickPath:"/notifications"
            
        });
      

        // Update the `isDoctor` status for the user
        user.isDoctor === "approved" ? true : false; 
        await user.save();
        }

        res.status(200).send({
            success: true,
            message: "Account Status Updated",
            data: { doctor, user },
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Account Status",
            error,
        });
    }
    
};

module.exports = {
    getAllDoctorsController,
    getAllUsersController,
    changeAccountStatusController,
};
