const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    var filetype = "";
    if (file.mimetype === "image/png") {
      filetype = "png";
    }
    else if (file.mimetype === "image/jpeg") {
      filetype = "jpg";
    } else {
      cb("Invalid file type!", null);
    }
    cb(null, "ExploreHub-" + Date.now() + "." + filetype);
  },
});

module.exports.uploadMulitpleImage = multer({ storage: storage }).array(
  "images",
  10
);
module.exports.uploadSingleImage = multer({ storage: storage }).single("image");
