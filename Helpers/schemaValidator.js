const deleteImage = require("../uploads/deleteImage");

module.exports = (objSchema, value) => {
  return new Promise((resolve, reject) => {
    //check if tourist spot is existing....
    
    const newObject = new objSchema(value);
    const validationError = newObject.validateSync();

    let validationResult;
    if (validationError) {
      validationResult = Object.values(validationError.errors).map(
        (err) => err.message
      );
    }
    if (newObject.images && newObject.images.length == 0) {
      const errorMessage = "Please provide at least one photo";
      if (validationResult) {
        validationResult.push(errorMessage);
      } else {
        validationResult = [errorMessage];
      }
    }
    if (validationResult) {
      if (newObject.images && newObject.images.length != 0) {
        newObject.images.forEach((image) => {
          deleteImage(image);
        });
      }
      reject({ type: "validation_error", error: validationResult });
    } else {
      resolve(newObject);
    }
  });
};
