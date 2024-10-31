const express = require("express");
const aiController = require("../controllers/aiController");

const router = express.Router();

// router.post("/a", async (req, res) => {
//   const message = req.body.message;
const Router = {
  SendAl: async (message) => {
    const response = await aiController.processMessage(message);
    return response;
  },
};
// res.json(response);
// });

module.exports = Router;
