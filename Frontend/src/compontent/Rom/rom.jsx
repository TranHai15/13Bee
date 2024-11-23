import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminChatHistory() {
  const [dataQuestion, setDataQuestion] = useState([]); // Dữ liệu câu hỏi
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [sortOrder, setSortOrder] = useState("desc"); // Sắp xếp theo số lượt hỏi (tăng/giảm dần)
  const [filterTimeRange, setFilterTimeRange] = useState("all"); // Lọc theo khoảng thời gian

  // Gọi API để lấy dữ liệu câu hỏi
  const callTopQuest = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        "http://localhost:3000/user/topquesun",
        {},
        {
          headers: {
            accessToken: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data) {
        setDataQuestion(response.data.getChatTop);
      } else {
        console.log("Không có dữ liệu câu hỏi.");
      }
    } catch (error) {
      console.log(
        error.response ? error.response.data : "Không có phản hồi từ server"
      );
    }
  };

  useEffect(() => {
    callTopQuest();
  }, []);

  // Lọc theo khoảng thời gian
  const filterByTimeRange = (questions) => {
    const now = new Date();
    return questions.filter((item) => {
      const createdAt = new Date(item.createAt);

      switch (filterTimeRange) {
        case "day":
          // Lọc theo ngày
          return now.toDateString() === createdAt.toDateString();
        case "week":
          // Lọc theo tuần
          const diffInDays = Math.floor(
            (now - createdAt) / (1000 * 60 * 60 * 24)
          );
          return diffInDays < 7;
        case "month":
          // Lọc theo tháng
          return (
            now.getMonth() === createdAt.getMonth() &&
            now.getFullYear() === createdAt.getFullYear()
          );
        case "three_month":
          // Lọc theo 3 tháng
          const diffInMonths =
            (now.getFullYear() - createdAt.getFullYear()) * 12 +
            now.getMonth() -
            createdAt.getMonth();
          return diffInMonths <= 3;
        case "all":
          // Không lọc
          return true;
        default:
          return true;
      }
    });
  };

  // Tìm kiếm dữ liệu theo nội dung câu hỏi và sắp xếp
  const filteredQuestions = filterByTimeRange(
    dataQuestion
      .filter((item) =>
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) =>
        sortOrder === "asc"
          ? a.question_count - b.question_count
          : b.question_count - a.question_count
      )
  );

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Top câu hỏi tìm kiếm</h1>

      <div className="mb-4 flex flex-wrap gap-4">
        {/* Tìm kiếm */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Lọc theo khoảng thời gian */}
        <div className="flex-1">
          <select
            value={filterTimeRange}
            onChange={(e) => setFilterTimeRange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả</option>
            <option value="day">Ngày hôm nay</option>
            <option value="week">Trong tuần</option>
            <option value="month">Trong tháng</option>
            <option value="three_month">Trong 3 tháng</option>
          </select>
        </div>

        {/* Lọc theo sắp xếp (tăng/giảm dần) */}
        <div className="flex-1">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="desc">Giảm dần số lượt hỏi</option>
            <option value="asc">Tăng dần số lượt hỏi</option>
          </select>
        </div>
      </div>

      {/* Nút Tìm kiếm & Lọc */}
      <div className="mb-6">
        <button
          onClick={() => callTopQuest()}
          className="w-full p-3 mt-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Tìm kiếm & Lọc
        </button>
      </div>

      {/* Hiển thị danh sách câu hỏi */}
      <ul className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((item, index) => (
            <li
              key={index}
              className="p-4 border border-gray-200 rounded-lg shadow-md"
            >
              <div className="font-semibold text-lg">{item.content}</div>
              <div className="text-sm text-gray-600">
                Số lượt hỏi: {item.question_count}
              </div>
            </li>
          ))
        ) : (
          <li className="p-4 text-center text-gray-500">
            Không có câu hỏi phù hợp.
          </li>
        )}
      </ul>
    </div>
  );
}
