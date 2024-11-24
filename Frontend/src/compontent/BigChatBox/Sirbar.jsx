import { useState, useEffect } from "react";

export default function Sirbar({ dataChat }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roomId, setRooID] = useState(null);
  const [lirooom, setLirooom] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      console.log("Dữ liệu từ Content:", dataChat); // In ra dữ liệu truyền từ Content
    }

    const newcaht = localStorage.getItem("newChat");
    setLirooom(newcaht);
    // localStorage.removeItem("newChat");
  }, [dataChat]); // Lắng nghe sự thay đổi của dataChat

  useEffect(() => {
    if (roomId !== null) {
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("oldRoomId", roomId);

      location.reload();
    }
  }, [roomId]);
  const addRoomId = () => {
    if (isLoggedIn) {
      localStorage.removeItem("roomId");
      localStorage.setItem("newChat", "New");
      location.reload();
    } else {
      location.reload();
    }
  };

  return (
    <div className="sirbar flex-1 h-screen relative shadow-md overflow-y-auto">
      <aside className="w-full flex-col shadow-md">
        <div className="flex justify-between items-center px-4 py-[0.85rem] sticky top-0 left-0 z-20">
          <div>
            <img
              className="w-5 object-contain"
              src="../../../src/assets/coles.svg"
              alt="Icon"
            />
          </div>
          <div>
            <span onClick={addRoomId}>
              {" "}
              <img
                className="w-5 object-contain"
                src="../../../src/assets/add.svg"
                alt="Add"
              />
            </span>
          </div>
        </div>

        {isLoggedIn && dataChat.length > 0 ? (
          <ul className="py-8">
            {lirooom && (
              <li className="px-4 cursor-pointer bg-slate-500 hover:bg-slate-400 rounded-sm py-2 mt-1 text-sm font-medium truncate max-w-xs">
                {lirooom}
              </li>
            )}
            {dataChat.map((item, index) => (
              <li
                onClick={() => setRooID(item.chat_id)}
                key={index}
                className="px-4 cursor-pointer hover:bg-slate-400 rounded-sm py-2 mt-1 text-sm font-medium truncate max-w-xs"
              >
                {item.chat_title || "No Title"} <br />
              </li>
            ))}
          </ul>
        ) : (
          isLoggedIn && (
            <p className="text-center py-4">Không có tin nhắn nào.</p>
          )
        )}

        {!isLoggedIn && (
          <button className="absolute bottom-2 left-2 right-2 px-5 py-3 font-bold text-white bg-emerald-500 rounded-md m-4">
            <a className="content-login" href="/login">
              Đăng nhập
            </a>
          </button>
        )}
      </aside>
    </div>
  );
}
