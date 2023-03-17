const mongoose = require("mongoose");

function connectDatabase() {
  mongoose.connect("mongodb://localhost:27017/Social_Media").then(function (data) {
    console.log(`MongoDB is connect with host ${data.connection.host} `);
  }).catch(function (err) {
    console.log("MongoDB could not be connected");
  });
}

module.exports = connectDatabase