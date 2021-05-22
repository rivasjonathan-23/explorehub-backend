const mongoose = require("mongoose");
const { ComponentModel } = require("../../models/commonSchemas/component");
const { Item } = require("../../models/item");
const notification = require("../../models/notification");
const notificationGroup = require("../../models/notificationGroup");
const Page = require("../../models/page");
const serviceCategory = require("../../models/serviceCategory");
const touristSpotCategory = require("../../models/touristSpotCategory");
const deleteImage = require("../../uploads/deleteImage");

const addComponent = (model, touristSpotId, res, data, returnData = true) => {
  model.findByIdAndUpdate(
    touristSpotId,
    data,
    { upsert: true },
    function (err, result) {
      if (err) {
        return res.status(500).json({
          type: "internal_error",
          error: err.message,
        });
      }
      if (returnData) {
        result = Object.values(Object.values(data)[0])[0];
      }
      res.status(200).json(result);
    }
  );
};
module.exports.addComponent = addComponent;

module.exports.addNewComponent = async (model, component, id, res, type = "services") => {
  try {
    delete component._id;
    const data = await ComponentModel.validate(component);
    const newComponent = type == "services" ? { services: data } :
      type == "bookingInfo" ? { bookingInfo: data } : { components: data };
    addComponent(model, id, res, {
      $addToSet: newComponent
    });
  } catch (error) {
    handleError(error, res);
  }
}

module.exports.editComponent = (model, query, data, res, newData, deleteImg = null) => {
  model.updateOne(query,
    data)
    .then(result => {
      if (deleteImg) deleteImg(newData.imageUrl)
      if (newData && newData.data.pageType && newData.data && newData.data.defaultName == "category") {
        console.log(newData.pageType)
        const categoryModel = newData.data.pageType == "service"?   serviceCategory: touristSpotCategory
        categoryModel.updateMany({},
          {
            $pull:
              { 'touristSpots': mongoose.Types.ObjectId(query._id) }
          }
        ).then(result => {
          if (newData.data.referenceId) {
            categoryModel.findByIdAndUpdate(mongoose.Types.ObjectId(newData.data.referenceId), {
              $push: {
                touristSpots: mongoose.Types.ObjectId(query._id)
              }
            }).then(resulta => {

              res.status(200).json(resulta);
            })

          } else {
            res.status(200).json(result);
          }
        })
      } else {

        res.status(200).json(newData);
      }
    }).catch(error => {
      res.status(500).json({ type: 'internal_error!', error: error.message });
    })
}

module.exports.deleteItem = (model, query, condition, res, images) => {
  model.updateOne(
    query,
    {
      $pull: condition
    }, function (err, numberAffected) {
      if (err) {
        return res.status(500).json({ type: "internal_error", error: err.message });
      }
      if (images) {
        images.forEach(image => { deletePhoto(image) });
      }
      res.status(200).json({
        message: "Component successfully deleted",
        result: numberAffected
      })
    });
}

const deletePhoto = (image) => {
  let img = image.split("/");
  deleteImage(img[img.length - 1]);
}

module.exports.convertIdToObjectId = (component) => {
  return component.data.map(data => {
    if (typeof data == 'object') {
      if (data._id) {
        data._id = mongoose.Types.ObjectId(data._id);
      }
    }
    return data;
  })
}

module.exports.getItem = (pageId, itemId, pageType) => {
  return new Promise((resolve, reject) => {
    // const Pages = pageType == "service" ? servicePage : touristSpotPage
    Page.aggregate([
      {
        "$match": { _id: mongoose.Types.ObjectId(pageId) }
      },
      {
        "$project": {
          "services": {
            "$filter": {
              "input": {
                "$map": {
                  "input": "$services",
                  "in": {
                    "data": {
                      "$filter": {
                        "input": "$$this.data",
                        "as": "data",
                        "cond": { "$eq": ["$$data._id", mongoose.Types.ObjectId(itemId)] }
                      }
                    }
                  }
                }
              }, "cond": { "$ne": ["$$this.data", []] }
            }
          }
        }
      }
    ], function (err, data) {
      if (err) {
        reject({ type: "internal_error", error: err })
      } else {
        resolve(data)
      }
    })
  })
}


