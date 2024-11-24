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
      // console.log("useer", dataAllUser);
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
  getAllChat: async (req, res) => {
    try {
      const idUser = req.params.id; // Lấy id từ req.params thay vì req.body
      // console.log(idUser);
      if (!idUser) {
        return res.status(400).json("ID người dùng là bắt buộc."); // Kiểm tra ID
      }

      const getChat = await User.getAllChat(idUser);
      // console.log("message: Lay thành công");
      return res.status(200).json({ getChat });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi lay lich su chat", error: error.message });
    }
  },
  getAllTopCauhoi: async (req, res) => {
    try {
      const getChatTop = await User.getAllTopQuesun();
      // console.log("message: Lay thành công");
      return res.status(200).json({ getChatTop });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi lay top su chat", error: error.message });
    }
  },
  getAllChatAdmin: async (req, res) => {
    try {
      const idUser = req.params.id;

      console.log(idUser);
      if (!idUser) {
        return res.status(400).json("ID chat là bắt buộc."); // Kiểm tra ID
      }

      const getChat = await User.getAllChatByidChat_id(idUser);
      // console.log("message: Lay thành công");
      return res.status(200).json({ getChat });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi lay lich su chat chi tiet",
        error: error.message,
      });
    }
  },
  getOneChat: async (req, res) => {
    try {
      const idUser = req.params.id; // Lấy id từ req.params thay vì req.body
      // console.log(idUser);
      if (!idUser) {
        return res.status(400).json("ID người dùng là bắt buộc."); // Kiểm tra ID
      }

      const getChat = await User.getAllChat(idUser);
      // console.log("message: Lay thành công");
      return res.status(200).json({ getChat });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi lay lich su chat", error: error.message });
    }
  },

  insertMessageChat: async (req, res) => {
    try {
      const { room, message, id } = req.body;
      const role = message.role;
      const title = message.content;
      const now = new Date();
      console.log({ role: role, title: title, room: room });
      // Kiểm tra phòng có tồn tại không
      const roomExists = await User.checkRoomExists(room);

      if (roomExists) {
        // Nếu phòng tồn tại, thêm tin nhắn vào bảng chi tiết
        const insertOneChat = await User.inssertOnechat(room, role, title, now);
        return res.status(200).json({
          success: true,
          message: "Đã thêm tin nhắn vào phòng hiện có",
          data: insertOneChat,
          title: title,
        });
      } else {
        // Nếu phòng chưa tồn tại, tạo phòng mới và thêm tin nhắn
        const createRoom = await User.insertMessage(room, id, title, now); // Đảm bảo hàm insertMessage được định nghĩa
        if (createRoom) {
          const insertOneChat = await User.inssertOnechat(
            room,
            role,
            title,
            now
          );

          return res.status(200).json({
            success: true,
            message: "Phòng mới đã được tạo và tin nhắn đã được thêm",
            data: insertOneChat,
            title: title,
          });
        } else {
          return res.status(500).json({
            success: false,
            message: "Không thể tạo phòng mới",
          });
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy lịch sử chat",
        error: error.message,
      });
    }
  },
  getAllChatByIdRoom: async (req, res) => {
    try {
      const idUser = req.body.id;
      console.log(idUser);
      if (!idUser) {
        return res.status(400).json("ID chat là bắt buộc."); // Kiểm tra ID
      }

      const getChat = await User.getAllChatByidChat_id(idUser);
      // console.log("message: Lay thành công");
      return res.status(200).json({ getChat });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi lay lich su chat chi tiet",
        error: error.message,
      });
    }
  },
};

module.exports = dataUser;
