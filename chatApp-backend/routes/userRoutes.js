const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/users");
const authHelper = require("../helpers/authHelper");

router.get("/users", authHelper.VerifyToken, userCtrl.getAllUsers);
router.get("/user/:id", authHelper.VerifyToken, userCtrl.getUser);
router.get(
  "/username/:username",
  authHelper.VerifyToken,
  userCtrl.getUserByName
);
router.post("/user/view-profile", authHelper.VerifyToken, userCtrl.profileView);
router.post(
  "/change-password",
  authHelper.VerifyToken,
  userCtrl.changePassword
);

module.exports = router;
