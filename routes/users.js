var express = require("express");
var mysql = require("mysql");
const uniqid = require("uniqid");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getData, logout } = require("./db");
const { pool } = require("./db");

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
/* const pool = mysql.createPool({
  connectionLimit: 10, // default = 10
  socketPath:"/MAMP/tmp/mysql/mysql.sock",
  host: "localhost",
  user: "root",
  password: "root",
  database: "hijyen",
  multipleStatements: true,
  debug: false,
}); */
/* const pool = mysql.createPool({
  connectionLimit: 10, // default = 10
  host: "34.134.249.238",
  user: "root",
  password: "hijyenakademi",
  database: "hijyen-akademi",
  multipleStatements: true,
  debug: false,
}); */

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

//middlewares
//sign up - kayıt olma
router.use("/users/create", urlParser, async function (req, res, next) {
  try {
    req.body.userPassword = await bcrypt.hash(req.body.userPassword, 12);
    next();
  } catch (err) {
    next();
  }
});
router.post("/users/create", urlParser, function (req, res) {
  try {
    pool.getConnection(function (err, connection) {
      var sql = `INSERT INTO users (userName, userMail, userNumber, userPassword) VALUES ("${req.body.userName}","${req.body.userMail}","${req.body.userNumber}","${req.body.userPassword}")`;
      connection.query(sql, function (err, rows) {
        connection.release();
        if (err) throw err;
        res.redirect("/");
      });
    });
  } catch (err) {
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
    return res.status(401).json({ status:'fail',message:'sifre ve email alanı doldurulmalıdır'});
  }

  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM users where (userMail='${email}')`,
      async function (err, rows) {
        try {
          connection.release();
          if (err) throw err;
          if (!rows[0]) {
            return res.status(401).json({ status:'fail',message:'hatalı email'});
          }
          let results = Object.values(JSON.parse(JSON.stringify(rows)));
          if (!(await correctPassword(password, results[0]?.userPassword))) {
            return res.status(401).json({ status:'fail',message:'hatalı sifre'});
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
        
          res.status(200).json(
            {
              status:'success',
              message:"Başarıyla Giriş Yapıldı"
            }
          );
        } catch (err) {
          res.status(401).json({
            status: "fail",
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
const calcScore = async (req) => {
  let data = await getData(req, `SELECT answer FROM sorular`, pool);
  let userAnswers = req.params.sonuc;
  let answers = "";
  data.map((el) => (answers += el.answer));
  let score = 0;
  for (let i = 0; i < answers.length - 1; i++) {
    if (answers[i] == userAnswers[i]) {
      score++;
    }
  }
  const userScore = (score * 100) / (answers.length * 1);
  return userScore;
};

router.get("/sinav-sonuc/:sonuc", async (req, res) => {
  const user = await getUser(req);
  let userScore;
  pool.getConnection(async (err, connection) => {
    userScore = await calcScore(req);
    connection.query(
      `UPDATE users SET score='${userScore}' WHERE userMail='${user.userMail}'`,
      function (err, rows) {
        if (err) throw err;
        res.render("messages/score-message", {
          userScore,
        });
      }
    );
  });
});
/* simple pages */
router.get('/exam/start/',async (req,res,next)=>{
  const user = await getUser(req);
  const questions = await getData(
    req,
    "select soru, optionA, optionB, optionC, optionD from sorular",
    pool
  );

  res.render("pages/questions", {
    user: user,
    questions: JSON.stringify(questions),
  });
})
router.get("/exam/questions", async (req, res, next) => {
  //kullanıcı giriş yapmıştır.
  if (!req.cookies.jwt) {
    res.status(400).json({ status:'fail',message:'No permission to enter exam'});
  }
  res.status(200).json({ status:'success',});

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
router.get("/logout", logout);

router.route("/").get(async (req, res, next) => {
  const user = await getUser(req);
  res.render("home", { user: user });
});

module.exports = router;

// sınav sorularını çekme
