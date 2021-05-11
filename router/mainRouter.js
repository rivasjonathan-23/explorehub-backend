const express = require("express");
const router = express.Router();
const serviceProviderRoutes = require("./routeGroups/serviceProviderRoutes");
const accountRoutes = require("./routeGroups/accountRoutes");
const checkIfAuthorized = require("../middlewares/checkIfAuthorized");
const adminRoutes = require("./routeGroups/adminRoutes")

router.use("/account", accountRoutes);
router.use("/service-provider", checkIfAuthorized, serviceProviderRoutes);
router.use("/admin", adminRoutes)

module.exports = router;
