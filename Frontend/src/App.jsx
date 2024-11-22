// import { useEffect, useState } from "react"; // Thêm useState ở đây
import { Routes, Route, Navigate } from "react-router-dom";

import {
  Content,
  LoginPage,
  SignupPage,
  AdminChatHistory,
  ListUser,
} from "./compontent";

export default function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(true);

  // useEffect(() => {
  //   const token = localStorage.getItem("accessToken");
  //   setIsAuthenticated(!!token); // Kiểm tra xem người dùng đã đăng nhập hay chưa
  // }, []);
  return (
    <>
      <Routes>
        <Route path="/login" element=<LoginPage /> />
        <Route path="/admin" element=<AdminChatHistory /> />
        <Route path="/listUser" element=<ListUser /> />
        <Route path="/signup" element=<SignupPage /> />
        <Route path="/" element=<Content /> />
      </Routes>
    </>
  );
}
