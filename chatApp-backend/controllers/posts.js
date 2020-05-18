const Joi = require("@hapi/joi");
const Post = require("../models/postModels");
const httpStatus = require("http-status-codes");
const User = require("../models/userModels");
const cloudinary = require("cloudinary");
const request = require("request");

cloudinary.config({
  cloud_name: "dy6relv7v",
  api_key: "739963512761195",
  api_secret: "hUWgIrh8cHYZopNa7YM_ujqdbPI",
});

module.exports = {
  addPost(req, res) {
    const schema = Joi.object().keys({
      post: Joi.string().required(),
    });
    const body = {
      post: req.body.post,
    };
    const { error, value } = schema.validate(body);
    if (error && error.details) {
      return res.status(httpStatus.BAD_REQUEST).json({ msg: error.details });
    }
    const body1 = {
      user: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created: new Date(),
    };

    if (req.body.post && !req.body.image) {
      Post.create(body1)
        .then(async (post) => {
          await User.update(
            {
              _id: req.user._id,
            },
            {
              $push: {
                posts: {
                  postId: post._id,
                  post: req.body.post,
                  created: new Date(),
                },
              },
            }
          );
          res.status(httpStatus.OK).json({ message: "Post created" });
        })
        .catch((err) => {
          res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Error occured" });
        });
    }

    if (req.body.post && req.body.image) {
      cloudinary.uploader.upload(req.body.image, async (result) => {
        const reqBody = {
          user: req.user._id,
          username: req.user.username,
          post: req.body.post,
          imgId: result.public_id,
          imgVersion: result.version,
          created: new Date(),
        };
        Post.create(reqBody)
          .then(async (post) => {
            await User.update(
              {
                _id: req.user._id,
              },
              {
                $push: {
                  posts: {
                    postId: post._id,
                    post: req.body.post,
                    created: new Date(),
                  },
                },
              }
            );
            res.status(httpStatus.OK).json({ message: "Post created" });
          })
          .catch((err) => {
            res
              .status(httpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: "Error occured" });
          });
      });
    }
  },

  async GetAllPosts(req, res) {
    try {
      const posts = await Post.find({}).populate("user").sort({ created: -1 });
      const top = await Post.find({ totalLikes: { $gte: 2 } })
        .populate("user")
        .sort({ created: -1 });

      const user = await User.findOne({ _id: req.user._id });
      if (!user.city && !user.country) {
        request(
          "http://geolocation-db.com/json/",
          { json: true },
          async (err, res, body) => {
            await User.update(
              {
                _id: req.user._id,
              },
              {
                city: body.city,
                state: body.state,
                country: body.country_name,
              }
            );
          }
        );
      }

      return res
        .status(httpStatus.OK)
        .json({ message: "All posts", posts, top });
    } catch (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Error occured", posts });
    }
  },

  async addLike(req, res) {
    const postId = req.body._id;
    await Post.update(
      {
        _id: postId,
        "likes.username": { $ne: req.user.username },
      },
      {
        $push: {
          likes: {
            username: req.user.username,
          },
        },
        $inc: { totalLikes: 1 },
      }
    )
      .then(() => {
        res.status(httpStatus.OK).json({ message: "You liked the post" });
      })
      .catch((err) => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },

  async addComment(req, res) {
    const postId = req.body.postId;
    await Post.update(
      {
        _id: postId,
      },
      {
        $push: {
          comments: {
            userId: req.user._id,
            username: req.user.username,
            comment: req.body.comment.comment,
            createdAt: new Date(),
          },
        },
      }
    )
      .then(() => {
        res
          .status(httpStatus.OK)
          .json({ message: "Comment added to the post" });
      })
      .catch((err) =>
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "error occured" })
      );
  },

  async GetPost(req, res) {
    await Post.findOne({ _id: req.params.id })
      .populate("user")
      .populate("comments.userId")
      .then((post) => {
        res.status(httpStatus.OK).json({ message: "Post found", post });
      })
      .catch((err) =>
        res
          .status(httpStatus.NOT_FOUND)
          .json({ message: "Post not found", post })
      );
  },
};
