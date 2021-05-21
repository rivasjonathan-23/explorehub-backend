const express = require("express");
const router = express();

const pageCreation = require("../../controllers/serviceProviderController/pageCreation");
const touristSpotCategories = require("../../controllers/serviceProviderController/touristSpotCategories");
const uploadImage = require("../../middlewares/uploadImage");
const serviceProvider = require("../../controllers/serviceProviderController/serviceProvider");
const tourist = require("../../controllers/serviceProviderController/tourist");
const { service } = require("../../models/service");

router.post("/addDefaultCategories", touristSpotCategories.addDefaultCategories);

router.post("/addComponent/:id/:pageType", pageCreation.addComponent)
router.post("/saveItem/:parentId/:serviceId/:pageType", pageCreation.saveItem)
router.post("/addServiceChildComponent/:pageId/:grandParentId/:parentId/:pageType", pageCreation.addServiceChildComponent)
router.post("/addServiceComponent/:id/:pageType", pageCreation.addServiceComponent)
router.put("/editComponent/:id/:pageType", pageCreation.editComponent)
router.put("/editChildComponent/:pageId/:grandParentId/:parentId/:pageType", pageCreation.editChildComponent)
router.post("/deleteChildComponent/:pageId/:grandParentId/:childId/:pageType", pageCreation.deleteChildComponent)
router.post("/deleteItemChild/:pageId/:grandParentId/:parentId/:childId/:pageType", pageCreation.deleteItemChild)
router.post("/addComponentImage/:parentId/:childId/:pageType", pageCreation.addComponentImage)
router.post("/addItemChildComponentImage/:pageId/:grandParentId/:parentId/:childId/:pageType",  pageCreation.addItemChildComponentImage)
router.post("/deleteImage/:id/:pageType", pageCreation.deleteImage)
router.post("/deleteItemImage/:pageId/:grandParentId/:parentId/:pageType", pageCreation.deleteItemImage)
router.post("/deleteComponent/:id/:componentId/:pageType", pageCreation.deleteComponent)
router.post("/deleteInputField/:pageId/:grandParentId/:parentId/:childId/:pageType", pageCreation.deleteInputField)
router.delete("/deleteItem/:pageId/:itemListId/:itemId/:pageType", pageCreation.deleteItem)
router.delete("/deleteServiceComponent/:pageId/:serviceId/:pageType", pageCreation.deleteServiceComponent)
router.get("/getItemUpdatedData/:pageId/:serviceId/:itemId/:pageType", pageCreation.getItemUpdatedData)
router.get("/getUpdatedItemListData/:pageId/:serviceId/:pageType", pageCreation.getUpdatedItemListData)
router.put("/editServiceInfo/:pageId/:serviceId/:infoId/:pageType", pageCreation.editServiceInfo)
router.post("/saveInputField/:pageId/:grandParentId/:parentId/:pageType", pageCreation.saveInputField)
router.put("/editInputField/:pageId/:grandParentId/:parentId/:pageType", pageCreation.editInputField)
router.delete("/deletePage/:pageId/:pageType", pageCreation.deletePage)
router.post("/editServiceSettings", pageCreation.editServiceSettings)

router.get("/retrieveAllTouristSpotsPage", pageCreation.retrieveAllTouristSpotsPage)
router.post("/createPage/:pageType", pageCreation.createPage)
router.get("/retrievePage/:pageId/:pageType", pageCreation.retrievePage)
router.post("/submitPage/:pageId/:pageType", pageCreation.submitPage)
router.get("/getPages/:status", serviceProvider.getPages);
router.get("/getPage/:pageId", serviceProvider.getPage)
router.get("/getServices/:pageId/:pageType", serviceProvider.getServices)
router.get("/getPageBooking/:bookingStatus/:pageId", serviceProvider.getPageBooking)
router.get("/getNotificationsCount", serviceProvider.getNotificationsCount)
router.post("/createConversation", serviceProvider.createConversation)
router.get("/getConversation/:bookingId/:pageId/:receiver", serviceProvider.getConversation)
router.post("/sendMessage", serviceProvider.sendMessage)
router.post("/changePageStatus", serviceProvider.changePageStatus)
router.get("/getHostedPages/:pageId", serviceProvider.getHostedPages)
router.post("/changeInitialStatus", serviceProvider.changeInitialStatus)
router.get("/getPageConversation/:conversationId", serviceProvider.getPageConversation)
router.get("/getConvoForPageSubmission/:pageId/:type", serviceProvider.getConvoForPageSubmission)
router.post("/createConvoForPageSubmission", serviceProvider.createConvoForPageSubmission)
router.get("/getAllConversations/:pageId", serviceProvider.getAllConversations)
router.post("/openConvo", serviceProvider.openConvo)
router.post("/deleteConfirmedPage/:pageId/:pageType", pageCreation.deletePage)
router.get("/getPageActiveBookings/:pageId", serviceProvider.getPageActiveBookings)
router.delete("/deleteNotification/:notificationId", serviceProvider.deleteNotification)
router.delete("/deleteNotificationGroup/:notificationGroupId", serviceProvider.deleteNotificationGroup)

router.get("/getOnlinePages/:category", tourist.getOnlinePages)
router.get("/viewPage/:pageId/:pageType", tourist.viewPage)
router.get("/viewItems/:pageId/:serviceId/:pageType", tourist.viewItems)
router.get("/viewAllServices/:pageId", tourist.viewAllServices)
router.get("/getDefaultCategories/:pageType", pageCreation.getDefaultCategories)
router.post("/createBooking/:pageId/:pageType/:bookingId", tourist.createBooking)
router.get("/getBooking/:bookingId/:purpose", tourist.getBooking)
router.post("/addBookingInfo/:bookingId", tourist.addBookingInfo)
router.get("/getPageBookingInfo/:pageId/:pageType/:bookingId", tourist.getPageBookingInfo)
router.post("/submitBooking/:bookingId", tourist.submitBooking)
router.get("/getBookings/:bookingStatus", tourist.getBookings)
router.get("/viewBooking/:bookingId", tourist.viewBooking)
router.delete("/deleteBooking/:bookingId", tourist.deleteBooking)
router.get("/getNotifications", tourist.getNotifications)
router.put("/viewNotification", tourist.viewNotification)
router.put("/removeSelectedItem/:bookingId/:selectedId", tourist.removeSelectedItem)
router.post("/changeBookingStatus/:status", tourist.changeBookingStatus)
router.post("/searchTouristSpot", tourist.searchTouristSpot)
router.get("/getAllCategories", tourist.getAllCategories)

module.exports = router;
