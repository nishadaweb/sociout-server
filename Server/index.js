import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoute from "./Routes/AuthRoute.js";
import UserRoute from "./Routes/UserRoute.js";
import PostRoute from "./Routes/PostRoute.js";
import UploadRoute from "./Routes/UploadRoute.js";
import ChatRoute from "./Routes/ChatRoute.js";
import MessageRoute from "./Routes/MessageRoute.js";
import AdminRoute from "./Routes/AdminRoute.js";
import { mongoconnection } from "./config/db.js";
//Routes
const app = express();
//to serve images for public
app.use(express.static("Public"));
app.use("/images", express.static("images"));
//MiddleWare
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
dotenv.config();

app.listen(process.env.PORT, () =>
  console.log(`listening at ${process.env.PORT}`)
);

//usage of routes
app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/post", PostRoute);
app.use("/upload", UploadRoute);
app.use("/chat", ChatRoute);
app.use("/message", MessageRoute);
app.use("/admin", AdminRoute);
