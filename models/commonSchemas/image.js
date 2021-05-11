const mongoose = require("mongoose");
const schemaValidator = require("../../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const Image = new Schema({
  url: { type: String, required: [true, "Image url is required"] },
 });

Image.statics.validate = async function (image) {
  return await schemaValidator(this, image);
};

module.exports.Image = Image;
module.exports.ImageModel = mongoose.model(
  "ImageModel",
  Image
);
