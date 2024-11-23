const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authController = {
  // Phương thức tạo tài khoản
  registerUser: async (req, res) => {
    const { username, email, password } = req.body.data;

    if (!username || !email || !password) {
      return res.status(400).json("Tên, email và mật khẩu là bắt buộc.");
    }

    try {
      const emailExists = await User.checkEmailExists(email);
      if (emailExists) {
        return res.status(400).json("Email đã được sử dụng.");
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const userId = await User.insertUser(username, hashedPassword, email, 0);
      // console.log(userId);
      if (userId) {
        res
          .status(200)
          .json({ message: "Người dùng đã được thêm thành công!", userId });
      } else {
        res.status(500).json("Không thể thêm người dùng.");
      }
    } catch (error) {
      res.status(500).json("Đã xảy ra lỗi.");
    }
  },

  // Tạo access token
  createAccessToken: (user) => {
    return jwt.sign(
      { id: user.id, role: user.role_id },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "60000s" }
    );
  },

  // Tạo refresh token
  createRefreshToken: (user) => {
    return jwt.sign(
      { id: user.id, role: user.role_id },
      process.env.JWT_REFRESH_TOKEN,
      { expiresIn: "365d" }
    );
  },

  // Phương thức đăng nhập
  loginUser: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Email và mật khẩu là bắt buộc.");
    }

    try {
      const user = await User.checkEmailExists(email, true);
      if (!user) {
        return res.status(400).json("Email không tồn tại.");
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json("Mật khẩu sai");
      }

      const session = await User.getSessionByUserId(user.id, true);
      let accessToken, refreshToken;

      if (session.length > 0) {
        accessToken = authController.createAccessToken(user);
        refreshToken = session[0].refresh_token;
      } else {
        accessToken = authController.createAccessToken(user);
        refreshToken = authController.createRefreshToken(user);
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await User.insertSession(user.id, accessToken, refreshToken, expiresAt);
      }
      // console.log("accetoken", accessToken);
      // res.cookie("refreshToken", refreshToken, {
      //   secure: false,
      //   path: "/",
      //   sameSite: "Strict",
      // });
      const { password: pwd, ...userData } = user;
      // console.log({ userData, accessToken, refreshToken });
      res.status(200).json({ userData, accessToken, refreshToken });
    } catch (error) {
      res.status(500).json("Đã xảy ra lỗi khi đăng nhập");
    }
  },

  // Refresh token
  requestRefreshToken: async (req, res) => {
    const refreshToken = req.body.refreshToken;
    // console.log(req.body);
    // console.log("message", refreshToken);
    if (!refreshToken) {
      return res.status(401).json("Bạn chưa đăng nhập.");
    }

    try {
      const session = await User.getSessionByUserId(req.body.id, true);
      const tokenExists = session[0]?.refresh_token === refreshToken;

      if (!tokenExists) {
        return res.status(403).json("Token này không phải là của tôi");
      }

      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN,
        async (error, user) => {
          if (error) {
            return res.status(403).json("Refresh token không hợp lệ");
          }

          const newAccessToken = authController.createAccessToken(user);
          const newRefreshToken = authController.createRefreshToken(user);
          await User.updateRefreshToken(user.id, newRefreshToken);
          // res.cookie("refreshToken", newRefreshToken, {
          //   httpOnly: true,
          //   secure: false,
          //   path: "/",
          //   sameSite: "strict",
          // });
          res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
        }
      );
    } catch (error) {
      res.status(500).json("Đã xảy ra lỗi khi yêu cầu refresh token");
    }
  },

  // Logout
  userLogout: async (req, res) => {
    // console.log(req);
    // console.log(req.body);
    await User.deleteSession(req.body.id);
    res.clearCookie("refreshToken");
    res.status(200).json("Đăng xuất thành công.");
  },
};

module.exports = authController;
