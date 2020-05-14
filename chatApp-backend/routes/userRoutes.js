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

module.exports = router;
