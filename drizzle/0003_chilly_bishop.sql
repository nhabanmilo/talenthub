ALTER TABLE `jobs` ADD `specialty` text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE jobs SET specialty='it/software/frontend' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%frontend%' OR title LIKE '%Frontend%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/software/backend' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%backend%' OR title LIKE '%Backend%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/software/mobile' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%mobile%' OR title LIKE '%Mobile%' OR title LIKE '%android%' OR title LIKE '%Android%' OR title LIKE '%ios%' OR title LIKE '%Ios%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/software/fullstack' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%fullstack%' OR title LIKE '%Fullstack%' OR title LIKE '%full stack%' OR title LIKE '%Full stack%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/data/engineer' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%kỹ sư dữ liệu%' OR title LIKE '%Kỹ sư dữ liệu%' OR title LIKE '%data engineer%' OR title LIKE '%Data engineer%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/data/analyst' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%data analyst%' OR title LIKE '%Data analyst%' OR title LIKE '%phân tích dữ liệu%' OR title LIKE '%Phân tích dữ liệu%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/data/ai' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%machine learning%' OR title LIKE '%Machine learning%' OR title LIKE '%kỹ sư ai%' OR title LIKE '%Kỹ sư ai%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/qa/manual' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%kiểm thử%' OR title LIKE '%Kiểm thử%' OR title LIKE '%tester%' OR title LIKE '%Tester%' OR title LIKE '%manual qa%' OR title LIKE '%Manual qa%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/qa/automation' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%automation test%' OR title LIKE '%Automation test%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/systems/devops' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%devops%' OR title LIKE '%Devops%' OR title LIKE '%cloud engineer%' OR title LIKE '%Cloud engineer%');

--> statement-breakpoint
UPDATE jobs SET specialty='it/systems/security' WHERE specialty='' AND category='Công nghệ thông tin' AND (title LIKE '%bảo mật%' OR title LIKE '%Bảo mật%' OR title LIKE '%an toàn thông tin%' OR title LIKE '%An toàn thông tin%');

--> statement-breakpoint
UPDATE jobs SET specialty='design/product/uxui' WHERE specialty='' AND category='Thiết kế & Sáng tạo' AND (title LIKE '%ui/ux%' OR title LIKE '%Ui/ux%' OR title LIKE '%ux designer%' OR title LIKE '%Ux designer%' OR title LIKE '%ui designer%' OR title LIKE '%Ui designer%' OR title LIKE '%thiết kế sản phẩm%' OR title LIKE '%Thiết kế sản phẩm%');

--> statement-breakpoint
UPDATE jobs SET specialty='design/visual/graphic' WHERE specialty='' AND category='Thiết kế & Sáng tạo' AND (title LIKE '%đồ họa%' OR title LIKE '%Đồ họa%' OR title LIKE '%đồ hoạ%' OR title LIKE '%Đồ hoạ%' OR title LIKE '%thương hiệu%' OR title LIKE '%Thương hiệu%' OR title LIKE '%graphic%' OR title LIKE '%Graphic%');

--> statement-breakpoint
UPDATE jobs SET specialty='design/visual/video' WHERE specialty='' AND category='Thiết kế & Sáng tạo' AND (title LIKE '%video%' OR title LIKE '%Video%' OR title LIKE '%dựng phim%' OR title LIKE '%Dựng phim%');

--> statement-breakpoint
UPDATE jobs SET specialty='sales/b2b/solutions' WHERE specialty='' AND category='Kinh doanh' AND (title LIKE '%giải pháp%' OR title LIKE '%Giải pháp%' OR title LIKE '%b2b%' OR title LIKE '%B2b%');

--> statement-breakpoint
UPDATE jobs SET specialty='sales/b2b/development' WHERE specialty='' AND category='Kinh doanh' AND (title LIKE '%phát triển kinh doanh%' OR title LIKE '%Phát triển kinh doanh%');

--> statement-breakpoint
UPDATE jobs SET specialty='sales/b2c/store' WHERE specialty='' AND category='Kinh doanh' AND (title LIKE '%cửa hàng%' OR title LIKE '%Cửa hàng%' OR title LIKE '%tư vấn khách hàng%' OR title LIKE '%Tư vấn khách hàng%');

