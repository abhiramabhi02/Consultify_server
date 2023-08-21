const Professional = require("../models/professionals");
const hash = require("../helpers/passwordHash");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpgen = require("../helpers/otp");
const otpGenerator = require("otp-generator");
const mail = require("../helpers/sendMail");
const Preferences = require("../models/preferences");
const Appointments = require('../models/appointments')
const { ObjectId } = require("mongodb");
require('dotenv').config()
const appointmentController = require('../controllers/appointment.Controller')

// professional registration with parameters name,email,profession, password.
const professionalRegistration = async (req, res) => {
  const { name, profession, email, password, cpassword } = req.body;

  try {
    const exist = await Professional.findOne({ Email: email });
    if (exist) {
      res.send({
        status: 500,
        success: false,
        message: "professional already exist",
      });
    } else {
      if (password === cpassword) {
        const spassword = await hash.securePassword(password);
        const professional = new Professional({
          Name: name,
          Profession: profession,
          Email: email,
          Password: spassword,
        });
        const saved = professional.save();
        if (saved) {
          res.send({
            status: 200,
            success: true,
            message: "professional registration successful",
          });
        } else {
          res.send({
            status: 500,
            success: false,
            message: "User registration failed",
          });
        }
      }
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

//professional login with 2 parameters email and password
const professionalLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const professional = await Professional.findOne({ Email: email });
    if (professional) {
      const pass = await hash.passwordMatch(password, professional.Password);

      if (pass) {
        if (professional.Status === "Active" && professional.Verified) {
          const payload = {
            proId: professional._id,
          };
          Token = jwt.sign(payload, process.env.jwtSecret, {
            expiresIn: "60m",
          });
          res.send({
            status: 200,
            success: true,
            token: Token,
            message: "Professional login successful",
          });
        } else {
          res.send({
            status: 500,
            success: false,
            message: "email is not verified or you might be blocked",
          });
        }
      } else {
        res.send({
          status: 500,
          success: false,
          message: "Professional login failed",
        });
      }
    } else {
      res.send({
        status: 500,
        success: false,
        message: "Professional not found",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};



const sendMail = async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const email = req.body;

    const professional = await Professional.findOne({ Email: email.email });
    if (professional) {
      const otpsend = await mail.sendOtp(professional.Email, otp);

      const update = await Professional.findOneAndUpdate(
        { Email: email.email },
        { $set: { Token: otp } }
      );

      if (update) {
        res.send({ status: 200, success: true, message: "success" });
      } else {
        res.send({ status: 500, success: false, message: "failed" });
      }
    } else {
      res.send({
        status: 500,
        success: false,
        message: "professional not found",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const verifyMail = async (req, res) => {
  try {
    // const { email, otp } = req.body;
    const { email } = req.body.email;
    const { otp } = req.body.otp;

    const professional = await Professional.findOne({ Email: email });

    if (professional.Token == otp) {
      const updateData = await Professional.findOneAndUpdate(
        { Email: email },
        {
          $set: {
            Verified: true,
            Token: "",
          },
        }
      );

      if (updateData) {
        res.send({
          status: 200,
          success: true,
          message: "Email successfully verified",
        });
      }
    } else {
      res.send({
        status: 500,
        success: false,
        message: "OTP verification failed",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const loadDashboard = async (req, res) => {
  try {
    const { id } = req.body;
    const professional = await Professional.findOne({ _id: id });
    if (professional) {
      res.send({
        status: 200,
        success: true,
        pro: professional,
        message: "User fetched successfully",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "error in user finding",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const preferences = async (req, res) => {
 
  try {
    const {form, id} = req.body;
     // Validate the form data before proceeding
     if (!form || typeof form !== 'object') {
      return res.status(400).send({ success: false, message: "Invalid 'form' data" });
    }
    console.log(form, 'form');
    const professional = await Preferences.findOne({ProId:id})

     // Prepare the updated availability object based on the form data
     const updatedAvailability = {};
     for (const day of Object.keys(form)) {
       updatedAvailability[day] = {
         timeSlots: Object.keys(form[day]).filter(time => form[day][time] === true)
       };
     }
     console.log(updatedAvailability, 'updated');

    if(professional){
       // If professional exists, update their preferences
       professional.Availability = updatedAvailability;
       await professional.save();
       res.status(200).send({ success: true, message: 'Professional preferences updated' });
    }else{
      const prefernce = new Preferences({
        ProId: id,
        Availability: updatedAvailability
      });
      const save =  await prefernce.save();
      if (save) {
        res.send({status:200, success: true, message: "professional preferences created" });
      } else {
        res.send({status:500, success:false, message: "professional prefernce creation failed" });
      }
    }
  } catch (error) {
    res.send({status:500, success: false, message: error.message });
  }
};

const appointments = async(req,res)=>{
  try {
    const id = req.body
    const pid = new ObjectId(id.proId)
    const role = 'ProId'
    console.log(id, 'id pro ');
    const appointments = await appointmentController.userProfessionalAppointment(Appointments, role, pid)
    if(appointments){
      res.send({status:200, success:true, appointments:appointments, message:'appointments fetched successfully'})
    }else{
      res.send({status:500, success:false, message:'appointments fetching failed'})
    }
    
  } catch (error) {
    res.send({status:500, success:false, message:error.message})
  }
}

const confirmAppointment = async(req,res)=>{
  try {
    const id = req.body.id
    const appointment = await Appointments.findOneAndUpdate({_id:id},
      {$set:{
        Status:'Scheduled'
      }})
      if(appointment){
        res.send({status:200, success:true, message:'status updation successful'})
      }else{
        res.send({status:500, success:false, message:'status updation failed'})
      }
  } catch (error) {
    res.send({status:500, success:false, message:error.message})
  }
}

const cancelAppointment = async(req,res)=>{
  try {
    const id = req.body.id
    const appointment = await Appointments.findOneAndUpdate({_id:id},
      {$set:{
        Status:'Cancelled'
      }})
      if(appointment){
        res.send({status:200, success:true, message:'status updation successful'})
      }else{
        res.send({status:500, success:false, message:'status updation failed'})
      }
  } catch (error) {
    res.send({status:500, success:false, message:error.message})
  }
}

const getAppointmentData = async(req,res)=>{
  try {
    const id = req.body.id
    console.log(id, 'id');
    const appointment = await Appointments.findOne({_id:id})
    if(appointment){
      res.send({status:200, success:true, appointment:appointment, message:'fetched successfully'})
    }else{
      res.send({status:500, success:false, message:'failed to fetch the appointment'})
    }
    
  } catch (error) {
    res.send({status:500, success:false, message:error.message})
  }
}

module.exports = {
  professionalRegistration,
  professionalLogin,
  sendMail,
  verifyMail,
  loadDashboard,
  preferences,
  appointments,
  confirmAppointment,
  cancelAppointment,
  getAppointmentData
};
