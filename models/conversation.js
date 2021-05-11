const mongoose = require("mongoose");
const { message } = require("./commonSchemas/message");

const Schema = mongoose.Schema;

const Conversation = new Schema(
  {
    page: { type: Schema.Types.ObjectId, required: true, ref: "Page" },
    booking: { type: Schema.Types.ObjectId, required: false, ref: "Booking" },
    messages: [message],
    receiver: { type: Schema.Types.ObjectId, required: false, ref: "Account" },
    participants: [{ type: Schema.Types.ObjectId, required: false, ref: "Account" }],
    type: {type: String, required: false},
    viewedBy: [{type: String, required: false}],
    opened: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", Conversation);