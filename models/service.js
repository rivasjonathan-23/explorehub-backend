const mongoose = require("mongoose");
const schemaValidator = require("../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const Service = new Schema({
  type: { type: String, required: [true, "Service type is required"] },
  styles: { type: Array, required: false },
  data: [{ type: Schema.Types.ObjectId, required: true, ref: "Item" }],
  required: {type: Boolean, required: false , default: false},
  selectMultiple: {type: Boolean, required: false , default: true},
  inputQuantity: {type: Boolean, required: false , default: true},
  default: { type: Boolean, required: false, default: false }
});

Service.statics.validate = async function (Service) {
  return await schemaValidator(this, Service);
};

module.exports.service = Service;
module.exports.serviceModel = mongoose.model(
    "ServiceModel",
    Service
  );;

