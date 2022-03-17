import axios from "axios";
import { showAlert } from "./message";

//httpOnly -> cookie silinemez,upda edilemez anlamına gelir.
export const signup = async ({ userName,userMail, userNumber, userPassword }) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/users/create",
      data: {
        userName: userName,
        userMail: userMail,
        userNumber: userNumber,
        userPassword: userPassword,
      },
    });
    if (res.status === 200) {
      showAlert("success", "Kayıt", "Kayıt Başarıyla Oluşturuldu");
      window.setTimeout(() => {
        location.assign("/");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", "HATA", err.response.data.message);
  }
};
