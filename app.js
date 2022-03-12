const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const users = require("./routes/users");
const admin = require("./routes/admin");

const router = express.Router();
const app = express();
/* const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour!",
}); */
//sadece icide / gecenlerde calisir. :)

/* app.use("/", limiter); */
//setting template engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.json());
app.use(cookieParser());
app.use(users);
app.use(admin);
app.use((req, res, next) => {
  req.user = req.cookies;
  next();
});

module.exports = app;
