const User = require("../models/User");

// Quản lý người dùng
const dataUser = {
  // Lấy toàn bộ người dùng
  getAllusers: async (req, res) => {
    try {
      const dataAllUser = await User.getUsers();

      if (!dataAllUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }
      console.log("useer", dataAllUser);
      return res.status(200).json(dataAllUser);
    } catch (error) {
      return res.status(500).json("Lỗi truy vấn dataUser");
    }
  },

  // Xóa người dùng
  deleteUser: async (req, res) => {
    try {
      const idUser = req.params.id; // Lấy id từ req.params thay vì req.body
      if (!idUser) {
        return res.status(400).json("ID người dùng là bắt buộc."); // Kiểm tra ID
      }

      const deleteCount = await User.delete(idUser); // Gọi hàm delete

      if (deleteCount > 0) {
        return res
          .status(200)
          .json({ message: "Xóa thành công", deletedCount: deleteCount });
      } else {
        return res.status(404).json("Không tìm thấy người dùng để xóa.");
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi xóa người dùng", error: error.message });
    }
  },
};

module.exports = dataUser;
