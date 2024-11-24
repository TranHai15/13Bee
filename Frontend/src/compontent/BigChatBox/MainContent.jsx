import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";

export default function MainContent() {
  const [message, setMessage] = useState("");
  const [MessageChat, SetMessagesChat] = useState([]);
  const [charLimitReached, setCharLimitReached] = useState(false);
  const [connectionError, setConnectionError] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [roomId, setRoomId] = useState(""); // Quản lý roomId trong state
  const charLimit = 500;
  const start = useRef(true);
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isReplying, setIsReplying] = useState(false);
  const [streamData, setStreamData] = useState("");

  // Khi load trang, kiểm tra hoặc tạo roomId
  useEffect(() => {
    let storedRoomId = localStorage.getItem("roomId");
    if (!storedRoomId) {
      // Tạo roomId mới nếu chưa có
      storedRoomId = `room_${Date.now()}`;
      localStorage.setItem("roomId", storedRoomId);
    }
    setRoomId(storedRoomId); // Cập nhật roomId vào state
  }, []);

  // Kiểm tra và gọi API lấy lịch sử chat
  useEffect(() => {
    const oldRoomId = localStorage.getItem("oldRoomId");

    // Chỉ gọi API nếu oldRoomId tồn tại và bằng roomId
    if (oldRoomId && oldRoomId === roomId) {
      fetchChatHistory(oldRoomId);
    }
  }, [roomId]);

  const fetchChatHistory = async (roomId) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3000/user/historyChat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accessToken: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id: roomId }),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi lấy lịch sử chat");
      }

      const chatData = await response.json();
      console.log("chatData", chatData);
      // Cập nhật MessageChat với lịch sử chat lấy được
      SetMessagesChat(chatData.getChat || []);
      localStorage.removeItem("oldRoomId");
      start.current = false;
    } catch (error) {
      console.error("Lỗi khi gọi API lịch sử chat:", error);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setCharLimitReached(message.length >= charLimit);
  }, [message]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [MessageChat]);

  // useEffect(() => {
  //   if (isReplying) {
  //     const lastMessage = MessageChat.at(-1);
  //     if (lastMessage?.role === "answer" && lastMessage?.content) {
  //       luuAl(roomId); // Lưu câu trả lời vào database với roomId
  //     }
  //     setIsReplying(false);
  //   }
  // }, [isReplying, MessageChat]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const clickEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitMessage();
    }
  };

  const validateInput = (input) => {
    return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";
  };

  const submitMessage = async () => {
    start.current = false;
    if (isSending) return;

    const dataMessage = validateInput(message);
    if (!dataMessage) return;

    // Thêm tin nhắn của người dùng vào state
    SetMessagesChat((prev) => [
      ...prev,
      { role: "user", content: dataMessage },
    ]);
    setMessage("");
    setIsSending(true);

    try {
      const response = await fetch(
        "https://2bd9-2405-4802-17a4-cfa0-adcd-45f7-a2a3-9936.ngrok-free.app",
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
      let aiResponse = "";

      // Đọc luồng dữ liệu từ API AI
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[START]") continue;
            if (data === "[DONE]") break;

            // Cập nhật state với luồng dữ liệu AI
            flushSync(() => {
              aiResponse += data;
              SetMessagesChat((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage?.role === "answer") {
                  return [
                    ...prevMessages.slice(0, -1),
                    { ...lastMessage, content: lastMessage.content + data },
                  ];
                }
                return [...prevMessages, { role: "answer", content: data }];
              });
            });
          }
        }
      }
      setIsSending(false);
      // Sau khi AI trả lời hoàn tất, lưu cả tin nhắn người dùng và AI vào database
      if (aiResponse) {
        await inserMessageUser(roomId, { role: "user", content: dataMessage });
        await inserMessageUser(roomId, { role: "answer", content: aiResponse });
      }

      setIsReplying(true);
    } catch (error) {
      console.error("Error:", error);
      setIsSending(false);
    }
  };

  const inserMessageUser = async (room, message) => {
    const accessToken = localStorage.getItem("accessToken");
    const id = localStorage.getItem("id");

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`http://localhost:3000/user/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accessToken: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ room: room, message: message, id: id }),
        });

        if (response.ok) {
          // console.log(response);
          const title = await response.json();
          console.log(title);
          console.log("Message saved successfully!");
          return;
        }
      } catch (error) {
        console.error("Retrying... Error:", error);
      }
    }
    console.error("Failed to save message after 3 attempts.");
  };

  return (
    <main className="w-full  mx-auto h-svh  flex flex-col px-28 noidung  ">
      <div className="w-full  relative p-5 flex-grow overflow-auto  your-element mt-9 mb-5">
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
              <p className="flex-auto w-full max-w-3xl h-auto text-black ml-2 text-4xl font-extrabold text-hello">
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
                <div className="loading-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
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
          start.current == true ? "absolute  top-1/2 left-32 right-32 " : ""
        } `}
      >
        {charLimitReached && (
          <p className="text-red-500 ml-5 mb-2 mt-2">
            Bạn đã đạt giới hạn ký tự tối đa!
          </p>
        )}

        <div className="flex items-center sticky right-0 left-0 bottom-3 items-end  bg-white rounded-3xl mx-2 input-nhaplieu">
          <div className="flex-[19] ">
            <textarea
              ref={textareaRef}
              className=" your-element w-full max-h-32 h-full py-[0.6rem] pl-5 rounded-3xl resize-none outline-none  input-nhaplieu py-[0.6rem] "
              rows={1}
              placeholder="Send Messages..."
              value={message}
              onChange={handleInputChange}
              onKeyDown={clickEnter}
              // maxLength={500}
            />
          </div>
          <div className="flex items-center justify-center h-full flex-1">
            <button type="submit" onClick={submitMessage} className=" h-10 p-1">
              {isSending === false ? (
                <img
                  className="w-9 object-contain"
                  src="../../../src/assets/svg-submit.svg"
                />
              ) : (
                <img
                  className="logo w-9 object-contain"
                  src="../../../src/assets/loaing.svg"
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
