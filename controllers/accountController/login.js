const Account = require("../../models/account");
const bcrypt = require("bcryptjs");
const passcodeGenerator = require("./passcodeGenerator");
const userTokenType = require("./userTokenType");
const VerificationCode = require("../../models/verificationCode");
const accountFinder = require("./accountFinderFunctions");
// {
// 	"credentialUsed": "email",
// 	"credential": "tanix@gmail.com",
// 	"password":"Jrivas2398"
// }
//host/api/account/login

module.exports = async (req, res) => {
  try {
    let unfinished_registration = false;
    var userAccount = await accountFinder.searchAccount(req.body);

    if (!userAccount) {
      return res.status(400).json({ type: "account_not_found" });
    }

    let tokenType = userTokenType.accountAccess;
    await VerificationCode.deleteMany({ expiryDate: { $lt: new Date() } });

    if (userAccount.fullName == undefined) {
      unfinished_registration = true;
      tokenType = userTokenType.accountVerification;
      const codesSent = await VerificationCode.find({
        accountId: userAccount._id,
        purpose: userTokenType.accountVerification,
      });
      if (codesSent.length == 0) {
        const result = await passcodeGenerator(
          userAccount,
          userAccount.contactNumber,
          userTokenType.accountVerification,
          "contactNumber"
        );
        if (result.type == "sending_failed") {
          return res.status(500).json({
            message: "Unexpected error occured in sending verification code",
          });
        }
      }
    } else {
      await VerificationCode.deleteMany({ accountId: userAccount._id });
    }
    if (!bcrypt.compareSync(req.body.password, userAccount.password)) {
      return res.status(400).json({ type: "incorrect_password" });
    }

    const token = await Account.generateJwt(userAccount, tokenType);
    res.status(200).json({
      message: "User sucessfully logged in",
      unfinished_registration: unfinished_registration,
      token: token,
    });
  } catch (error) {
    console.error("error in logging in: ", error);
    res.status(500).json({ type: "internal_error", error: error.message });
  }
};