--> statement-breakpoint
UPDATE jobs SET specialty='sales/b2c/telesales' WHERE specialty='' AND category='Kinh doanh' AND (title LIKE '%telesales%' OR title LIKE '%Telesales%' OR title LIKE '%bán hàng qua điện thoại%' OR title LIKE '%Bán hàng qua điện thoại%');

--> statement-breakpoint
UPDATE jobs SET specialty='marketing/digital/ads' WHERE specialty='' AND category='Marketing' AND (title LIKE '%quảng cáo%' OR title LIKE '%Quảng cáo%' OR title LIKE '%performance%' OR title LIKE '%Performance%');

--> statement-breakpoint
UPDATE jobs SET specialty='marketing/digital/seo' WHERE specialty='' AND category='Marketing' AND (title LIKE '%seo%' OR title LIKE '%Seo%' OR title LIKE '%sem%' OR title LIKE '%Sem%');

--> statement-breakpoint
UPDATE jobs SET specialty='marketing/digital/digital' WHERE specialty='' AND category='Marketing' AND (title LIKE '%digital marketing%' OR title LIKE '%Digital marketing%');

--> statement-breakpoint
UPDATE jobs SET specialty='marketing/content/content' WHERE specialty='' AND category='Marketing' AND (title LIKE '%content%' OR title LIKE '%Content%' OR title LIKE '%nội dung%' OR title LIKE '%Nội dung%');

--> statement-breakpoint
UPDATE jobs SET specialty='marketing/content/social' WHERE specialty='' AND category='Marketing' AND (title LIKE '%social%' OR title LIKE '%Social%' OR title LIKE '%mạng xã hội%' OR title LIKE '%Mạng xã hội%');

--> statement-breakpoint
UPDATE jobs SET specialty='finance/accounting/general' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%kế toán tổng hợp%' OR title LIKE '%Kế toán tổng hợp%');

--> statement-breakpoint
UPDATE jobs SET specialty='finance/accounting/tax' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%kế toán thuế%' OR title LIKE '%Kế toán thuế%');

--> statement-breakpoint
UPDATE jobs SET specialty='finance/accounting/payable' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%công nợ%' OR title LIKE '%Công nợ%');

--> statement-breakpoint
UPDATE jobs SET specialty='finance/analysis/fpa' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%phân tích tài chính%' OR title LIKE '%Phân tích tài chính%' OR title LIKE '%fp&a%' OR title LIKE '%Fp&a%');

--> statement-breakpoint
UPDATE jobs SET specialty='finance/analysis/audit' WHERE specialty='' AND category='Tài chính & Kế toán' AND (title LIKE '%kiểm toán%' OR title LIKE '%Kiểm toán%');

--> statement-breakpoint
UPDATE jobs SET specialty='hr/recruitment/recruiter' WHERE specialty='' AND category='Nhân sự' AND (title LIKE '%chuyên viên tuyển dụng%' OR title LIKE '%Chuyên viên tuyển dụng%');

--> statement-breakpoint
UPDATE jobs SET specialty='hr/recruitment/intern' WHERE specialty='' AND category='Nhân sự' AND (title LIKE '%thực tập sinh tuyển dụng%' OR title LIKE '%Thực tập sinh tuyển dụng%');

--> statement-breakpoint
UPDATE jobs SET specialty='hr/operations/payroll' WHERE specialty='' AND category='Nhân sự' AND (title LIKE '%tiền lương%' OR title LIKE '%Tiền lương%' OR title LIKE '%phúc lợi%' OR title LIKE '%Phúc lợi%' OR title LIKE '%c&b%' OR title LIKE '%C&b%');

--> statement-breakpoint
UPDATE jobs SET specialty='hr/operations/training' WHERE specialty='' AND category='Nhân sự' AND (title LIKE '%đào tạo nội bộ%' OR title LIKE '%Đào tạo nội bộ%');

--> statement-breakpoint
UPDATE jobs SET specialty='education/teaching/english' WHERE specialty='' AND category='Giáo dục & Đào tạo' AND (title LIKE '%giáo viên tiếng anh%' OR title LIKE '%Giáo viên tiếng anh%');

--> statement-breakpoint
UPDATE jobs SET specialty='education/teaching/teacher' WHERE specialty='' AND category='Giáo dục & Đào tạo' AND (title LIKE '%giảng viên%' OR title LIKE '%Giảng viên%');

--> statement-breakpoint
UPDATE jobs SET specialty='education/support/assistant' WHERE specialty='' AND category='Giáo dục & Đào tạo' AND (title LIKE '%trợ giảng%' OR title LIKE '%Trợ giảng%');

