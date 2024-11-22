import { useState, useEffect } from "react";
import { Header, ListUser } from "../index";
export default function AdminChatHistory() {
  const [searchTerm, setSearchTerm] = useState(""); // Lưu giá trị tìm kiếm
  const [chatHistories, setChatHistories] = useState([
    {
      id: 1,
      user: "Trần Văn Hải",
      message: "Hello, how are you?",
      date: "2024-11-22",
    },
    {
      id: 2,
      user: "Đỗ Xuân Bằng",
      message: "Can you help me?",
      date: "2024-11-21",
    },
    { id: 3, user: "Lê Văn Thắng", message: "Thank you!", date: "2024-11-20" },
  ]);

  // Lọc danh sách lịch sử chat theo từ khóa tìm kiếm
  const filteredChats = chatHistories.filter((chat) =>
    chat.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="h-14">
        <Header />
      </div>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-1/5 bg-gray-800 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold px-4 py-4">Admin Panel</h2>
            <ul>
              <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                Quản lý lịch sử chat
              </li>
              <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                Quản lý người dùng
              </li>
              <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                Cài đặt
              </li>
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Quản lý lịch sử chat</h1>
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="rounded-lg px-4 py-2 border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </header>

          {/* Chat history content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <ListUser />
            {filteredChats.length > 0 ? (
              <table className="min-w-full bg-white shadow-md rounded-md">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="text-left px-4 py-2">Người dùng</th>
                    <th className="text-left px-4 py-2">Tin nhắn</th>
                    <th className="text-left px-4 py-2">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChats.map((chat) => (
                    <tr key={chat.id} className="border-t hover:bg-gray-100">
                      <td className="px-4 py-2">{chat.user}</td>
                      <td className="px-4 py-2">{chat.message}</td>
                      <td className="px-4 py-2">{chat.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">
                Không có lịch sử chat nào phù hợp.
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
