const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const inputValue = new Schema(
  {
    inputFieldType: { type: String, required: true },
    inputId: { type: String, required: true },
    inputLabel: {type: String, require:true},
    settings: { type: Object, required: false },
    value: { type: Object, required: false }
  },
);

module.exports.inputValue = inputValue;
module.exports.inputValueModel = mongoose.model("inputValueModel", inputValue);