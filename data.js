const questions = [
    {
        id: "C01",
        behavior: "HV01",
        question: "Nam hỏi AI về dân số của một tỉnh. AI đưa ra một số liệu cụ thể nhưng không ghi nguồn và thời điểm. Nam nên làm gì trước khi sử dụng số liệu?",
        options: [
            "Dùng ngay vì AI trả lời rất cụ thể",
            "Hỏi AI lại rồi dùng số liệu mới",
            "Kiểm tra lại thông tin bằng nguồn phù hợp",
            "Bỏ qua tất cả thông tin do AI cung cấp"
        ],
        answer: 2
    },

    {
        id: "C02",
        behavior: "HV02",
        question: "Khoa dùng AI lập dàn ý cho bài thuyết trình nhưng chưa kiểm tra nội dung. Khoa nên làm gì?",
        options: [
            "Dùng ngay vì AI đã lập dàn ý",
            "Kiểm tra nội dung rồi mới sử dụng",
            "Chỉ cần trình bày bài cho đẹp",
            "Gửi cho bạn quyết định"
        ],
        answer: 1
    },

    {
        id: "C03",
        behavior: "Phương dùng AI tạo một hình ảnh cho dự án. Quy định yêu cầu ghi rõ công cụ đã sử dụng. Phương nên làm gì?",
        options: [
            "Nói hình ảnh hoàn toàn do mình tạo",
            "Không cần nói về AI",
            "Đổi tên tệp hình ảnh",
            "Ghi nhận AI đã hỗ trợ tạo hình ảnh"
        ],
        answer: 3
    },

    {
        id: "C04",
        behavior: "HV04",
        question: "Một công cụ AI yêu cầu Bình cho phép truy cập toàn bộ danh bạ điện thoại. Bình nên làm gì?",
        options: [
            "Kiểm tra xem quyền truy cập đó có thật sự cần thiết không",
            "Đồng ý ngay",
            "Đồng ý vì đây là công cụ AI",
            "Cho phép và gửi thêm thông tin"
        ],
        answer: 0
    },

    {
        id: "C05",
        behavior: "HV05",
        question: "Hoàng xem một video của một người nổi tiếng. Hình ảnh và âm thanh có một số điểm không tự nhiên. Điều gì khiến Hoàng cần nghi ngờ và kiểm tra thêm?",
        options: [
            "Video có nhiều lượt xem",
            "Hình ảnh và âm thanh có dấu hiệu bất thường",
            "Người xuất hiện trong video rất nổi tiếng",
            "Video có thời lượng ngắn"
        ],
        answer: 1
    },

    {
        id: "C06",
        behavior: "HV06",
        question: "AI cung cấp thông tin cho bài dự án. Nguồn chỉ ghi “chuyên gia công nghệ”, không có tên hay tài liệu cụ thể. Em nên làm gì?",
        options: [
            "Dùng ngay vì có chữ “chuyên gia”",
            "Tin vì AI đã trả lời",
            "Xóa thông tin mà không cần kiểm tra",
            "Tìm và đối chiếu với nguồn phù hợp khác"
        ],
        answer: 3
    },

    {
        id: "C07",
        behavior: "HV07",
        question: "Phong nhận tin nhắn nói tài khoản ngân hàng của cha mẹ bị khóa và có một đường link đăng nhập. Phong nên làm gì?",
        options: [
            "Đăng nhập ngay",
            "Gửi mật khẩu cho người gửi",
            "Không dùng đường link đó và báo người lớn để kiểm tra qua kênh chính thức",
            "Chuyển tiếp tin nhắn cho bạn"
        ],
        answer: 2
    },

    {
        id: "C08",
        behavior: "HV08",
        question: "Một nhóm học sinh gặp một vấn đề thực tế. AI đưa ra một phương án và nhóm định chọn ngay mà chưa thảo luận. Nhóm nên làm gì?",
        options: [
            "Chọn ngay phương án của AI",
            "Tự phân tích, thảo luận và quyết định",
            "Hỏi AI thêm rồi chọn phương án đầu tiên",
            "Giao việc quyết định cho AI"
        ],
        answer: 1
    },

    {
        id: "C09",
        behavior: "HV09",
        question: "Châu dùng AI viết một đoạn code và định nộp ngay mà chưa chạy thử. Châu nên làm gì?",
        options: [
            "Chạy thử, kiểm tra và sửa lỗi nếu cần",
            "Nộp ngay",
            "Hỏi AI xem code có đúng không rồi nộp",
            "Đổi tên chương trình"
        ],
        answer: 0
    }
];

const behaviors = {
    HV01: "Kiểm tra và đánh giá thông tin do AI cung cấp",
    HV02: "Kiểm tra kết quả do AI hỗ trợ",
    HV03: "Ghi nhận việc sử dụng AI khi cần thiết",
    HV04: "Bảo vệ thông tin cá nhân khi sử dụng AI",
    HV05: "Nhận biết nội dung có thể do AI tạo ra hoặc bị giả mạo",
    HV06: "Xác minh thông tin AI bằng nguồn phù hợp",
    HV07: "Xử lí phù hợp khi gặp nội dung đáng ngờ",
    HV08: "Giữ vai trò chủ động của con người khi sử dụng AI",
    HV09: "Kiểm tra sản phẩm do AI hỗ trợ"
};

const recommendations = {
    HV01: "Kiểm tra thông tin AI bằng SGK hoặc nguồn đáng tin cậy trước khi sử dụng.",
    HV02: "Đọc, kiểm tra cách giải và chịu trách nhiệm về kết quả cuối cùng.",
    HV03: "Ghi nhận việc sử dụng AI theo yêu cầu của giáo viên hoặc quy định của hoạt động.",
    HV04: "Không đưa thông tin cá nhân không cần thiết vào công cụ AI.",
    HV05: "Chú ý các dấu hiệu bất thường và kiểm tra lại trước khi tin hoặc chia sẻ.",
    HV06: "Tìm và đối chiếu thông tin AI với các nguồn đáng tin cậy.",
    HV07: "Không nhấn liên kết hoặc cung cấp thông tin khi chưa xác minh; báo người có trách nhiệm khi cần.",
    HV08: "Dùng AI để tham khảo, sau đó tự lựa chọn, điều chỉnh và phát triển nội dung.",
    HV09: "Kiểm tra ngữ pháp, ý nghĩa, nội dung và ngữ cảnh trước khi sử dụng."
};
