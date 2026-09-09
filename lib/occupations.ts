// TalentHub taxonomy: group → occupation → specialty. Inspired by the three-level
// selection pattern at https://www.topcv.vn/viec-lam; labels are curated for this catalog.
type RoleInput = [string, string, [string, string, string[]][]];
function group(id: string, category: string, roles: RoleInput[]) {
  return { id, category, roles: roles.map(([key, name, leaves]) => ({ id: id + '/' + key, name,
    specialties: leaves.map(([key2, name2, keywords]) => ({ id: id + '/' + key + '/' + key2, name: name2, keywords })) })) };
}
export const occupations = [
 group('it','Công nghệ thông tin',[
  ['software','Phát triển phần mềm', [['frontend','Lập trình Frontend',['frontend']],['backend','Lập trình Backend',['backend']],['mobile','Lập trình di động',['mobile','android','ios']],['fullstack','Lập trình Fullstack',['fullstack','full stack']]]],
  ['data','Dữ liệu & Trí tuệ nhân tạo',[['engineer','Kỹ sư dữ liệu',['kỹ sư dữ liệu','data engineer']],['analyst','Phân tích dữ liệu',['data analyst','phân tích dữ liệu']],['ai','Kỹ sư AI / Machine Learning',['machine learning','kỹ sư ai']]]],
  ['qa','Kiểm thử phần mềm',[['manual','Kiểm thử thủ công',['kiểm thử','tester','manual qa']],['automation','Kiểm thử tự động',['automation test']]]],
  ['systems','Hạ tầng & Bảo mật',[['devops','DevOps / Cloud',['devops','cloud engineer']],['security','An toàn thông tin',['bảo mật','an toàn thông tin']]]],
 ]),
 group('design','Thiết kế & Sáng tạo',[
  ['product','Thiết kế sản phẩm số',[['uxui','UI/UX Designer',['ui/ux','ux designer','ui designer','thiết kế sản phẩm']]]],
  ['visual','Thiết kế truyền thông',[['graphic','Thiết kế đồ họa / Thương hiệu',['đồ họa','đồ hoạ','thương hiệu','graphic']],['video','Dựng phim / Biên tập video',['video','dựng phim']]]],
 ]),
 group('sales','Kinh doanh',[
  ['b2b','Kinh doanh doanh nghiệp',[['solutions','Kinh doanh giải pháp B2B',['giải pháp','b2b']],['development','Phát triển kinh doanh',['phát triển kinh doanh']]]],
  ['b2c','Bán hàng & Tư vấn',[['store','Tư vấn bán hàng tại cửa hàng',['cửa hàng','tư vấn khách hàng']],['telesales','Telesales',['telesales','bán hàng qua điện thoại']]]],
 ]),
 group('marketing','Marketing',[
  ['digital','Digital Marketing',[['ads','Quảng cáo hiệu suất',['quảng cáo','performance']],['seo','SEO / SEM',['seo','sem']],['digital','Digital Marketing tổng hợp',['digital marketing']]]],
  ['content','Nội dung & Truyền thông',[['content','Content Marketing',['content','nội dung']],['social','Social Media',['social','mạng xã hội']]]],
 ]),
 group('finance','Tài chính & Kế toán',[
  ['accounting','Kế toán',[['general','Kế toán tổng hợp',['kế toán tổng hợp']],['tax','Kế toán thuế',['kế toán thuế']],['payable','Kế toán công nợ',['công nợ']]]],
  ['analysis','Phân tích & Kế hoạch tài chính',[['fpa','Phân tích tài chính / FP&A',['phân tích tài chính','fp&a']],['audit','Kiểm toán',['kiểm toán']]]],
 ]),
 group('hr','Nhân sự',[
  ['recruitment','Tuyển dụng',[['recruiter','Chuyên viên tuyển dụng',['chuyên viên tuyển dụng']],['intern','Thực tập sinh tuyển dụng',['thực tập sinh tuyển dụng']]]],
  ['operations','Vận hành nhân sự',[['payroll','Tiền lương & Phúc lợi (C&B)',['tiền lương','phúc lợi','c&b']],['training','Đào tạo nội bộ',['đào tạo nội bộ']]]],
 ]),
 group('education','Giáo dục & Đào tạo',[
  ['teaching','Giảng dạy',[['english','Giáo viên tiếng Anh',['giáo viên tiếng anh']],['teacher','Giáo viên / Giảng viên',['giảng viên']]]],
  ['support','Hỗ trợ đào tạo',[['assistant','Trợ giảng',['trợ giảng']],['academic','Giáo vụ / Quản lý học viên',['giáo vụ','học viên']]]],
 ]),
 group('health','Y tế & Chăm sóc sức khỏe',[
  ['clinical','Khám chữa bệnh & Điều dưỡng',[['nurse','Điều dưỡng',['điều dưỡng']],['doctor','Bác sĩ',['bác sĩ']]]],
  ['operations','Vận hành cơ sở y tế',[['coordinator','Điều phối lịch khám',['điều phối lịch khám']],['reception','Lễ tân y tế',['lễ tân y tế']]]],
 ]),
 group('pharma','Dược phẩm & Công nghệ sinh học',[
  ['quality','Kiểm nghiệm & Chất lượng',[['lab','Kiểm nghiệm phòng thí nghiệm',['kiểm nghiệm']],['qa','Đảm bảo chất lượng dược',['đảm bảo chất lượng']]]],
  ['regulatory','Hồ sơ & Đăng ký sản phẩm',[['registration','Hồ sơ sản phẩm',['hồ sơ sản phẩm']]]],
 ]),
 group('logistics','Logistics & Chuỗi cung ứng',[
  ['trade','Xuất nhập khẩu',[['documents','Chứng từ xuất nhập khẩu',['chứng từ']],['customs','Khai báo hải quan',['hải quan']]]],
  ['transport','Vận tải & Kho vận',[['dispatch','Điều phối vận tải',['điều phối vận tải']],['warehouse','Quản lý kho',['kho']]]],
 ]),
 group('production','Sản xuất & Quản lý chất lượng',[
  ['quality','Quản lý chất lượng',[['qc','QA / QC sản xuất',['chất lượng','qa','qc']]]],
  ['planning','Kế hoạch & Vận hành sản xuất',[['planner','Kế hoạch sản xuất',['kế hoạch']],['operator','Vận hành dây chuyền',['vận hành']]]],
 ]),
 group('engineering','Cơ khí & Điện tự động hóa',[
  ['automation','Điện & Tự động hóa',[['plc','Lập trình PLC / HMI',['plc','hmi']],['electrical','Kỹ thuật điện',['kỹ thuật điện']]]],
  ['mechanical','Cơ khí & Bảo trì',[['maintenance','Bảo trì cơ khí',['bảo trì']],['design','Thiết kế cơ khí',['thiết kế cơ khí']]]],
 ]),
 group('construction','Xây dựng & Kiến trúc',[
  ['architecture','Thiết kế kiến trúc',[['architect','Kiến trúc sư',['kiến trúc sư']],['interior','Thiết kế nội thất',['nội thất']]]],
  ['civil','Kỹ thuật xây dựng',[['qs','Dự toán / QS',['dự toán','qs']],['site','Kỹ sư hiện trường',['hiện trường','giám sát']]]],
 ]),
 group('tourism','Du lịch & Khách sạn',[
  ['hotel','Dịch vụ khách sạn',[['reception','Lễ tân khách sạn',['lễ tân']],['housekeeping','Buồng phòng',['buồng phòng']]]],
  ['travel','Lữ hành',[['operations','Điều hành tour',['điều hành tour']],['guide','Hướng dẫn viên',['hướng dẫn viên']]]],
 ]),
 group('food','Nhà hàng & Thực phẩm',[
  ['kitchen','Bếp & Chế biến',[['assistant','Phụ bếp',['phụ bếp']],['chef','Đầu bếp',['đầu bếp']]]],
  ['service','Vận hành nhà hàng',[['supervisor','Giám sát ca nhà hàng',['giám sát ca']],['waiter','Phục vụ nhà hàng',['phục vụ']]]],
 ]),
 group('retail','Bán lẻ & Thương mại điện tử',[
  ['ecommerce','Thương mại điện tử',[['operations','Vận hành sàn',['vận hành sàn']],['livestream','Bán hàng livestream',['livestream']]]],
  ['store','Vận hành bán lẻ',[['merchandising','Trưng bày hàng hóa',['trưng bày']],['manager','Quản lý cửa hàng',['quản lý cửa hàng']]]],
 ]),
 group('legal','Pháp lý & Tuân thủ',[
  ['legal','Pháp chế',[['contract','Pháp chế hợp đồng',['hợp đồng']],['corporate','Pháp chế doanh nghiệp',['pháp chế doanh nghiệp']]]],
  ['compliance','Tuân thủ & Kiểm soát',[['compliance','Tuân thủ nội bộ',['tuân thủ']]]],
 ]),
 group('agri','Nông nghiệp & Môi trường',[
  ['agriculture','Nông nghiệp',[['crops','Kỹ thuật trồng trọt',['trồng trọt']],['livestock','Kỹ thuật chăn nuôi',['chăn nuôi']]]],
  ['environment','Môi trường',[['monitoring','Quan trắc môi trường',['quan trắc']],['treatment','Xử lý môi trường',['xử lý môi trường']]]],
 ]),
 group('service','Chăm sóc khách hàng',[
  ['support','Hỗ trợ khách hàng',[['chat','Hỗ trợ qua chat',['qua chat']],['call','Tổng đài chăm sóc khách hàng',['tổng đài']]]],
  ['experience','Trải nghiệm khách hàng',[['cx','Chuyên viên trải nghiệm khách hàng',['trải nghiệm khách hàng']]]],
 ]),
 group('admin','Hành chính & Văn phòng',[
  ['office','Hành chính',[['administrator','Hành chính văn phòng',['hành chính']],['reception','Lễ tân văn phòng',['lễ tân']]]],
  ['assistant','Thư ký & Trợ lý',[['project','Trợ lý dự án',['trợ lý dự án']],['executive','Trợ lý điều hành',['trợ lý điều hành']]]],
 ]),
];
export const specialties = occupations.flatMap(g => g.roles.flatMap(r => r.specialties.map(s => ({ ...s, category: g.category, groupId: g.id, roleId: r.id, roleName: r.name }))));
export function inferSpecialty(category: string, title: string) {
  const text = title.toLocaleLowerCase('vi');
  return specialties.filter(s => s.category === category).find(s => s.keywords.some(k => text.includes(k)))?.id || '';
}
export function occupationSelection(value: string) {
  if (value.startsWith('@specialty:')) {
    const leaf = specialties.find(s => s.id === value.slice(11));
    return leaf ? { category: leaf.category, ids: [leaf.id], label: leaf.name } : null;
  }
  if (value.startsWith('@role:')) {
    const leaves = specialties.filter(s => s.roleId === value.slice(6));
    return leaves.length ? { category: leaves[0].category, ids: leaves.map(s => s.id), label: leaves[0].roleName } : null;
  }
  return null;
}
