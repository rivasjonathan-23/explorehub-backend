const Account = require('../../models/adminSchemas/adminAccount');
const booking = require("../../models/booking");
const Page = require("../../models/page")
const { formatArray, formatComponentArray, formatPendingArray } = require('./func')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs");
const notification = require("../../models/notification");
const { Item } = require("../../models/item");
const mongoose = require("mongoose");
const helper = require("../serviceProviderController/helper");
const touristSpotCategory = require('../../models/touristSpotCategory');
const { addTouristSpotCategory } = require('../serviceProviderController/touristSpotCategories');
const serviceCategory = require('../../models/serviceCategory');
const { addServiceCategory } = require('../serviceProviderController/serviceCategories');
const page = require('../../models/page');
const MY_SECRET = process.env.MY_SECRET;

function createToken(user) {
    return jwt.sign({ _id: user.id, username: user.username }, MY_SECRET, {
        expiresIn: "12h" // 86400 expires in 24 hours
    })
}
// module.exports.adminAccount = async(req, res) => {
// var userAndPass = {
//     username: "admin",
//     password: "3Xplorehub"
// }
// const salt = await bcrypt.genSalt(10);
// userAndPass.password = await bcrypt.hash(userAndPass.password, salt)
// const user = new Account(userAndPass)
// user.save()
// res.send({
//     status: true,
//     sms: "Saved!!",
//     data: user
// });
// }

module.exports.login = (req, res) => {
    Account.findOne({ username: req.body.username }, (err, user) => {
        if (user) {
            const validPassword = bcrypt.compareSync(req.body.password, user.password)
            if (validPassword == false) {
                res.send({ status: false, sms: 'Invalid Credentials' })
            } else {
                return res.send({ status: true, sms: 'Success', token: createToken(user) })
            }
        } else {
            return res.send({ status: false, sms: 'Account doesn\'t exist' });
        }
    })
}

module.exports.pusher = (req, res) => {
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    const auth = pusher.authenticate(socketId, channel);
    res.send(auth);
}

module.exports.getAllBookings = (req, res) => {
    booking.find({ status: req.params.bookingStatus })
        .populate({ path: "tourist", model: "Account", select: "fullName address contactNumber email profile" })
        .populate({ path: "selectedServices.service", model: "Item" })
        .populate({ path: "pageId", populate: { path: "creator", model: "Account" } })
        .sort({ 'createdAt': 1 })
        .exec((error, bookings) => {
            if (error) {
                console.log(error)
                return res.status(500).json(error.message);
            } else {
                try {


                    // // start get booking Info
                    // let result = []; // initialize result
                    // if (bookings.length) {
                    //     // format object algorithm
                    //     bookings.forEach(bookingDetail => {
                    //         let formattedObject = { ...bookingDetail._doc }; //deep copy
                    //         let { bookingInfo } = formattedObject; //object destructuring
                    //         if (bookingInfo && bookingInfo.length) { //bookingInfo != null , bookingInfo!=  && bookingInfo [*,*,*]
                    //             //loop through booking info array
                    //             let simplifiedDetail = bookingInfo.map((info) => {
                    //                 //loop every object
                    //                 let { inputLabel, value } = info._doc;
                    //                 if (value && typeof value == 'object') {
                    //                     let objectKeys = Object.keys(value) //Object.keys return all the keys of the object as a string array , not sure sa nested
                    //                     if (objectKeys.includes('month')) {
                    //                         let { month, day, year } = value;
                    //                         let date = `${month.text} ${day.text},${year.text}`
                    //                         value = date;
                    //                     }
                    //                 }
                    //                 return { label: inputLabel, value }
                    //             });
                    //             formattedObject.bookingInfo = simplifiedDetail;
                    //         }
                    //         let components = formatComponentArray(formattedObject.pageId._doc.components);

                    //         if (components != undefined) formattedObject.pageId._doc.components = components; //get page Default vale
                    //         formattedObject.selectedServiceData = formattedObject.selectedServices
                    //         formattedObject.selectedServices = formatArray(formattedObject.selectedServices)

                    //         result.push(formattedObject)
                    //     });
                    // }

                    bookings = bookings.map(booking => {
                        if (booking._doc.status == "Processing" || booking._doc.messaged) {
                            const currentTime = new Date();
                            const remainingTime = booking._doc.timeLeft - currentTime;

                            if (remainingTime > 0) {
                                const timeLeft = (remainingTime / 1000).toFixed()
                                booking._doc.timeLeft = timeLeft;
                            } else {
                                booking._doc.timeLeft = null
                            }

                        }
                        return booking
                    })
                    res.status(200).json(bookings);
                    // res.status(200).json(result);
                } catch (error) {
                    console.log(error)
                    res.status(500).json(error.message)
                }
            }
        })
}

