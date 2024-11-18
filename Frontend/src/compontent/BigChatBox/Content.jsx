import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
export default function Content() {
  const [message, setMessage] = useState(""); // Lưu tin nhắn người dùng
  const [MessageChat, SetMessagesChat] = useState([]); // Lưu lịch sử tin nhắn
  const [charLimitReached, setCharLimitReached] = useState(false); // Kiểm tra giới hạn ký tự
  const [connectionError, setConnectionError] = useState(true); // Kiểm tra lỗi kết nối
  const [isSending, setIsSending] = useState(false); // Kiểm tra trạng thái gửi tin nhắn
  const charLimit = 500; // Giới hạn ký tự
  const start = useRef(true); // Biến kiểm tra trạng thái ban đầu của màn hình
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);
  const [streamData, setStreamData] = useState("");

  // Điều chỉnh chiều cao textarea khi người dùng nhập
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setCharLimitReached(message.length >= charLimit);
  }, [message]);

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
  const submitMessage = async () => {
    start.current = false;
    if (isSending) return;

    const dataMessage = validateInput(message);
    if (!dataMessage) return;

    SetMessagesChat((prev) => [
      ...prev,
      { role: "user", content: dataMessage },
    ]);
    setMessage("");
    setIsSending(true);

    try {
      const response = await fetch(
        "http://localhost:5000/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  'Bạn là một trợ lí ảo. Tên của bạn là 13Bee (Một Ba Bi). Bạn được sinh ra ngày 01/10/2024. Hãy chào hỏi một cách ngắn gọn và thân thiện, số điện thoại 0838 411 897. Nếu không biết thì trả lời là "Tôi không biết", đừng cố trả lời.',
              },
              ...MessageChat,
              { role: "user", content: dataMessage },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // Loại bỏ khoảng trắng và ký tự xuống dòng.
            if (data === "[START]") continue;
            if (data === "[DONE]") break;

            flushSync(() => {
              setStreamData((prev) => prev + data); // Ghép nối vào dữ liệu hiện có.
              SetMessagesChat((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage?.role === "answer") {
                  // Cập nhật nội dung tin nhắn cuối cùng.
                  return [
                    ...prevMessages.slice(0, -1),
                    { ...lastMessage, content: lastMessage.content + data },
                  ];
                }
                // Thêm tin nhắn mới nếu chưa có.
                return [...prevMessages, { role: "answer", content: data }];
              });
            });
            setIsSending(false);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // console.log("streamData", streamData);
  console.log("MessageChat", [...MessageChat]);
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
