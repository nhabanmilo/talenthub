# TalentHub — kích hoạt bản cập nhật

## Tình trạng ngày 23/09/2026

Mã nguồn đã bổ sung luồng tin thật có duyệt, đăng nhập/liên kết Google, ảnh Google, trình tạo CV 3 mẫu, gợi ý việc làm theo mong muốn và tính Gross/Net. Các tính năng này đã được kiểm tra cục bộ. **Chưa triển khai bản cập nhật lên website**: Sites trả `Sites project not found` với project_id đang lưu trong `.openai/hosting.json`. Cần kết nối đúng tài khoản/workspace đang sở hữu Site để tiếp tục trên dự án cũ, không tạo dự án khác thay thế dữ liệu.

## Tin tuyển dụng thật

1. Nhà tuyển dụng đăng ký vai trò Nhà tuyển dụng, hoàn thiện mục Doanh nghiệp.
2. Quản trị viên kiểm tra thông tin doanh nghiệp, chọn Đã xác minh trong mục Doanh nghiệp.
3. Nhà tuyển dụng tạo tin, chọn gửi duyệt. Lưu nháp chưa xuất hiện công khai.
4. Quản trị viên xem tin chờ duyệt: duyệt hoặc từ chối kèm lý do. Hệ thống chặn duyệt nếu doanh nghiệp chưa xác minh hoặc hạn nộp đã qua.
5. Tin đã duyệt, chưa hết hạn và thuộc doanh nghiệp đã xác minh mới xuất hiện trên trang tìm việc. Sửa tin gửi lại trạng thái chờ duyệt; sửa hồ sơ doanh nghiệp yêu cầu xác minh lại.

Trang mặc định chỉ hiển thị tin thật (`is_demo=0`). Tùy chọn Xem dữ liệu minh họa hiển thị riêng tin mẫu có nhãn. Không tự đổi tin mẫu thành tin thật và không tự tạo doanh nghiệp giả để lấp danh sách. Nếu chưa có nhà tuyển dụng đăng tin, danh sách tin thật có thể trống.

## Google OAuth và ảnh đại diện

Trong Google Cloud, tạo OAuth Client loại Web application, hoàn thiện consent screen và quyền sử dụng. Thêm chính xác redirect URI:

`https://talenthub-viec-lam-080926.spite-mahouts9j.chatgpt.site/api/auth/google/callback`

Nếu URL thực thay đổi, cập nhật URI này và APP_URL cho khớp. Cấu hình runtime:

| Biến | Nội dung |
| --- | --- |
| GOOGLE_CLIENT_ID | OAuth client ID |
| GOOGLE_CLIENT_SECRET | OAuth client secret — giữ kín |
| APP_URL | Origin HTTPS thực tế, không thêm đường dẫn |

Local dùng `.dev.vars` theo `.env.example`; Google flow cần HTTPS origin khớp cấu hình. Không đưa secret vào JavaScript trình duyệt hoặc Git. Với consent screen Testing, chỉ tài khoản được thêm vào danh sách test users mới dùng được.

Tài khoản đã đăng ký bằng mật khẩu phải đăng nhập trước, vào Hồ sơ rồi Liên kết Google. Hệ thống không tự ghép tài khoản chỉ vì trùng email. Liên kết/cập nhật ảnh Google sẽ thay ảnh tự tải lên bằng ảnh Google; Google identity được xác định bằng `sub`. Token Google không được lưu. Tài khoản Google mới chọn vai trò Ứng viên/Nhà tuyển dụng; không tự cấp quản trị.

Google OAuth là đăng nhập ứng dụng TalentHub; không thay thế cổng truy cập riêng tư của Sites. Để nhà tuyển dụng bên ngoài truy cập, chủ Site cần quyết định và cấu hình đối tượng được truy cập trong Sites.

Tài liệu: https://developers.google.com/identity/openid-connect/openid-connect

## Gửi email thật

Giữ luồng hàng đợi Resend hiện có. Cần chủ tài khoản Resend xác minh tên miền gửi rồi cấu hình runtime:

- `RESEND_API_KEY`: API key có quyền gửi trên tên miền đó.
- `EMAIL_FROM`: tên và địa chỉ thuộc tên miền đã xác minh, ví dụ `TalentHub <tuyendung@tenmien-cua-ban.vn>`.
- `APP_URL`: origin thực của website.
- `MAIL_CRON_SECRET`: chuỗi ngẫu nhiên ít nhất 32 ký tự nếu dùng bộ hẹn giờ.

Sau triển khai, quản trị mở Email, gửi kiểm tra đến email của chính mình và kiểm tra hộp thư/Resend. Trạng thái Resend đã tiếp nhận chỉ xác nhận API nhận yêu cầu; chưa có webhook xác nhận delivered/bounced. Không có API key hoặc người gửi đã xác minh thì email vẫn chờ, không gửi thật.

Để nhắc hạn tin đã lưu khi người dùng không mở web, cấu hình bộ hẹn giờ gọi `POST /api/email/dispatch` định kỳ (ví dụ mỗi giờ), header `Authorization: Bearer <MAIL_CRON_SECRET>`. Cần đáp ứng cả quyền truy cập của Site nếu Site đang riêng tư. Endpoint kiểm tra tin còn 0–2 ngày, tránh gửi trùng, rồi xử lý tối đa 20 email; tăng tần suất phù hợp lưu lượng. Bộ hẹn giờ production chưa được cấu hình do Site hiện không truy cập được.

## CV, gợi ý và tính lương

- Tạo CV: ba mẫu Chuyên nghiệp/Hiện đại/Tối giản; lưu tối đa 20 bản riêng tư. Lưu rồi chọn Mở bản đã lưu → In / lưu PDF, khổ A4, tắt header/footer trình duyệt. Sau đó tải PDF vào Hồ sơ & CV để ứng tuyển. Chưa có xuất PDF tự động phía máy chủ.
- Gợi ý: lưu ngành, địa điểm, kinh nghiệm, lương tối thiểu và kỹ năng. Xếp hạng theo các trường trùng khớp trong tối đa 1.000 tin thật mới nhất còn hạn; trả tối đa 20 tin, loại tin đã ứng tuyển. Hiển thị lý do, không gọi là AI hoặc tỷ lệ đánh giá năng lực.
- Tính lương: Gross ↔ Net theo biểu thuế 2026 cho cá nhân cư trú, hợp đồng từ 3 tháng. Nhập tổng bảo hiểm người lao động đóng thực tế; không tự suy ra trần bảo hiểm theo vùng. Bảo hiểm giữ cố định khi tính ngược Net → Gross. Chưa tính các khoản miễn thuế/giảm trừ đặc thù.

## Migration và kiểm tra

Giữ nguyên migrations 0000–0004; áp dụng migration 0005 theo cơ chế hosting khi triển khai. Máy local đã có 0005. Không chạy lại SQL tạo bảng trên cơ sở dữ liệu đã áp dụng.

Đã chạy thành công: TypeScript, build production, 54 kiểm tra API, 108 kiểm tra mở rộng, test CV/gợi ý/tính lương, test nhắc hạn, test Resend và callback Google mô phỏng. Test Google/Resend không chứng minh dịch vụ thật đã hoạt động. Chưa kiểm tra bản cập nhật trên production vì lỗi truy cập Site.

Các lệnh kiểm tra từ thư mục dự án (máy chủ local cổng 3001 cho test API):

```sh
npx tsc --noEmit
npm run build
npm run test:api
npm run test:extensions
npm run test:career
npm run test:google
npm run test:mail
node scripts/test-saved-reminders.mjs
```
