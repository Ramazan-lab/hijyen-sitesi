var express = require("express");
var mysql = require("mysql");
const uniqid = require("uniqid");
const { signup, login } = require("./authorization");
var router = express.Router();

router.get("/admin", (req, res) => {
  res.render("admin/admin-login");
});

router.get("/admin/dashboard", (req, res) => {
  res.render("admin/admin-dashboard");
});

module.exports = router;
