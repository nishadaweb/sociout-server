import mongoose from "mongoose";
import PostModel from "../Models/postModel.js";
import UserModel from "../Models/userModel.js";

//Create new post
export const createPost = async (req, res) => {
  const newPost = new PostModel(req.body);
  try {
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Get a post
export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//update a Post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post is Updated");
    } else {
      res.status(403).json("Action denied");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Delete a Post
export const deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.params.uid;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("Post deleted successfully");
    } else {
      res.status(403).json("Action denied");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Like and dislike Post
export const likePost = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });

      res.status(200).json("post liked");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post Unliked");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//GET timeline post
export const timelinePost = async (req, res) => {
  const userId = req.params.id;
  try {
    const currentUserPosts = await PostModel.find({ userId: userId });
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);
    res.status(200).json(
      currentUserPosts
        .concat(...followingPosts[0].followingPosts)
        .sort((a, b) => {
          return b.createdAt - a.createdAt;
        })
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Add comment
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    if (req.body.comment == null) {
      return res.json({ message: "Add any comment" });
    }
    let commented = await PostModel.updateOne(
      { _id: postId },
      {
        $push: {
          comments: {
            comment: req.body.comment,
            commentBy: req.body.userId,
          },
        },
      }
    );

    res.json(commented);
  } catch (error) {
    res.status(500).json(error);
  }
};
// saved Post
export const savedPost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.params.uid;

  const user = await UserModel.findOne({ _id: userId });

  if (user?.saved.includes(postId)) {
    await user.updateOne({ $pull: { saved: postId } });
    res.status(200).json("Post removed");
  } else {
    await user.updateOne({ $push: { saved: postId } });
    res.status(200).json("Post saved");
  }
};
// report post

export const reportPost = async (req, res) => {
  const postId = req.params.id;
  console.log(postId, "postid");
  const userId = req.params.uid;
  const post = await PostModel.findById(postId);
  console.log(post, "got post");
  if (post) {
    try {
      const post = await PostModel.findByIdAndUpdate(postId, req.body, {
        new: true,
      });
    } catch (err) {
      console.log(err);
    }
  }
};
