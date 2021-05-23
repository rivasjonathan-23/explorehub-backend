const mongoose = require("mongoose");
const { Component } = require("./commonSchemas/component");
const { service, serviceModel } = require("./service");

const Schema = mongoose.Schema; 

const Page = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    hostTouristSpot: { type: Schema.Types.ObjectId, ref: "Page" },
    pageType: { type: String, enum: ['tourist_spot', 'service', 'service_group'], required: true },
    components: [Component],
    services: [service],
    otherServices: [{ type: Schema.Types.ObjectId, ref: "Page" }],
    bookingInfo: [Component],
    hidePage:{type: Boolean, required: false, default: false},
    beBackOn: {type: String, required: false},
    initialStatus: { type: String, enum: ['Approved', 'Declined', 'Pending'], required: false, default: 'Pending' },
    status: { type: String, enum: ['Unfinished', 'Pending', 'Processing', 'Online', 'Rejected', 'Not Operating'], required: false, default: 'Unfinished' }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Page", Page);
