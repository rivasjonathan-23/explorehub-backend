const mongoose = require("mongoose");
const schemaValidator = require("../../Helpers/schemaValidator");

const Schema = mongoose.Schema;

const Component = new Schema({
  type: { type: String, required: [true, "Component type is required"] },
  styles: { type: Array, required: false, default: []},
  data: { type: Object, required: [true, "Component data is required"] },
  default: { type: Boolean, required: false, default: false }
});

Component.statics.validate = async function (Component) {
  return await schemaValidator(this, Component);
};

module.exports.Component = Component;
module.exports.ComponentModel = mongoose.model(
  "ComponentModel",
  Component
);
