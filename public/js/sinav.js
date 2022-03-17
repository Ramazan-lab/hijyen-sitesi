import axios from "axios";
import { showAlert } from "./message";

//httpOnly -> cookie silinemez,upda edilemez anlamına gelir.
export const enterExam = async () => {
  try {
    const res=await axios({
      method: "GET",
      url: "exam/questions"
    });
    if (res.data.status === "success") {
        showAlert("success", "Sınav", "Sınavınız başlamıştır, başarılar dileriz.");
        window.setTimeout(() => {
          location.assign("/exam/start/");
        }, 1500);
      }
  } catch (err) {
      console.log(err);
    showAlert("error", "HATA", "Sadece üyeler sınava girebilir.");
  }
};
