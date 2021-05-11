const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ServiceCategory = new Schema(
  {
    name: {
      type: String,
      required: [true, "Service spot category name is required"],
      unique: true,
      trim: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Category should have a creator"],
    },
    serviceTotalCount: { type: Number, required: false, default: 0 },
  },
  { timestamps: true }
);

ServiceCategory.statics.addServiceCategory = async function (
  ServiceCategory
) {
  const newServiceCategory = new this(ServiceCategory);
  let result;
  let error = newServiceCategory.validateSync();

  if (error) {
    result = Object.values(error.errors).map((err) => err.message);
  }


  return new Promise(async (resolve, reject) => {
    if (!result) {
      const existing = await this.findOne({
        name: newServiceCategory.name,
      });
      if (!existing) {
        return newServiceCategory.save().then((doc, err) => {
          if (err) {
            reject({ type: "internal_error" });
          } else {
            resolve({ type: "successful", data: doc });
          }
        });
      } else {
        result = ["Category already exists"];
      }
    }
    reject({ type: "validation_error", errors: result });
  });
};

module.exports = mongoose.model("ServiceCategory", ServiceCategory);
