import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { refreshAccessToken } from "../../api";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true); // Nếu có accessToken thì coi như đã đăng nhập
    }
  }, []);

  // Tự động làm mới token sau 55 giây
  useEffect(() => {
    let intervalId;
    if (isLoggedIn) {
      intervalId = setInterval(() => {
        refreshAccessToken();
      }, 55000);
    }
    let i = 0;
    console.log(i);
    i++;
    return () => clearInterval(intervalId); // Dọn dẹp interval khi component unmount
  }, [isLoggedIn]);

  const logoutUser = async () => {
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
          accessToken: `Baber ${token}`,
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
    <header className="h-12 right-0 -left-0 header absolute top-0 z-30 shadow-md flex justify-between items-center">
      <span className="ml-[3%] block xl:hidden">
        <img
          className="w-5 object-cover"
          src="../../../src/assets/mobile-menu.svg"
        />
      </span>
      <div className="text-3xl font-extrabold  flex-col  px-9 logo-title">
        <a href="/" className="cursor-pointer">
          13Bee
        </a>
      </div>
      <div className="ml-auto mr-9">
        <img src="../../../src/assets/Filter.svg" />
      </div>
      {isLoggedIn ? (
        <button
          onClick={logoutUser}
          className="bg-red-300 text-xl p-2 rounded-lg font-medium hover:bg-red-500 transition-all"
        >
          Sign Out
        </button>
      ) : (
        <div>
          <a
            href="/login"
            className="bg-red-300 text-xl p-2 rounded-lg font-medium hover:bg-red-500 transition-all"
          >
            Log In
          </a>
          <a
            href="/signup"
            className="bg-red-300 text-xl p-2 rounded-lg font-medium hover:bg-red-500 transition-all ml-3"
          >
            Sign Up
          </a>
        </div>
      )}
    </header>
  );
}
