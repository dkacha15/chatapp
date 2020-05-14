const express = require("express");
const router = express.Router();
const messageCtrl = require("../controllers/message");
const authHelper = require("../helpers/authHelper");

router.get(
  "/chat-messages/:sender_Id/:receiver_Id",
  authHelper.VerifyToken,
  messageCtrl.getAllMessages
);

router.get(
  "/receiver-messages/:sender/:receiver",
  authHelper.VerifyToken,
  messageCtrl.markMessages
);

router.get(
  "/mark-all-messages",
  authHelper.VerifyToken,
  messageCtrl.markAllMessages
);

router.post(
  "/chat-messages/:sender_Id/:receiver_Id",
  authHelper.VerifyToken,
  messageCtrl.sendMessage
);

module.exports = router;
