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

Đã kiểm tra 107 trường hợp API xuyên suốt ba vai trò, bộ kiểm tra Resend với phản hồi mô phỏng và kiểm tra TypeScript. Chưa gửi email thật vì chưa có khóa Resend và địa chỉ gửi đã xác minh. Không thực hiện kiểm thử tương tác/ảnh chụp bằng trình duyệt. Có WebMCP `search_jobs` tùy khả năng trình duyệt; chưa xác minh bằng môi trường WebMCP hỗ trợ.

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

Đây là MVP phục vụ nghiệp vụ lõi. CV chỉ nhận PDF; thao tác xóa CV khỏi hồ sơ là xóa mềm để giữ lịch sử ứng tuyển. Một tài khoản nhà tuyển dụng quản lý một doanh nghiệp trong phiên bản này. Đã bổ sung chat theo hồ sơ ứng tuyển, lịch phỏng vấn và email thông báo qua Resend. Chưa triển khai nhiều nhân sự cùng một doanh nghiệp, khôi phục mật khẩu/email xác minh, thanh toán, AI hoặc video phỏng vấn tích hợp. Lịch trực tuyến sử dụng liên kết họp do nhà tuyển dụng cung cấp.


## Chức năng mở rộng phiên bản 0.2

### Chat

Trong danh sách hồ sơ ứng tuyển, chọn **Nhắn tin** hoặc mở mục **Tin nhắn**. Hai bên trao đổi theo hồ sơ, có trạng thái đã đọc và tải tin nhắn cũ. Tin nhắn tự cập nhật mỗi 5 giây khi trang hiển thị; không dùng WebSocket. Gửi lại cùng mã yêu cầu không tạo tin trùng. Quản trị viên và nhà tuyển dụng không liên quan không được đọc hội thoại. Tài khoản/doanh nghiệp bị khóa không được gửi thêm.

### Lịch phỏng vấn

Nhà tuyển dụng chọn **Hẹn phỏng vấn**, điền giờ Việt Nam (UTC+7), hình thức, địa điểm hoặc liên kết HTTPS. Hỗ trợ đổi/hủy/hoàn thành lịch; ứng viên xác nhận hoặc từ chối kèm lời nhắn. Hệ thống kiểm tra trùng lịch trong chính lệnh ghi dữ liệu và ngăn cập nhật từ phiên bản cũ. Đổi lịch yêu cầu xác nhận lại. Tệp .ics có UID ổn định và số phiên bản để nhập vào ứng dụng lịch; không tự đồng bộ Google Calendar/Outlook, không tự tạo phòng họp.

### Email Resend

- Mọi thông báo mới tạo một mục email trong cùng giao dịch dữ liệu, thông qua trigger migration 0001. Không gửi lại các thông báo cũ từ trước nâng cấp.
- Nội dung email là văn bản; chat chỉ gửi thông báo có tin mới, không gửi nguyên văn hội thoại hoặc CV.
- Người dùng bật/tắt nhận email trong mục **Email**. Quản trị xem nhật ký, xử lý hàng đợi và gửi kiểm tra đến chính email đăng ký của mình.
- Thiếu cấu hình: email giữ trạng thái chờ, không báo đã gửi. Có cấu hình: mỗi thao tác ghi nghiệp vụ xử lý tối đa 4 mục. Lỗi được giữ lại và thử lại với thời gian chờ tăng dần khi có lần xử lý tiếp theo. Tối đa 5 lần tự thử.
- Khóa chống trùng Resend được giữ nguyên theo thông báo; khóa xử lý hàng đợi ngăn hai tiến trình cùng gửi. Sau 23 giờ từ lần gửi đầu mà chưa rõ kết quả, chuyển **Cần kiểm tra**, không tự gửi tiếp để tránh vượt thời hạn lưu khóa chống trùng của nhà cung cấp.
- **Resend đã tiếp nhận** là API xác nhận tiếp nhận, không phải xác nhận đã vào hộp thư. Chưa tích hợp webhook giao thư/bounce.

Cấu hình trong **môi trường Sites**, sau đó triển khai lại:

| Biến | Giá trị |
| --- | --- |
| RESEND_API_KEY | API key Resend, đặt dạng secret |
| EMAIL_FROM | TalentHub &lt;tuyendung@tenmien-da-xac-minh.vn&gt; |
| APP_URL | URL thực của website |
| MAIL_CRON_SECRET | Tùy chọn: secret ngẫu nhiên ít nhất 32 ký tự |

Ở local, sao chép .env.example thành .dev.vars và điền các giá trị, rồi khởi động lại server. Không commit API key. Địa chỉ dùng .test, .invalid hoặc example.com/net/org sẽ không được gửi qua Resend.

Nếu cần tự thử lại hàng đợi khi không có người dùng hoạt động, cấu hình bộ hẹn giờ HTTPS bên ngoài gọi POST /api/email/dispatch với Authorization: Bearer [MAIL_CRON_SECRET], ví dụ mỗi 5 phút. Endpoint đã có sẵn nhưng bộ hẹn giờ bên ngoài chưa được cấu hình. Không cần bộ hẹn giờ để gửi ngay theo thao tác nghiệp vụ; quản trị cũng có nút xử lý hàng đợi thủ công. Chưa có email nhắc trước giờ phỏng vấn.

Tài liệu nhà cung cấp: [Gửi email](https://resend.com/docs/api-reference/emails/send-email), [Chống gửi trùng](https://resend.com/docs/dashboard/emails/idempotency-keys).

Kiểm tra bổ sung (máy chủ local đang chạy):

~~~sh
npm run test:extensions
npm run test:mail
~~~

Bộ test mail chỉ dùng fetch mô phỏng và không gửi email thật. Bộ test API tạo dữ liệu thử cục bộ, gồm kiểm tra cạnh tranh ghi chat/lịch và quyền sở hữu.
