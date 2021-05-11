const express = require("express");
const router = express();
const admin = require('../../controllers/adminController/admin');
const checkIfAuthorized = require("../../middlewares/checkIfAuthorized");
router.post('/login', admin.login);
router.post('/auth', admin.pusher);
router.get('/getAllBookings/:bookingStatus', admin.getAllBookings);
router.get('/getAllPendingNotifications/:pageStatus', admin.getAllPendingNotifications);


// router.get('/getOnProcessBooking/:bookingId', admin.getOnProcessBooking)
// router.get("/getBookedDetails/:bookingId", admin.getBookedDetails)
// router.get("/getDeclineBookings/:bookingId", admin.getDeclinedBookings)
// router.get("/getPendingBookings/:bookingId", admin.getPendingBookings)
router.post("/setPageStatus", checkIfAuthorized, admin.setPageStatus)
router.post("/setBookingStatus", checkIfAuthorized, admin.setBookingStatus)
router.get("/getPendingBookingsCount", admin.getPendingBookingsCount)
router.get("/getPendingPagesCount", admin.getPendingPagesCount)
router.get("/getNotificationCount", checkIfAuthorized, admin.getNotificationCount)



// router.get("/getOnlinePage/:pageId", admin.getOnlinePage)

module.exports = router;