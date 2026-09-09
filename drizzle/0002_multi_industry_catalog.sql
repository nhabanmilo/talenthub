-- Add 40 explicitly fictional demo jobs across 20 industries; preserve all existing records.
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-1','Công nghệ thông tin',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-1','catalog-202609-employer-1@example.invalid','disabled','employer','locked','Mây Việt Labs',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-1');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-1','catalog-202609-employer-1','Mây Việt Labs','Hà Nội','Doanh nghiệp giả lập trong lĩnh vực công nghệ thông tin. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-01','catalog-202609-company-1','catalog-202609-employer-1','Công nghệ thông tin','Kỹ sư dữ liệu (Python / SQL)','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Thiết kế luồng thu thập dữ liệu
• xây dựng kho dữ liệu và giám sát chất lượng dữ liệu hằng ngày.','Thành thạo Python, SQL và mô hình dữ liệu; có kinh nghiệm xây dựng ETL và làm việc với Git.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',25,40,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Python","SQL","ETL"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-02','catalog-202609-company-1','catalog-202609-employer-1','Công nghệ thông tin','Thực tập sinh kiểm thử phần mềm','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Viết test case cho website
• thực hiện kiểm thử hồi quy và ghi nhận lỗi cùng nhóm phát triển.','Sinh viên ngành CNTT hoặc tương đương; hiểu quy trình kiểm thử, cẩn thận và có thể làm tối thiểu 4 ngày/tuần.','Mức hỗ trợ theo khoảng hiển thị, đơn vị triệu đồng/tháng. Có người hướng dẫn, phản hồi định kỳ và cơ hội thực hành qua dự án. Lịch thực tập được thống nhất khi trao đổi.','TP. Hồ Chí Minh',4,7,date('now','+90 days'),'active','Chưa có kinh nghiệm','Thực tập','["QA","Testing","Intern"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-2','Thiết kế & Sáng tạo',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-2','catalog-202609-employer-2@example.invalid','disabled','employer','locked','Nét Mới Studio',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-2');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-2','catalog-202609-employer-2','Nét Mới Studio','Đà Nẵng','Doanh nghiệp giả lập trong lĩnh vực thiết kế & sáng tạo. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-03','catalog-202609-company-2','catalog-202609-employer-2','Thiết kế & Sáng tạo','Thiết kế đồ họa thương hiệu','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Thiết kế bộ nhận diện, ấn phẩm truyền thông và bao bì
• chuẩn bị file in theo yêu cầu sản xuất.','Có portfolio thiết kế thương hiệu; sử dụng Illustrator và Photoshop; hiểu màu sắc, bố cục và kỹ thuật in.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Đà Nẵng',12,20,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Branding","Illustrator","Photoshop"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-04','catalog-202609-company-2','catalog-202609-employer-2','Thiết kế & Sáng tạo','Biên tập video ngắn','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Dựng video giới thiệu sản phẩm và nội dung mạng xã hội
• xử lý âm thanh, phụ đề và nhịp dựng.','Sử dụng Premiere hoặc DaVinci Resolve; có sản phẩm video minh họa; đáp ứng lịch bàn giao trực tuyến.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Làm việc từ xa',10,18,date('now','+90 days'),'active','Dưới 1 năm','Toàn thời gian','["Video","Premiere","Remote"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-3','Marketing',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-3','catalog-202609-employer-3@example.invalid','disabled','employer','locked','Lá Xanh Media',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-3');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-3','catalog-202609-employer-3','Lá Xanh Media','Hà Nội','Doanh nghiệp giả lập trong lĩnh vực marketing. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-05','catalog-202609-company-3','catalog-202609-employer-3','Marketing','Chuyên viên SEO nội dung','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Nghiên cứu từ khóa
• xây dựng kế hoạch nội dung và tối ưu trang
• theo dõi hiệu quả truy cập tự nhiên.','Hiểu SEO on-page và Search Console; viết tiếng Việt tốt; đọc và phân tích báo cáo website.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',12,20,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["SEO","Content","Analytics"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-06','catalog-202609-company-3','catalog-202609-employer-3','Marketing','Chuyên viên quảng cáo hiệu suất','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Lập kế hoạch ngân sách quảng cáo
• thử nghiệm nội dung và nhóm khách hàng
• báo cáo chi phí chuyển đổi.','Có kinh nghiệm vận hành quảng cáo Google hoặc Meta; hiểu tracking và phân tích hiệu quả chiến dịch.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',18,30,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Google Ads","Meta Ads","Performance"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-4','Kinh doanh',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-4','catalog-202609-employer-4@example.invalid','disabled','employer','locked','Cầu Nối Thương Mại',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-4');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-4','catalog-202609-employer-4','Cầu Nối Thương Mại','Hà Nội','Doanh nghiệp giả lập trong lĩnh vực kinh doanh. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-07','catalog-202609-company-4','catalog-202609-employer-4','Kinh doanh','Nhân viên kinh doanh giải pháp doanh nghiệp','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Tìm hiểu nhu cầu khách hàng doanh nghiệp
• trình bày giải pháp, lập báo giá và theo dõi hợp đồng.','Giao tiếp và đàm phán tốt; sử dụng CRM; có kinh nghiệm bán hàng B2B. Lương hiển thị là lương cơ bản.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',12,22,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["B2B","CRM","Sales"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-08','catalog-202609-company-4','catalog-202609-employer-4','Kinh doanh','Nhân viên tư vấn khách hàng tại cửa hàng','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Tư vấn sản phẩm tại cửa hàng
• hỗ trợ đặt hàng, thanh toán và chăm sóc khách sau mua.','Giao tiếp rõ ràng; sử dụng máy tính cơ bản; sẵn sàng làm việc theo ca được thống nhất trước.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Cần Thơ',8,12,date('now','+90 days'),'active','Chưa có kinh nghiệm','Toàn thời gian','["Tư vấn","Bán hàng","Cửa hàng"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-5','Tài chính & Kế toán',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-5','catalog-202609-employer-5@example.invalid','disabled','employer','locked','Sổ Sáng Dịch Vụ',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-5');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-5','catalog-202609-employer-5','Sổ Sáng Dịch Vụ','TP. Hồ Chí Minh','Doanh nghiệp giả lập trong lĩnh vực tài chính & kế toán. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-09','catalog-202609-company-5','catalog-202609-employer-5','Tài chính & Kế toán','Kế toán tổng hợp','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Hạch toán nghiệp vụ
• đối soát công nợ, kiểm tra chứng từ và lập báo cáo tài chính định kỳ.','Tốt nghiệp kế toán hoặc tài chính; thành thạo Excel và phần mềm kế toán; hiểu nguyên tắc kiểm soát chứng từ.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',15,23,date('now','+90 days'),'active','3–5 năm','Toàn thời gian','["Kế toán","Excel","Báo cáo"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-10','catalog-202609-company-5','catalog-202609-employer-5','Tài chính & Kế toán','Chuyên viên phân tích tài chính','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Lập mô hình ngân sách
• phân tích doanh thu, chi phí và dòng tiền
• báo cáo chênh lệch so với kế hoạch.','Có kinh nghiệm lập mô hình tài chính; sử dụng Excel tốt; trình bày được giả định và kết quả phân tích.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',20,32,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["FP&A","Ngân sách","Excel"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-6','Nhân sự',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-6','catalog-202609-employer-6@example.invalid','disabled','employer','locked','Đồng Hành People',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-6');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-6','catalog-202609-employer-6','Đồng Hành People','Hà Nội','Doanh nghiệp giả lập trong lĩnh vực nhân sự. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-11','catalog-202609-company-6','catalog-202609-employer-6','Nhân sự','Chuyên viên tiền lương và phúc lợi','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Tổng hợp chấm công, tính lương và theo dõi phúc lợi
• quản lý hồ sơ nhân sự và giải đáp thắc mắc nội bộ.','Có kinh nghiệm C&B; xử lý bảng tính chính xác; bảo mật thông tin và phối hợp tốt với kế toán.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',14,22,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["C&B","Payroll","Excel"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-12','catalog-202609-company-6','catalog-202609-employer-6','Nhân sự','Thực tập sinh tuyển dụng','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Đăng tin tuyển dụng
• sàng lọc hồ sơ theo tiêu chí
• sắp xếp phỏng vấn và cập nhật dữ liệu ứng viên.','Sinh viên ngành nhân sự, quản trị hoặc tương đương; giao tiếp tốt; có thể thực tập tối thiểu 3 tháng.','Mức hỗ trợ theo khoảng hiển thị, đơn vị triệu đồng/tháng. Có người hướng dẫn, phản hồi định kỳ và cơ hội thực hành qua dự án. Lịch thực tập được thống nhất khi trao đổi.','Đà Nẵng',4,6,date('now','+90 days'),'active','Chưa có kinh nghiệm','Thực tập','["Tuyển dụng","HR","Intern"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-7','Giáo dục & Đào tạo',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-7','catalog-202609-employer-7@example.invalid','disabled','employer','locked','Học Mở Academy',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-7');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-7','catalog-202609-employer-7','Học Mở Academy','Hà Nội','Doanh nghiệp giả lập trong lĩnh vực giáo dục & đào tạo. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-13','catalog-202609-company-7','catalog-202609-employer-7','Giáo dục & Đào tạo','Giáo viên tiếng Anh giao tiếp','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Soạn giáo án giao tiếp
• giảng dạy theo nhóm nhỏ
• theo dõi tiến bộ và phản hồi cho học viên.','Có năng lực tiếng Anh phù hợp và kỹ năng sư phạm; kinh nghiệm giảng dạy; chuẩn bị một buổi dạy thử.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',15,25,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Tiếng Anh","Giảng dạy","Đào tạo"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-14','catalog-202609-company-7','catalog-202609-employer-7','Giáo dục & Đào tạo','Trợ giảng lớp kỹ năng thiếu nhi','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Chuẩn bị học cụ
• hỗ trợ giáo viên tổ chức hoạt động và điểm danh
• trao đổi tình hình học tập với phụ trách lớp.','Kiên nhẫn, giao tiếp tốt với trẻ; có thể làm 20 giờ/tuần, gồm cuối tuần; được hướng dẫn quy trình bảo vệ trẻ em.','Thu nhập tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng cho lịch 20 giờ/tuần. Được đào tạo ban đầu và sắp xếp ca theo lịch thống nhất.','TP. Hồ Chí Minh',4,7,date('now','+90 days'),'active','Chưa có kinh nghiệm','Bán thời gian','["Trợ giảng","Kỹ năng","Part-time"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-8','Y tế & Chăm sóc sức khỏe',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-8','catalog-202609-employer-8@example.invalid','disabled','employer','locked','An Tâm Care',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-8');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-8','catalog-202609-employer-8','An Tâm Care','Đà Nẵng','Doanh nghiệp giả lập trong lĩnh vực y tế & chăm sóc sức khỏe. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-15','catalog-202609-company-8','catalog-202609-employer-8','Y tế & Chăm sóc sức khỏe','Điều dưỡng phòng khám','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Tiếp nhận người bệnh
• hỗ trợ chăm sóc theo chỉ định chuyên môn
• quản lý dụng cụ và hồ sơ điều dưỡng.','Tốt nghiệp điều dưỡng; đáp ứng điều kiện hành nghề áp dụng cho vị trí; tuân thủ kiểm soát nhiễm khuẩn và bảo mật hồ sơ.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Đà Nẵng',10,16,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Điều dưỡng","Chăm sóc","Phòng khám"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-16','catalog-202609-company-8','catalog-202609-employer-8','Y tế & Chăm sóc sức khỏe','Nhân viên điều phối lịch khám','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Tiếp nhận yêu cầu đặt lịch
• phối hợp các phòng khám và hướng dẫn thủ tục
• cập nhật thông tin trên hệ thống.','Giao tiếp lịch sự; thao tác máy tính tốt; bảo mật dữ liệu người bệnh; không thực hiện tư vấn chuyên môn y tế.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Cần Thơ',8,12,date('now','+90 days'),'active','Dưới 1 năm','Toàn thời gian','["Lễ tân","Điều phối","Chăm sóc khách hàng"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-9','Dược phẩm & Công nghệ sinh học',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-9','catalog-202609-employer-9@example.invalid','disabled','employer','locked','Sinh Lộc Bio',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-9');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-9','catalog-202609-employer-9','Sinh Lộc Bio','TP. Hồ Chí Minh','Doanh nghiệp giả lập trong lĩnh vực dược phẩm & công nghệ sinh học. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-17','catalog-202609-company-9','catalog-202609-employer-9','Dược phẩm & Công nghệ sinh học','Nhân viên kiểm nghiệm chất lượng','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Chuẩn bị mẫu và thực hiện phép thử theo quy trình
• ghi nhận kết quả và báo cáo sai lệch cho phụ trách phòng.','Tốt nghiệp hóa, sinh hoặc dược; hiểu quy trình phòng thí nghiệm; thao tác chính xác và tuân thủ an toàn.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',12,20,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["QC","Phòng thí nghiệm","Kiểm nghiệm"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-18','catalog-202609-company-9','catalog-202609-employer-9','Dược phẩm & Công nghệ sinh học','Chuyên viên hồ sơ sản phẩm','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Tổng hợp tài liệu kỹ thuật
• quản lý phiên bản hồ sơ sản phẩm
• phối hợp bộ phận chất lượng theo dõi tiến độ hoàn thiện hồ sơ.','Nền tảng dược, sinh học hoặc hóa học; đọc hiểu tài liệu tiếng Anh; quản lý văn bản và dữ liệu cẩn thận.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',14,22,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Hồ sơ","Dược phẩm","Tài liệu"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-10','Logistics & Chuỗi cung ứng',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-10','catalog-202609-employer-10@example.invalid','disabled','employer','locked','Luồng Việt Logistics',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-10');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-10','catalog-202609-employer-10','Luồng Việt Logistics','Hải Phòng','Doanh nghiệp giả lập trong lĩnh vực logistics & chuỗi cung ứng. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-19','catalog-202609-company-10','catalog-202609-employer-10','Logistics & Chuỗi cung ứng','Nhân viên chứng từ xuất nhập khẩu','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Kiểm tra bộ chứng từ lô hàng
• phối hợp khách hàng, hãng vận chuyển và bộ phận khai báo để theo dõi tiến độ giao nhận.','Hiểu nghiệp vụ xuất nhập khẩu; đọc hiểu chứng từ tiếng Anh; sử dụng Excel và làm việc đúng thời hạn.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hải Phòng',11,18,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Xuất nhập khẩu","Chứng từ","Logistics"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-20','catalog-202609-company-10','catalog-202609-employer-10','Logistics & Chuỗi cung ứng','Điều phối vận tải nội địa','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Lập lịch xe và tuyến giao hàng
• theo dõi trạng thái vận chuyển
• phối hợp xử lý chậm giao và đối soát chi phí.','Có kinh nghiệm điều phối; giao tiếp tốt với đối tác vận tải; sử dụng bảng tính và hệ thống quản lý đơn hàng.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',12,18,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Vận tải","Điều phối","TMS"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-11','Sản xuất & Quản lý chất lượng',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-11','catalog-202609-employer-11@example.invalid','disabled','employer','locked','Chuẩn Việt Manufacturing',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-11');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-11','catalog-202609-employer-11','Chuẩn Việt Manufacturing','Hải Phòng','Doanh nghiệp giả lập trong lĩnh vực sản xuất & quản lý chất lượng. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-21','catalog-202609-company-11','catalog-202609-employer-11','Sản xuất & Quản lý chất lượng','Kỹ sư quản lý chất lượng sản xuất','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Theo dõi chất lượng công đoạn
• phân tích lỗi và phối hợp cải tiến
• cập nhật hướng dẫn kiểm tra tại chuyền.','Tốt nghiệp kỹ thuật; hiểu công cụ QC và phân tích nguyên nhân; đọc bản vẽ, sử dụng thiết bị đo phù hợp.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hải Phòng',16,25,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["QA","QC","Cải tiến"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-22','catalog-202609-company-11','catalog-202609-employer-11','Sản xuất & Quản lý chất lượng','Nhân viên kế hoạch sản xuất','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Tổng hợp đơn hàng, năng lực máy và tồn kho
• lập kế hoạch sản xuất tuần
• theo dõi tiến độ và cảnh báo thiếu nguyên liệu.','Sử dụng Excel thành thạo; hiểu quy trình sản xuất; phối hợp tốt với kho và mua hàng.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',12,19,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Kế hoạch","ERP","Sản xuất"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-12','Cơ khí & Điện tự động hóa',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-12','catalog-202609-employer-12@example.invalid','disabled','employer','locked','Mạch Việt Engineering',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-12');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-12','catalog-202609-employer-12','Mạch Việt Engineering','Hải Phòng','Doanh nghiệp giả lập trong lĩnh vực cơ khí & điện tự động hóa. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-23','catalog-202609-company-12','catalog-202609-employer-12','Cơ khí & Điện tự động hóa','Kỹ sư tự động hóa PLC','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Lập trình PLC và HMI
• chạy thử hệ thống điều khiển
• bàn giao tài liệu vận hành và phối hợp bảo trì.','Tốt nghiệp tự động hóa hoặc điện; có kinh nghiệm PLC; đọc sơ đồ điện và tuân thủ quy trình an toàn.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hải Phòng',18,30,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["PLC","HMI","Tự động hóa"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-24','catalog-202609-company-12','catalog-202609-employer-12','Cơ khí & Điện tự động hóa','Kỹ thuật viên bảo trì cơ khí','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Kiểm tra và bảo dưỡng thiết bị theo kế hoạch
• ghi nhận hư hỏng
• hỗ trợ thay thế chi tiết và quản lý vật tư bảo trì.','Tốt nghiệp nghề cơ khí; đọc bản vẽ cơ bản; sử dụng dụng cụ đo và tuân thủ quy trình cô lập năng lượng.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',11,18,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Cơ khí","Bảo trì","Kỹ thuật"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-13','Xây dựng & Kiến trúc',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-13','catalog-202609-employer-13@example.invalid','disabled','employer','locked','Không Gian Mới',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-13');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-13','catalog-202609-employer-13','Không Gian Mới','Đà Nẵng','Doanh nghiệp giả lập trong lĩnh vực xây dựng & kiến trúc. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-25','catalog-202609-company-13','catalog-202609-employer-13','Xây dựng & Kiến trúc','Kiến trúc sư thiết kế công trình','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Phát triển phương án kiến trúc
• triển khai bản vẽ và mô hình
• phối hợp bộ môn kết cấu, cơ điện để hoàn thiện hồ sơ.','Tốt nghiệp kiến trúc; có portfolio; sử dụng AutoCAD, Revit hoặc phần mềm tương đương.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Đà Nẵng',18,28,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Kiến trúc","Revit","AutoCAD"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-26','catalog-202609-company-13','catalog-202609-employer-13','Xây dựng & Kiến trúc','Kỹ sư dự toán công trình','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Bóc tách khối lượng từ bản vẽ
• lập dự toán và so sánh báo giá
• hỗ trợ kiểm soát chi phí theo tiến độ dự án.','Tốt nghiệp xây dựng hoặc kinh tế xây dựng; đọc bản vẽ; sử dụng Excel và phần mềm dự toán.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',15,24,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Dự toán","QS","Xây dựng"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-14','Du lịch & Khách sạn',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-14','catalog-202609-employer-14@example.invalid','disabled','employer','locked','Dải Nắng Hospitality',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-14');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-14','catalog-202609-employer-14','Dải Nắng Hospitality','Đà Nẵng','Doanh nghiệp giả lập trong lĩnh vực du lịch & khách sạn. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-27','catalog-202609-company-14','catalog-202609-employer-14','Du lịch & Khách sạn','Nhân viên lễ tân khách sạn','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Thực hiện nhận và trả phòng
• quản lý đặt phòng
• phối hợp buồng phòng và hỗ trợ yêu cầu của khách lưu trú.','Tiếng Anh giao tiếp; thái độ phục vụ tốt; sử dụng máy tính và sẵn sàng làm theo ca thỏa thuận.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Đà Nẵng',8,13,date('now','+90 days'),'active','Dưới 1 năm','Toàn thời gian','["Lễ tân","Khách sạn","Tiếng Anh"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-28','catalog-202609-company-14','catalog-202609-employer-14','Du lịch & Khách sạn','Nhân viên điều hành tour nội địa','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Lập lịch trình và dự toán tour
• đặt dịch vụ
• phối hợp hướng dẫn viên và xử lý thay đổi trong chuyến đi.','Hiểu tuyến điểm nội địa; kỹ năng tổ chức và làm việc với nhà cung cấp; theo dõi chi phí chính xác.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',11,18,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Du lịch","Điều hành","Tour"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-15','Nhà hàng & Thực phẩm',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-15','catalog-202609-employer-15@example.invalid','disabled','employer','locked','Bếp Mùa Việt',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-15');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-15','catalog-202609-employer-15','Bếp Mùa Việt','Cần Thơ','Doanh nghiệp giả lập trong lĩnh vực nhà hàng & thực phẩm. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-29','catalog-202609-company-15','catalog-202609-employer-15','Nhà hàng & Thực phẩm','Phụ bếp nhà hàng','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Sơ chế nguyên liệu theo hướng dẫn
• chuẩn bị khu vực bếp
• vệ sinh dụng cụ và hỗ trợ kiểm kê thực phẩm.','Có tinh thần học hỏi; tuân thủ vệ sinh thực phẩm; làm việc theo ca và phối hợp tốt với nhóm bếp.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Cần Thơ',7,10,date('now','+90 days'),'active','Chưa có kinh nghiệm','Toàn thời gian','["Phụ bếp","Ẩm thực","Nhà hàng"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-30','catalog-202609-company-15','catalog-202609-employer-15','Nhà hàng & Thực phẩm','Giám sát ca nhà hàng','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Phân công nhân sự theo ca
• theo dõi chất lượng phục vụ
• giải quyết phản hồi và đối soát doanh thu cuối ca.','Có kinh nghiệm phục vụ hoặc quản lý ca; xử lý tình huống tốt; sử dụng phần mềm bán hàng.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',12,18,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Giám sát","F&B","Vận hành"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-16','Bán lẻ & Thương mại điện tử',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-16','catalog-202609-employer-16@example.invalid','disabled','employer','locked','Giỏ Mới Retail',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-16');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-16','catalog-202609-employer-16','Giỏ Mới Retail','TP. Hồ Chí Minh','Doanh nghiệp giả lập trong lĩnh vực bán lẻ & thương mại điện tử. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-31','catalog-202609-company-16','catalog-202609-employer-16','Bán lẻ & Thương mại điện tử','Chuyên viên vận hành sàn thương mại điện tử','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Quản lý danh mục sản phẩm
• thiết lập chương trình bán hàng
• theo dõi tồn kho, đơn hàng và hiệu quả gian hàng.','Có kinh nghiệm vận hành gian hàng trực tuyến; dùng Excel; hiểu quy trình xử lý đơn và hoàn hàng.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',12,20,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["E-commerce","Vận hành","Gian hàng"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-32','catalog-202609-company-16','catalog-202609-employer-16','Bán lẻ & Thương mại điện tử','Nhân viên trưng bày hàng hóa','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Sắp xếp sản phẩm theo sơ đồ trưng bày
• cập nhật bảng giá
• kiểm tra tồn kho trên quầy và ghi nhận nhu cầu bổ sung.','Cẩn thận và có thẩm mỹ cơ bản; giao tiếp với đội cửa hàng; có thể di chuyển giữa điểm bán theo lịch.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',9,14,date('now','+90 days'),'active','Dưới 1 năm','Toàn thời gian','["Merchandising","Bán lẻ","Trưng bày"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-17','Pháp lý & Tuân thủ',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-17','catalog-202609-employer-17@example.invalid','disabled','employer','locked','Minh Bạch Advisory',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-17');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-17','catalog-202609-employer-17','Minh Bạch Advisory','Hà Nội','Doanh nghiệp giả lập trong lĩnh vực pháp lý & tuân thủ. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-33','catalog-202609-company-17','catalog-202609-employer-17','Pháp lý & Tuân thủ','Chuyên viên pháp chế hợp đồng','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Rà soát điều khoản hợp đồng
• tổng hợp rủi ro để báo cáo người phụ trách
• quản lý hồ sơ và theo dõi nghĩa vụ thực hiện.','Tốt nghiệp luật; có kinh nghiệm rà soát hợp đồng thương mại; viết và phân tích văn bản rõ ràng.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',18,28,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Pháp chế","Hợp đồng","Tuân thủ"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-34','catalog-202609-company-17','catalog-202609-employer-17','Pháp lý & Tuân thủ','Trợ lý tuân thủ nội bộ','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Thu thập hồ sơ kiểm tra nội bộ
• cập nhật danh mục chính sách
• theo dõi việc hoàn thành hành động khắc phục.','Nền tảng luật, kiểm toán hoặc quản trị; sử dụng bảng tính; bảo mật thông tin và quản lý hồ sơ có hệ thống.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',10,16,date('now','+90 days'),'active','Dưới 1 năm','Toàn thời gian','["Compliance","Hồ sơ","Kiểm soát"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-18','Nông nghiệp & Môi trường',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-18','catalog-202609-employer-18@example.invalid','disabled','employer','locked','Mầm Xanh Agri',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-18');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-18','catalog-202609-employer-18','Mầm Xanh Agri','Cần Thơ','Doanh nghiệp giả lập trong lĩnh vực nông nghiệp & môi trường. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-35','catalog-202609-company-18','catalog-202609-employer-18','Nông nghiệp & Môi trường','Kỹ sư nông nghiệp trồng trọt','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Theo dõi tình hình cây trồng
• ghi chép nhật ký canh tác
• phối hợp đội sản xuất triển khai quy trình và đánh giá năng suất.','Tốt nghiệp trồng trọt hoặc nông học; có thể làm việc tại vùng sản xuất theo lịch; thu thập số liệu hiện trường chính xác.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Cần Thơ',12,20,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Nông nghiệp","Trồng trọt","Canh tác"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-36','catalog-202609-company-18','catalog-202609-employer-18','Nông nghiệp & Môi trường','Nhân viên quan trắc môi trường','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Chuẩn bị thiết bị và lấy mẫu theo kế hoạch
• ghi nhận điều kiện hiện trường
• bảo quản, bàn giao mẫu và hoàn thiện biên bản.','Tốt nghiệp môi trường hoặc hóa; nắm quy trình lấy mẫu; tuân thủ an toàn và có thể đi hiện trường.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Đà Nẵng',11,18,date('now','+90 days'),'active','Dưới 1 năm','Toàn thời gian','["Môi trường","Quan trắc","Lấy mẫu"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-19','Chăm sóc khách hàng',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-19','catalog-202609-employer-19@example.invalid','disabled','employer','locked','Lắng Nghe Services',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-19');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-19','catalog-202609-employer-19','Lắng Nghe Services','Làm việc từ xa','Doanh nghiệp giả lập trong lĩnh vực chăm sóc khách hàng. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-37','catalog-202609-company-19','catalog-202609-employer-19','Chăm sóc khách hàng','Nhân viên hỗ trợ khách hàng qua chat','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Tiếp nhận câu hỏi qua chat
• hướng dẫn sử dụng dịch vụ theo tài liệu
• chuyển yêu cầu chuyên sâu và theo dõi đến khi xử lý xong.','Viết tiếng Việt rõ ràng; thao tác máy tính nhanh; có thiết bị và kết nối ổn định để làm việc theo ca tại nhà.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Làm việc từ xa',8,13,date('now','+90 days'),'active','Dưới 1 năm','Toàn thời gian','["CSKH","Chat","Remote"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-38','catalog-202609-company-19','catalog-202609-employer-19','Chăm sóc khách hàng','Chuyên viên trải nghiệm khách hàng','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Phân tích phản hồi và hành trình khách hàng
• đề xuất cải tiến quy trình
• phối hợp các nhóm theo dõi chỉ số hài lòng.','Có kinh nghiệm chăm sóc khách hàng hoặc vận hành; phân tích dữ liệu cơ bản; trình bày đề xuất cụ thể.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','TP. Hồ Chí Minh',15,23,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Customer Experience","CRM","Dịch vụ"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO categories(id,name,is_active) VALUES('catalog-202609-category-20','Hành chính & Văn phòng',1);
--> statement-breakpoint
INSERT OR IGNORE INTO users(id,email,password_hash,role,status,name,created_at) VALUES('catalog-202609-employer-20','catalog-202609-employer-20@example.invalid','disabled','employer','locked','Nếp Việt Office',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO profiles(user_id) VALUES('catalog-202609-employer-20');
--> statement-breakpoint
INSERT OR IGNORE INTO companies(id,owner_id,name,address,description,status,is_demo) VALUES('catalog-202609-company-20','catalog-202609-employer-20','Nếp Việt Office','Hà Nội','Doanh nghiệp giả lập trong lĩnh vực hành chính & văn phòng. Tên công ty và các vị trí tuyển dụng chỉ dùng để minh họa website; không phải thông báo tuyển dụng thực tế.','verified',1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-39','catalog-202609-company-20','catalog-202609-employer-20','Hành chính & Văn phòng','Nhân viên hành chính văn phòng','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Quản lý văn phòng phẩm và lịch phòng họp
• tiếp nhận công văn
• hỗ trợ hậu cần cho các hoạt động nội bộ.','Sử dụng Word và Excel; tổ chức công việc tốt; giao tiếp lịch sự và lưu trữ hồ sơ cẩn thận.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Hà Nội',8,13,date('now','+90 days'),'active','Dưới 1 năm','Toàn thời gian','["Hành chính","Văn phòng","Office"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
--> statement-breakpoint
INSERT OR IGNORE INTO jobs(id,company_id,created_by,category,title,description,requirements,benefits,location,salary_min,salary_max,deadline,status,experience,type,tags,created_at,updated_at,is_demo) VALUES('catalog-202609-job-40','catalog-202609-company-20','catalog-202609-employer-20','Hành chính & Văn phòng','Trợ lý dự án','TIN MẪU MINH HỌA — không phải vị trí đang tuyển thực tế.

Cập nhật kế hoạch và biên bản họp
• theo dõi đầu việc, thời hạn và tài liệu
• tổng hợp báo cáo tiến độ cho quản lý dự án.','Có kinh nghiệm điều phối hoặc hỗ trợ dự án; sử dụng công cụ quản lý công việc; viết báo cáo rõ ràng.','Lương cơ bản tham khảo theo khoảng hiển thị, đơn vị triệu đồng/tháng, trước các khoản khấu trừ. Đào tạo theo vị trí, đánh giá năng lực định kỳ; bảo hiểm và nghỉ phép theo chế độ áp dụng. Lịch làm việc và các khoản phụ cấp được trao đổi khi phỏng vấn.','Đà Nẵng',12,19,date('now','+90 days'),'active','1–3 năm','Toàn thời gian','["Trợ lý","Điều phối","Dự án"]',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'),1);
