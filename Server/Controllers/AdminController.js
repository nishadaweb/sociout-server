import UserModel from "../Models/userModel.js";
import PostModel from "../Models/postModel.js";
//Get all user
export const getAllUser = async (req, res) => {
  try {
    const user = await UserModel.find({ isAdmin: false });

    res.json({ users: user });
  } catch (error) {
    res.status(500).json(error);
  }
};
//Blocking user
export const blockUser = async (req, res) => {
  try {
    const id = req.params.id;
    const users = await UserModel.findOne({ _id: id });
    const user = await UserModel.updateOne(
      { _id: id },
      { $set: { activeStatus: !users.activeStatus } }
    );
    res.status(200).json({ status: true });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const findOneuser = async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findById(id);
  res.json(user);
};
//Get all post
export const getAllPost = async (req, res) => {
  try {
    const post = await PostModel.find({});
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json(error);
  }
};
//Get all reported posts
export const getAllRpost = async (req, res) => {
  try {
    const post = await PostModel.find({ isReport: true });
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json(error);
  }
};

// delete Reported post
export const deleteRPost = async (req, res) => {
  console.log("admin");
  const id = req.params.id;
  const userId = req.params.uid;

  const admin = await UserModel.findById(userId);
  if (admin.isAdmin === true) {
    try {
      const post = await PostModel.findById(id);
      await post.deleteOne();
      res.status(200).json("Post deleted.");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Action forbidden");
  }
};
