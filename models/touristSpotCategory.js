const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TouristSpotCategory = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tourist spot category is required"],
      unique: true,
      trim: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Category should have a creator"],
    },
    touristSpots: [{type: Schema.Types.ObjectId, ref: "Page", required: false}],
    touristSpotTotalCount: { type: Number, required: false, default: 0 },
  },
  { timestamps: true }
);

TouristSpotCategory.statics.addTouristSpotCategory = async function (
  touristSpotCategory
) {
  const newTouristSpotCategory = new this(touristSpotCategory);
  let result;
  console.log("NEW TOURIST SPOT CATEGORY::::: "+ newTouristSpotCategory)
  let error = newTouristSpotCategory.validateSync();

  if (error) {
    result = Object.values(error.errors).map((err) => err.message);
  }


  return new Promise(async (resolve, reject) => {
    if (!result) {
      const existing = await this.findOne({
        name: newTouristSpotCategory.name,
      });
      if (!existing) {
        return newTouristSpotCategory.save().then((doc, err) => {
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

module.exports = mongoose.model("TouristSpotCategory", TouristSpotCategory);
