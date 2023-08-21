var express = require('express');
var router = express.Router();
const professionalController = require('../controllers/professionalController')
const auth = require('../middlewares/checkAuth')


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/professionalregistration', professionalController.professionalRegistration)

router.post('/professionallogin', professionalController.professionalLogin )

router.post('/verifyMail', professionalController.sendMail)

router.post('/verifyotp', professionalController.verifyMail)

router.post('/professionaldashboard',auth, professionalController.loadDashboard)

router.post('/professionalpreferences',auth, professionalController.preferences )

router.post('/professionalappointments', professionalController.appointments)

router.post('/confirmappointment', professionalController.confirmAppointment )

router.post('/cancelappointment', professionalController.cancelAppointment)

router.post('/getconferenceappointment', professionalController.getAppointmentData)

module.exports = router;
