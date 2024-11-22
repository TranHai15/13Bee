import { useState, useEffect } from "react";

export default function Sirbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true); // Nếu có accessToken thì coi như đã đăng nhập
    }
  }, []);

  return (
    <div className="sirbar flex-1 h-screen relative shadow-md your-element overflow-y-auto relative ">
      <aside className="w-full flex-col shadow-md ">
        <div className="flex justify-between items-center px-4 py-[0.85rem] sticky top-0 left-0 ring-0 sirbar z-20">
          <div>
            <img
              className="w-5 object-contain"
              src="../../../src/assets/coles.svg"
            />
          </div>
          <div>
            <img
              className="w-5 object-contain"
              src="../../../src/assets/add.svg"
            />
          </div>
        </div>

        {isLoggedIn && (
          <div className="flex flex-col-reverse">
            <ul className="py-8 ">
              <li className="px-4 cursor-pointer hover:bg-slate-400 rounded-sm py-2 mt-1 text-sm font-medium">
                Xử lý SSE và dữ liệu
              </li>
            </ul>
          </div>
        )}

        {!isLoggedIn && (
          <button className=" absolute bottom-2 left-2 right-2 px-5 py-3 font-bold text-white bg-emerald-500 rounded-md m-4 btn-login">
            <a className="content-login" href="/login">
              Đăng nhập
            </a>
          </button>
        )}
      </aside>
    </div>
  );
}
