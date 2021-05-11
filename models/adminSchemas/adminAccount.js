const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema;

const adminAccount = new Schema({
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    }

)

module.exports = mongoose.model("Admin", adminAccount)