var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var verificationCodeSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, required: true },
  code: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  sentTo: { type: String, required: true },
  mediumInSending: { type: String, required: true },
  purpose: { type: String, required: true },
});

module.exports = mongoose.model("VerificationCode", verificationCodeSchema);
