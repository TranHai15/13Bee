import Header from "./Header";
import MainContent from "./MainContent";
import Sirbar from "./Sirbar";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Content() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chat, setChat] = useState([]); // Đặt tên biến đồng bộ viết thường

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true); // Nếu có accessToken thì coi như đã đăng nhập
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchChat();
    }
  }, [isLoggedIn]);
  const fetchChat = async () => {
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("accessToken");
    if (!id) {
      console.error("Không tìm thấy ID.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3000/user/chat/${id}`,
        {
          headers: {
            accessToken: `Bearer ${token}`, // Sửa từ "Baber" thành "Bearer"
          },
        }
      );
      console.log("Dữ liệu nhận được:", response.data);

      // Gán dữ liệu từ getChat
      const chats = response.data.getChat;
      setChat(Array.isArray(chats) ? chats : []); // Kiểm tra và chỉ gán nếu là mảng
    } catch (error) {
      console.error("Lấy dữ liệu chat thất bại:", error);
    }
  };

  return (
    <div className="flex w-full">
      {/* Sidebar */}
      <Sirbar dataChat={chat} />
      {/* Main */}
      <div className="flex-[5] relative">
        <div className="w-full">
          <Header />
        </div>
        <div className="bg-custom-gray h-auto">
          <MainContent />
        </div>
      </div>
    </div>
  );
}
