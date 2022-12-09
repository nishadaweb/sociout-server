import express from "express";
import {
  getAllUser,
  blockUser,
  findOneuser,
  deleteRPost,
  getAllPost,
  getAllRpost,
} from "../Controllers/AdminController.js";
const router = express.Router();

router.get("/users", getAllUser);
router.get("/posts", getAllPost);
router.get("/rposts", getAllRpost);
router.put("/:id", blockUser);
router.get("/:id", findOneuser);

router.delete("/:id/:uid/report", deleteRPost);
export default router;
