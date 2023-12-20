const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/activateAccount", UserController.activateAccount);
router.post("/forgotPassword", UserController.forgotPassword);
router.post("/resetPassword", UserController.resetPassword);

module.exports = router;
