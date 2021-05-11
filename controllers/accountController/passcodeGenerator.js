const verificationCode = require("../../models/verificationCode");
const sendMessage = require("../../Helpers/sendMessage");
const userTokenType = require("./userTokenType");

module.exports = async (User, sentTo, purpose, mediumInSending) => {
  return new Promise(async (resolve, reject) => {
    try {
      let code = "";
      for (let i = 0; i < 7; ++i) {
        code += Math.floor(Math.random() * 9);
      }
      code = code.toString();
      await verificationCode.deleteMany({ expiryDate: { $lt: new Date() } });
      const sentCodes = await verificationCode.find({
        accountId: User._id,
        purpose: purpose,
      });
      console.log(sentCodes);
      if (sentCodes.length >= 3) {
        resolve({ type: "limit_reached" });
      } else {
        const date = new Date();
        const expiryDate = date.setMinutes(date.getMinutes() + 15);
        const newCode = new verificationCode({
          code: code,
          accountId: User._id,
          expiryDate: expiryDate,
          sentTo: sentTo,
          purpose: purpose,
          mediumInSending: mediumInSending,
        });
        console.log(newCode);

        await newCode.save();
        console.error(newCode);
        const message = purpose == userTokenType.passwordReset? `Your password reset code: ${code}, sent by ExploreHub. `:
          `Your account verification code: ${code}, sent by ExploreHub. `

        const sent = await sendMessage("Account_verification", sentTo, message);

        if (!sent) {
          resolve({ type: "sending_failed" });
        }
        resolve({ type: "success", code: code });
      }
    } catch (error) {
      console.error("error in generate verification code: ", error);
      reject(error);
    }
  });
};
