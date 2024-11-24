// router dieu huong admin

// import express và sử dụng Router
const express = require("express");
const router = express.Router(); // Tạo đối tượng router
const middlewares = require("../middlewares/authenticateToken");

// import file controller/authController
const userController = require("../controllers/userController");
//  lay toan bo nguoi dung
router.get("/", userController.getAllusers);

// lay lich su chat cua nguoi dung
router.get("/chat/:id", middlewares.verifyToken, userController.getAllChat);
router.get("/oneData/:id", userController.getOneChat);
router.get("/oneDataadmin/:id", userController.getAllChatAdmin);
router.post("/topquesun", userController.getAllTopCauhoi);
router.post("/historyChat", userController.getAllChatByIdRoom);
// them du lieu vao dataabse
router.post(
  "/send/",
  middlewares.verifyToken,
  userController.insertMessageChat
);

// xoa nguoi dung
router.delete(
  "/delete/:id",
  middlewares.verifyToken,
  userController.deleteUser
);
// dieu huong bat dang nhap
// router.get("/lichsu", middlewares.verifyToken);
module.exports = router;
