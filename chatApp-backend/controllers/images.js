const cloudinary = require("cloudinary");
const httpStatus = require("http-status-codes");
const User = require("../models/userModels");

cloudinary.config({
  cloud_name: "dy6relv7v",
  api_key: "739963512761195",
  api_secret: "hUWgIrh8cHYZopNa7YM_ujqdbPI",
});

module.exports = {
  uploadImage(req, res) {
    cloudinary.uploader.upload(req.body.image, async (result) => {
      await User.update(
        {
          _id: req.user._id,
        },
        {
          $push: {
            images: {
              imgId: result.public_id,
              imgVersion: result.version,
            },
          },
        }
      )
        .then(() =>
          res
            .status(httpStatus.OK)
            .json({ message: "Image uploaded successfully" })
        )
        .catch((err) =>
          res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Error uploading image" })
        );
    });
  },

  async setDefaultImage(req, res) {
    const { imgId, imgVersion } = req.params;
    await User.update(
      {
        _id: req.user._id,
      },
      {
        picId: imgId,
        picVersion: imgVersion,
      }
    )
      .then(() =>
        res.status(httpStatus.OK).json({ message: "Default image set" })
      )
      .catch((err) =>
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" })
      );
  },
};
