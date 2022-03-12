var express = require("express");
var mysql = require("mysql");
const uniqid = require("uniqid");
const bodyParser = require("body-parser");
const { parse } = require("querystring");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");
const app = require("../app");
//token oluşturma fonksiyonu
const signToken = (email) => {
  return jwt.sign({ email }, "ABCDEFG123456", {
    expiresIn: "90d",
  });
};

//olusturulan tokeni gondermek
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.email);
  // secure: true,sadece https'de gonderilir.
  user.password = undefined;
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  });
};

const correctPassword = async function (
  candidatePassword,
  userPassword = "pass"
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

var router = express.Router();

//db connection & data parsing
const urlParser = bodyParser.urlencoded({ extended: false });
var pool = mysql.createPool({
  connectionLimit: 10, // default = 10
  host: "localhost",
  user: "root",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock", //path to mysql sock in MAMP
  password: "root",
  database: "hijyen",
  multipleStatements: true,
  debug: false,
});
//middlewares
const getUser = async (req) => {
  if (req.cookies.jwt) {
    return new Promise((resolve) => {
      let result = jwt.verify(req.cookies.jwt, "ABCDEFG123456");
      pool.getConnection(function (err, connection) {
        connection.query(
          `SELECT * FROM users where (userMail='${result.email}')`,
          function (err, rows) {
            connection.release();
            let loggedInUserData = Object.values(
              JSON.parse(JSON.stringify(rows))
            );
            resolve(loggedInUserData[0]);
          }
        );
      });
    });
  }
};
//sign up - kayıt olma
router.use("/users/create", async function (req, res, next) {
  try {
    req.body.userPassword = await bcrypt.hash(req.body.userPassword, 12);
    next();
  } catch (err) {
    console.log(err);
    next();
  }
});
router.post("/users/create", urlParser, function (req, res, next) {
  try {
    pool.getConnection(function (err, connection) {
      var sql = `INSERT INTO users (userName, userMail, userNumber, userPassword) VALUES ("${req.body.userName}","${req.body.userMail}","${req.body.userNumber}","${req.body.userPassword}")`;
      connection.query(sql, function (err, rows) {
        connection.release();
        if (err) throw err;
        createSendToken(req.body, 201, req, res);
        res.render("messages/success");
      });
    });
  } catch (err) {
    console.log(err.stack);
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

//login - giriş yapma
router.post("/users/login", urlParser, function (req, res, next) {
  const { email, password } = req.body;
  //if email-password exist
  if (!email || !password) {
    return res.status(404).json({ message: "Email veya password yok!" });
  }

  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM users where (userMail='${email}')`,
      async function (err, rows) {
        try {
          connection.release();
          if (err) throw err;
          if (!rows[0]) {
            return res.status(401).json({
              message: "UYARI!",
              status: "Emaile ait hesap bulunamadı",
            });
          }
          let results = Object.values(JSON.parse(JSON.stringify(rows)));
          if (!(await correctPassword(password, results[0]?.userPassword))) {
            return res.status(401).json({
              message: "UYARI!",
              status: "Şifre yanlış, tekrar deneyin",
            });
          }

          //if everthing is ok, send token to client
          const currentUser = {
            email,
            password,
            name: results[0].userName,
            phone: results[0].userNumber,
            sertifika: results[0].sertifika,
          };

          res.locals.user = currentUser;
          createSendToken(req.body, 200, req, res);
          res.redirect("/");
        } catch (err) {
          res.status(200).json({
            status: "success",
            message: err,
          });
        }
      }
    );
  });
});

//başvuru
router.post("/basvuru", urlParser, async (req, res, next) => {
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
//sizi arayalım
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

/* simple pages */
router.get("/sinav/questions", async (req, res, next) => {
  const user = await getUser(req);
  //kullanıcı giriş yapmıştır.
  if (req.cookies.jwt) {
    res.render("pages/questions", { user: user });
  } else {
    res.render("messages/warning");
  }
});
router.get("/hijyen-belgesi", async (req, res, next) => {
  const user = await getUser(req);

  res.render("pages/hijyen-belgesi", { user: user });
});
router.get("/iletisim", async (req, res, next) => {
  const user = await getUser(req);
  res.render("pages/iletisim", { user: user });
});
router.get("/basvuru", async (req, res, next) => {
  const user = await getUser(req);
  res.render("pages/basvuru", { user: user });
});
router.get("/post-id/:postid", urlParser, async (req, res) => {
  const user = await getUser(req);

  pool.getConnection(function (err, connection) {
    connection.query(`SELECT * FROM blogPosts`, function (err, rows) {
      connection.release();
      if (err) throw err;
      let results = Object.values(JSON.parse(JSON.stringify(rows)));
      let post = results.find((el) => req.params.postid == el.id);

      res.render("pages/blog-post-details", { data: post, user });
    });
  });
});
router.get("/blog", async (req, res) => {
  const user = await getUser(req);

  pool.getConnection(function (err, connection) {
    connection.query(`SELECT * FROM blogPosts`, function (err, rows) {
      connection.release();
      if (err) throw err;
      const results = Object.values(JSON.parse(JSON.stringify(rows)));
      res.render("pages/blog", { data: results, user });
    });
  });
});
router.get("/sinav", async (req, res, next) => {
  const user = await getUser(req);
  res.render("pages/sinav", { user: user });
});
router.get("/sss", async (req, res, next) => {
  const user = await getUser(req);
  res.render("pages/sss", { user: user });
});
router.get("/logout", function (req, res, next) {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.redirect("/");
});

router.route("/").get(async (req, res, next) => {
  const user = await getUser(req);
  res.render("home", { user: user });
});

module.exports = router;
