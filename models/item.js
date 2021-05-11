const mongoose = require("mongoose");
const schemaValidator = require("../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const Item = new Schema({
  type: { type: String, required: [true, "Item type is required"] },
  styles: { type: Array, required: false },
  serviceId: { type: String, required: [true, "ServiceId is required"] },
  pageId: { type: String, required: [true, "pageId is required"] },
  data: { type: Object, required: [true, "Item data is required"] },
  default: { type: Boolean, required: false, default: false },
  toBeBooked: { type: Number, required: false, default: 0 },
  booked: { type: Number, required: false, default: 0 },
  pending: { type: Number, required: false, default: 0 },
  manuallyBooked: { type: Number, required: false, default: 0 },
});

Item.statics.validate = async function (Item) {
  return await schemaValidator(this, Item);
};

module.exports.Item = mongoose.model(
  "Item",
  Item
);
