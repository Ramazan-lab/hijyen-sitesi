const express = require("express");
const path = require("path");
const users = require("./routes/users");

const router = express.Router();
const app = express();

//setting template engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.json());
app.get("/welcome", (req, res) => {
  res.render("welcome"); //template name
});
app.use("/", users);

module.exports = app;
