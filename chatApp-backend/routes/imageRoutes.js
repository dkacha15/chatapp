const express = require("express");
const router = express.Router();
const imageCtrl = require("../controllers/images");
const authHelper = require("../helpers/authHelper");

router.post("/upload-image", authHelper.VerifyToken, imageCtrl.uploadImage);
router.get(
  "/set-default-image/:imgId/:imgVersion",
  authHelper.VerifyToken,
  imageCtrl.setDefaultImage
);

module.exports = router;
