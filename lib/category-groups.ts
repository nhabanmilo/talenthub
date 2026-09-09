export const categoryGroups = [
  { id: 'digital', name: 'Công nghệ & Sáng tạo', children: ['Công nghệ thông tin', 'Thiết kế & Sáng tạo'] },
  { id: 'business', name: 'Kinh doanh & Tiếp thị', children: ['Kinh doanh', 'Marketing', 'Bán lẻ & Thương mại điện tử', 'Chăm sóc khách hàng'] },
  { id: 'office', name: 'Quản trị & Văn phòng', children: ['Tài chính & Kế toán', 'Nhân sự', 'Hành chính & Văn phòng', 'Pháp lý & Tuân thủ'] },
  { id: 'engineering', name: 'Kỹ thuật & Sản xuất', children: ['Cơ khí & Điện tự động hóa', 'Sản xuất & Quản lý chất lượng', 'Xây dựng & Kiến trúc', 'Logistics & Chuỗi cung ứng'] },
  { id: 'health', name: 'Y tế & Khoa học sự sống', children: ['Y tế & Chăm sóc sức khỏe', 'Dược phẩm & Công nghệ sinh học', 'Nông nghiệp & Môi trường'] },
  { id: 'education', name: 'Giáo dục & Đào tạo', children: ['Giáo dục & Đào tạo'] },
  { id: 'hospitality', name: 'Du lịch & Dịch vụ ăn uống', children: ['Du lịch & Khách sạn', 'Nhà hàng & Thực phẩm'] },
];
export function categoryFilterNames(value: string) {
  return categoryGroups.find(group => '@group:' + group.id === value)?.children || [value];
}
export function visibleCategoryGroups(names: string[]) {
  const groups = categoryGroups.map(group => ({ ...group, children: group.children.filter(name => names.includes(name)) })).filter(group => group.children.length);
  const other = names.filter(name => !categoryGroups.some(group => group.children.includes(name)));
  return other.length ? [...groups, { id: 'other', name: 'Ngành nghề khác', children: other }] : groups;
}
