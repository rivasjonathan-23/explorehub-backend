const mongoose = require("mongoose");
const adminAccount = require("../../models/adminSchemas/adminAccount");
const booking = require("../../models/booking");
const { messageModel } = require("../../models/commonSchemas/message");
const conversation = require("../../models/conversation");
const notification = require("../../models/notification");
const Page = require("../../models/page");
const helper = require("./helper");

module.exports.getPages = async (req, res) => {

    try {
        let cond = { creator: { $eq: mongoose.Types.ObjectId(req.user._id) }, pageType: { $ne: "service_group" }, status: { $eq: 'Unfinished' } }
        if (req.params.status == "submitted") cond.status = { $ne: 'Unfinished' }
        const services = await Page.aggregate([{ $match: cond },  { $lookup: { from: 'items', localField: 'services.data', foreignField: '_id', as: 'pageServices' } }]);
        res.status(200).json(services)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

module.exports.getPage = async (req, res) => {
    Page.findOne({ _id: req.params.pageId }).populate({ path: "otherServices", model: "Page" }).exec((error, page) => {
        if (error) {
            return res.status(500).json(error.message)
        }
        if (!page) {
            res.status(404).json({ message: "Page not found!" })
        }
        return res.status(200).json(page);
    })
}

module.exports.getServices = (req, res) => {
    Page.findOne({ _id: req.params.pageId }, { services: 1 })
        .populate({ path: "services.data", model: "Item" })
        .exec((error, services) => {
            if (error) {
                return res.status(500).json(error.message)
            }
            return res.status(200).json(services);
        })
}

module.exports.getPageBooking = (req, res) => {
    booking.find({ pageId: req.params.pageId, status: req.params.bookingStatus })
        .populate({ path: "tourist", model: "Account", select: "firstName lastName profile" })
        .populate({ path: "pageId", model: "Page"})
        .populate({ path: "selectedServices.service", model: "Item" })
        .sort({ 'updatedAt': -1 })
        .exec((error, bookings) => {
            if (error) {
                return res.status(500).json(error.message);
            }
            res.status(200).json(bookings);
        })
}

module.exports.approveBooking = (req, res) => {

}

module.exports.getNotificationsCount = (req, res) => {
    notification.countDocuments({
        'receiver': mongoose.Types.ObjectId(req.user._id),
        'opened': false
    }, function (err, docs) {
        if (err) return res.status(500).json(err.message)
        res.status(200).json(docs)
    });
}


module.exports.createConversation = (req, res) => {
    const data = req.body
    const fullName = req.user && req.user.username && !req.user.fullName ? "Admin" : req.user.fullName
    const firstMessage = new messageModel({ sender: req.user._id, senderFullName: fullName, message: data.message })
    const message = new conversation({
        booking: data.booking,
        page: data.page,
        receiver: data.receiver,
        messages: [firstMessage],
    })

    message.save().then(async (message) => {
        try {
            data.notificationData["conversation"] = message._id
            
            if (req.body.booking && req.body.fromAdmin) {
                const doc  = await booking.findById(req.body.booking)
                const currentTime = new Date();
                let remainingTime = 0
                if (doc.timeLeft) {
                    remainingTime = doc.timeLeft - currentTime;
                }
                
                let settings = { messaged: true }
                
                if (doc.status == "Pending" && remainingTime <= 0 || doc.status == "Pending" && !doc.messaged) {
                    settings["timeLeft"] = currentTime.setMinutes(currentTime.getMinutes() + 10)
                }
                booking.findByIdAndUpdate(req.body.booking, { $set: settings }, async function (error, result) {
                    if (error) return res.status(500).json(error.message)
                    await helper.createNotification(data.notificationData)
                })
            } else {
                await helper.createNotification(data.notificationData)
            }
                
        } catch (error) {
        }
        res.status(200).json(message);
    }).catch(error => {
        res.status(500).json(error.message)
    })
}

module.exports.getConversation = async (req, res) => {
    try {
        const conv = await conversation.findOne({ page: req.params.pageId, booking: req.params.bookingId, receiver: req.params.receiver })
        if (!conv) return res.status(200).json({ noConversation: true, message: "no converstion yet!" })
        res.status(200).json(conv)
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}


module.exports.sendMessage = (req, res) => {
    const fullName = req.user && req.user.username && !req.user.fullName ? "Admin" : req.user.fullName
    const message = new messageModel({ sender: req.user._id, senderFullName: fullName, message: req.body.message })
    conversation.updateOne({ "_id": mongoose.Types.ObjectId(req.body.conversationId) },
        {
            $push: {
                messages: message,
            },

        },
        async function (err, response) {
            if (err) {
                return res.status(500).json({ type: "internal error", error: err.message })
            }

            if (req.body.notificationData.booking) {
                booking.findById(req.body.notificationData.booking).then((doc, error) => {
                    if (doc.status == "Pending" && req.body.forAdmin && doc.messaged) {
                        booking.updateOne({ _id: mongoose.Types.ObjectId(req.body.notificationData.booking) }, { $set: { messaged: false, timeLeft: 0 } }, function (error, result) {
                            if (error) return res.status(500).json(error.message)
                            updateConversation(req, res)
                        })
                    }
                    else if (req.body.fromAdmin) {
                        const currentTime = new Date();
                        let remainingTime = 0
                        if (doc.timeLeft) {
                            remainingTime = doc.timeLeft - currentTime;
                        }

                        let settings = { messaged: true }

                        if (doc.status == "Pending" && remainingTime <= 0 || doc.status == "Pending" && !doc.messaged) {
                            settings["timeLeft"] = currentTime.setMinutes(currentTime.getMinutes() + 10)
                        }
                        booking.findByIdAndUpdate(req.body.notificationData.booking, { $set: settings }, function (error, result) {
                            if (error) return res.status(500).json(error.message)
                            updateConversation(req, res)
                        })
                    } else {
                        updateConversation(req, res)
                    }
                })
            } else {
                updateConversation(req, res)

            }


        })
}

async function updateConversation(req, res) {
    try {

        req.body.notificationData["conversation"] = req.body.conversationId
        if (req.body.notificationData) await helper.createNotification(req.body.notificationData)
        conversation.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(req.body.conversationId) }, {
            $set: {
                viewedBy: [mongoose.Types.ObjectId(req.user._id)]
            }
        }, function (error, convo) {
            if (error) return res.status(500).json(error.message);
            res.status(200).json(convo);
        })
    } catch (erro) {
        res.status(500).json(erro.message)
    }
}

module.exports.changePageStatus = (req, res) => {
    Page.updateOne({
        _id: req.body.pageId
    }, {
        $set: {
            status: req.body.status
        }
    }, function (error, response) {
        if (error) {
            return res.status(500).json(error.message)
        }
        res.status(200).json(response)
    })
}

module.exports.getHostedPages = async (req, res) => {
    try {
        const pages = await Page.find({ hostTouristSpot: mongoose.Types.ObjectId(req.params.pageId) })
        res.status(200).json(pages)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

module.exports.changeInitialStatus = (req, res) => {
    Page.updateOne({
        _id: mongoose.Types.ObjectId(req.body.pageId)
    }, {
        $set: {
            initialStatus: req.body.status
        }
    }, async function (error, result) {
        if (error) return res.status(500).json(error.message)
        try {
            if (req.body.notificationData) {
                await helper.createNotification(req.body.notificationData)
            }
            res.status(200).json(result)
        } catch (error) {
            res.status(500).json(error.message)
        }
    })
}

module.exports.getPageConversation = (req, res) => {
    conversation.findOne({ _id: req.params.conversationId })
        .populate({ path: "receiver", model: "Account" })
        .populate({ path: "participants" })
        .populate({ path: "page", model: "Page" })
        .exec((error, conversation) => {
            if (error) return res.status(500).json(error.message)
            if (!conversation) return res.status(200).json({})

            if (conversation && conversation.participants.length == 1) {
                adminAccount.find({}).then(admin => {
                    if (admin.length > 0) {
                        conversation.participants.push({ _id: admin[0]._id, fullName: "Admin" })
                    }
                    return res.status(200).json(conversation)
                }).catch(error => {
                    return res.status(500).json(error.message)
                })
            } else {

                res.status(200).json(conversation)
            }
        })
}


module.exports.getConvoForPageSubmission = (req, res) => {
    conversation.findOne({ page: req.params.pageId, type: req.params.type, participants: { "$in": [req.user._id] } })
        .populate({ path: "page", model: "Page" })
        .populate({ path: "receiver", model: "Account" })
        .exec((error, conversation) => {
            if (error) return res.status(500).json(error.message)
            conversation = conversation ? conversation : { noConversation: true }
            res.status(200).json(conversation)
        })
}

module.exports.createConvoForPageSubmission = (req, res) => {
    const data = req.body
    const fullName = req.user && req.user.username && !req.user.fullName ? "Admin" : req.user.fullName
    const firstMessage = new messageModel({ sender: req.user._id,withMedia: data.withMedia? true: false, senderFullName: fullName, message: data.message })
    const message = new conversation({
        booking: data.booking,
        page: data.page,
        participants: [req.user._id, data.receiver],
        type: data.type,
        viewedBy: [req.user._id],
        messages: [firstMessage],
    })

    message.save().then(async (message) => {
        try {
            data.notificationData["conversation"] = message._id
            await helper.createNotification(data.notificationData)
        } catch (error) {
        }
        res.status(200).json(message);
    }).catch(error => {
        res.status(500).json(error.message)
    })
}

module.exports.getAllConversations = (req, res) => {
    conversation.find({ participants: { $in: [req.user._id] } })
        .populate({ path: "participants" })
        .populate({ path: "page" })
        .sort({ 'updatedAt': -1 })
        .exec((error, convos) => {
            if (error) return res.status(500).json(error.message)
            adminAccount.find({}).then(admin => {
                console.log("Admin:", admin);
                if (admin.length > 0) {
                    convos = convos.map(convo => {
                        if (convo.participants.length == 1) convo.participants.push({ _id: admin[0]._id, fullName: "Admin" })
                        console.log('participants: ', convo.participants)
                        return convo
                    })
                }
                res.status(200).json(convos)

            }).catch(error => {
                return res.status(500).json(error.message)
            })

        })
}

module.exports.openConvo = async (req, res) => {
    try {
        const conv = await conversation.findOne({ _id: req.body.convoId })
        if (!conv.viewedBy.includes(req.user._id)) {

            conversation.updateOne({
                _id: mongoose.Types.ObjectId(req.body.convoId)
            }, {
                $push: { viewedBy: req.user._id }
            }, function (error, result) {
                if (error) return res.status(500).json(error.message)
                res.status(200).json(result)
            })
        } else {
            res.status(200).json({ message: "Already opened" })
        }
    } catch (error) {
        res.status(500).json(error.message)
    }
}


module.exports.getPageActiveBookings = async (req, res) => {
    try {

        const bookings = await booking.aggregate([{
            $match: {
                $or: [
                    {
                        status: 'Booked',
                        pageId: mongoose.Types.ObjectId(req.params.pageId)
                    },
                    {
                        status: 'Processing',
                        pageId: mongoose.Types.ObjectId(req.params.pageId)
                    }
                ]
            }
        }])
        res.status(200).json({ bookings: bookings })
    } catch (error) {
        console.log(error)
        res.status(500).json(error.message)
    }
}

