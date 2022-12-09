import express from "express";
import { registerUser } from "../Controllers/AuthController.js";
import {
  loginUser,
  sendOtp,
  verifyOtp,
} from "../Controllers/AuthController.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/sendotp", sendOtp);
router.post("/verifyotp", verifyOtp);

export default router;
