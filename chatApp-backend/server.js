const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const _ = require("lodash");
//const logger = require("morgan");

const app = express();

const options = { useUnifiedTopology: true, useNewUrlParser: true };

const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

const { User } = require("./helpers/userClass");

require("./socket/streams")(io, User, _);
require("./socket/private")(io);

const dbConfig = require("./config/secret");
const auth = require("./routes/authRoutes");
const posts = require("./routes/postRoutes");
const users = require("./routes/userRoutes");
const friends = require("./routes/friendsRoutes");
const message = require("./routes/messageRoutes");
const image = require("./routes/imageRoutes");

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
//app.use(logger("dev"));

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, options);

app.use("/api/chatapp", auth);
app.use("/api/chatapp", posts);
app.use("/api/chatapp", users);
app.use("/api/chatapp", friends);
app.use("/api/chatapp", message);
app.use("/api/chatapp", image);

server.listen(3000, () => {
  console.log("Running on port 3000");
});
