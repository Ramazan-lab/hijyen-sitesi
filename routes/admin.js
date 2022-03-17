var express = require("express");
const uniqid = require("uniqid");
var router = express.Router();
var mysql = require("mysql");
const { pool, getUser } = require("./db");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bodyParser = require("body-parser");
const { getData, getCount, logout } = require("./db");
const urlParser = bodyParser.urlencoded({ extended: false });
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
/* Protecting all admin routes */
const protectedURLs = [
  "/admin/users",
  "/admin/dashboard",
  "/admin/sinavi-gecenler",
  "/admin/online-basvurular",
  "/admin/iletisime-gecenler",
  "/admin/blog-posts",
  "/admin/blog-posts/:id",
  "/admin/edit-post/",
  "/admin/create-post",
  "/admin/create-post",
];
router.use(protectedURLs, async (req, res, next) => {
  if (!req.cookies?.jwt) {
    res.redirect("/");
  }
  let result = await promisify(jwt.verify)(req.cookies.jwt, "ABCDEFG123456");
  const adminData = await getData(
    req,
    `select (role) from admin where email='${result.email}'`,
    pool
  );
  if (adminData[0].role != "admin") {
    res.redirect("/");
  }
  next();
});

router.get("/admin", (req, res) => {
  res.render("admin/admin-login");
});

router.post("/admin", urlParser, async (req, res) => {
  const { email, password } = req.body;
  //if email-password exist
  if (!email || !password) {
    return res.status(404).json({ message: "Email veya password yok!" });
  }

  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM admin where (email='${email}')`,
      async function (err, rows) {
        try {
          connection.release();
          if (err) throw err;
          if (!rows[0]) {
            return res.status(401).json({
              message: "Bu email ait hesap bulunamadı.",
              status: "failed",
            });
          }
          let results = Object.values(JSON.parse(JSON.stringify(rows)));
          console.log(results[0].password,password);
          let isCorrect=results[0].password== password;
          if (!isCorrect) {
            return res.status(401).json({
              message: "UYARI!",
              status: "Şifre yanlış, tekrar deneyin",
            });
          }
          //if everthing is ok, send token to client
          const currentUser = {
            email,
            password,
          };

          res.locals.user = currentUser;
          createSendToken(req.body, 200, req, res);
          res.redirect("admin/dashboard");
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

router.get("/admin/dashboard", async (req, res, next) => {
  const users = await getData(req, "SELECT * FROM users", pool);
  const onlineBasvurular = await getCount(
    req,
    "SELECT COUNT(*) FROM onlineBasvurular",
    pool
  );
  const istekBekleyenler = await getCount(
    req,
    "SELECT COUNT(*) FROM siziArayalim",
    pool
  );
  const sertifikaAlanlar = [];
  users.map((user) =>
    user.sertifika == 1 ? sertifikaAlanlar.push(user) : undefined
  );

  let userCount = users.length;
  let data = {
    userCount,
    sertifikaAlanlar: sertifikaAlanlar.length,
    onlineBasvurular: onlineBasvurular[0],
    istekBekleyenler: istekBekleyenler[0],
  };

  res.render("admin/admin-dashboard", { data });
});
router.get("/admin/users", async (req, res, next) => {
  const users = await getData(req, "Select * from users", pool);
  res.render("admin/admin-users", { users });
});
router.get("/admin/sinavi-gecenler", async (req, res, next) => {
  const users = await getData(req, "Select * from users where score>=60", pool);
  res.render("admin/admin-sinavi-gecenler", { users });
});
router.get("/admin/online-basvurular", async (req, res, next) => {
  const users = await getData(req, "Select * from onlineBasvurular", pool);
  res.render("admin/admin-online-basvurular", { users });
});
router.get("/admin/iletisime-gecenler", async (req, res, next) => {
  const users = await getData(req, "Select * from siziArayalim", pool);
  res.render("admin/admin-iletisime-gecenler", { users });
});
router.get("/admin/blog-posts", async (req, res, next) => {
  const posts = await getData(req, "Select * from blogPosts", pool);
  res.render("admin/admin-blog-post-listele.ejs", { posts });
});
router.get("/admin/blog-posts/:id", async (req, res, next) => {
  const deleted = await getData(
    req,
    `DELETE FROM blogPosts where id='${req.params.id}'`,
    pool
  );
  res.redirect("/admin/blog-posts");
});
router.get("/admin/edit-post/", urlParser, async (req, res, next) => {
  res.render("admin/admin-blog-edit-post");
});
router.post("/admin/create-post", urlParser, async (req, res, next) => {
  const { title, shortDesc, longDesc } = req.body;
  const postImage = "/images/blog4.jpeg";
  const createdAt = Date.now();
  query = `INSERT INTO blogPosts (id, title, shortDesc, longDesc, postImage, createdAt) VALUES ('${uniqid()}','${title}','${shortDesc}','${longDesc}','${postImage}',${createdAt})`;

  const result = await getData(req, query, pool);
  res.render("admin/admin-blog-edit-post");
});

router.get("/admin/logout", logout);
module.exports = router;
