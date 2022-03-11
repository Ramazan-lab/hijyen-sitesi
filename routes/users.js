var express = require("express");
var mysql = require("mysql");
const uniqid = require("uniqid");
const bodyParser = require("body-parser");
const { parse } = require("querystring");

var router = express.Router();
const urlParser = bodyParser.urlencoded({ extended: false });

var pool = mysql.createPool({
  connectionLimit: 10, // default = 10
  host: "localhost",
  user: "root",
 
 // socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock", //path to mysql sock in MAMP
  password: "1234",
  database: "hijyen",
  multipleStatements: true,
  debug: false,
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
router.post("/basvuru", urlParser, function (req, res, next) {
  pool.getConnection(function (err, connection) {
    let { phone, email, ticariunvan, adress, website } = req.body;
    connection.query(
      `INSERT INTO onlineBasvurular (id,phone,email,ticariunvan,adress,website) VALUES ('${uniqid()}','${phone}','${email}','${ticariunvan}','${adress}','${website}')`,
      function (err, rows) {
        connection.release();
        if (err) throw err;
        res.render("messages/success");
      }
    );
  });
});
router.post("/", urlParser, function (req, res, next) {
  pool.getConnection(function (err, connection) {
    let { email, phone } = req.body;
    connection.query(
      `INSERT INTO siziArayalim (email,telefon) VALUES ('${email}', '${phone}')`,
      function (err, rows) {
        connection.release();
        if (err) throw err;
        res.render("messages/success");
      }
    );
  });
});
router.get("/sinav/questions", function (req, res, next) {
  res.render("pages/questions");
});
router.get("/hijyen-belgesi", function (req, res, next) {
  res.render("pages/hijyen-belgesi");
});
router.get("/iletisim", function (req, res, next) {
  res.render("pages/iletisim");
});
router.get("/basvuru", function (req, res, next) {
  res.render("pages/basvuru");
});
router.get("/post-id/:postid", urlParser, function (req, res) {
  pool.getConnection(function (err, connection) {
    connection.query(`SELECT * FROM blogPosts`, function (err, rows) {
      connection.release();
      if (err) throw err;
      let results = Object.values(JSON.parse(JSON.stringify(rows)));
      let post = results.find((el) => req.params.postid == el.id);
      console.log(post);
      res.render("pages/blog-post-details", { data: post });
    });
  });
});
router.get("/blog", function (req, res) {
  pool.getConnection(function (err, connection) {
    connection.query(`SELECT * FROM blogPosts`, function (err, rows) {
      connection.release();
      if (err) throw err;
      const results = Object.values(JSON.parse(JSON.stringify(rows)));
      res.render("pages/blog", { data: results });
    });
  });
});
router.get("/sinav", function (req, res, next) {
  res.render("pages/sinav");
});
router.get("/sss", function (req, res, next) {
  res.render("pages/sss");
});
//user listeleme
router.route("/").get((req, res, next) => {
  res.render("home");
});
module.exports = router;
