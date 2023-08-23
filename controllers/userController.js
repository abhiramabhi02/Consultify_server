const User = require("../models/users");
const jwt = require("jsonwebtoken");
const hash = require("../helpers/passwordHash");
const Professional = require("../models/professionals");
const mail = require("../helpers/sendMail");
const Appointment = require("../models/appointments");
const Preferences = require("../models/preferences");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const Razorpay = require("razorpay");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const crypto = require("crypto");
const appointentcontrol = require('../controllers/appointment.Controller')

const userRegistration = async (req, res) => {
  const { name, email, password, cpassword } = req.body;
  console.log(name, email, password, cpassword, "data");

  try {
    const exist = await User.findOne({ Email: email });
    if (exist) {
      res.send({ status: 500, success: false, message: "user already exist" });
    } else {
      if (password === cpassword) {
        const spassword = await hash.securePassword(password);
        console.log(spassword, "spass");
        const user = new User({
          Name: name,
          Email: email,
          Password: spassword,
        });
        const saved = user.save();
        if (saved) {
          res.send({
            status: 200,
            success: true,
            message: "User registration successful",
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

const userLogin = async (req, res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await User.findOne({ Email: email });
    console.log(user, "user found");
    if (user) {
      const passwordMatch = await hash.passwordMatch(password, user.Password);
      console.log(passwordMatch);
      if (passwordMatch) {
        if (user.Status === "Active" && user.Verified) {
          const payload = {
            userId: user._id,
          };
          Token = jwt.sign(payload, process.env.jwtSecret, {
            expiresIn: "60m",
          });
          res.status(200).json({
            success: true,
            token: Token,
            role: "user",
            message: "login successful",
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
          message: "email or password incorrect",
        });
      }
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const listProfessionals = async (req, res) => {
  try {
    let prodata = req.body;
    console.log(prodata, "prodata");
    let professionals = await Professional.find({ Profession: prodata.role });
    if (professionals) {
      console.log(professionals, "pro");
      res.send({
        status: 200,
        success: true,
        pros: professionals,
        message: "professional fetching successful",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "professional fetching failed",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const professionalProfile = async (req, res) => {
  try {
    const id = req.body;
    console.log(id);
    const professional = await Professional.findOne({ _id: id.id });
    if (professional) {
      console.log(professional, "pro");
      res.send({
        status: 200,
        success: true,
        pro: professional,
        message: "Professional fetched successfully",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "Failed to find the professional",
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
    console.log(email.email, "emial req");
    const user = await User.findOne({ Email: email.email });
    if (user) {
      console.log(user.Email, "pro");
      const otpsend = await mail.sendOtp(user.Email, otp);
      console.log(otpsend, "otpsend");
      const update = await User.findOneAndUpdate(
        { Email: email.email },
        { $set: { Token: otp } }
      );
      console.log(update, "update");
      if (update) {
        res.send({ status: 200, success: true, message: "success" });
      } else {
        console.log("failed");
      }
    } else {
      console.log("user not found", user);
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
    console.log(email, otp, "req");
    const user = await User.findOne({ Email: email });
    console.log(user, "pro");
    console.log(user.Token, otp, "otp verify");
    if (user.Token == otp) {
      const updateData = await User.findOneAndUpdate(
        { Email: email },
        {
          $set: {
            Verified: true,
            Token: "",
          },
        }
      );
      console.log(updateData, "upda");
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

const removetimeslot = async (proId, day, timeslot) => {
  try {
    const prefernce = await Preferences.findOne({ ProId: proId });
    if (!prefernce) {
      console.log("preference not found");
      return;
    }

    const selectedDate = new Date(day);

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const numericDay = selectedDate.getDay();

    const dayName = daysOfWeek[numericDay];

    prefernce.Availability[dayName].timeSlots = prefernce.Availability[
      dayName
    ].timeSlots.filter((slot) => slot !== timeslot);

    await prefernce.save();
    console.log("success");
  } catch (error) {
    console.log(error.message);
  }
};

const appointmenScheduling = async (req, res) => {
  try {
    const data = req.body;
    const userId = new ObjectId(data.userId);
    const proId = new ObjectId(data.proId);

    // let day = data.date.getDay()
    console.log(data.date, "day");
    // console.log(data, "data recieved");
    const appointment = new Appointment({
      UserId: userId,
      ProId: proId,
      BookingDate: data.bookingDate,
      Date: data.date,
      Time: data.time,
      Payment: 500,
      Status: data.status,
    });
    const saved = appointment.save();
    if (saved) {
      removetimeslot(proId, data.date, data.time);

      res.send({
        status: 200,
        success: true,
        message: "New appointment generated",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "failed to generate new appointment",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const getPreferences = async (req, res) => {
  try {
    const id = req.body.id;
    const preferences = await Preferences.findOne({ ProId: id });
    if (preferences) {
      res.send({
        status: 200,
        success: true,
        preference: preferences,
        message: "preferences fetched successfully",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "preferences not found",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const userProData = async (req, res) => {
  try {
    const userId = req.body.userId;
    const proId = req.body.proId;

    const user = await User.findOne({ _id: userId });
    const professional = await Professional.findOne({ _id: proId });

    if (user && professional) {
      res.send({
        status: 200,
        success: true,
        user: user,
        pro: professional,
        message: "user and professional found",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "user or professional not found",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const getUserData = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id, "id");
    const user = await User.findOne({ _id: id });
    if (user) {
      res.send({
        status: 200,
        success: true,
        user: user,
        message: "user fetched",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "user fetching failed",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const getAllAppointment = async (req, res) => {
  try {
    const id = req.body.id;
    const Id = new ObjectId(id);
    const UserId = 'UserId'

    const appointment = await appointentcontrol.userProfessionalAppointment(Appointment, UserId ,Id)
    console.log(appointment, "app");
    if (appointment) {
      res.send({
        status: 200,
        success: true,
        appointments: appointment,
        message: "appointments fetched successfully",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "appointments fetching failed",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

  const rzpKey = process.env.razorpayKey;
  const rzpSecret = process.env.razorpayPassword;

  const razorpayInstance = new Razorpay({
    key_id: rzpKey,
    key_secret: rzpSecret,
  });

  const signatureData = {
    key_id: rzpKey,
    key_secret: rzpSecret,
  };

const createOrder = async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const options = {
      amount: amount * 100,
      currency: currency,
    };

    console.log(options.amount, "amount");

    const order = await razorpayInstance.orders.create(options);

    const signature = generateSignature({
      amount: order.amount,
      currency: order.currency,
    });

    const responseData = {
      ...order,
      signature: signature,
    };

    res.send({
      status: 200,
      success: true,
      response: responseData,
      message: "order creation success",
    });
  } catch (error) {
    res.send({ status: 500, success: false, error: error.message });
  }
};

const generateSignature = (options) => {
  const concatenatedData = Object.keys(options)
    .sort()
    .map((keyName) => `${keyName}=${options[keyName]}`) // Use keyName instead of key
    .join("&");

  const secret = rzpSecret;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(concatenatedData)
    .digest("hex");

  return signature;
};

const paymentVerify = async (req, res) => {
  const { payment_id, order_id, razorpay_signature } = req.body;
  console.log(req.body, "req");
  try {
    const payment = await razorpayInstance.payments.fetch(payment_id);
    // console.log(payment, 'peyme');

    if (payment.order_id === order_id) {
      const expectedSignature = generateSignature({
        order_id: order_id,
        payment_id: payment_id,
      });

      console.log(expectedSignature, "boolean", razorpay_signature, "boolean");

      console.log(expectedSignature === razorpay_signature, "boolean2");
      if (expectedSignature === razorpay_signature) {
        res.send({ status: 200, success: true, message: "success" });
      } else {
        res.send({ status: 200, success: true, message: "success" });
      }
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const ConfirmAppointment = async (req, res) => {
  try {
    const id = req.body.id;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          Status: "Confirmed",
        },
      }
    );
    if (appointment) {
      res.send({
        status: 200,
        success: true,
        message: "status updation successful",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "status updation failed",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const getAppointmentData = async (req, res) => {
  try {
    const id = req.body.id;
    const appointment = await Appointment.findOne({ _id: id });
    if (appointment) {
      res.send({
        status: 200,
        success: true,
        appointment: appointment,
        message: "fetched successfully",
      });
    } else {
      res.send({
        status: 500,
        success: false,
        message: "failed to fetch the appointment",
      });
    }
  } catch (error) {
    res.send({ status: 500, success: false, message: error.message });
  }
};

const AgoraAppId = process.env.AgoraAppId;
const agoraAppCertificate = process.env.agoraAppCertificate;

const AgoraToken = async (req, res) => {
  const { channelName, uid } = req.query;

  console.log(channelName, uid, "query");

  let role;
  const expireTimeInSeconds = 100000; // Set the desired validity period for the token in seconds (1 hour in this example).
  if (uid === 1) {
    role = RtcRole.SUBSCRIBER;
  } else {
    role = RtcRole.PUBLISHER;
  }
  console.log(role, "role");

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTime + expireTimeInSeconds;

  const agoraToken = RtcTokenBuilder.buildTokenWithUid(
    AgoraAppId,
    agoraAppCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
  console.log(agoraToken, "ag tok");

  res.json({ token: agoraToken });
};

module.exports = {
  userRegistration,
  userLogin,
  listProfessionals,
  professionalProfile,
  sendMail,
  verifyMail,
  appointmenScheduling,
  getPreferences,
  userProData,
  getUserData,
  getAllAppointment,
  createOrder,
  paymentVerify,
  AgoraToken,
  ConfirmAppointment,
  getAppointmentData,
};
