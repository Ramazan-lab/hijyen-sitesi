var express = require("express");
var mysql = require("mysql");
const uniqid = require("uniqid");

var router = express.Router();

router.get("/admin", (req, res) => {
  res.render("admin/admin-login");
});

module.exports = router;
