const mongoose = require("mongoose");

function connectDatabase() {
  mongoose.connect("mongodb+srv://Pranav:0gmajIxFhaoFXdTv@socialmedia.9ryvax1.mongodb.net/socialMedia").then(function (data) {
    console.log(`MongoDB is connect with host ${data.connection.host} `);
  }).catch(function (err) {
    console.log("MongoDB could not be connected");
  });
}

module.exports = connectDatabase

