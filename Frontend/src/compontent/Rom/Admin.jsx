import { Header, ListUser } from "../index";

import AdminChatHistory from "./rom";
import ViewChat from "./ViewChat";
import { useState } from "react";

export default function AdminHome() {
  const [page, setPage] = useState("chatHistory"); // Mặc định là trang AdminChatHistory

  const handlePageChange = (pageName) => {
    setPage(pageName); // Cập nhật trang khi người dùng chọn mục mới
  };

  return (
    <div>
      <div className="h-12">
        <Header />
      </div>
      <div className="flex h-screen">
        <aside className="w-1/5 bg-gray-800 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold px-4 py-4">Admin Panel</h2>
            <ul>
              <li
                onClick={() => handlePageChange("chatHistory")} // Chuyển đến trang AdminChatHistory
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
              >
                Các câu hỏi hỏi nhiều nhất
              </li>
              <li
                onClick={() => handlePageChange("listUser")} // Chuyển đến trang ListUser
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
              >
                Quản lý người dùng
              </li>
              <li
                onClick={() => handlePageChange("settings")} // Chuyển đến trang Settings
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
              >
                Cài đặt
              </li>
            </ul>
          </div>
        </aside>
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {page === "chatHistory" && <AdminChatHistory />}
            {page === "listUser" && <ListUser />}
            {page === "settings" && <div>Settings Page Content</div>}

            {/* Chỉ hiển thị ViewChat nếu page không phải là một trong ba trang trên */}
            {!(
              page === "chatHistory" ||
              page === "listUser" ||
              page === "settings"
            ) && <ViewChat />}
          </main>
        </div>
      </div>
    </div>
  );
}
