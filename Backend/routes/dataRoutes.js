// # Route CRUD dữ liệu
// import express và sử dụng Router
const express = require("express");
const router = express.Router(); // Tạo đối tượng router
const middlewares = require("../middlewares/authenticateToken");

// import file controller/authController
const dataController = require("../controllers/dataController");
//  lay api du lieu
router.post("/callApi", dataController.callApi);
// lay toan bo du lieu cua mot nguoi dung
router.post("/takeApi/:id", dataController.getAllData);
// uploade hinh anh
router.post("/upload", dataController.uplodeImg);
// lay mot mach chi tiet dua theo id
router.post("/takemach", dataController.getIdWhereMach);

module.exports = router;
