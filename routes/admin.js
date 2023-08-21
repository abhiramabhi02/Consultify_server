var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const checkAuth = require('../middlewares/checkAuth')


//admin login 2 parameters, email and password, checked in db and return the result
router.post('/adminlogin', adminController.AdminLogin)

//loading users in user management in admin side
router.get('/adminusers', adminController.getAllUsers)

router.get('/adminprofessionals',checkAuth, adminController.getAllProfessionals)

router.post('/adminblockuser', adminController.blockUser)

router.post('/adminunblockuser', adminController.unblockUser)

router.post('/adminblockprofessional', adminController.blockProfessional)

router.post('/adminunblockuserprofessional', adminController.unblockProfessional)

router.get('/getappointments', adminController.getAppointments)


module.exports = router;