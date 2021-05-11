const Account = require("../../models/account");
const VerificationCode = require("../../models/verificationCode");


module.exports = async (req, res) => {
  try {
    await VerificationCode.deleteMany({ expiryDate: { $lt: new Date() } });

    const userAccount = await Account.getUserInfo(req.user._id);
    if (!userAccount) {
      return res.status(404).json({ message: "User info was not found!" });
    }

    res.status(200).json(userAccount);
  } catch (error) {
    console.error("error in getting user information: ", error);
    res.status(400).json(error.message);
  }
};
