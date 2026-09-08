# TalentHub

Website tuyển dụng tiếng Việt dựa trên báo cáo phân tích nghiệp vụ được cung cấp. Có giao diện responsive, API, cơ sở dữ liệu quan hệ và lưu trữ CV riêng tư.

## Chức năng

- Ứng viên: đăng ký/đăng nhập, hồ sơ nghề nghiệp, nhiều CV PDF và CV mặc định, tìm kiếm/lọc/phân trang, lưu việc, ứng tuyển bằng CV, theo dõi trạng thái và thông báo.
- Nhà tuyển dụng: hồ sơ doanh nghiệp, tạo/sửa/đóng tin, lưu nháp hoặc gửi duyệt, xem CV đã nộp vào tin thuộc quyền quản lý, cập nhật trạng thái và ghi chú nội bộ.
- Quản trị: duyệt/từ chối/ẩn tin kèm lý do, khóa/mở tài khoản, xác minh/khóa doanh nghiệp, quản lý ngành nghề, thống kê và nhật ký.
- Chặn ứng tuyển trùng, CV không thuộc ứng viên, tin chưa duyệt/đã đóng/đã hết hạn và thao tác trái vai trò. Khóa tài khoản thu hồi phiên đăng nhập.

## Công nghệ

React 19, TypeScript, Vinext/Vite, Tailwind CSS và Shadcn/Base UI. API chạy trên Cloudflare Workers. Dữ liệu quan hệ ở D1, tệp PDF ở R2. Mật khẩu được băm PBKDF2 với salt ngẫu nhiên; token phiên được băm trong cơ sở dữ liệu, cookie HttpOnly. Không dùng localStorage làm nguồn dữ liệu nghiệp vụ.

## Chạy trên máy

Yêu cầu Node.js >= 22.13 và npm. Mở terminal tại thư mục dự án:

```sh
npm ci
npm run db:local
npm run dev
```

Mở địa chỉ Local mà terminal in ra (thường là http://localhost:3000). D1 và R2 cục bộ nằm trong `.wrangler/state`, không cần tài khoản Cloudflare để chạy bản phát triển.

Danh mục và 8 tin giả lập được tạo một lần khi mở website lần đầu. Các tin này có nhãn “Mẫu minh họa”; tài khoản doanh nghiệp mẫu bị khóa, không có mật khẩu sử dụng. Tạo tài khoản nhà tuyển dụng riêng để thử quản lý hồ sơ.

## Khởi tạo quản trị

Trên Site riêng tư đã triển khai: chủ sở hữu đăng nhập Site, mở website và chọn **Thiết lập hệ thống**. Tạo email/mật khẩu quản trị của riêng mình. Sau khi có quản trị viên, endpoint thiết lập không cho tạo thêm quản trị.

Trên localhost: mở `/signin-with-chatgpt?return_to=/` bằng thanh địa chỉ để kích hoạt danh tính phát triển của Sites, sau đó chọn **Thiết lập hệ thống**. Đây là danh tính mô phỏng chỉ trong môi trường phát triển. Không có tài khoản quản trị hay mật khẩu mặc định trong mã nguồn.

Khởi tạo quản trị trong khi Site còn riêng tư trước khi thay đổi quyền chia sẻ. Tài khoản ứng viên/nhà tuyển dụng sử dụng đăng nhập email và mật khẩu của ứng dụng, độc lập với lớp truy cập riêng tư của Sites.

## Luồng kiểm tra thủ công

1. Đăng ký nhà tuyển dụng, điền hồ sơ doanh nghiệp và gửi tin tuyển dụng.
2. Đăng nhập quản trị, xem nội dung rồi phê duyệt tin.
3. Đăng ký ứng viên, tải CV PDF tối đa 5 MB, tìm tin và ứng tuyển.
4. Đăng nhập nhà tuyển dụng, mở CV, cập nhật hồ sơ sang Phỏng vấn.
5. Ứng viên xem trạng thái và thông báo. Thử nộp lại cùng vị trí để kiểm tra chặn trùng.

## Kiểm tra và build

```sh
npx tsc --noEmit
npm run build
```

Kiểm tra API (chạy trên bản sao dữ liệu cục bộ dùng riêng cho kiểm thử):

```sh
npm run test:api
```

Mặc định bộ kiểm tra dùng `http://localhost:3001`. Có thể đặt `TEST_BASE_URL` theo cổng Local. Bộ kiểm tra tạo tài khoản và dữ liệu test; tạo quyền admin fixture qua D1 cục bộ, không gọi máy chủ sản xuất. Không chạy trên dữ liệu thật.

Đã kiểm tra 52 trường hợp API xuyên suốt ba vai trò và kiểm tra TypeScript. Không thực hiện kiểm thử tương tác/ảnh chụp bằng trình duyệt. Có WebMCP `search_jobs` tùy khả năng trình duyệt; chưa xác minh bằng môi trường WebMCP hỗ trợ.

## Cấu trúc mã nguồn

- `app/recruitment-app.tsx`: giao diện và các luồng thao tác.
- `app/api/auth/route.ts`: tài khoản, phiên đăng nhập, thiết lập quản trị.
- `app/api/data/route.ts`: tìm kiếm, nghiệp vụ và phân quyền.
- `app/api/resumes`: tải lên/tải xuống CV với kiểm tra quyền.
- `lib/server.ts`: D1/R2, xác thực, kiểm tra dữ liệu, xử lý lỗi.
- `db/schema.ts`, `drizzle/`: mô hình quan hệ và migration.
- `.openai/hosting.json`: cấu hình Site cùng binding DB/FILES.

Thay đổi schema bằng `npm run db:generate`, giữ nguyên migration đã triển khai. Trên máy mới dùng `npm run db:local` để áp dụng migration cục bộ.

## Phạm vi phiên bản

Đây là MVP phục vụ nghiệp vụ lõi. CV chỉ nhận PDF; thao tác xóa CV khỏi hồ sơ là xóa mềm để giữ lịch sử ứng tuyển. Một tài khoản nhà tuyển dụng quản lý một doanh nghiệp trong phiên bản này. Chưa triển khai nhiều nhân sự cùng một doanh nghiệp, khôi phục mật khẩu/email xác minh, email thông báo, lịch hẹn, chat, thanh toán, AI hoặc video phỏng vấn. Thông báo hiện có nằm trong website. Cần cấu hình dịch vụ email nếu mở rộng đăng ký công khai và khôi phục tài khoản.
