const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config(); // Đọc biến môi trường từ file .env

const app = express();
// Phục vụ các tệp tĩnh trong thư mục img
app.use("/img", express.static(path.join(__dirname, "../img")));
// Sử dụng cors
app.use(cookieParser()); // cookie
app.use(
  cors({
    origin: "http://localhost:5173", // Đảm bảo đúng domain của frontend
    methods: "GET,PUT,POST,DELETE",
    credentials: true, // Quan trọng: cho phép cookie được gửi đi
  })
);

// Sử dụng middleware cho JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoter"); // Sửa lỗi chính tả ở đây
const dataRouter = require("./routes/dataRoutes");

app.get("/", (req, res) => {
  console.log("cookei", req.cookies); // In tất cả các cookies
  res.send("Hello, world!");
});

// Sử dụng authRouter cho các route bắt đầu bằng /auth
app.use("/auth", authRouter);
// Sử dụng userRouter cho các route bắt đầu bằng /user
app.use("/user", userRouter);
// Sử dụng dataRouter cho các route bắt đầu bằng /api
app.use("/api", dataRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
