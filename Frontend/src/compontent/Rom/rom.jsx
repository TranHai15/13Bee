import { useState, useRef, useEffect } from "react";
import io from "socket.io-client";

// Kết nối đến server WebSocket
const socket = io("https://2f1a-118-70-118-224.ngrok-free.app");

export default function ChatApp() {
  const [message, setMessage] = useState(""); // Nội dung tin nhắn
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn
  const [charLimitReached, setCharLimitReached] = useState(false); // Kiểm tra giới hạn ký tự
  const [isConnected, setIsConnected] = useState(false); // Trạng thái kết nối
  const [isSending, setIsSending] = useState(false); // Trạng thái gửi tin nhắn
  const charLimit = 500; // Giới hạn ký tự
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null); // Cuộn đến cuối

  // Tự động focus vào textarea và điều chỉnh chiều cao
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }

    setCharLimitReached(message.length >= charLimit);
  }, [message]);

  // Tự động cuộn xuống dưới khi có tin nhắn mới
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Kết nối và xử lý sự kiện WebSocket
  useEffect(() => {
    const handleConnect = () => {
      console.log("Kết nối thành công");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Mất kết nối");
      setIsConnected(false);
    };

    const handleReceiveMessage = (data) => {
      console.log("Nhận được phản hồi từ server:", data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "answer", content: data.content },
      ]);
      setIsSending(false); // Kích hoạt lại gửi tin nhắn
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receive_message", handleReceiveMessage);

    // Cleanup sự kiện khi unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  // Xử lý thay đổi nội dung tin nhắn
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Xử lý gửi tin nhắn khi nhấn Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  // Gửi tin nhắn
  const submitMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage === "" || isSending) return;

    const userMessage = {
      socketId: socket.id, // Thêm socket.id vào payload
      messages: [
        { role: "system", content: "Bạn là một trợ lí ảo." },
        { role: "user", content: trimmedMessage },
      ],
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: trimmedMessage },
    ]); // Hiển thị tin nhắn của user ngay lập tức
    setMessage(""); // Xóa nội dung textarea
    setIsSending(true); // Tạm dừng gửi tin nhắn khác

    socket.emit("send_message", userMessage, (response) => {
      console.log("Phản hồi từ server sau khi gửi:", response);
    });
  };

  return (
    <div>
      {/* Header */}
      <header className="w-full h-12 bg-white fixed top-0 z-30 shadow-md flex justify-between items-center px-5">
        <h1 className="text-2xl font-bold">13Bee Chat</h1>
        <span
          className={`text-sm font-medium ${
            isConnected ? "text-green-600" : "text-red-600"
          }`}
        >
          {isConnected ? "Đã kết nối" : "Mất kết nối"}
        </span>
      </header>

      {/* Chat Container */}
      <div className="flex flex-col h-screen pt-16 px-5">
        {/* Danh sách tin nhắn */}
        <div className="flex-grow overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "answer" && (
                <img
                  src="../../../src/assets/beeit.jpg"
                  alt="Bot Avatar"
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                className={`p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
                style={{ maxWidth: "70%", wordBreak: "break-word" }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Nhập tin nhắn */}
        <div className="mt-4">
          {charLimitReached && (
            <p className="text-red-500 text-sm mb-2">
              Bạn đã đạt giới hạn ký tự tối đa!
            </p>
          )}
          <div className="flex items-center bg-white rounded-lg shadow p-2">
            <textarea
              ref={textareaRef}
              className="flex-grow resize-none border-none outline-none px-3 py-2 rounded-lg"
              rows={1}
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button
              className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={submitMessage}
              disabled={isSending}
            >
              {isSending ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
