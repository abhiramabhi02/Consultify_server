const jwt = require('jsonwebtoken')
const Admin = require('../models/admin')
const User = require('../models/users')
const Appointment = require('../models/appointments')
const Professional = require('../models/professionals')
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose')
const appointentcontrol = require('../controllers/appointment.Controller')
require('dotenv').config()

const AdminLogin = async(req,res)=>{
    const {email, password} = req.body
    try {
        const admin = await Admin.findOne({Email:email})
        if(admin){
            if(admin.Password === password){
                const payload = {
                    adminId: admin._id
                  }
                  Token = jwt.sign(payload, process.env.jwtSecret, {
                    expiresIn:'60m'
                  })
                  res.send({status:200, success:true, token:Token, message:"Admin login successful"})
            }else{
                res.send({status:500, success:false, message:"incorrect password or email"})
            }
        }else{
            res.send({status:500, success:false, message:"incorrect credentials"})
        }

    } catch (error) {
        res.send({status:500, success:false, message: error.message})
    }
}

const getAllUsers = async(req,res)=>{
    try {
        const allUsers = await User.find({})
        if(allUsers){
            res.send({status:200, success:true, users:allUsers, message:"Users fetched successfully"})
        }else{
            res.send({status:500, success:false, message:'Users fetching failed'})
        }
        
    } catch (error) {
        res.send({status:500, success:false, message:error.message})
    }
}

const getAllProfessionals = async(req,res)=>{
    try {
        const allProfessionals = await Professional.find({})
        if(allProfessionals){
            res.send({status:200, success:true, professionals:allProfessionals, message:"professionals fetched successfully"})
        }else{
            res.send({status:500, success:false, message:'professionals fetching failed'})
        }
        
    } catch (error) {
        res.send({status:500, success:false, message:error.message})
    }
}

const blockUser = async(req,res)=>{
    try {
        const id = req.body

        const update = await User.findOneAndUpdate({_id: id.ID},
            {$set:{
                Status:'Block'
            }})
        if(update){
            console.log(update.Status, 'update');
            res.send({status:200, success:true, message:'user status updated'})
        }else{
            res.send({status:500, success:false, message:'user status failed to updated'})
        }

    } catch (error) {
        res.send({status:500, success:false, message:error.message})
    }
}

const unblockUser = async(req,res)=>{
    try {
        const id = req.body
        console.log(id, 'id');

        const update = await User.findOneAndUpdate({_id: id.ID},
            {$set:{
                Status:'Active'
            }})
        if(update){
            console.log(update.Status, 'update');
            res.send({status:200, success:true, message:'user status updated'})
        }else{
            console.log(id, 'id failed');
            res.send({status:500, success:false, message:'user status failed to updated'})
        }

    } catch (error) {
        res.send({status:500, success:false, message:error.message})
    }
}

const blockProfessional =  async(req,res)=>{
    try {
        const id = req.body

        const update = await Professional.findOneAndUpdate({_id: id.ID},
            {$set:{
                Status:'Block'
            }})
        if(update){
            res.send({status:200, success:true, message:'professional status updated'})
        }else{
            res.send({status:500, success:false, message:'professional status failed to updated'})
        }

    } catch (error) {
        res.send({status:500, success:false, message:error.message})
    }
}

const unblockProfessional = async(req,res)=>{
    try {
        const id = req.body

        const update = await Professional.findOneAndUpdate({_id: id.ID},
            {$set:{
                Status:'Active'
            }})
        if(update){
            res.send({status:200, success:true, message:'professional status updated'})
        }else{
            res.send({status:500, success:false, message:'professional status failed to updated'})
        }

    } catch (error) {
        res.send({status:500, success:false, message:error.message})
    }
}

const getAppointments = async(req,res)=>{
    try {
        const appointments = await appointentcontrol.getAllAppointments(Appointment)
   
        if(appointments){
            res.send({status:200, success:true, appointement:appointments, message:'appointments fetched successfully'})    
        }else{
         res.send({status:500, success:false, message:'error fetching in appointments'})    
        }
    } catch (error) {
        res.send({status:500, success:false, message:error.message})
    }
}



module.exports = {
    AdminLogin,
    getAllUsers,
    getAllProfessionals,
    blockUser,
    unblockUser,
    blockProfessional,
    unblockProfessional,
    getAppointments
}