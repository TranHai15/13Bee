// router dieu huong admin

// import express và sử dụng Router
const express = require("express");
const router = express.Router(); // Tạo đối tượng router
const middlewares = require("../middlewares/authenticateToken");

// import file controller/authController
const userController = require("../controllers/userController");
//  lay toan bo nguoi dung
router.get("/", middlewares.verifyTokenAdmin, userController.getAllusers);
// xoa nguoi dung
router.delete(
  "/delete/:id",
  middlewares.verifyToken,
  userController.deleteUser
);
// dieu huong bat dang nhap
router.get("/lichsu", middlewares.verifyToken);
module.exports = router;
