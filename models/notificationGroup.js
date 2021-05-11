const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");
const notification = require("./notification");

const Schema = mongoose.Schema;

const NotificationGroup = new Schema(
    {
        receiver: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
        mainReceiver: { type: Schema.Types.ObjectId, required: false, ref: "Account" },
        page: { type: Schema.Types.ObjectId, required: true, ref: "Page" },
        booking: { type: Schema.Types.ObjectId, required: false, ref: "Booking" },
        type: { type: String, enum: [ "page", "booking", "page-tourist", "page-provider", "page-admin", "booking-tourist", "booking-provider", "booking-admin"], required: true },
        notifications: [{ type: Schema.Types.ObjectId, required: true, ref: "Notification" }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("NotificationGroup", NotificationGroup);