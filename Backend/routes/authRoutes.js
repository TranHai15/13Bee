// Đăng kí và đăng nhập

const express = require("express");
const router = express.Router();
const middlewares = require("../middlewares/authenticateToken");
const authController = require("../controllers/authController");

// Định nghĩa route đăng ký người dùng
router.post("/register", authController.registerUser);

// Định nghĩa route đăng nhập
router.post("/login", authController.loginUser);

// Định nghĩa route để refresh token
router.post("/refresh", authController.requestRefreshToken);

// Định nghĩa route để logout
router.post("/logout", middlewares.verifyToken, authController.userLogout);

module.exports = router;
