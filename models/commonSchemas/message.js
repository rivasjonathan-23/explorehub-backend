const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const message = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    senderFullName: { type: String, required: true },
    message: { type: String, required: true },
    withMedia:{type: Boolean, required:false, default:false}
  },
  { timestamps: true }
);

module.exports.message = message;
module.exports.messageModel = mongoose.model("messageModel", message);
