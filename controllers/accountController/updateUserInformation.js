const Account = require("../../models/account");
const VerificationCode = require("../../models/verificationCode");
const userTokenType = require("./userTokenType");

module.exports = async (req, res) => {
  try {
    await VerificationCode.deleteMany({ expiryDate: { $lt: new Date() } });

    const userAccountUpdate = await Account.updateUserInfo(req.user._id, req.body);
    if (!userAccountUpdate) {
      return res.status(404).json({ message: "Failed to update user account!" });
    }
    const token = await Account.generateJwt(userAccountUpdate, userTokenType.accountAccess);
    res.status(200).json({token: token, user: userAccountUpdate});
  } catch (error) {
    console.error("error in getting user information: ", error);
    res.status(400).json(error.message);
  }
};