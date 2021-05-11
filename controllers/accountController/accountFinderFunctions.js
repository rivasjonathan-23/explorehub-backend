const Account = require("../../models/account");

module.exports.findAccount = async function (req, res) {
  try {
    var userAccount = await searchAccount(req.body);
    if (!userAccount) {
      return res.status(404).json({ message: "Account was not found!" });
    }
    res.status(200).json({ frgtnAccountId: userAccount._id });
  } catch (error) {
    console.error("error searching the account: ", error);
    res.status(400).json(error.message);
  }
};

// {
// 	"_id":"5fddc4569a3957262037d59d"
// }

//host/api/account/findAccountById
module.exports.findAccountById = async function (req, res) {
  try {
    const userAccount = await Account.getUserInfo(req.body._id);
    if (!userAccount) {
      return res
        .status(404)
        .json({ type: "user_not_found", message: "User was not found!" });
    }
    res.status(200).json({
      _id: userAccount._id,
      contactNumber: userAccount.contactNumber,
      codeSent: req.codeSent,
      email: userAccount.email,
      from_wherer: "find account",
      fullName: userAccount.fullName,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

async function searchAccount(data) {
  if (data.credentialUsed === "contactNumber") {
    return await Account.checkContactNumber(data.credential);
  }
  return await Account.checkEmail(data.credential);
}

module.exports.searchAccount = searchAccount;
