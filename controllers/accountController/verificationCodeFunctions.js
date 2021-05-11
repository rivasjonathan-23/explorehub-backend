const Account = require("../../models/account");

const VerificationCode = require("../../models/verificationCode");

module.exports.handleCode = async (req, res) => {
  const pcode = await getCodeSent(req.userData._id, req.body.purpose);
  return res.status(200).json({
    message: "Code sucessfully sent",
    fullName: req.userData.fullName,
    codeSent: pcode,
  });
};

module.exports.getCodeExp = async (req, res, next) => {
  try {
    req["codeSent"] = await getCodeSent(req.body._id, req.body.purpose);
    next();
  } catch (err) {
    console.error("ERROR IN GETTING THE CODE: ", err);
  }
};

async function getCodeSent(id, purpose) {
  return new Promise(async (resolve) => {
    await VerificationCode.deleteMany({ expiryDate: { $lt: new Date() } });
    const pcode = await VerificationCode.find({
      accountId: id,
      purpose: purpose,
    });
    let codes = [];
    if (pcode.length > 0) {
      pcode.forEach((code) => {
        const currentTime = new Date();
        const remainingTime = Math.abs(code.expiryDate - currentTime);
        codes.push({
          id: code._id,
          sentTo: code.sentTo,
          timeLeft: (remainingTime / 1000).toFixed(),
        });
      });
    }
    resolve(codes);
  });
}

module.exports.checkCode = async (req, res) => {
  try {
    const userAccount = await Account.findById(req.body._id);
    if (!userAccount) {
      return res.status(404).json({ message: "User account not found!" });
    }
    await VerificationCode.deleteMany({ expiryDate: { $lt: new Date() } });
    const matchedCode = await VerificationCode.findOne({
      code: req.body.code,
      accountId: req.body._id,
      purpose: req.body.purpose,
    });
    if (matchedCode) {
      const currentTime = new Date();
      if (matchedCode.expiryDate > currentTime) {
        await VerificationCode.deleteMany({ accountId: req.body._id });
        const token = await Account.generateJwt(
          userAccount,
          req.body.token_type
        );
        return res.status(200).json({
          message: "Code is correct",
          fullName: userAccount.fullName,
          token: token,
        });
      } else {
        return res.status(400).json({ message: "Code already expired!" });
      }
    } else {
      return res.status(400).json({ message: "Code is incorrect!" });
    }
  } catch (err) {
    console.error("error in verification codes functions: ", err);
    res.status(500).json(err.message);
  }
};
