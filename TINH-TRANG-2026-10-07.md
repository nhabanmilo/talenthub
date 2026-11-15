# Tình trạng bàn giao ngày 07/10/2026

- Đã phục hồi thư viện theo package-lock, bao gồm @cspotcode/source-map-support; không còn lỗi thiếu module này khi kiểm tra bằng Node.
- Đã chỉnh giao diện: font hệ thống, nền trắng/xám, bớt trang trí và ưu tiên danh sách việc làm.
- Đã cải tiến Mo-TalentHub.cmd: kiểm tra thư viện, xử lý khóa của tiến trình đã dừng, chỉ mở trình duyệt sau khi API dữ liệu hoạt động.
- Kiểm tra TypeScript và các kiểm tra Google/Resend/nhắc hạn đã qua. Google và Resend dùng phản hồi mô phỏng.
- Chưa xác nhận build/chạy thật trong phiên này: Windows trả EPERM ở thao tác realpath của Vite, kể cả sau khi được cấp quyền thư mục. Bản local chưa mở thành công từ phiên chạy của trợ lý.
- Google và email thật chưa có GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, RESEND_API_KEY và EMAIL_FROM.
- Website online chưa cập nhật vì tài khoản hiện tại không truy cập được dự án Sites.

## Mở bản local

Giải nén gói với Mo-TalentHub.cmd nằm cạnh thư mục talenthub. Nhấp đúp Mo-TalentHub.cmd và giữ cửa sổ máy chủ mở. Trình duyệt tự mở khi dữ liệu đã sẵn sàng. Nếu đã mở máy chủ trước khi phục hồi thư viện, đóng cửa sổ máy chủ đó rồi mở lại file.

Máy mới cần Node.js >=22.13 và chạy npm install trong thư mục talenthub. Xem SETUP-PRODUCTION.md về khởi tạo dữ liệu và cấu hình dịch vụ. Gói mã nguồn không chứa dữ liệu tài khoản, CV hoặc API key.
