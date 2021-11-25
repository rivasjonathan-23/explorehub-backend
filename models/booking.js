const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");
const { inputValue } = require("./commonSchemas/inputValue");
const { selectedService } = require("./commonSchemas/selectedService");

const Schema = mongoose.Schema;

const booking = new Schema(
    {
        tourist: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
        pageId: { type: Schema.Types.ObjectId, required: true, ref: "Page" },
        bookingInfo: [inputValue],
        selectedServices: [selectedService],
        bookingType: { type: String, required: true },
        isManual: { type: Boolean, require: false, default: false },
        timeLeft: { type: Date, required: false },
        rejectionReason: {type: String, required: false},
        messaged: { type: Boolean, required: false, defualt: false },
        status: { type: String, enum: ['Pending', 'Cancelled', 'Booked', "Closed", 'Rejected', 'Unfinished'], required: false, default: 'Unfinished' }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", booking);
