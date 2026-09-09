# Đối chiếu TalentHub với luồng ứng viên TopCV

Nguồn tham khảo: [Trang tìm việc TopCV](https://www.topcv.vn/viec-lam), [Danh sách công ty](https://www.topcv.vn/cong-ty). Đối chiếu các trang công khai; không khẳng định đã kiểm tra mọi tính năng trong tài khoản TopCV.

| Hạng mục | TalentHub hiện tại |
|---|---|
| Tìm việc, ngành nghề, địa điểm, lương, kinh nghiệm | Đã có; danh mục nghề ba cấp và 34 tỉnh/thành |
| Lưu việc và theo dõi hồ sơ ứng tuyển | Đã có |
| Hồ sơ và CV PDF tải lên | Đã có |
| Tìm công ty | Đã thêm tìm theo tên, giới thiệu, địa chỉ và số tin đang tuyển |
| Theo dõi công ty | Đã thêm theo dõi/bỏ theo dõi và lọc danh sách đang theo dõi |
| Cập nhật tin mới từ công ty quan tâm | Đã thêm thông báo web khi tin mới được duyệt tại công ty đã xác minh; tránh gửi trùng theo tin và người theo dõi. Không gửi hồi tố các tin đã có trước khi theo dõi. Email đi qua hàng đợi hiện có |
| Khám phá việc liên quan | Đã thêm tối đa 4 tin cùng nhóm nghề, ưu tiên cùng chuyên môn; chỉ lấy tin công khai còn hạn. Đây là gợi ý theo tiêu chí rõ ràng, không phải mô hình AI |
| Chia sẻ tin | Đã thêm liên kết mở trực tiếp chi tiết. Site vẫn riêng tư; người nhận cần có quyền vào Site |
| Hoàn thiện hồ sơ | Đã thêm checklist thông tin và CV; phần trăm thể hiện độ đầy đủ, không đánh giá năng lực |
| Chat và lịch phỏng vấn | Đã có trên TalentHub |
| Email thật | Chưa hoạt động: cần API key Resend và địa chỉ gửi đã xác minh |
| Nhắc hạn kể cả khi người dùng không mở web | Đã có logic và endpoint, còn thiếu lịch chạy nền được cấu hình |
| Trình tạo CV nhiều mẫu, chỉnh bố cục, xuất PDF | Chưa triển khai; hiện hỗ trợ tải CV PDF lên |
| Gợi ý việc theo mục tiêu nghề nghiệp/cá nhân hóa nâng cao | Chưa triển khai |
| Công cụ lương Gross–Net, bảo hiểm, trắc nghiệm, cẩm nang | Chưa triển khai |
| Google OAuth và đồng bộ ảnh Google | Chưa kết nối; hiện dùng email/mật khẩu và tải ảnh lên |

Kiểm tra bản bổ sung: TypeScript, build triển khai và `node scripts/test-discovery.mjs` (65 kiểm tra API gồm phân quyền, theo dõi, thông báo và việc liên quan). Không sao chép thương hiệu, bài viết hay dữ liệu tuyển dụng của TopCV.