--> statement-breakpoint
UPDATE jobs SET specialty='education/support/academic' WHERE specialty='' AND category='Giáo dục & Đào tạo' AND (title LIKE '%giáo vụ%' OR title LIKE '%Giáo vụ%' OR title LIKE '%học viên%' OR title LIKE '%Học viên%');

--> statement-breakpoint
UPDATE jobs SET specialty='health/clinical/nurse' WHERE specialty='' AND category='Y tế & Chăm sóc sức khỏe' AND (title LIKE '%điều dưỡng%' OR title LIKE '%Điều dưỡng%');

--> statement-breakpoint
UPDATE jobs SET specialty='health/clinical/doctor' WHERE specialty='' AND category='Y tế & Chăm sóc sức khỏe' AND (title LIKE '%bác sĩ%' OR title LIKE '%Bác sĩ%');

--> statement-breakpoint
UPDATE jobs SET specialty='health/operations/coordinator' WHERE specialty='' AND category='Y tế & Chăm sóc sức khỏe' AND (title LIKE '%điều phối lịch khám%' OR title LIKE '%Điều phối lịch khám%');

--> statement-breakpoint
UPDATE jobs SET specialty='health/operations/reception' WHERE specialty='' AND category='Y tế & Chăm sóc sức khỏe' AND (title LIKE '%lễ tân y tế%' OR title LIKE '%Lễ tân y tế%');

--> statement-breakpoint
UPDATE jobs SET specialty='pharma/quality/lab' WHERE specialty='' AND category='Dược phẩm & Công nghệ sinh học' AND (title LIKE '%kiểm nghiệm%' OR title LIKE '%Kiểm nghiệm%');

--> statement-breakpoint
UPDATE jobs SET specialty='pharma/quality/qa' WHERE specialty='' AND category='Dược phẩm & Công nghệ sinh học' AND (title LIKE '%đảm bảo chất lượng%' OR title LIKE '%Đảm bảo chất lượng%');

--> statement-breakpoint
UPDATE jobs SET specialty='pharma/regulatory/registration' WHERE specialty='' AND category='Dược phẩm & Công nghệ sinh học' AND (title LIKE '%hồ sơ sản phẩm%' OR title LIKE '%Hồ sơ sản phẩm%');

--> statement-breakpoint
UPDATE jobs SET specialty='logistics/trade/documents' WHERE specialty='' AND category='Logistics & Chuỗi cung ứng' AND (title LIKE '%chứng từ%' OR title LIKE '%Chứng từ%');

--> statement-breakpoint
UPDATE jobs SET specialty='logistics/trade/customs' WHERE specialty='' AND category='Logistics & Chuỗi cung ứng' AND (title LIKE '%hải quan%' OR title LIKE '%Hải quan%');

--> statement-breakpoint
UPDATE jobs SET specialty='logistics/transport/dispatch' WHERE specialty='' AND category='Logistics & Chuỗi cung ứng' AND (title LIKE '%điều phối vận tải%' OR title LIKE '%Điều phối vận tải%');

--> statement-breakpoint
UPDATE jobs SET specialty='logistics/transport/warehouse' WHERE specialty='' AND category='Logistics & Chuỗi cung ứng' AND (title LIKE '%kho%' OR title LIKE '%Kho%');

--> statement-breakpoint
UPDATE jobs SET specialty='production/quality/qc' WHERE specialty='' AND category='Sản xuất & Quản lý chất lượng' AND (title LIKE '%chất lượng%' OR title LIKE '%Chất lượng%' OR title LIKE '%qa%' OR title LIKE '%Qa%' OR title LIKE '%qc%' OR title LIKE '%Qc%');

--> statement-breakpoint
UPDATE jobs SET specialty='production/planning/planner' WHERE specialty='' AND category='Sản xuất & Quản lý chất lượng' AND (title LIKE '%kế hoạch%' OR title LIKE '%Kế hoạch%');

--> statement-breakpoint
UPDATE jobs SET specialty='production/planning/operator' WHERE specialty='' AND category='Sản xuất & Quản lý chất lượng' AND (title LIKE '%vận hành%' OR title LIKE '%Vận hành%');

