const Joi = require("@hapi/joi");
const httpStatus = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModels");
const Helpers = require("../helpers/helpers");
const dbConfig = require("../config/secret");

module.exports = {
  async createUser(req, res) {
    const schema = Joi.object().keys({
      username: Joi.string().min(5).max(10).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
    });

    const { error, value } = schema.validate(req.body);
    console.log(value);
    if (error && error.details) {
      return res.status(httpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    const userEmail = await User.findOne({
      email: Helpers.lowerCase(req.body.email),
    });
    if (userEmail) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "Email already exist" });
    }

    const userName = await User.findOne({
      username: Helpers.firstUpper(req.body.username),
    });
    if (userName) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "Username already exist" });
    }

    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ message: "Error hashing password" });
      }
      const body = {
        username: Helpers.firstUpper(value.username),
        email: Helpers.lowerCase(value.email),
        password: hash,
      };
      User.create(body)
        .then((user) => {
          const token = jwt.sign({ data: user }, dbConfig.secret, {
            expiresIn: "10h",
          });
          res.cookie("auth", token);
          res
            .status(httpStatus.CREATED)
            .json({ message: "User created successfully", user, token });
        })
        .catch((err) => {
          res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Error occured" });
        });
    });
  },

  async loginUser(req, res) {
    if (!req.body.username || !req.body.password) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "No empty fields allowed" });
    }
    await User.findOne({
      username: Helpers.firstUpper(req.body.username),
    })
      .then((user) => {
        if (!user) {
          return res
            .status(httpStatus.NOT_FOUND)
            .json({ message: "Username not found" });
        }

        return bcrypt
          .compare(req.body.password, user.password)
          .then((result) => {
            if (!result) {
              return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: "Password is incorrect" });
            }
            const token = jwt.sign({ data: user }, dbConfig.secret, {
              expiresIn: "10h",
            });
            res.cookie("auth", token);
            return res
              .status(httpStatus.OK)
              .json({ message: "Login Successful", user, token });
          });
      })
      .catch((err) => {
        return res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },
};
