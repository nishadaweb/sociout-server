import UserModel from "../Models/userModel.js";
import OtpModel from "../Models/otpModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import dotenv from "dotenv";
dotenv.config();
const userEmail = process.env.EMAIL_ID;
const userPassword = process.env.EMAIL_PASSWORD;

const accountSid = process.env.ACCOUNTS_ID;
const authToken = process.env.AUTH_TOKEN;

const client = twilio(accountSid, authToken);
//enable us to send email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: userEmail,
    pass: userPassword,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
transporter.verify((err, success) => {
  if (err) console.log(err);
  else {
    console.log("nodemailer ready for messages");
    console.log(success);
  }
});
const sendEmailOTP = async (email) => {
  try {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    console.log(otp + "  otp");
    const mailOptions = {
      from: userEmail,
      to: email,
      subject: "SOCIOUT",
      html: `<p>Your Sociout OTP is : ${otp}.</p><p>This will <b>expire in 2 minutes</b>.</p>`,
    };
    //hash the otp
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    const newOtp = new OtpModel({
      user: email,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 2,
    });
    await newOtp.save();

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    res.json({ status: false });
  }
};
//Registering a newUser
export const registerUser = async (req, res) => {
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  req.body.password = hashedPassword;
  const newUser = new UserModel(req.body);

  const { email, mobile } = req.body;
  try {
    // addition new
    const oldUser = await UserModel.findOne({ email, mobile });

    if (oldUser)
      return res.status(400).json({ message: "User already exists" });

    //saving newuser
    const user = await newUser.save();

    res.status(200).json({
      user,
      status: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email: email });

    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(400).json("Invalid credential");
      } else {
        if (!user.isAdmin) {
          if (user.activeStatus) {
            if (user.verified.email || user.verified.mobile) {
              const token = jwt.sign(
                { email: user.email, id: user._id },
                process.env.JWT_KEY,
                { expiresIn: "30d" }
              );

              res.status(200).json({
                user,
                status: true,
                token,
              });
            } else {
              res.json({
                user,
                status: true,
              });
            }
          } else {
            res.json({ status: false, message: "Your account is blocked" });
          }
        } else {
          res.status(200).json({ user });
        }
      }
    } else {
      res.status(404).json("User doesnot exist");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//send OTP
export const sendOtp = async (req, res, next) => {
  try {
    const item = req.body.data;

    const stringItem = item.toString();

    if (stringItem.match(/^[0-9+]{10,13}$/)) {
      const otp = await sendMobileOTP(item);

      console.log({ status: true, otp });
      res.json({ status: true });
    } else {
      console.log("email");
      await sendEmailOTP(item);
      res.json({ status: true });
    }
  } catch (err) {
    next(err);
  }
};
//verify OTP
export const verifyOtp = async (req, res, next) => {
  try {
    const { OTP, type } = req.body.data;

    const stringData = type.toString();
    if (stringData.match(/^[0-9+]{10,13}$/)) {
      const verification = await verifyMobileOTP(OTP, type);

      if (verification.status === "approved") {
        const user = await UserModel.findOneAndUpdate(
          { mobile: type },
          { $set: { "verified.mobile": true } }
        );

        const token = jwt.sign(
          { email: user.email, id: user._id },
          process.env.JWT_KEY,
          { expiresIn: "30d" }
        );
        res.json({
          status: true,
          token,
          user,
        });
      } else {
        res.json({ status: false, message: "verification failed" });
      }
    } else {
      OtpModel.find({ user: type })
        .then(async (result) => {
          console.log(result);
          if (result.length > 0) {
            const { expiresAt } = result[result.length - 1];
            console.log(expiresAt);
            const sentOtp = result[result.length - 1].otp;
            if (expiresAt < Date.now()) {
              console.log("expired");
              OtpModel.findOneAndDelete({ user: type })
                .then(() => {
                  res.json({ status: false, message: "OTP Expired" });
                })
                .catch((error) => {
                  console.log(error);
                });
            } else {
              console.log(OTP + "  " + sentOtp);
              const same = await bcrypt.compare(OTP, sentOtp);
              if (same) {
                UserModel.updateOne(
                  { email: type },
                  { $set: { "verified.email": true } }
                )
                  .then((user) => {
                    console.log(user);
                    const token = jwt.sign(
                      { email: user.email, id: user._id },
                      process.env.JWT_KEY,
                      { expiresIn: "30d" }
                    );
                    OtpModel.deleteMany({ user: type })
                      .then(() => {
                        UserModel.findOne({ email: type }).then((user) => {
                          res.json({
                            user,

                            token: token,
                          });
                        });
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              } else {
                res.json({ status: false, message: "Invalid OTP" });
              }
            }
          } else {
            res.json({ status: false, message: "No user found" });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  } catch (error) {
    next(error);

    res.json({ status: false });
  }
};

const sendMobileOTP = (mobile) => {
  console.log("+91" + mobile);
  return client.verify.v2
    .services(process.env.SERVICE_ID)
    .verifications.create({ to: "+91" + mobile, channel: "sms" });
};

const verifyMobileOTP = (otp, mobile) => {
  console.log(otp, "dnd");
  return client.verify.v2
    .services(process.env.SERVICE_ID)
    .verificationChecks.create({ to: "+91" + mobile, code: otp });
};
