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
      console.log(response.data);
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

  useEffect(() => {
    callDatauser();
  }, []);

  return (
    <div>
      <h1>Danh sách người dùng</h1>
      <ul>
        {dataUser.length > 0 ? (
          dataUser.map((user, index) => (
            <li key={index}>{user.username}</li> // Giả sử mỗi user có thuộc tính `name`
          ))
        ) : (
          <p>Không có người dùng nào.</p>
        )}
      </ul>
    </div>
  );
}
