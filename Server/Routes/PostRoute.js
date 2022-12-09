import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  likePost,
  updatePost,
  timelinePost,
  addComment,
  savedPost,
  reportPost,
} from "../Controllers/PostController.js";

const router = express.Router();
router.post("/", createPost);
router.get("/:id", getPost);
router.put("/:id", updatePost);

router.put("/:id/like", likePost);
router.get("/:id/timeline", timelinePost);
router.put("/:id/comment", addComment);

router.delete("/:id/:uid", deletePost);
router.put("/:id/:uid/report", reportPost);
router.post("/:id/:uid/save", savedPost);
export default router;
