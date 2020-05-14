const express = require("express");
const router = express.Router();

const postCtrl = require("../controllers/posts");
const authHelper = require("../helpers/authHelper");

router.get("/posts", authHelper.VerifyToken, postCtrl.GetAllPosts);
router.get("/post/:id", authHelper.VerifyToken, postCtrl.GetPost);

router.post("/post/add-post", authHelper.VerifyToken, postCtrl.addPost);
router.post("/post/add-like", authHelper.VerifyToken, postCtrl.addLike);
router.post("/post/add-comment", authHelper.VerifyToken, postCtrl.addComment);

module.exports = router;
