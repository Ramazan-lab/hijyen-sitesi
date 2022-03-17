import "@babel/polyfill";

import { login } from "./login";
import { signup } from "./signup";
import { enterExam } from "./sinav";

const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const signExam=document.querySelector("#signExam");
const adminForm=document.getElementById("form-admin-login");

if (signupForm) {
    document.querySelector("#signupForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const userName = document.querySelector("#userName").value;
      const userMail = document.querySelector("#userMail").value;
      const userNumber = document.querySelector("#userNumber").value;
      const userPassword = document.querySelector("#userPassword").value;
      signup({userName, userMail,userNumber,userPassword});
    });
  }
  if (loginForm) {
    document.querySelector("#loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      console.log(email,password);
      const url="/users/login";
      const assign="/";
      login({ email, password,url,assign });
    });
  }

if(signExam){
  signExam.addEventListener('click',enterExam);
}

if(adminForm){
  adminForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const email = document.getElementById("adEmail").value;
    const password = document.getElementById("adPass").value;
    const url="/admin";
    const assign="/";
    login({ email, password,url,assign });

  })
}