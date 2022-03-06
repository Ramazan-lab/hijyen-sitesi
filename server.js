const app = require("./app");

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log("Server is runnning on port 3000");
});
