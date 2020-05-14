const express = require("express");
const router = express.Router();
const friendCtrl = require("../controllers/friends");
const authHelper = require("../helpers/authHelper");

router.post("/follow-user", authHelper.VerifyToken, friendCtrl.followUser);
router.post("/unfollow-user", authHelper.VerifyToken, friendCtrl.unFollowUser);
router.post("/mark/:id", authHelper.VerifyToken, friendCtrl.markNotification);
router.post(
  "/mark-all",
  authHelper.VerifyToken,
  friendCtrl.markAllNotification
);

module.exports = router;