--> statement-breakpoint
UPDATE jobs SET specialty='engineering/automation/plc' WHERE specialty='' AND category='Cơ khí & Điện tự động hóa' AND (title LIKE '%plc%' OR title LIKE '%Plc%' OR title LIKE '%hmi%' OR title LIKE '%Hmi%');

--> statement-breakpoint
UPDATE jobs SET specialty='engineering/automation/electrical' WHERE specialty='' AND category='Cơ khí & Điện tự động hóa' AND (title LIKE '%kỹ thuật điện%' OR title LIKE '%Kỹ thuật điện%');

--> statement-breakpoint
UPDATE jobs SET specialty='engineering/mechanical/maintenance' WHERE specialty='' AND category='Cơ khí & Điện tự động hóa' AND (title LIKE '%bảo trì%' OR title LIKE '%Bảo trì%');

--> statement-breakpoint
UPDATE jobs SET specialty='engineering/mechanical/design' WHERE specialty='' AND category='Cơ khí & Điện tự động hóa' AND (title LIKE '%thiết kế cơ khí%' OR title LIKE '%Thiết kế cơ khí%');

--> statement-breakpoint
UPDATE jobs SET specialty='construction/architecture/architect' WHERE specialty='' AND category='Xây dựng & Kiến trúc' AND (title LIKE '%kiến trúc sư%' OR title LIKE '%Kiến trúc sư%');

--> statement-breakpoint
UPDATE jobs SET specialty='construction/architecture/interior' WHERE specialty='' AND category='Xây dựng & Kiến trúc' AND (title LIKE '%nội thất%' OR title LIKE '%Nội thất%');

--> statement-breakpoint
UPDATE jobs SET specialty='construction/civil/qs' WHERE specialty='' AND category='Xây dựng & Kiến trúc' AND (title LIKE '%dự toán%' OR title LIKE '%Dự toán%' OR title LIKE '%qs%' OR title LIKE '%Qs%');

--> statement-breakpoint
UPDATE jobs SET specialty='construction/civil/site' WHERE specialty='' AND category='Xây dựng & Kiến trúc' AND (title LIKE '%hiện trường%' OR title LIKE '%Hiện trường%' OR title LIKE '%giám sát%' OR title LIKE '%Giám sát%');

--> statement-breakpoint
UPDATE jobs SET specialty='tourism/hotel/reception' WHERE specialty='' AND category='Du lịch & Khách sạn' AND (title LIKE '%lễ tân%' OR title LIKE '%Lễ tân%');

--> statement-breakpoint
UPDATE jobs SET specialty='tourism/hotel/housekeeping' WHERE specialty='' AND category='Du lịch & Khách sạn' AND (title LIKE '%buồng phòng%' OR title LIKE '%Buồng phòng%');

--> statement-breakpoint
UPDATE jobs SET specialty='tourism/travel/operations' WHERE specialty='' AND category='Du lịch & Khách sạn' AND (title LIKE '%điều hành tour%' OR title LIKE '%Điều hành tour%');

--> statement-breakpoint
UPDATE jobs SET specialty='tourism/travel/guide' WHERE specialty='' AND category='Du lịch & Khách sạn' AND (title LIKE '%hướng dẫn viên%' OR title LIKE '%Hướng dẫn viên%');

--> statement-breakpoint
UPDATE jobs SET specialty='food/kitchen/assistant' WHERE specialty='' AND category='Nhà hàng & Thực phẩm' AND (title LIKE '%phụ bếp%' OR title LIKE '%Phụ bếp%');

--> statement-breakpoint
UPDATE jobs SET specialty='food/kitchen/chef' WHERE specialty='' AND category='Nhà hàng & Thực phẩm' AND (title LIKE '%đầu bếp%' OR title LIKE '%Đầu bếp%');

--> statement-breakpoint
UPDATE jobs SET specialty='food/service/supervisor' WHERE specialty='' AND category='Nhà hàng & Thực phẩm' AND (title LIKE '%giám sát ca%' OR title LIKE '%Giám sát ca%');

--> statement-breakpoint
UPDATE jobs SET specialty='food/service/waiter' WHERE specialty='' AND category='Nhà hàng & Thực phẩm' AND (title LIKE '%phục vụ%' OR title LIKE '%Phục vụ%');

--> statement-breakpoint
UPDATE jobs SET specialty='retail/ecommerce/operations' WHERE specialty='' AND category='Bán lẻ & Thương mại điện tử' AND (title LIKE '%vận hành sàn%' OR title LIKE '%Vận hành sàn%');

