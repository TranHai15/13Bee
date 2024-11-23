import { useEffect, useState } from "react";
import axios from "axios";

export default function ListUser() {
  const [dataUser, setDataUser] = useState([]);

  const callDatauser = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.get("http://localhost:3000/user/", {
        headers: {
          accessToken: `Bearer ${accessToken}`, // Gửi token qua header
        },
      });
      // Kiểm tra nếu có dataAllUser
      // console.log(response.data);
      if (response.data) {
        setDataUser(response.data); // Lưu dữ liệu vào state
      } else {
        console.log("Không có dữ liệu người dùng.");
      }
    } catch (error) {
      console.log(
        error.response ? error.response.data : "Không có phản hồi từ server"
      );
    }
  };
  function chuyentrang() {}
  useEffect(() => {
    callDatauser();
  }, []);

  return (
    <div>
      <h1>Danh sách người dùng</h1>
      <div className="overflow-x-auto p-4">
        <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 border border-gray-300 text-left">
                STT
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Name
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Chat
              </th>

              <th className="px-4 py-2 border border-gray-300 text-left">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {dataUser.length > 0 ? (
              dataUser.map((user, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-100 hover:bg-blue-50"
                >
                  <td className="px-4 py-2 border border-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {user.username}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {user.chat_title}
                  </td>

                  <td className="px-4 py-2 border border-gray-300 text-center">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={chuyentrang}
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
  );
}
