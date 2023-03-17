const express = require("express");
const { addPost, likePost, unlikePost, deletePost, getAPost, getAllPost, commentOnPost } = require("../database/postDB");

const router = express.Router();


router.route("/posts").post(addPost);
router.route("/like/:id").post(likePost);
router.route("/unlike/:id").post(unlikePost);
router.route("/posts/:id").delete(deletePost);
router.route("/posts/:id").get(getAPost);
router.route("/all_posts").get(getAllPost);
router.route("/comment/:id").post(commentOnPost);
module.exports = router
