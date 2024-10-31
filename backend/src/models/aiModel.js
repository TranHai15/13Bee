require("dotenv").config();
const aiModel = {
  getAIResponse: async (message) => {
    try {
      console.log("Đang gửi tin nhắn:", message); // Log tin nhắn đang được gửi

      const res = await fetch(process.env.PAST__Al, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (res.ok) {
        console.log("Gửi tin nhắn đến AI thành công");
        return res;
      } else {
        console.error("Gửi đến AI không thành công:", res.statusText);
        return {
          message: "Gửi đến AI không thành công",
        };
      }
    } catch (error) {
      console.error("Lỗi xảy ra khi gửi dữ liệu đến AI:", error);
      return {
        message: "Có lỗi xảy ra khi gửi dữ liệu đến AI",
      };
    }
  },
};

module.exports = aiModel;
