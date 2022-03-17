import axios from "axios";
import { showAlert } from "./message";
//httpOnly -> cookie silinemez,upda edilemez anlamına gelir.
export const login = async ({ email, password,url,assign }) => {
  try {
    const res = await axios({
      method: "POST",
      url,
      data: {
        email: email,
        password: password,
      },
    });  
    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully");
      window.setTimeout(() => {
        location.assign(assign);
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert("error","Hata!", err.response.data.message);
  }
};

/* export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/logout",
    });
    if (res.data.status === "success") {
      location.reload(true); //
    }
  } catch (err) {
    showAlert("error", "Error logging out! Try again.");
  }
};
 */