module.exports.getService = (pageId, serviceId, pageType) => {
  return new Promise((resolve, reject) => {
    // const Pages = pageType == "service" ? servicePage : touristSpotPage
    Page.aggregate([
      {
        "$match": { _id: mongoose.Types.ObjectId(pageId) }
      },
      {
        "$project": {
          "services": {
            "$filter": {
              "input": "$services",
              "as": "service",
              "cond": { "$eq": ["$$service._id", mongoose.Types.ObjectId(serviceId)] }
            }
          }
        }
      }
    ], function (err, data) {
      if (err) {
        reject({ type: "internal_error", error: err })
      } else {
        resolve(data)
      }
    })
  })
}

module.exports.getImages = (data) => {
  let images = []
  data.data.forEach(data => {
    if (data.type == "item") {
      const img = getItemImages(data);
      if (img.length > 0) {
        images = [...images, ...img];
      }
      // data.data.forEach(comp => {
      //   if (comp.type == "photo") {
      //     comp.data.forEach(img => {
      //       images.push(img.url);
      //     })
      //   }
      // })
    }
  })
  return images;
}

function getItemImages(data) {
  let images = []
  data.data.forEach(comp => {
    if (comp.type == "photo") {
      comp.data.forEach(img => {
        images.push(img.url);
      })
    }
  })
  return images;
}

module.exports.updateItemBookingCount = (service, res, booked = true) => {
  const data = booked ? { booked: service.booked } : { manuallyBooked: service.manuallyBooked }
  Item.updateOne({
    _id: mongoose.Types.ObjectId(service._id)
  }, {
    $set: data
  }).then(result => {
    console.log("updated item ", service)
  }).catch(error => {
    return res.status(500).json(error.message)
  })
}


function createNotification(data) {
  return new Promise(async (resolve, reject) => {
    try {
      let { receiver, mainReceiver, page, booking, type, message } = data;
      const query = {
        receiver: mongoose.Types.ObjectId(receiver),
        page: mongoose.Types.ObjectId(page),
      }
      if (booking) {
        query["booking"] = mongoose.Types.ObjectId(booking)
      } else {
        query["type"] = type
      }
      const notifGroup = await notificationGroup.findOne(query)

      const firstNotif = new notification({ message: message, receiver: receiver })
      if (data.isMessage) {
        firstNotif["isMessage"] = true
        firstNotif["subject"] = data.subject
        firstNotif["sender"] = data.sender
        firstNotif["conversation"] = data.conversation
      }
      if (!notifGroup) {

        let notif = new notificationGroup({
          receiver: receiver,
          mainReceiver: mainReceiver,
          page: page,
          type: type,
          booking: booking,
          notifications: [firstNotif._id]
        })
        firstNotif["notificationGroup"] = notif._id
        await firstNotif.save();
        await notif.save();
        resolve(notif)
      } else {
        firstNotif["notificationGroup"] = notifGroup._id
        notificationGroup.updateOne(query, {
          $push: {
            notifications: {
              $each: [firstNotif._id],
              $position: 0
            }
          }
        }).then(async (result) => {

          if (!data.isMessage) {
            await firstNotif.save();
            notifGroup.notifications.unshift(firstNotif)
            resolve(notifGroup)
          } else {
            notification.findOneAndUpdate({ receiver: data.receiver, sender: data.sender, subject: data.subject, isMessage: true, notificationGroup: notifGroup._id },
              { $set: { opened: false, updatedAt: new Date(), message: message } })
              .then(async (result) => {
                try {

                  if (!result) {
                    await firstNotif.save()
                  }

                  resolve(notifGroup)
                }
                catch (error) {
                  reject(error)
                }
              }).catch(error => {
                reject(error)
              })

          }

        }).catch(error => {
          reject(error)
        })


      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports.createNotification = createNotification;

module.exports.getItemImages = getItemImages

module.exports.deletePhoto = deletePhoto;

const handleError = (error, res) => {
  switch (error.type) {
    case "validation_error":
      return res.status(400).json(error);
    case "unauthorized":
      return res.status(401).json({
        type: "unauthorized",
        message: "You are not allowed to do it",
      });
    case "not_found":
      return res.status(404).json({
        type: "not_found",
        message: "Object was not found",
      });
    default:
      console.log(error)
      res.status(500).json({
        type: "internal_error",
        message: "unexpected error occured",
        error: error.error.message,
      });
      break;
  }
};
module.exports.handleError = handleError;