module.exports.getAllPendingNotifications = (req, res) => {
    let cond = { $or: [{ status: "Pending" }, { status: "Processing" }] }
    if (req.params.pageStatus == "Online") {
        cond = { $or: [{ status: req.params.pageStatus }, { status: "Not Operating" }] }
    }
    Page.find(cond)
        .populate({ path: "hostTouristSpot", model: "Page" })
        .populate({ path: "creator", model: "Account", select: "fullName profile" })
        .populate({ path: "services.data", model: "Item" })
        .exec((err, pages) => {

            if (err) {
                res.status(500).json({ error: err.message })
            }

            // if (pages.length) {
            //     pages.forEach((page, idx) => {
            //         page._doc.components = formatComponentArray(page._doc.components) //onlycomponents property 
            //         let services = page.services;

            //         if (!services || !services.length) {
            //             return
            //         }
            //         page._doc.services = formatPendingArray(services)
            //     });
            // }
            res.status(200).json(pages)
        })

    // Page.aggregate({
    //     $match: cond
    // }).populate({ path: "hostTouristSpot", model: "Page" })
    //     .populate({ path: "creator", model: "Account", select: "fullName" })
    //     .populate({ path: "services.data", model: "Item" })
    //     .exec(function (err, pages) {
    //         if (err) {
    //             res.status(500).json(err.message);
    //         }
    //         res.status(200).json(pages)
    //     })
}



module.exports.setBookingStatus = async(req, res) => {


    if (req.body.servicesToUpdate) {
        req.body.servicesToUpdate.forEach(service => {
            Item.updateOne({
                _id: mongoose.Types.ObjectId(service._id)
            }, {
                $set: service.bookingData
            }, function(error, result) {
                if (error) {
                    console.log(error)
                    return res.status(500).json(error.message);
                }
            })
        })
    }
    let settings = { status: req.body.status, timeLeft: 0, messaged: false }
    if (req.body.status == "Processing") {
        const date = new Date();
        settings.timeLeft = date.setMinutes(date.getMinutes() + 20);
    }
    booking.findByIdAndUpdate({ _id: req.body.bookingId }, { $set: settings }, { new: true })
        .populate({ path: "tourist", model: "Account", select: "firstName lastName address address2 city stateOrProvince country profile" })
        .exec(async (err, data) => {

            if (err) {
                console.log(err)
                res.status(500).json({ error: err.message })
            }
            try {


                console.log("ADMIN ID:", req.user)
                helper.createNotification({
                    receiver: req.body.serviceProviderReceiver,
                    mainReceiver: req.body.mainReceiver,
                    page: req.body.page,
                    booking: req.body.bookingId,
                    type: "booking-provider",
                    message: req.body.messageForServiceProvider
                })

                helper.createNotification({
                    receiver: req.body.touristReceiver,
                    mainReceiver: req.body.mainReceiver,
                    page: req.body.page,
                    booking: req.body.bookingId,
                    type: "booking-tourist",
                    message: req.body.messageForTourist
                })

                booking.findOne({ _id: req.body.bookingId })
                    .populate({ path: "tourist", model: "Account", select: "firstName lastName profile" })

                    .populate({ path: "pageId", model: "Page" })
                    .populate({ path: "selectedServices.service", model: "Item" })
                    .exec((error, bookingData) => {
                        if (error) {
                            return res.status(500).json(error.message);
                        }
                        res.status(200).json(bookingData);
                    })
            } catch (error) {
                console.log(error)
                res.status(500).json(error.message)
            }
        })
}


module.exports.setPageStatus = async (req, res) => {
    try {

        Page.findByIdAndUpdate({ _id: req.body.page }, { $set: { status: req.body.status } }, { new: true }, async (err, page) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: err.message })
            }

            await helper.createNotification({
                receiver: req.body.receiver,
                mainReceiver: req.body.mainReceiver,
                page: req.body.page,
                booking: null,
                type: req.body.type,
                message: req.body.message,
                subject: req.body.subject
            })

            if (req.body.status == "Online") {
                page.components.forEach(async (data) => {
                    if (data.data.defaultName == "category") {
                        if (page.pageType == "tourist_spot") {

                            touristSpotCategory.findOne({ name: { "$regex": data.data.text, "$options": "i" } })
                                .then(async function (error, existingCategory) {
                                    console.log(existingCategory)
                                    if (!existingCategory) {
                                        let request = req
                                        request['body'] = { name: data.data.text, touristSpots: [mongoose.Types.ObjectId(req.body.page)] };
                                        request['continue'] = true;
                                        const resultAdding = await addTouristSpotCategory(request, res)
                                        console.log("Result adding:-----", resultAdding)
                                        return res.status(200).json({ page: page })
                                    }
                                })
                        } else {
                            serviceCategory.findOne({ name: { "$regex": data.data.text, "$options": "i" } })
                                .then(async function (error, existingCategory) {
                                    console.log(existingCategory)
                                    if (!existingCategory) {
                                        let request = req

                                        request['body'] = { name: data.data.text };
                                        request['continue'] = true;
                                        const resultAdding = await addServiceCategory(request, res)
                                        console.log("Result adding:-----", resultAdding)
                                        return res.status(200).json({ page: page })
                                    }
                                })
                        }
                    }
                })
            }

            return res.status(200).json({ page: page })


        })
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message)
    }
}

module.exports.getPendingBookingsCount = (req, res) => {
    booking.countDocuments({
        'status': 'Pending',
    }, function (err, docs) {
        if (err) return res.status(500).json(err.message)
        res.status(200).json(docs)
    });
}


module.exports.getPendingPagesCount = (req, res) => {
    page.countDocuments({
        'status': 'Pending',
        'initialStatus': 'Approved',
    }, function (err, docs) {
        if (err) return res.status(500).json(err.message)
        res.status(200).json(docs)
    });
}

module.exports.getNotificationCount = (req, res) => {
    notification.countDocuments({
        'opened': false,
        receiver: mongoose.Types.ObjectId(req.user._id)
    }, function (err, docs) {
        if (err) return res.status(500).json(err.message)
        res.status(200).json(docs)
    })
}
