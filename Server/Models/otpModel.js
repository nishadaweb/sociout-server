import mongoose from "mongoose";
const OTPSchema = mongoose.Schema({
  user: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});
const OtpModel = mongoose.model("OTP", OTPSchema);
export default OtpModel;
