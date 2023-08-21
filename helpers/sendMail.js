const nodemailer = require('nodemailer')
require('dotenv').config()

const sendOtp = async (email, otp) => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.smtphost,
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.mailsmtp,
          pass: process.env.mailPassSmtp,
        },
      });
  
      const mailOptions = {
        from: process.env.mailsmtp,
        to: email,
        subject: "For Verification mail",
        html:
          "<p>Hii This is your OTP  " +
          otp +
          "</p> " +
          "<p>Please do not share this OTP with anyone.</p>",
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email has been send:- ", info.response);
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  module.exports = {
    sendOtp
  }