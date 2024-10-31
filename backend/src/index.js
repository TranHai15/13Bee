const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const Router = require("./routes/aiRouter");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép mọi nguồn
    methods: ["GET", "POST"], // Chỉ cho phép GET và POST
  },
});
app.get("/", (req, res) => {
  res.send("hello");
});

// Middleware
app.use(cors());

// Hàm giả lập xử lý tin nhắn (có thể được tối ưu hơn)
async function processMessage(message, idSocket) {
  const dataMessage = {
    idSocket: idSocket,

    messages: [
      { role: "system", content: "Bạn là một trợ lí ảo." },
      ...message,
    ],
  };

  const data = await Router.SendAl(dataMessage);
  return [data];
}

// Sử dụng một biến để theo dõi số lượng người dùng kết nối
let connectedUsers = 0;

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(
    `Người dùng đã kết nối: ${socket.id}. Tổng số người dùng kết nối: ${connectedUsers}`
  );

  socket.on("sendMessage", async (message) => {
    // Đánh dấu là async
    console.log(`Tin nhắn nhận được từ client: id = ${socket.id}`);

    const responseMessage = await processMessage(message, socket.id); // Sử dụng await
    console.log("responsMessage", responseMessage);

    setTimeout(() => {
      socket.emit("receiveMessage", responseMessage);
    }, 100);
  });

  socket.on("disconnect", () => {
    connectedUsers--;
    console.log(
      `Người dùng đã ngắt kết nối: ${socket.id}. Tổng số người dùng còn lại: ${connectedUsers}`
    );
  });
});

// Khởi động server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server đang chạy trên http://localhost:${PORT}`);
});
