const express=require('express');
const users=require('./routes/users');

const router=express.Router();
const app=express();
app.set('view engine', 'ejs');
//app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.use("/",users);


module.exports=app;