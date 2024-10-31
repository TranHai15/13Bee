const aiModel = {
  getAIResponse: async (message) => {
    try {
      console.log("Đang gửi tin nhắn:", message); // Log tin nhắn đang được gửi

      const res = await fetch(
        "https://cb11-2405-4802-1bd4-8ce0-7dc1-5a6e-b0a4-4fcb.ngrok-free.app/api/data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        }
      );

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
