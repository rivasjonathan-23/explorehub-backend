const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const adminAccount = require("./adminSchemas/adminAccount");

const MY_SECRET = process.env.MY_SECRET;

const Schema = mongoose.Schema;

const Accountchema = new Schema(
  {
    accountType: {
      type: String,
      required: true,
      enum: ["Service Provider", "Tourist", "Admin"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    contactNumber: { type: Number, required: true, unique: true },
    password: { type: String, required: true, trim: true },
    firstName: {
      type: String, required: false, trim: true, set: name => {
        if (name.length > 1) {
          return name[0].toUpperCase() + name.substring(1)
        }
        return name.toUpperCase()
      }
    },
    lastName: {
      type: String, required: false, trim: true, set: name => {
        if (name.length > 1) {
          return name[0].toUpperCase() + name.substring(1)
        }
        return name.toUpperCase()
      }
    },
    address: { type: String, required: false, trim: true },
    address2: { type: String, required: false, trim: true },
    city: { type: String, required: false, trim: true },
    stateOrProvince: { type: String, required: false, trim: true },
    country: { type: String, required: false, trim: true },
    fullName: { type: String, required: false, trim: true },
    gender: { type: String, required: false },
    profile: { type: String, required: false },
    birthday: { type: String, required: false},
  },
  { timestamps: true }
);

Accountchema.statics.login = async function (credential) {
  return await this.findOne({ credential: credential });
};

Accountchema.statics.findById = async function (id) {
  return await this.findOne({ _id: id });
};

Accountchema.statics.checkContactNumber = async function (value) {
  return await this.findOne({ contactNumber: value });
};

Accountchema.statics.checkEmail = async function (value) {
  return await this.findOne({ email: value.toUpperCase() });
};

Accountchema.statics.getUserInfo = async function (id) {
  return this.findOne(
    { _id: id },
    "accountType fullName firstName lastName middleName email contactNumber age gender address address2 city stateOrProvince country birthday password profile",
    function (err, accountInfo) {
      if (err) {
        return err;
      }
      return accountInfo;
    }
  );
};

Accountchema.statics.updateUserInfo = async function (id, data) {
  const firstName = data.firstName[0].toUpperCase() + data.firstName.substring(1)
  const lastName = data.lastName[0].toUpperCase() + data.lastName.substring(1)
  data['fullName'] = firstName + " " + lastName
  return await this.findByIdAndUpdate(
    id, 
    data,
    { upsert: true },
    function (err, doc) {
      if(err) return err;
      return doc;
    }
  )
}

Accountchema.statics.addProfile = function (id, profile) {
  return this.findByIdAndUpdate(
    id,
    { $set: { profile: profile } },
    { upsert: true },
    function (err, doc) {
      if (err) return err;
      return doc;
    }
  );
}

Accountchema.statics.changePassword = async function (id, password) {
  return await this.findByIdAndUpdate(
    id,
    { $set: { password: password } },
    { upsert: true },
    function (err, doc) {
      if (err) return err;
      return doc;
    }
  );
};

Accountchema.statics.generateJwt = async function (user, type) {
  const expiry = new Date();
  try {

    const admin = await adminAccount.find({})
    const adminId = admin.length ? admin[0]._id: null
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        admin: adminId,
        fullName: user.fullName,
        accountType: user.accountType,
        gender: user.gender,
        profile: user.profile,
        type: type,
      },
      MY_SECRET
    );
  } catch (error) {
    console.log(error)
  }
};

module.exports = mongoose.model("Account", Accountchema);
