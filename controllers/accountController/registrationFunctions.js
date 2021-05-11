const Account = require("../../models/account");
const bcrypt = require("bcryptjs");
const passcodeGenerator = require("./passcodeGenerator");
const userTokenType = require("./userTokenType");

// {
// 	"accountType": "Service Provider",
// 	"email":"rivas@gmail.com",
// 	"contactNumber":"09380739572",
// 	"password":"Jrivas2398"
// }
//host/api/account/initialRegistration

//initial registration
module.exports.initialRegistration = async (req, res) => {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    var check = [];
    check.push(
      (await Account.checkContactNumber(req.body.contactNumber)) !== null
        ? "contactNumber"
        : ""
    );
    check.push(
      (await Account.checkEmail(req.body.email)) !== null ? "email" : ""
    );
    check = check.filter((i) => {
      return i !== "";
    });
    if (check.length > 0) {
      return res
        .status(400)
        .json({ type: "field_uniqueness", errorFields: check });
    }

    const newAccount = new Account(req.body);
    await newAccount.save();

    const token = await Account.generateJwt(
      newAccount,
      userTokenType.accountVerification
    );
    const result = await passcodeGenerator(
      newAccount,
      req.body.contactNumber,
      userTokenType.accountVerification,
      "contactNumber"
    );

    if (result.type == "sending_failed") {
      return res.status(500).json({
        message: "Unexpected error occured in sending verification code",
      });
    } else {
      res
        .status(200)
        .json({ message: "Account successfully created", token: token });
    }
  } catch (error) {
    console.error("error in registration process: ", error);
    return res
      .status(400)
      .json({ message: "error occured!", error: error.message });
  }
};

// {
// 	"firstName": "Jonathan",
// 	"lastName":"Rivas",
// 	"gender":"Male",
// 	"age":21
// }
//host/api/account/addAccountInformation

//adding personal information to the account
function formatName(name) {
  if (name && name != "") {
    if (name.length > 1) {
      return name[0].toUpperCase()+name.substring(1).toLowerCase()
    }
    return name.toUpperCase()
  }
}

module.exports.addAccountInformation = async (req, res) => {
  try {
    const data = req.body;
    const fullname = formatName(data.firstName)+" "+formatName(data.lastName)
    const updatedAccount = await Account.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: fullname,
          birthday: data.birthday,
          age: data.age,
          address: data.address,
          gender: data.gender,
        },
      },
      { upsert: true },
      function (err, doc) {
        if (err) return err;
        return doc;
      }
    );
    if (!updatedAccount) {
      return res.status(404).json({ message: "User account not found!" });
    }
    const token = await Account.generateJwt(
      updatedAccount,
      userTokenType.accountAccess
    );
    res.status(200).json({
      message: "account successfully updated",
      account: updatedAccount,
      token: token,
    });
  } catch (error) {
    console.error("error in adding account information: :", error);
    return res.status(500).json({
      error: error.message,
      message: "error in adding account information",
    });
  }
};

module.exports.deleteAccount = async (req, res) => {
  try {
    const accountDeleted = await Account.deleteOne({ _id: req.user._id });
    res.status(200).json({ message: "account successfully deleted" });
  } catch (error) {
    console.error("error in deleting account: ", error);
    res
      .status(500)
      .json({ error: error, message: "error in deleting the account" });
  }
};

module.exports.checkEmailOrNumberAvailability = async function (req, res) {
  try {
    const value = req.body.value;
    switch (req.body.field) {
      case "email":
        return res.status(200).send((await Account.checkEmail(value)) === null);
      default:
        return res
          .status(200)
          .send((await Account.checkContactNumber(value)) === null);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
};
