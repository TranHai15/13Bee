import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { refreshAccessToken } from "../../api";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
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
      }, 500000);
    }

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
      localStorage.removeItem("roomId");
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

      {isLoggedIn ? (
        <div className="relative">
          {/* Biểu tượng hình ảnh */}
          <div className="ml-auto mr-9 cursor-pointer" onClick={toggleDropdown}>
            <img src="../../../src/assets/Filter.svg" alt="Filter" />
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 bg-white p-2 shadow-lg rounded-md w-40">
              <button
                onClick={logoutUser}
                className="w-full text-left text-red-500 hover:text-red-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        ""
      )}
    </header>
  );
}
