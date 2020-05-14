const httpStatus = require("http-status-codes");
const Message = require("../models/messageModels");
const Conversation = require("../models/conversationModels");
const User = require("../models/userModels");
const helper = require("../helpers/helpers");

module.exports = {
  async getAllMessages(req, res) {
    const { sender_Id, receiver_Id } = req.params;
    const conversation = await Conversation.findOne({
      $or: [
        {
          $and: [
            { "participants.senderId": sender_Id },
            { "participants.receiverId": receiver_Id },
          ],
        },
        {
          $and: [
            { "participants.senderId": receiver_Id },
            { "participants.receiverId": sender_Id },
          ],
        },
      ],
    }).select("_id");

    if (conversation) {
      const messages = await Message.findOne({
        conversationId: conversation._id,
      });
      res.status(httpStatus.OK).json({ message: "Messages return", messages });
    }
  },

  sendMessage(req, res) {
    const { sender_Id, receiver_Id } = req.params;

    Conversation.find(
      {
        $or: [
          {
            participants: {
              $elemMatch: { senderId: sender_Id, receiverId: receiver_Id },
            },
          },
          {
            participants: {
              $elemMatch: { senderId: receiver_Id, receiverId: sender_Id },
            },
          },
        ],
      },
      async (err, result) => {
        if (result.length > 0) {
          const msg = await Message.findOne({ conversationId: result[0]._id });
          helper.updateChatList(req, msg);
          await Message.update(
            {
              conversationId: result[0]._id,
            },
            {
              $push: {
                message: {
                  senderId: req.user._id,
                  receiverId: req.params.receiver_Id,
                  senderName: req.user.username,
                  receiverName: req.body.receiverName,
                  body: req.body.message,
                },
              },
            }
          )
            .then(() =>
              res.status(httpStatus.OK).json({ message: "Message added" })
            )
            .catch((err) =>
              res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: "Error occured" })
            );
        } else {
          const newConversation = new Conversation();
          newConversation.participants.push({
            senderId: req.user._id,
            receiverId: req.params.receiver_Id,
          });

          const saveConversation = await newConversation.save();
          const newMessage = new Message();
          newMessage.conversationId = saveConversation._id;
          newMessage.sender = req.user.username;
          newMessage.receiver = req.body.receiverName;
          newMessage.message.push({
            senderId: req.user._id,
            receiverId: req.params.receiver_Id,
            senderName: req.user.username,
            receiverName: req.body.receiverName,
            body: req.body.message,
          });

          await User.update(
            {
              _id: req.user._id,
            },
            {
              $push: {
                chatList: {
                  $each: [
                    {
                      receiverId: req.params.receiver_Id,
                      msgId: newMessage._id,
                    },
                  ],
                  $position: 0,
                },
              },
            }
          );

          await User.update(
            {
              _id: req.params.receiver_Id,
            },
            {
              $push: {
                chatList: {
                  $each: [
                    {
                      receiverId: req.user._id,
                      msgId: newMessage._id,
                    },
                  ],
                  $position: 0,
                },
              },
            }
          );

          await newMessage
            .save()
            .then(() =>
              res.status(httpStatus.OK).json({ message: "Message sent" })
            )
            .catch((err) =>
              res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: "Error occured" })
            );
        }
      }
    );
  },

  async markMessages(req, res) {
    const { sender, receiver } = req.params;
    const msg = await Message.aggregate([
      { $unwind: "$message" },
      {
        $match: {
          $and: [
            { "message.senderName": receiver, "message.receiverName": sender },
          ],
        },
      },
    ]);
    if (msg.length > 0) {
      try {
        msg.forEach(async (value) => {
          await Message.update(
            {
              "message._id": value.message._id,
            },
            {
              $set: { "message.$.isRead": true },
            }
          );
        });
        res.status(httpStatus.OK).json({ message: "Messages marked as read" });
      } catch (err) {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      }
    }
  },

  async markAllMessages(req, res) {
    const msg = await Message.aggregate([
      { $match: { "message.receiverName": req.user.username } },
      { $unwind: "$message" },
      { $match: { "message.receiverName": req.user.username } },
    ]);

    if (msg.length > 0) {
      try {
        msg.forEach(async (value) => {
          await Message.update(
            {
              "message._id": value.message._id,
            },
            {
              $set: { "message.$.isRead": true },
            }
          );
        });
        res
          .status(httpStatus.OK)
          .json({ message: "All Messages marked as read" });
      } catch (err) {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      }
    }
  },
};
