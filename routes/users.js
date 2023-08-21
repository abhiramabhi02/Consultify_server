var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')
const jwtVerify = require('../middlewares/checkAuth')

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/userregistration',userController.userRegistration)

router.post('/userlogin',userController.userLogin)

router.post('/prolisting',jwtVerify,userController.listProfessionals)

router.post('/professionalprofile',jwtVerify, userController.professionalProfile)

router.post('/mailverify', userController.sendMail)

router.post('/otpverify', userController.verifyMail)

router.post('/schedule', userController.appointmenScheduling)

router.post('/getpreferences', userController.getPreferences)

router.post('/getalldata', userController.userProData)

router.post('/getuserdata', userController.getUserData)

router.post('/getallappointment',userController.getAllAppointment)

router.post('/api/createorder', userController.createOrder)

router.post('/api/paymentverify', userController.paymentVerify)

router.get('/get_agora_token', userController.AgoraToken)

router.post('/confirmappointment', userController.ConfirmAppointment)

router.post('/getconferenceappointment', userController.getAppointmentData)

module.exports = router;
