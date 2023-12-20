const express = require("express");
const controllers = require("../Controllers/UrlController");

const router = express.Router();

router.post("/create", controllers.createURL);
router.get("/urls", controllers.getURLs);
router.delete("/urls/:id", controllers.deleteURL);
router.get("/dashboard", controllers.getDashboardData);

module.exports = router;
