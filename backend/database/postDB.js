const req = require("express/lib/request");
const mongoose = require("mongoose");
const asyncError = require("../middleware/asyncError");
const jwt = require("jsonwebtoken");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter title"],
    maxLength: [50, "Name cannot have more than 40 characters"],
    minLength: [2, "Name should have atleast 4 characters"]
  },
  Desription: {
    type: String,
    required: [true, "Please enter description"],
    maxLength: [100, "Name cannot have more than 40 characters"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  },
  like: {
    user_id: [{ type: mongoose.Schema.ObjectId, ref: "User", required: true }],
    count: { type: Number, default: 0 },
  },
  comment: {
    comm_id: {
      type: Number
    },
    comm: [{
      user_id: { type: mongoose.Schema.ObjectId, ref: "User" },
      user_comm: { type: String }
    }],
    count: { type: Number, default: 0 },
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
})

const Post = mongoose.model("Post", postSchema);

//add post
exports.addPost = asyncError(async (req, res) => {

  const token = req.cookies.authcookie; // token will be recieved into object type
  if (!token)
    return res.json({ success: false, message: "Please login to access the resources." });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);


  const { title, Desription } = req.body;

  const post = await Post.create({
    title: title,
    Desription: Desription,
    user: decodedData.id,
    createAt: Date.now()

  });

  res.status(201).json({ success: true, post });
})

//like the post
exports.likePost = asyncError(async (req, res) => {

  const token = req.cookies.authcookie; // token will be recieved into object type
  console.log(token)
  if (!token)
    return res.json({ success: false, message: "Please login to access the resources." });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);


  const post = await Post.findById(req.params.id);
  if (!post)
    return res.json({ success: false, message: "This post does not exist" });

  //check if the user already liked
  const alreadyLiked = post.like.user_id.find(element => element == decodedData.id)

  if (alreadyLiked)
    return res.json({ success: false, message: "You have already liked this post" });

  post.like.user_id.push(decodedData.id)
  post.like.count = post.like.count + 1

  await post.save()

  return res.json({ success: true, message: "You liked this post" });

})

//unlike the post
exports.unlikePost = asyncError(async (req, res) => {

  const token = req.cookies.authcookie; // token will be recieved into object type
  console.log(token)
  if (!token)
    return res.json({ success: false, message: "Please login to access the resources." });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);


  const post = await Post.findById(req.params.id);
  if (!post)
    return res.json({ success: false, message: "This post does not exist" });

  //check if the user already liked
  const alreadyLiked = post.like.user_id.find(element => element == decodedData.id);

  if (!alreadyLiked)
    return res.json({ success: false, message: "You did not like the post yet." });


  index = post.like.user_id.indexOf(decodedData.id);
  post.like.user_id.splice(index, 1);
  post.like.count = post.like.count - 1

  await post.save()

  return res.json({ success: true, message: "You unliked this post" });

})

//delete a post
exports.deletePost = asyncError(async (req, res) => {

  const token = req.cookies.authcookie; // token will be recieved into object type
  console.log(token)
  if (!token)
    return res.json({ success: false, message: "Please login to access the resources." });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  const post = await Post.findById(req.params.id);
  if (!post)
    return res.json({ success: false, message: "This post does not exist" });

  if (post.user != decodedData.id)
    return res.json({ success: false, message: "Unauthorized access" });

  console.log(post)
  await post.deleteOne();

  return res.json({ success: true, message: "Post deleted successfully." });

})

//comment on a post
exports.commentOnPost = asyncError(async (req, res) => {

  const token = req.cookies.authcookie; // token will be recieved into object type
  console.log(token)
  if (!token)
    return res.json({ success: false, message: "Please login to comment." });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);


  const post = await Post.findById(req.params.id);
  if (!post)
    return res.json({ success: false, message: "This post does not exist" });

  const { comment } = req.body;
  post.comment.comm.push({ user_id: decodedData.id, user_comm: comment })
  post.comment.comm_id = Math.floor((1 + Math.random()) * 0x1000000)
  post.comment.count = post.like.count + 1

  await post.save()

  return res.json({ success: true, id: post.comment.comm_id });

})

//get a post detail
exports.getAPost = asyncError(async (req, res) => {

  const post = await Post.findById(req.params.id);
  if (!post)
    return res.json({ success: false, message: "This post does not exist" });

  res.json({ success: true, likeCount: post.like.count, commentcount: post.comment.count })

})


// get all the posts of a user
exports.getAllPost = asyncError(async (req, res) => {
  const token = req.cookies.authcookie; // token will be recieved into object type
  console.log(token)
  if (!token)
    return res.json({ success: false, message: "Please login to access the resources." });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  const posts = await Post.find({ user: decodedData.id });

  if (!posts)
    return res.json({ success: false, message: "No post found." });


  res.json({ success: true, posts })
})