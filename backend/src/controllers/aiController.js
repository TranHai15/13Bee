const aiModel = require("../models/aiModel");

const aiController = {
  processMessage: async (message) => {
    try {
      const response = await aiModel.getAIResponse(message);
      console.log("Response status:", response.ok); // Log status
      if (response.ok) {
        const data = await response.json();
        // console.log("Data received:", data); // Log data
        return data;
      }
      return [{ type: "AI", text: "Có lỗi xảy ra, vui lòng thử lại sau." }];
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu đến AI", error);
      return [{ type: "AI", text: "Có lỗi xảy ra, vui lòng thử lại sau." }];
    }
  },
};

module.exports = aiController;
