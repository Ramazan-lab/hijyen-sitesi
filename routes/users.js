var express = require("express");
var mysql = require("mysql");
const uniqid = require("uniqid");

var router = express.Router();
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock", //path to mysql sock in MAMP
  password: "root",
  database: "hijyen",
  multipleStatements: true,
});
con.connect(function (err) {
  if (!err) {
    console.log("Database is connected ... nn");
  } else {
    console.log(err);
  }
});
//sign up - kayıt olma
router.post("/create", function (req, res, next) {
  try {
    console.log(req.body);
    con.connect(function (err) {
      var sql = `INSERT INTO users (userName, userMail, userNumber, userPassword) VALUES ("${req.body.userName}","${req.body.userMail}","${req.body.userNumber}","${req.body.userPassword}")`;

      con.query(sql, function (err, result) {
        console.log(err);
        res.status(204).json({
          status: "success",
          message: null,
        });
      });
    });
  } catch (err) {
    console.log("Hata varrr");
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});
//login - giriş yapma
router.post("/login", function (req, res, next) {
  res.status(200).json({
    status: "bekliyor...",
    message: "login islemi yapilacak",
  });
});
//user test
router.post("/exam", function (req, res, next) {
  res.status(200).json({
    status: "bekliyor...",
    message: "kullanıcı puanı kayıt edilecek",
  });
});

router.get("/results2", function (req, res, next) {
  let sqlSorgusu = "SELECT * FROM users";
  con.connect(function (err) {
    con.query(sqlSorgusu, function (err, results, fields) {
      res.render("home", { data: results });
      console.log(results);
    });
  });
});
//
router.get("/results", function (req, res, next) {
  let sqlSorgusu = "SELECT * FROM users";
  con.connect(function (err) {
    con.query(sqlSorgusu, function (err, results, fields) {
      res.status(200).json({
        status: "bekliyor...",
        message: results,
      });
    });
  });
});
//user listeleme
router.route("/").get((req, res, next) => {
  res.status(200).json({
    status: "fail",
    message: "get all usersss",
  });
  next();
});

module.exports = router;
