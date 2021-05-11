const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");

const Schema = mongoose.Schema;

const Notification = new Schema(
  {
    message: { type: String, required: [true, "Message is required"] },
    opened: { type: Boolean, required: false, default: false },
    receiver: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    subject: { type: String, required: false },
    isMessage: { type: Boolean, required: false, default: false },
    conversation: { type: Schema.Types.ObjectId, required: false, ref: "Conversation" },
    notificationGroup: { type: Schema.Types.ObjectId, required: true, ref: "NotificationGroup" },
    sender: { type: String, required: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", Notification);