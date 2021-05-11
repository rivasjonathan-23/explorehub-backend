var fs = require("fs");

module.exports = (file) => {
  try {

    fs.unlinkSync(__dirname + "\\" + file);
    console.log("successfully deleted: ", file)
  } catch (error) {
  }
};