const aiModel = require("../models/aiModel");

const aiController = {
  processMessage: async (message) => {
    const { idSocket, ...data } = message;
    console.log("idSocket", idSocket);
    try {
      const response = await aiModel.getAIResponse(message);
      console.log("Response status:", response.ok); // Log status
      if (response.ok) {
        const data = await response.json();
        // console.log("Data received:", data); // Log data
        return data;
      }
      const errorData = {
        role: "answer",
        content: "Có lỗi xảy ra, vui lòng thử lại sau.",
        idSocket: idSocket,
        can_answer: false,
      };
      return errorData;
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu đến AI", error);
      return [
        { role: "answer", content: "Có lỗi xảy ra, vui lòng thử lại sau." },
      ];
    }
  },
};

module.exports = aiController;
