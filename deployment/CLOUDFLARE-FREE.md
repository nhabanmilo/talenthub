# Triển khai Cloudflare Free

D1: talenthub-db (5477c196-30f7-49cb-8b8c-35c183939f09). Không dùng R2.
Cấu hình build lấy database từ cloudflare.production.json; chạy dev vẫn dùng DB local.

1. Cơ sở dữ liệu trống đã được khởi tạo. Không chạy lại initialize-empty-d1.sql.
2. Chạy npm run build rồi npx wrangler deploy --config dist/server/wrangler.json.
3. Chạy npx wrangler secret put ADMIN_SETUP_TOKEN --config dist/server/wrangler.json.
   Nhập mã ngẫu nhiên từ 32 đến 256 ký tự do bạn giữ riêng, không dùng mật khẩu tài khoản.
4. Mở URL workers.dev được trả về, bấm Thiết lập hệ thống, nhập mã trên và tên/email/mật khẩu của quản trị viên.
5. Sau khi tạo thành công, chạy npx wrangler secret delete ADMIN_SETUP_TOKEN --config dist/server/wrangler.json.

Đăng nhập thông thường dùng email/mật khẩu. Google và email khôi phục cần cấu hình riêng, chưa hoạt động nếu thiếu thông số.
CV dùng đường dẫn HTTPS do ứng viên cung cấp; cần bật quyền xem ở nhà cung cấp lưu trữ.
Dữ liệu local không tự chuyển lên D1. Database online bắt đầu trống ngoài danh mục nghề nghiệp.
Giữ gói Workers Free; khi vượt hạn mức, dịch vụ có thể tạm ngừng. Không bật R2 hoặc nâng gói trả phí.
Mã nguồn thay đổi cần được đẩy lên GitHub trước khi dùng lại nút build trên dashboard; nếu chưa, dashboard vẫn dùng mã cũ.
