const User = require("../models/userModels");
const httpStatus = require("http-status-codes");
const moment = require("moment");
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");

module.exports = {
  async getAllUsers(req, res) {
    await User.find({})
      .populate("posts.postId")
      .populate("following.userFollowed")
      .populate("followers.follower")
      .populate("chatList.receiverId")
      .populate("chatList.msgId")
      .populate("notifications.senderId")
      .then((result) => {
        res.status(httpStatus.OK).json({ message: "All users", result });
      })
      .catch((err) => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },

  async getUser(req, res) {
    await User.findOne({ _id: req.params.id })
      .populate("posts.postId")
      .populate("following.userFollowed")
      .populate("followers.follower")
      .populate("chatList.receiverId")
      .populate("chatList.msgId")
      .populate("notifications.senderId")
      .then((result) => {
        res.status(httpStatus.OK).json({ message: "User by id", result });
      })
      .catch((err) => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },

  async getUserByName(req, res) {
    await User.findOne({ username: req.params.username })
      .populate("posts.postId")
      .populate("following.userFollowed")
      .populate("followers.follower")
      .populate("chatList.receiverId")
      .populate("chatList.msgId")
      .populate("notifications.senderId")
      .then((result) => {
        res.status(httpStatus.OK).json({ message: "User by username", result });
      })
      .catch((err) => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },

  async profileView(req, res) {
    //const dateValue = moment().format("YYYY-MM-DD");
    const dateValue = new Date();
    await User.update(
      {
        _id: req.body.id,
        "notifications.senderId": { $ne: req.user._id },
        //"notifications.created": { $ne: [dateValue, ""] },
      },
      {
        $push: {
          notifications: {
            senderId: req.user._id,
            message: `${req.user.username} viewed your profile.`,
            created: new Date(),
            date: new Date(),
            viewProfile: true,
          },
        },
      }
    )
      .then((result) => {
        res.status(httpStatus.OK).json({ message: "Notification sent" });
      })
      .catch((err) => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },

  async changePassword(req, res) {
    const schema = Joi.object().keys({
      cpassword: Joi.string().required(),
      newpassword: Joi.string().min(5).required(),
      confirmpassword: Joi.string().min(5).optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: error.details });
    }

    const user = await User.findOne({ _id: req.user._id });
    return bcrypt
      .compare(value.cpassword, user.password)
      .then(async (result) => {
        if (!result) {
          return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Current password is incorrect" });
        }

        const newPassword = await User.EncryptPassword(req.body.newpassword);
        await User.update(
          {
            _id: req.user._id,
          },
          {
            password: newPassword,
          }
        )
          .then((result) => {
            res
              .status(httpStatus.OK)
              .json({ message: "Password change successfully" });
          })
          .catch((err) => {
            res
              .status(httpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: "Error occured" });
          });
      });
  },
};
