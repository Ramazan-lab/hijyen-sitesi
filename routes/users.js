var express = require("express");
var mysql = require("mysql");
const uniqid = require("uniqid");
const bodyParser = require("body-parser");
const { parse } = require("querystring");

var router = express.Router();
const urlParser = bodyParser.urlencoded({ extended: false });
/* 
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  //for Ramazan
  // password: "1234",
  //for Omer
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock", //path to mysql sock in MAMP
  password: "root",
  database: "hijyen",
  multipleStatements: true,
  debug: false,
}); */
var pool = mysql.createPool({
  connectionLimit: 10, // default = 10
  host: "localhost",
  user: "root",
  password: "root",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock", //path to mysql sock in MAMP
  password: "root",
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
router.post("/basvuru", function (req, res, next) {
  pool.getConnection(function (err, connection) {
    let {} = req.body;
    connection.query(
      `
    INSERT INTO onlineBasvurular (id,phone,email,ticari-unvan,adress,website) VALUES ()
    `,
      function (err, rows) {
        connection.release();
        if (err) throw err;
        res.render("message/success");
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
//
/* 
GETTING PAGES
*/
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
api = [
  {
    postId: 1,
    postTitle: "HİJYEN BELGESİ NEDİR ? KİMLER ALMALI ?",
    postImage: "/images/blog1.jpg",
    postText:
      "HİJYEN BELGESİ NEDİR ?   Hijyen belgesi nedir, nereden alınır? Sorusu hala aktüelliğini koruyor. Bu yazımızda hijyen sertifikası nedir, nereden alınır sorularını cevaplayacağız. Hijyen belgesi, insanların sağlığına zarar verecek ortamlarda alınan tedbirleri uygulamalı olarak gösteren hijyen eğitimi sonrası verilen belgedir. Hijyen sertifikası, ilgili bakanlık tarafından yayınlanan hijyen eğitimi yönetmeliğine göre zorunludur. Hijyen belgesi almak için 0552 479 94 53 numaralı telefondan.",
    postLongText:
      "Hijyen belgesi eğitiminde işlenecek konular;   Hastalıklar neden olan mikrop ve virüslerin özellikleri Ne şekilde bulaştıkları Hastalıklara yakalanma riskini azaltma önlemleri İşyeri sahiplerine uygulanan yasa Çalışanlara yönelik yasa Mikrop tanımı Mikrop çeşitleri Mikropların bulaşma yolları Hastalıkların Kaynakları Hastalıkların bulaşma yolları Enfeksiyon zinciri Sık görülen hastalıklar\n \n   Hijyen belgesi eğitimi, eğitim.Hijyen belgesi eğitiminde işlenecek konular;   Hastalıklar neden olan mikrop ve virüslerin özellikleri Ne şekilde bulaştıkları Hastalıklara yakalanma riskini azaltma önlemleri İşyeri sahiplerine uygulanan yasa Çalışanlara yönelik yasa Mikrop tanımı Mikrop çeşitleri Mikropların bulaşma yolları Hastalıkların Kaynakları Hastalıkların bulaşma yolları Enfeksiyon zinciri Sık görülen hastalıklar   Hijyen belgesi eğitimi, eğitim.Hijyen belgesi eğitiminde işlenecek konular;   Hastalıklar neden olan mikrop ve virüslerin özellikleri Ne şekilde bulaştıkları Hastalıklara yakalanma riskini azaltma önlemleri İşyeri sahiplerine uygulanan yasa Çalışanlara yönelik yasa Mikrop tanımı Mikrop çeşitleri Mikropların bulaşma yolları Hastalıkların Kaynakları Hastalıkların bulaşma yolları Enfeksiyon zinciri Sı",
  },
  {
    postId: 2,
    postTitle: "HİJYEN EĞİTİM İÇERİĞİNDE NELER VAR ?",
    postImage: "/images/blog2.jpg",
    postText:
      "Hijyen belgesi eğitiminde işlenecek konular;   Hastalıklar neden olan mikrop ve virüslerin özellikleri Ne şekilde bulaştıkları Hastalıklara yakalanma riskini azaltma önlemleri İşyeri sahiplerine uygulanan yasa Çalışanlara yönelik yasa Mikrop tanımı Mikrop çeşitleri Mikropların bulaşma yolları Hastalıkların Kaynakları Hastalıkların bulaşma yolları Enfeksiyon zinciri Sık görülen hastalıklar",
    postLongText:
      "Hijyen belgesi eğitiminde işlenecek konular;   Hastalıklar neden olan mikrop ve virüslerin özellikleri Ne şekilde bulaştıkları Hastalıklara yakalanma riskini azaltma önlemleri İşyeri sahiplerine uygulanan yasa Çalışanlara yönelik yasa Mikrop tanımı Mikrop çeşitleri Mikropların bulaşma yolları Hastalıkların Kaynakları Hastalıkların bulaşma yolları Enfeksiyon zinciri Sık görülen hastalıklar\n \n   Hijyen belgesi eğitimi, eğitim.Hijyen belgesi eğitiminde işlenecek konular;   Hastalıklar neden olan mikrop ve virüslerin özellikleri Ne şekilde bulaştıkları Hastalıklara yakalanma riskini azaltma önlemleri İşyeri sahiplerine uygulanan yasa Çalışanlara yönelik yasa Mikrop tanımı Mikrop çeşitleri Mikropların bulaşma yolları Hastalıkların Kaynakları Hastalıkların bulaşma yolları Enfeksiyon zinciri Sık görülen hastalıklar   Hijyen belgesi eğitimi, eğitim.Hijyen belgesi eğitiminde işlenecek konular;   Hastalıklar neden olan mikrop ve virüslerin özellikleri Ne şekilde bulaştıkları Hastalıklara yakalanma riskini azaltma önlemleri İşyeri sahiplerine uygulanan yasa Çalışanlara yönelik yasa Mikrop tanımı Mikrop çeşitleri Mikropların bulaşma yolları Hastalıkların Kaynakları Hastalıkların bulaşma yolları Enfeksiyon zinciri Sık görülen hastalıklar   Hijyen belgesi eğitimi, eğitim.",
  },
  {
    postId: 3,
    postTitle: "HİJYEN EĞİTİMİ NEDİR? NASIL OLMALIDIR?",
    postImage: "/images/blog3.jpg",
    postText:
      "Hijyen kelime anlamıyla, temiz, sağlıklı yaşam için alınan önlem ve uygulanan faaliyetlerin tamamıdır. Ayrıca ilgili bakanlık tarafından Resmi Gazete’de yayınlanan Hijyen Eğitimi Yönetmeliğine göre çalışan personelin, kendi ve halk sağlığını koruyacak şekilde hizmet vermeyi sağlamak için yapılan uygulamaların ve alınan temizlik önlemlerinin tamamıdır.",
    postLongText:
      "Hijyen kelime anlamıyla, temiz, sağlıklı yaşam için alınan önlem ve uygulanan faaliyetlerin tamamıdır. Ayrıca ilgili bakanlık tarafından Resmi Gazete’de yayınlanan Hijyen Eğitimi Yönetmeliğine göre çalışan personelin, kendi ve halk sağlığını koruyacak şekilde hizmet vermeyi sağlamak için yapılan uygulamaların ve alınan temizlik önlemlerinin tamamıdır. İlgili yönetmeliğe göre, başta yemekhaneler, restoranlar ve diğer benzeri gıda.Hijyen kelime anlamıyla, temiz, sağlıklı yaşam için alınan önlem ve uygulanan faaliyetlerin tamamıdır. Ayrıca ilgili bakanlık tarafından Resmi Gazete’de yayınlanan Hijyen Eğitimi Yönetmeliğine göre çalışan personelin, kendi ve halk sağlığını koruyacak şekilde hizmet vermeyi sağlamak için yapılan uygulamaların ve alınan temizlik önlemlerinin tamamıdır. İlgili yönetmeliğe göre, başta yemekhaneler, restoranlar ve diğer benzeri gıda.Hijyen kelime anlamıyla, temiz, sağlıklı yaşam için alınan önlem ve uygulanan faaliyetlerin tamamıdır. Ayrıca ilgili bakanlık tarafından Resmi Gazete’de yayınlanan Hijyen Eğitimi Yönetmeliğine göre çalışan personelin, kendi ve halk sağlığını koruyacak şekilde hizmet vermeyi sağlamak için yapılan uygulamaların ve alınan temizlik önlemlerinin tamamıdır. İlgili yönetmeliğe göre, başta yemekhaneler, restoranlar ve diğer benzeri gıda.",
  },
  {
    postId: 4,
    postTitle: "HİJYEN BELGESİ HANGİ İŞLETMELER İÇİN ZORUNLUDUR?",
    postImage: "/images/blog4.jpeg",
    postText:
      "Her şeyin başı sağlık, sağlık olsun gibi sözleri gündelik hayatımızda o kadar çok duyarız ki kendimiz de bir o kadar kullanırız. Çünkü gerçekten bu hayattaki belki de en önemli varlığımızdır. İnsanlar gençken varlık (mal- para) için sağlığını feda edercesine çalışır, sağlığını kaybedince ise tüm varlığını harcamaktan çekinmezmiş. Gerçekten de.",
    postLongText:
      "Her şeyin başı sağlık, sağlık olsun gibi sözleri gündelik hayatımızda o kadar çok duyarız ki kendimiz de bir o kadar kullanırız. Çünkü gerçekten bu hayattaki belki de en önemli varlığımızdır. İnsanlar gençken varlık (mal- para) için sağlığını feda edercesine çalışır, sağlığını kaybedince ise tüm varlığını harcamaktan çekinmezmiş. Gerçekten de.Her şeyin başı sağlık, sağlık olsun gibi sözleri gündelik hayatımızda o kadar çok duyarız ki kendimiz de bir o kadar kullanırız. Çünkü gerçekten bu hayattaki belki de en önemli varlığımızdır. İnsanlar gençken varlık (mal- para) için sağlığını feda edercesine çalışır, sağlığını kaybedince ise tüm varlığını harcamaktan çekinmezmiş. Gerçekten de.Her şeyin başı sağlık, sağlık olsun gibi sözleri gündelik hayatımızda o kadar çok duyarız ki kendimiz de bir o kadar kullanırız. Çünkü gerçekten bu hayattaki belki de en önemli varlığımızdır. İnsanlar gençken varlık (mal- para) için sağlığını feda edercesine çalışır, sağlığını kaybedince ise tüm varlığını harcamaktan çekinmezmiş. Gerçekten de.",
  },
];
router.get("/post-id/:postid", function (req, res) {
  let currData = api.find((post) => post.postId == req.params.postid);
  res.render("pages/blog-post-details", { data: currData });
});
router.get("/blog", function (req, res) {
  res.render("pages/blog", { data: api });
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
