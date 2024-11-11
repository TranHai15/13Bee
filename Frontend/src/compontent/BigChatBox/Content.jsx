import { useState, useRef, useEffect } from "react";
import io from "socket.io-client";

// Kết nối đến server Socket.IO
const socket = io("http://localhost:3000"); // Địa chỉ của server Socket.IO

export default function Content() {
  const [message, setMessage] = useState(""); // Khởi tạo message trống
  const [charLimitReached, setCharLimitReached] = useState(false); // Trạng thái cho thông báo
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null); // Tham chiếu đến phần cuối cùng của danh sách tin nhắn
  const [active, setActive] = useState("true");
  const [MessageChat, SetMessagesChat] = useState([]);
  const charLimit = 500; // Giới hạn số ký tự
  useEffect(() => {
    const textarea = textareaRef.current;

    // Điều chỉnh chiều cao của textarea khi message thay đổi
    if (textarea) {
      textarea.style.height = "auto"; // Reset chiều cao
      textarea.style.height = textarea.scrollHeight + "px"; // Điều chỉnh chiều cao dựa trên nội dung
      textarea.scrollTop = textarea.scrollHeight; // Tự động cuộn lên
    }

    // Kiểm tra xem người dùng đã đạt đến giới hạn ký tự hay chưa
    if (message.length >= charLimit) {
      setCharLimitReached(true);
    } else {
      setCharLimitReached(false);
    }
  }, [message]);
  // Log MessageChat sau mỗi lần cập nhật
  useEffect(() => {
    console.log("Updated MessageChat:", MessageChat);
  }, [MessageChat]);

  useEffect(() => {
    // Tự động cuộn xuống dưới cùng mỗi khi có sự thay đổi trong MessageChat
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [MessageChat]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  function validateInput(input) {
    const trimmedInput = input.trim().replace(/\s+/g, " ");

    if (trimmedInput === "") {
      return "";
    }
    const sanitizedInput = trimmedInput
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return sanitizedInput;
  }
  const submitMessage = () => {
    const dataMessage = validateInput(message);
    console.log(dataMessage);
    if (dataMessage === "") {
      return;
    } else {
      if (dataMessage) {
        // Tạo đối tượng tin nhắn
        const newMessage = { role: "user", content: dataMessage };

        // Cập nhật trạng thái với hàm callback
        SetMessagesChat((oldMessages) => {
          const updatedMessages = [...oldMessages, newMessage];

          // Gửi tin nhắn hiện tại lên server ngay sau khi trạng thái được cập nhật
          socket.emit("sendMessage", updatedMessages); // gửi `updatedMessages` nếu cần

          return updatedMessages; // trả về mảng tin nhắn đã cập nhật
        });

        setMessage(""); // Xóa tin nhắn sau khi gửi
        setActive("false");
      }
    }
  };

  // Nhận tin nhắn từ server
  useEffect(() => {
    const handleReceiveMessage = (res) => {
      console.log("res", res);
      // const da = res;
      // console.log(da);
      // const data = [res];
      // console.log("data", data);
      if (res.can_answer === false) {
        SetMessagesChat((oldMessages) => [
          ...oldMessages,
          ...res.map((answer) => ({
            role: "answer",
            content: answer.content,
          })),
        ]);
        setActive("true");
      } else {
        //   // Lấy tất cả các object có role là "answer"
        const answers = res.filter((item) => item.role === "answer");
        // console.log("answers", answers);
        // // Kiểm tra xem có dữ liệu trả về không
        if (answers.length > 0) {
          SetMessagesChat((oldMessages) => [
            ...oldMessages,
            ...answers.map((answer) => ({
              role: "answer",
              content: answer.content,
            })), // Thêm tất cả answers vào messages
          ]);
        }
        //   // Cập nhật active state
        setActive("true");
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    // Dọn dẹp sự kiện khi component unmount
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

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
            <div className="flex items-center h-9 mt-3">
              <div className="w-8 h-auto top-0 logo">
                <span className="logo flex-none w-8 rounded-full">
                  <img
                    className="w-full rounded-full object-contain"
                    src="../../../src/assets/beeit.jpg"
                  />
                </span>
              </div>
              <div className="flex items-center">
                <p className="flex-auto w-full max-w-3xl h-auto text-black ml-2">
                  Xin chào, tôi có thể giúp gì được cho bạn?
                </p>
              </div>
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

                {active === "false" && index === MessageChat.length - 1 ? (
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
          <div className="mb-5">
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
                  // maxLength={500}
                />
              </div>
              <button
                onClick={submitMessage}
                className="w-8 flex-none absolute right-3 bottom-[7px]"
              >
                {active === "true" ? (
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
