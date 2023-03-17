const req = require("express/lib/request");
const mongoose = require("mongoose");
const validator = require("validator");
const asyncError = require("../middleware/asyncError");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [40, "Name cannot have more than 40 characters"],
    minLength: [4, "Name should have atleast 4 characters"]
  },
  user_name: {
    type: String,
    required: [true, "Please enter your user name"],
    maxLength: [40, "Name cannot have more than 40 characters"],
    minLength: [4, "Name should have atleast 4 characters"]
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,  // only unique email should be there in the database.
    validate: [validator.isEmail, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user"
  },
  follower: {
    user_id: [{ type: mongoose.Schema.ObjectId, ref: "User", required: true }],
    count: { type: Number, default: 0 },
  },
  following: {
    user_id: [{ type: mongoose.Schema.ObjectId, ref: "User", required: true }],
    count: { type: Number, default: 0 },
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});


// JWT TOKEN: It will generate the token and store the token into cookie
userSchema.methods.getJWTtoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const User = mongoose.model("User", userSchema);

//add user
exports.addUser = asyncError(async (req, res) => {
  const { name, user_name, email, password } = req.body;

  // check if there is any account already exist with this mail id
  const userfromDB = await User.findOne({ email: email });

  if (userfromDB)
    return res.json({ success: false, message: "Already an account exists with the mail id" });

  const user = await User.create({
    name: name,
    user_name: user_name,
    email: email,
    password: password,
  });

  res.status(201).json({ success: true, user });

});


// Login user
exports.authenticate = asyncError(async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password)
    return res.json({ success: false, message: "email and password is missing." });
  else if (!email && password)
    return res.json({ success: false, message: "email is missing." });
  else if (email && !password)
    return res.json({ success: false, message: "password is missing." });

  const user = await User.findOne({ email: email, password: password });

  if (!user)
    return res.json({ success: false, message: "invalid email or password." });

  // const isPasswordCorrect = await user.comparePassword(password);

  // if (!isPasswordCorrect)
  //   return res.json({ success: false, message: "invalid email or password." });

  const token = user.getJWTtoken();
  res.cookie('authcookie', token, { maxAge: 900000, httpOnly: false })
  res.status(200).json({ success: true, token });

});

//follow a user
exports.followUser = asyncError(async (req, res) => {

  const token = req.cookies.authcookie; // token will be recieved into object type
  console.log(req.cookies)
  console.log(token)
  if (!token)
    return res.json({ success: false, message: "Please login to access the resources." });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);

  // const login_user = req.user.

  const user_to_follow = await User.findById(req.params.id);

  if (!user_to_follow)
    return res.json({ success: true, message: `No such user found with ID : ${req.params.id}` });


  const isFollower = req.user.following.user_id.find(element => element == req.params.id)

  if (isFollower)
    return res.json({ success: false, msg: "User is already followed" });

  // adding in following
  req.user.following.user_id.push(req.params.id);
  req.user.following.count = req.user.following.count + 1;


  // adding in follower
  user_to_follow.follower.user_id.push(req.user._id)
  user_to_follow.follower.count = user_to_follow.follower.count + 1

  await req.user.save()
  await user_to_follow.save()

  res.json({ success: true, user: req.user });
});


//unfollow a user
exports.unfollowUser = asyncError(async (req, res) => {


  const token = req.cookies.authcookie; // token will be recieved into object type
  console.log(req.cookies)
  console.log(token)
  if (!token)
    return res.json({ success: false, message: "Please login to access the resources." });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);

  // const login_user = req.user.

  const user_to_unfollow = await User.findById(req.params.id);

  if (!user_to_unfollow)
    return res.json({ success: true, message: `No such user found with ID : ${req.params.id}` });


  const isFollower = req.user.following.user_id.find(element => element == req.params.id)

  if (!isFollower)
    return res.json({ success: false, msg: `You are not following the user ${req.params.id}` });

  // removing from following
  let index = req.user.following.user_id.indexOf(req.params.id);
  req.user.following.user_id.splice(index, 1);
  req.user.following.count = req.user.following.count - 1;


  // removing from follower
  index = user_to_unfollow.follower.user_id.indexOf(req.user._id);
  user_to_unfollow.follower.user_id.splice(index, 1);
  user_to_unfollow.follower.count = user_to_unfollow.follower.count - 1

  await req.user.save()
  await user_to_unfollow.save()

  res.json({ success: true, user: req.user });
});


// get a user detail
exports.userDetail = asyncError(async (req, res) => {

  const token = req.cookies.authcookie; // token will be recieved into object type
  console.log(req.cookies)
  console.log(token)
  if (!token)
    return res.json({ success: false, message: "Please login to access the resources." });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);


  res.json({ success: true, username: req.user.user_name, follower: req.user.follower.count, following: req.user.following.count })
})
