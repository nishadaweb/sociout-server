import express from "express";
import { getUser, userSearch } from "../Controllers/UserController.js";
import { updateUser } from "../Controllers/UserController.js";
import { deleteUser } from "../Controllers/UserController.js";
import { followUser } from "../Controllers/UserController.js";
import { UnFollowUser } from "../Controllers/UserController.js";
import { getAllUser } from "../Controllers/UserController.js";
import authMidddleware from "../Middleware/authMiddleware.js";
const router = express.Router();
router.get("/", getAllUser);
router.get("/search", userSearch);
router.get("/:id", getUser);
router.put("/:id", authMidddleware, updateUser);
router.delete("/:id", authMidddleware, deleteUser);
router.put("/:id/follow", authMidddleware, followUser);
router.put("/:id/unfollow", authMidddleware, UnFollowUser);

export default router;
