var mysql = require("mysql");
const jwt = require("jsonwebtoken");

exports.pool = mysql.createPool({
  connectionLimit: 10, // default = 10
  host: "localhost",
  user: "root",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock", //path to mysql sock in MAMP
  password: "root",
  database: "hijyen",
  multipleStatements: true,
  debug: false,
});

exports.getData = async (req, query, pool) => {
  if (req.cookies.jwt) {
    return new Promise((resolve) => {
      pool.getConnection(function (err, connection) {
        connection.query(query, function (err, rows) {
          connection.release();
          if (err) throw err;
          let data = Object.values(JSON.parse(JSON.stringify(rows)));
          resolve(data);
        });
      });
    });
  }
};

exports.getCount = async (req, query, pool) => {
  if (req.cookies.jwt) {
    return new Promise((resolve) => {
      pool.getConnection(function (err, connection) {
        connection.query(query, function (err, rows) {
          connection.release();
          if (err) throw err;
          var result = Object.values(JSON.parse(JSON.stringify(rows))[0]);
          resolve(result);
        });
      });
    });
  }
};
exports.getUser = async (req, pool) => {
  if (req.cookies.jwt) {
    return new Promise((resolve) => {
      let result = jwt.verify(req.cookies.jwt, "ABCDEFG123456");
      pool.getConnection(function (err, connection) {
        connection.query(
          `SELECT * FROM users where (email='${result.email}')`,
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

exports.logout = (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.redirect("/");
};
