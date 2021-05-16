const { saveImageToCloud } = require("../../Helpers/saveImageToCloud");
const Account = require("../../models/account");
const deleteImage = require("../../uploads/deleteImage");
const userTokenType = require("./userTokenType");

const deletePhoto = (image) => {
  // let img = image.split("/");
  // deleteImage(img[img.length - 1]);
  deleteImage(image);
}

module.exports = async (req, res) => {
  try { 



    deletePhoto(req.body.profile);
    const savedImage =  await saveImageToCloud(req.file);
    const userAddProfile = await Account.addProfile(req.user._id, savedImage );
    if (!userAddProfile) {
      return res.status(404).json({ message: "Failed to delete profile!" });
    }
    const token = await Account.generateJwt(userAddProfile, userTokenType.accountAccess);
    res.status(200).json({token: token, user: userAddProfile});
  } catch (error) {
    console.error("error in getting user information: ", error);    
    res.status(400).json(error.message);
  }
};