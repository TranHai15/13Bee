const refreshAccessToken = async () => {
  const id = localStorage.getItem("id");
  if (!id) {
    console.error("ID is missing in localStorage");
    return;
  }
  const cookies = document.cookie; // Tất cả cookies của trang hiện tại
  console.log(cookies);
  try {
    const response = await fetch("http://localhost:3000/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
      credentials: "include", // Thêm credentials: "include" để gửi cookie
    });

    if (!response.ok) {
      console.error(`Failed to refresh token: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken); // Lưu token mới
      console.log("Access token refreshed:", data.accessToken);
    } else {
      console.error("Failed to refresh access token");
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};

export { refreshAccessToken };
