const express = require("express");
const req = require("express/lib/request");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const app = express();


//config.
dotenv.config({ path: "backend/config/config.env" });


//import routes path
const user = require("./routes/userRoute");
const post = require("./routes/postRoute")

app.use(express.json());
app.use(cookieParser());


// import routes
app.use("/api", user);
app.use("/api", post);

module.exports = app