--> statement-breakpoint
UPDATE jobs SET specialty='retail/ecommerce/livestream' WHERE specialty='' AND category='Bán lẻ & Thương mại điện tử' AND (title LIKE '%livestream%' OR title LIKE '%Livestream%');

--> statement-breakpoint
UPDATE jobs SET specialty='retail/store/merchandising' WHERE specialty='' AND category='Bán lẻ & Thương mại điện tử' AND (title LIKE '%trưng bày%' OR title LIKE '%Trưng bày%');

--> statement-breakpoint
UPDATE jobs SET specialty='retail/store/manager' WHERE specialty='' AND category='Bán lẻ & Thương mại điện tử' AND (title LIKE '%quản lý cửa hàng%' OR title LIKE '%Quản lý cửa hàng%');

--> statement-breakpoint
UPDATE jobs SET specialty='legal/legal/contract' WHERE specialty='' AND category='Pháp lý & Tuân thủ' AND (title LIKE '%hợp đồng%' OR title LIKE '%Hợp đồng%');

--> statement-breakpoint
UPDATE jobs SET specialty='legal/legal/corporate' WHERE specialty='' AND category='Pháp lý & Tuân thủ' AND (title LIKE '%pháp chế doanh nghiệp%' OR title LIKE '%Pháp chế doanh nghiệp%');

--> statement-breakpoint
UPDATE jobs SET specialty='legal/compliance/compliance' WHERE specialty='' AND category='Pháp lý & Tuân thủ' AND (title LIKE '%tuân thủ%' OR title LIKE '%Tuân thủ%');

--> statement-breakpoint
UPDATE jobs SET specialty='agri/agriculture/crops' WHERE specialty='' AND category='Nông nghiệp & Môi trường' AND (title LIKE '%trồng trọt%' OR title LIKE '%Trồng trọt%');

--> statement-breakpoint
UPDATE jobs SET specialty='agri/agriculture/livestock' WHERE specialty='' AND category='Nông nghiệp & Môi trường' AND (title LIKE '%chăn nuôi%' OR title LIKE '%Chăn nuôi%');

--> statement-breakpoint
UPDATE jobs SET specialty='agri/environment/monitoring' WHERE specialty='' AND category='Nông nghiệp & Môi trường' AND (title LIKE '%quan trắc%' OR title LIKE '%Quan trắc%');

--> statement-breakpoint
UPDATE jobs SET specialty='agri/environment/treatment' WHERE specialty='' AND category='Nông nghiệp & Môi trường' AND (title LIKE '%xử lý môi trường%' OR title LIKE '%Xử lý môi trường%');

--> statement-breakpoint
UPDATE jobs SET specialty='service/support/chat' WHERE specialty='' AND category='Chăm sóc khách hàng' AND (title LIKE '%qua chat%' OR title LIKE '%Qua chat%');

--> statement-breakpoint
UPDATE jobs SET specialty='service/support/call' WHERE specialty='' AND category='Chăm sóc khách hàng' AND (title LIKE '%tổng đài%' OR title LIKE '%Tổng đài%');

--> statement-breakpoint
UPDATE jobs SET specialty='service/experience/cx' WHERE specialty='' AND category='Chăm sóc khách hàng' AND (title LIKE '%trải nghiệm khách hàng%' OR title LIKE '%Trải nghiệm khách hàng%');

--> statement-breakpoint
UPDATE jobs SET specialty='admin/office/administrator' WHERE specialty='' AND category='Hành chính & Văn phòng' AND (title LIKE '%hành chính%' OR title LIKE '%Hành chính%');

--> statement-breakpoint
UPDATE jobs SET specialty='admin/office/reception' WHERE specialty='' AND category='Hành chính & Văn phòng' AND (title LIKE '%lễ tân%' OR title LIKE '%Lễ tân%');

--> statement-breakpoint
UPDATE jobs SET specialty='admin/assistant/project' WHERE specialty='' AND category='Hành chính & Văn phòng' AND (title LIKE '%trợ lý dự án%' OR title LIKE '%Trợ lý dự án%');

--> statement-breakpoint
UPDATE jobs SET specialty='admin/assistant/executive' WHERE specialty='' AND category='Hành chính & Văn phòng' AND (title LIKE '%trợ lý điều hành%' OR title LIKE '%Trợ lý điều hành%');
