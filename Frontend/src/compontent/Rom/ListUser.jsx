import { useEffect, useState } from "react";
import axios from "axios";

export default function ListUser() {
  const [dataUser, setDataUser] = useState([]); // Dữ liệu người dùng gốc
  const [searchText, setSearchText] = useState(""); // Giá trị input tìm kiếm
  const [detailUser, setDetailUser] = useState(null); // Dữ liệu chi tiết của tài khoản
  const [filteredChats, setFilteredChats] = useState([]); // Lọc chat
  const [startDate, setStartDate] = useState(""); // Ngày bắt đầu
  const [endDate, setEndDate] = useState(""); // Ngày kết thúc
  const [chatSearchText, setChatSearchText] = useState(""); // Tìm kiếm trong chat
  const [ChetMessage, setChetMessage] = useState(null); // Tìm kiếm trong chat
  const [namse, setname] = useState("");
  const [emalis, setemail] = useState("");

  // Gọi API để lấy danh sách người dùng
  const callDatauser = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.get("http://localhost:3000/user/", {
        headers: {
          accessToken: `Bearer ${accessToken}`, // Gửi token qua header
        },
      });
      if (response.data) {
        const normalizedData = response.data.map((user) => ({
          ...user,
          normalizedUsername: user.username.replace(/\s+/g, "").toLowerCase(),
        }));
        setDataUser(normalizedData);
      } else {
        console.log("Không có dữ liệu người dùng.");
      }
    } catch (error) {
      console.log(
        error.response ? error.response.data : "Không có phản hồi từ server"
      );
    }
  };

  // Lọc dữ liệu dựa trên tên đã chuẩn hóa
  const filteredUsers = dataUser.filter((user) =>
    user.normalizedUsername.includes(
      searchText.replace(/\s+/g, "").toLowerCase()
    )
  );

  // Lấy dữ liệu chi tiết của tài khoản
  const fetchDetailUser = async (accountId) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.get(
        `http://localhost:3000/user/oneData/${accountId}`,
        {
          headers: {
            accessToken: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data) {
        setDetailUser(response.data);
        // name = response.data.getChat[0].username;
        // email = response.data.getChat[0].email;
        // console.log(name);
        setFilteredChats(response.data.getChat); // Lưu lịch sử chat gốc
        // console.log(filteredChats);
      } else {
        console.log("Không có dữ liệu chi tiết cho tài khoản này.");
      }
    } catch (error) {
      console.log(
        error.response ? error.response.data : "Không có phản hồi từ server"
      );
    }
  };

  const handleDetailClick = (accountId) => {
    fetchDetailUser(accountId);
  };

  const chitietcap3 = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.get(
        `http://localhost:3000/user/oneDataadmin/${id}`,
        {
          headers: {
            accessToken: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data) {
        // alert("thanh cong");
        setChetMessage(response.data.getChat);
        // setFilteredChats(response.data.getChat); // Lưu lịch sử chat gốc
      } else {
        console.log("Không có dữ liệu chi tiết cho tài khoản này.");
      }
    } catch (error) {
      console.log(
        error.response ? error.response.data : "Không có phản hồi từ server"
      );
    }
  };
  console.log(detailUser);
  // Lọc chat theo ngày và nội dung
  useEffect(() => {
    if (detailUser?.getChat) {
      const filtered = detailUser.getChat.filter((chat) => {
        const chatDate = new Date(chat.create_at);
        const isWithinDateRange =
          (!startDate || chatDate >= new Date(startDate)) &&
          (!endDate || chatDate <= new Date(endDate));
        const matchesSearchText = chat.chat_title
          .toLowerCase()
          .includes(chatSearchText.toLowerCase());
        return isWithinDateRange && matchesSearchText;
      });
      setFilteredChats(filtered);
    }
  }, [startDate, endDate, chatSearchText, detailUser]);

  useEffect(() => {
    callDatauser();
  }, []);
  console.log(detailUser);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6"> Danh sách người dùng</h1>

      {/* Hiển thị danh sách người dùng hoặc thông tin chi tiết */}
      {detailUser ? (
        <div>
          <button
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 mb-4"
            onClick={() => setDetailUser(null)} // Trở lại danh sách người dùng
          >
            Quay lại
          </button>

          <div className="p-4 border border-gray-300 rounded shadow-lg">
            <h2 className="text-lg font-bold">Thông tin chi tiết</h2>
            <p>
              <strong>Tên:</strong> {namse}
            </p>
            <p>
              <strong>Email:</strong> {emalis}
            </p>

            {/* Bộ lọc lịch sử chat */}
            <div className="mt-4">
              <h3 className="text-md font-bold mb-2">Lọc lịch sử chat</h3>
              <div className="flex gap-4 mb-4">
                <input
                  type="date"
                  className="border border-gray-300 px-3 py-2 rounded"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="border border-gray-300 px-3 py-2 rounded"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <input
                  type="text"
                  className="border border-gray-300 px-3 py-2 rounded flex-1"
                  placeholder="Tìm kiếm nội dung chat..."
                  value={chatSearchText}
                  onChange={(e) => setChatSearchText(e.target.value)}
                />
              </div>
            </div>

            {/* Danh sách lịch sử chat */}
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="px-4 py-2 border border-gray-300">STT</th>
                    <th className="px-4 py-2 border border-gray-300">
                      Nội dung
                    </th>
                    <th className="px-4 py-2 border border-gray-300">
                      Ngày tạo
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChats.length > 0 ? (
                    filteredChats.map((chat, index) => (
                      <tr
                        key={chat.chat_id}
                        className="odd:bg-white even:bg-gray-100 hover:bg-blue-50"
                      >
                        <td className="px-4 py-2 border border-gray-300">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          {chat.chat_title}
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          {new Date(chat.create_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => chitietcap3(chat.chat_id)}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-2 text-center border border-gray-300 text-gray-500 italic"
                      >
                        Không có lịch sử chat phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {ChetMessage && (
              <div>
                <h1 className="my-8 text-2xl font-bold ">Lịch sử đoạn chat</h1>
                {ChetMessage.map((text, index) => (
                  <div key={index}>
                    <div
                      className={`w-full flex min-h-8 mb-4 mt-3 ${
                        text.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {text.role === "answer" && (
                        <div className="w-8 h-auto top-0 relative">
                          <span className="logo flex-none w-8 absolute top-0 rounded-full">
                            <img
                              className="w-full rounded-full object-contain"
                              src="../../../src/assets/beeit.jpg"
                            />
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <p
                          className={`flex-auto w-full max-w-3xl h-auto ${
                            text.role === "user"
                              ? "bg-[#fefefe] font-sans rounded-lg text-black p-3"
                              : "text-black ml-2"
                          }`}
                          style={{
                            overflowWrap: "break-word", // Ngăn nội dung tràn ra
                            wordBreak: "break-word", // Tự động xuống dòng
                          }}
                        >
                          {text.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="p-4">
            <input
              type="text"
              className="border border-gray-300 px-3 py-2 rounded w-full"
              placeholder="Tìm kiếm theo tên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto p-4">
            <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-4 py-2 border border-gray-300">STT</th>
                  <th className="px-4 py-2 border border-gray-300">Name</th>
                  <th className="px-4 py-2 border border-gray-300">Email</th>
                  <th className="px-4 py-2 border border-gray-300">Chat</th>
                  <th className="px-4 py-2 border border-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.account_id}
                      className="odd:bg-white even:bg-gray-100 hover:bg-blue-50"
                    >
                      <td className="px-4 py-2 border border-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        {user.username}
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        {user.email}
                      </td>
                      <td className="px-4 py-2 border border-gray-300">
                        {user.chat_title}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-center">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          onClick={() => {
                            handleDetailClick(user.account_id);
                            setname(user.username);
                            setemail(user.email);
                          }}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-2 text-center border border-gray-300 text-gray-500 italic"
                    >
                      Không có người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
