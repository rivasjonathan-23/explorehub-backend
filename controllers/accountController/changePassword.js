const Account = require("../../models/account");
const bcrypt = require("bcryptjs");
const userTokenType = require("./userTokenType");

module.exports = async (req, res) => {
  try {
    const fUser = await Account.findById(req.user._id);
    if (!fUser) {
      return res.status(404).json({ message: "User not found!" });
    }
    const match = bcrypt.compareSync(req.body.password, fUser.password);
    if (req.body.reUseOldPassword != "reuse_password") {
      if (match) {
        return res.status(400).json({ type: "old_password" });
      }
    } else {
      if (!match) {
        return res.status(400).json({ type: "did_not_match" });
      }
    }
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    const updated = await Account.changePassword(fUser._id, req.body.password);
    if (!updated) {
      return res
        .status(400)
        .json({
          type: "passsword_update_failed",
          message: "Password update failed!",
        });
    }
    let unfinishedRegistration = false;
    let tokenType = userTokenType.accountAccess;
    if (fUser.fullName == undefined) {
      unfinishedRegistration = true;
      tokenType = userTokenType.addAccountInfo;
    }
    const token = await Account.generateJwt(updated, tokenType);

    res.status(200).json({ token: token });
  } catch (error) {
    console.error("error in changing the passwword: ", error);
    res.status(500).json(error.message);
  }
};
