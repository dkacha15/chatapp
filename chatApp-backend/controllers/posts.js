const Joi = require("@hapi/joi");
const Post = require("../models/postModels");
const httpStatus = require("http-status-codes");
const User = require("../models/userModels");

module.exports = {
  addPost(req, res) {
    const schema = Joi.object().keys({
      post: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res.status(httpStatus.BAD_REQUEST).json({ msg: error.details });
    }
    const body = {
      user: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created: new Date(),
    };

    Post.create(body)
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
  },

  async GetAllPosts(req, res) {
    try {
      const posts = await Post.find({}).populate("user").sort({ created: -1 });
      const top = await Post.find({ totalLikes: { $gte: 2 } })
        .populate("user")
        .sort({ created: -1 });
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
