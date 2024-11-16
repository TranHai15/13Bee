import { useState, useRef, useEffect } from "react";
import io from "socket.io-client";

// URL của server Socket.IO
const SOCKET_URL = "https://0be1-118-70-118-224.ngrok-free.app";
const socket = io(SOCKET_URL);

export default function Content() {
  // Các state quản lý tin nhắn và trạng thái
  const [message, setMessage] = useState(""); // Lưu tin nhắn người dùng
  const [MessageChat, SetMessagesChat] = useState([]); // Lưu lịch sử tin nhắn
  const [tempMessage, setTempMessage] = useState(""); // Tin nhắn tạm thời của AI
  const [charLimitReached, setCharLimitReached] = useState(false); // Kiểm tra giới hạn ký tự
  const [connectionError, setConnectionError] = useState(true); // Kiểm tra lỗi kết nối
  const [isSending, setIsSending] = useState(false); // Kiểm tra trạng thái gửi tin nhắn
  const charLimit = 500; // Giới hạn ký tự cho tin nhắn
  const start = useRef(true); // Biến kiểm tra trạng thái ban đầu của màn hình

  // Tham chiếu đến các phần tử DOM
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);

  // Điều chỉnh chiều cao textarea khi người dùng nhập
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setCharLimitReached(message.length >= charLimit); // Kiểm tra nếu tin nhắn vượt quá giới hạn ký tự
  }, [message]);

  // Lắng nghe các tin nhắn từ server (gửi qua Socket.IO)
  useEffect(() => {
    const handleReceiveMessage = (res) => {
      if (!res || !res.content?.trim()) return;

      const isAnswer = res.role === "answer";

      if (isAnswer) {
        const chars = res.content.split(""); // Chia nội dung thành từng ký tự
        let index = 0;

        const typingEffect = setInterval(() => {
          if (index < chars.length) {
            setTempMessage((prev) => prev + chars[index]);
            index++;
          } else {
            clearInterval(typingEffect); // Dừng khi đã hiển thị hết
          }
        }, 50); // Tốc độ hiển thị (50ms mỗi ký tự)
      }

      if (res.done) {
        SetMessagesChat((prev) => [
          ...prev,
          { role: "answer", content: tempMessage },
        ]);
        setTempMessage("");
        setIsSending(false);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    socket.on("connect", () => {
      console.log("Đã kết nối tới server");
      setConnectionError(true); // Xóa lỗi kết nối
    });

    socket.on("connect_error", (error) => {
      console.error("Lỗi kết nối:", error);
      setConnectionError(false); // Đặt lỗi kết nối
    });

    socket.on("disconnect", () => {
      console.log("Mất kết nối tới server");
      setConnectionError(false); // Đặt lỗi khi mất kết nối
      alert("Kết nối bị gián đoạn!");
    });

    return () => {
      socket.off("receive_message", handleReceiveMessage); // Dọn dẹp khi component bị hủy
    };
  }, [tempMessage]);

  // console.log("message", tempMessage);
  // Tự động cuộn tới tin nhắn cuối cùng khi có tin nhắn mới
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [MessageChat]);

  // Xử lý khi người dùng nhập tin nhắn
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Gửi tin nhắn khi người dùng nhấn phím Enter
  const clickEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitMessage();
    }
  };

  // Kiểm tra tính hợp lệ của tin nhắn (ngăn chặn các thẻ HTML)
  const validateInput = (input) => {
    return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";
  };

  // Gửi tin nhắn đến server khi người dùng nhấn nút gửi
  const submitMessage = () => {
    start.current = false;
    if (isSending) return; // Nếu đang gửi tin nhắn, không gửi lại

    const dataMessage = validateInput(message); // Kiểm tra tin nhắn hợp lệ
    if (!dataMessage) return; // Nếu tin nhắn không hợp lệ, không gửi

    const userMessage = {
      idSocket: socket.id,
      messages: [
        {
          role: "system",
          content:
            "Bạn là một trợ lí ảo. Tên của bạn là 13Bee (Một Ba Bi). Bạn được sinh ra ngày 01/10/2024. Hãy chào hỏi một cách ngắn gọn và thân thiện, số điện thoại 0838 411 897",
        },
        { role: "user", content: dataMessage }, // Tin nhắn người dùng
      ],
    };

    console.log("user__message", userMessage);

    // Thêm tin nhắn người dùng vào lịch sử chat
    SetMessagesChat((prev) => [
      ...prev,
      { role: "user", content: dataMessage },
    ]);
    setMessage(""); // Xóa tin nhắn hiện tại
    setIsSending(true); // Đặt trạng thái gửi tin nhắn

    // Gửi tin nhắn đến server
    socket.emit("send_message", userMessage, (response) => {
      console.log("Phản hồi từ server:", response);
      setIsSending(false); // Đặt trạng thái gửi xong
    });
  };

  console.log("MessageChat", MessageChat);
  return (
    <div>
      <header className="w-full h-12 bg-white fixed top-0 z-30 shadow-md flex justify-between items-center">
        <span className="ml-[3%] block xl:hidden">
          <img
            className="w-5 object-cover"
            src="../../../src/assets/mobile-menu.svg"
          />
        </span>
        <div className=" ml-[19%]  text-3xl font-extrabold  hidden xl:flex flex-col logo ">
          13Bee
        </div>
        <div className=" mx-auto text-3xl font-extrabold  block xl:hidden  logo ">
          <span>13Bee</span>
        </div>
        <div className="mr-[3%]">
          <img src="../../../src/assets/Filter.svg" />
        </div>
      </header>
      <div className="flex justify-between bg-custom-gray   h-auto">
        {/* Sidebar bên phải (thời điểm chỉ hiển thị trên màn hình Detop) */}
        <div className=" bg-white w-[20%] min-w-[14rem] h-full relative hidden xl:block">
          <aside className="bg-white w-[17%] h-screen fixed z-40 top-0 left-0 hidden xl:flex flex-col justify-between">
            <div>{/* Nội dung khác của aside ở đây */}</div>
            <button className="flex justify-center px-4 py-2 text-white bg-emerald-500 rounded-md m-4">
              Đăng nhập
            </button>
          </aside>
        </div>

        <main className="w-11/12 xl:w-[60%] mx-auto h-svh  flex flex-col  ">
          <div className="w-full md:w-full relative p-5 flex-grow overflow-auto  your-element mt-9 mb-5">
            {/* Các tin nhắn */}
            <div
              className={`flex items-center  h-9 mt-3  flex flex-col text-center gap-3 mt-[14%] ${
                start.current == true ? "block" : "hidden"
              }`}
            >
              <div className="w-[4rem] h-auto top-0 logo">
                <span className="logo flex-none w-[4rem] rounded-full">
                  <img
                    className="w-full rounded-full object-contain"
                    src="../../../src/assets/beeit.jpg"
                  />
                </span>
              </div>
              {connectionError === true ? (
                <div className="flex items-center">
                  <p className="flex-auto w-full max-w-3xl h-auto text-black ml-2 text-4xl font-extrabold">
                    13Bee xin chào bạn
                  </p>
                </div>
              ) : (
                <div className="flex items-center">
                  <p className="flex-auto w-full max-w-3xl h-auto text-black ml-2 text-4xl font-extrabold">
                    Lỗi kết nối
                  </p>
                </div>
              )}
            </div>
            {/* tra loi  */}
            {MessageChat.map((text, index) => (
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
                <div>
                  <p>{tempMessage}</p>
                </div>
                {isSending === true && index === MessageChat.length - 1 ? (
                  <>
                    <div className="w-8 h-auto flex top-0 relative">
                      <span className="logo flex-none w-8 absolute top-0 rounded-full">
                        <img
                          className="w-full rounded-full object-contain"
                          src="../../../src/assets/beeit.jpg"
                        />
                      </span>
                    </div>
                    <>
                      <div className="loading-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </>
                  </>
                ) : (
                  " "
                )}
              </div>
            ))}
            <div ref={chatEndRef} /> {/* Tham chiếu đến phần cuối cùng */}
            {/* ket thuc donan tin nhan  */}
          </div>
          <div
            className={`mb-5  ${
              start.current == true ? "fixed top-1/2  w-3/5" : ""
            } `}
          >
            {charLimitReached && (
              <p className="text-red-500 ml-5 mb-2 mt-2">
                Bạn đã đạt giới hạn ký tự tối đa!
              </p>
            )}

            <div className="flex sticky right-0 left-0 bottom-3 items-end  bg-white rounded-3xl mx-2">
              <div className="w-[90%] bg-white rounded-3xl">
                <textarea
                  ref={textareaRef}
                  className=" your-element w-full max-h-32 h-full py-[0.6rem] pl-5 rounded-3xl resize-none outline-none"
                  rows={1}
                  placeholder="Send Messages..."
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={clickEnter}
                  // maxLength={500}
                />
              </div>
              <button
                type="submit"
                onClick={submitMessage}
                className="w-8 flex-none absolute right-3 bottom-[7px]"
              >
                {isSending === false ? (
                  <img src="../../../src/assets/svg-submit.svg" />
                ) : (
                  <img className="logo" src="../../../src/assets/loaing.svg" />
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
