const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const selectedService = new Schema(
  {
    service: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    serviceGroupName: { type: String, required: true },
    serviceGroupId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: false, default: 1 },
    otherData: { type: Object, required: false }
  },
);

module.exports.selectedService = selectedService;
module.exports.selectedServiceModel = mongoose.model("selectedServiceModel", selectedService);
