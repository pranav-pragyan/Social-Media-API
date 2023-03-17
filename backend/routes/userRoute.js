const express = require("express");

const { authenticate, addUser, followUser, unfollowUser, userDetail } = require("../database/userDB");

const router = express.Router();

router.route("/adduser").post(addUser)
router.route("/authenticate").post(authenticate);
router.route("/follow/:id").post(followUser)
router.route("/unfollow/:id").post(unfollowUser)
router.route("/user").get(userDetail)

module.exports = router