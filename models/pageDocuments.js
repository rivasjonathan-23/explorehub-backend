const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PageDocuments = new Schema({
  businessPermit: { type: String, required: false},
  ownerValidId: { type: String, required: false},
  pageId: {type: Schema.Types.ObjectId, ref: "Page" }
 },
 { timestamps: true });              

module.exports.PageDocuments = PageDocuments;
module.exports.PageDocumentsModel = mongoose.model(
  "PageDocuments",
  PageDocuments
);