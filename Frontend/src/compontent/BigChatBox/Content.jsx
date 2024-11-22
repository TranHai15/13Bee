import Header from "./Header";
import MainContent from "./MainContent";
import Sirbar from "./Sirbar";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Content() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [Chat, setChat] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true); // Nếu có accessToken thì coi như đã đăng nhập
    }
  }, []);
  const callChat = async () => {
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("accessToken");
    if (!id) {
      console.error("Không tìm thấy id .");
      return;
    }

    try {
      const logoutResponse = await axios.post(
        "http://localhost:3000/auth/logout",
        {
          id: id,
        },
        {
          headers: {
            accessToken: `Baber ${token}`, // Gửi token qua header
          },
        }
      );

      console.log("Log Out Successfully:", logoutResponse.data);

      // Xóa token khỏi localStorage và cập nhật trạng thái đăng nhập
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("id");
      setIsLoggedIn(false);
      navigate("/"); // Điều hướng về trang chính

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Log Out Failed:", error);
    }
  };
  return (
    <div className="flex w-full ">
      {/* sibar */}
      <Sirbar />
      {/* main  */}
      <div className="flex-[5] relative">
        <div className="w-full">
          <Header />
        </div>
        <div className="bg-custom-gray   h-auto">
          <MainContent />
        </div>
      </div>
    </div>
  );
}
