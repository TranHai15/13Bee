// # Xử lý API từ AI và lưu dữ liệu vào MySQL
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const MachDien = require("../models/Data");
const fs = require("fs");
const path = require("path");

const dataController = {
  uplodeImg: async (req, res) => {
    // Đường dẫn tới thư mục img
    const imgDir = path.join(__dirname, "../../img"); // Đường dẫn tới thư mục img

    // Kiểm tra và tạo thư mục img nếu nó không tồn tại
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir);
    }

    const base64Data = req.body.file;
    // Giải mã Base64
    const buffer = Buffer.from(base64Data, "base64");

    // Tạo tên tệp duy nhất (có thể sử dụng thời gian hoặc UUID)
    const fileName = `image_${Date.now()}.png`;
    const filePath = path.join(imgDir, fileName); // Đường dẫn tới thư mục img

    // Lưu tệp vào thư mục
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error("Có lỗi khi lưu tệp:", err);
        return res.status(500).json({ message: "Lỗi khi lưu tệp" });
      }

      // Trả về đường dẫn tệp đã lưu (đảm bảo đường dẫn có thể truy cập từ frontend)
      res.json({
        message: "Tệp đã được lưu thành công",
        filePath: `http://localhost:3000/img/${fileName}`, // Đảm bảo đường dẫn có thể truy cập từ frontend
      });
    });
  },

  // lay api tu al tra ve
  callApi: async (req, res) => {
    console.log(req.body);
    // chỗ này nó sẽ lấy dữ liệu mik gửi lên
    const { anh_mach, so_loi, bao_cao, ngay_them, id } = req.body.data;
    // đoạn if này nó kiểm tra xem dữ liệu có rỗng ko
    if (!anh_mach || !so_loi || !bao_cao || !id || !ngay_them) {
      return res
        .status(400)
        .json("Loi khong co du lieu gui tu frontend len api Al");
    }
    console.log("anh mach", anh_mach);
    console.log("so_loi", so_loi);
    console.log("bao_cao", bao_cao);
    console.log("id", id);
    console.log("ngay_them", ngay_them);
    // nếu ko rỗng thì nó sẽ gọi hàm insertMach và mik truyền các tham số dữ liệu vào
    try {
      // insert vao database
      const checkInsert = await MachDien.insertMach(
        anh_mach,
        so_loi,
        bao_cao,
        ngay_them,
        id
      );
      //   console.log("Thực hiện truy vấn SQL:", insert);
      // if này để kiêm tra xem insert vào dattabase có thành công hay ko nếu thành coogn nó trả về 200 và thêm thông tin insert vào databasse
      if (checkInsert) {
        res.status(200).json({
          message: "Thêm vào database thành công!",
          anh_mach,
          so_loi,
          bao_cao,
          ngay_them,
          id,
        });
      } else {
        res.status(500).json("Không thể them dữ liệu vào database");
      }
    } catch (error) {
      res.status(500).json("Đã xảy ra lỗi API.");
    }
  },
  // lấy toàn bộ dữ liệu
  getAllData: async (req, res) => {
    const id = req.params.id;
    console.log("id", id);
    if (!id) {
      return res.status(400).json("Không có id để lấy dữ liệu");
    }

    try {
      const dataApi = await MachDien.getMachByUserId(id);

      // Kiểm tra nếu dataApi là mảng trống
      if (!dataApi || dataApi.length === 0) {
        return res.status(200).json({
          message: "Không có dữ liệu nào cho người dùng này",
          data: [],
        });
      }

      // Nếu có dữ liệu, trả về dữ liệu
      return res.status(200).json({
        message: "Lấy dữ liệu thành công",
        data: dataApi,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Đã xảy ra lỗi khi lấy dữ liệu",
        error: error.message,
      });
    }
  },

  // lay mach du theo id mach va id nguoi dung

  getIdWhereMach: async (req, res) => {
    const { id, id_mach } = req.body.data;
    // console.log(" i ", id, "          id_mach", id_mach);
    // Kiểm tra nếu dataApi là mảng trống
    if (!id || !id_mach) {
      return res.status(402).json({
        message: "Khong Nhan dc id gui id mach gui len",
        data: [],
      });
    }

    try {
      const laydata = await MachDien.getMachById(id_mach, id);
      if (laydata) {
        return res.status(200).json({ id, id_mach, laydata });
      } else {
        return res.status(402).json("loi truy van ko lay dc du lieu mach");
      }
    } catch (error) {
      console.log("loi id mach", error);
      return res.status(500).json("loi khong ther lay id va id mach");
    }
  },
};

module.exports = dataController;
