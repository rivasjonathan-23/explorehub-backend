const serviceCategory = require("../../models/serviceCategory");

async function addServiceCategory(req, res) {
  try {
    req.body["addedBy"] = req.user._id;
    const newCategory = await serviceCategory.addServiceCategory(
      req.body
    );
    if (!req.continue) {
      res.status(200).json(newCategory.data);
    } else {
      return newCategory.data;
    }
  } catch (error) {
    if (error.type == "validation_error") {
      return res.status(400).json({
        type: "validation_error",
        error: error.errors,
      });

    } else {
      return res.status(400).json({
        type: "internal_error",
        message: "an error occured!",
        error: error,
      });
    }
  }
};

module.exports.addServiceCategory = addServiceCategory;

module.exports.addDefaultCategories = async (req, res) => {
  return serviceCategory.find({}).then(async (categories, error) => {
    if (error) {
      res.statu(500).json(error);
    }
    if (categories.length == 0) {
      const defaults = [
        { name: "Restaurant" },
        { name: "Transportation" },
        { name: "Lodging" },
        { name: "Touring" }
      ]

      defaults.forEach(async (category) => {
        req['body'] = category;
        req['continue'] = true;
        await addServiceCategory(req, res)
      })
      return defaults;
    }
    return categories;
  })

}

module.exports.retrieveAllToristSpotCategories = async (req, res) => {
  serviceCategory
    .find({}, "name touristSpotTotalCount addedBy")
    .populate("addedBy", "fullName firstName lastName")
    .exec((error, categories) => {
      if (error) {
        res.status(400).json({
          message: "Error in retrieving categories",
          error: error,
        });
      }
      res.status(200).json(categories);
    });
};
