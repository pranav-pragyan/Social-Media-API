const app = require("./app");
const connectDatabase = require("./database/database");
const dotenv = require("dotenv");
// const connectDB = require("./database/database");


//config.
dotenv.config({ path: "backend/config/config.env" });

// Connect database to this server.......
connectDatabase();





app.listen(process.env.PORT || 4000, function () {
  console.log("The server is started at port 4000");
});



