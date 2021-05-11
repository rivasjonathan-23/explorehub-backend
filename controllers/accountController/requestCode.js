const passcodeGenerator = require("./passcodeGenerator");
const accountFinder = require("./accountFinderFunctions");

//{"credentialUsed":"contactNumber", "credential":"09380739572"}
//host/api/account/sendCodeForPasswordReset

//when the user pressed sendcode , for password reset
module.exports = async (req, res, next) => {
  try {
    var userAccount = await accountFinder.searchAccount(req.body);
    if (!userAccount) {
      return res
        .status(404)
        .json({ message: "cannot find account with this phone number" });
    }

    const result = await passcodeGenerator(
      userAccount,
      req.body.sentTo,
      req.body.purpose,
      req.body.mediumInSending
    );

    if (result.type == "limit_reached") {
      return res.status(400).json({
        type: "limit_reached",
        message:
          "You have already reached the maximum number of code request! Try again later when your send codes expired.",
      });
    } else if (result.type == "sending_failed") {
      return res.status(500).json({
        message: "Unexpected error occured in sending verification code",
      });
    } else {
      req.userData = {
        _id: userAccount._id,
        contactNumber: userAccount.contactNumber,
        code: result.code,
        fullName: userAccount.fullName,
      };
      next();
    }
  } catch (err) {
    console.error("error in requesting verifiction code: ", err);
    res.status(500).json({ message: "Unexpecter error occured!", error: err.message });
  }
};
