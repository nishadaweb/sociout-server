const io = require("socket.io")(8800, {
  cors: {
    origin: "https://main.d2ltn75dce3jvx.amplifyapp.com",
  },
});
let activeUsers = [];
io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers = [
        ...activeUsers,
        { userId: newUserId, socketId: socket.id },
      ];
      // activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    // remove user from active users
    console.log("User befor disconection", activeUsers);
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    console.log(activeUsers, "active user in message recievee", receiverId);
    const user = activeUsers.find((user) => {
      return user.userId === receiverId;
    });
    console.log(user, "chatuser");
    console.log("Sending from socket to :", receiverId);
    console.log("Data: ", data);
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });
});
