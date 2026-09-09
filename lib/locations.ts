// Provincial units after Resolution 202/2025/QH15.
// https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm
export const provinces = [
  'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Cần Thơ',
  'Đà Nẵng', 'Đắk Lắk', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Nội', 'Hà Tĩnh', 'Hải Phòng', 'TP. Hồ Chí Minh',
  'Huế', 'Hưng Yên', 'Khánh Hòa', 'Lai Châu', 'Lâm Đồng',
  'Lạng Sơn', 'Lào Cai', 'Nghệ An', 'Ninh Bình', 'Phú Thọ',
  'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sơn La', 'Tây Ninh',
  'Thái Nguyên', 'Thanh Hóa', 'Tuyên Quang', 'Vĩnh Long',
];
export const locations = [...provinces, 'Làm việc từ xa'];
export const formerProvinces: Record<string, string> = {
  'Hà Giang': 'Tuyên Quang', 'Yên Bái': 'Lào Cai', 'Bắc Kạn': 'Thái Nguyên',
  'Vĩnh Phúc': 'Phú Thọ', 'Hòa Bình': 'Phú Thọ', 'Bắc Giang': 'Bắc Ninh',
  'Thái Bình': 'Hưng Yên', 'Hải Dương': 'Hải Phòng', 'Hà Nam': 'Ninh Bình',
  'Nam Định': 'Ninh Bình', 'Quảng Bình': 'Quảng Trị', 'Quảng Nam': 'Đà Nẵng',
  'Kon Tum': 'Quảng Ngãi', 'Bình Định': 'Gia Lai', 'Ninh Thuận': 'Khánh Hòa',
  'Đắk Nông': 'Lâm Đồng', 'Bình Thuận': 'Lâm Đồng', 'Phú Yên': 'Đắk Lắk',
  'Bà Rịa - Vũng Tàu': 'TP. Hồ Chí Minh', 'Bình Dương': 'TP. Hồ Chí Minh',
  'Bình Phước': 'Đồng Nai', 'Long An': 'Tây Ninh', 'Sóc Trăng': 'Cần Thơ',
  'Hậu Giang': 'Cần Thơ', 'Bến Tre': 'Vĩnh Long', 'Trà Vinh': 'Vĩnh Long',
  'Tiền Giang': 'Đồng Tháp', 'Bạc Liêu': 'Cà Mau', 'Kiên Giang': 'An Giang',
  'Thừa Thiên Huế': 'Huế', 'Thừa Thiên - Huế': 'Huế',
  'Hồ Chí Minh': 'TP. Hồ Chí Minh', 'Thành phố Hồ Chí Minh': 'TP. Hồ Chí Minh',
};
export function normalizeLocation(value: string) {
  const name = value.trim().normalize('NFC');
  return formerProvinces[name] || name;
}
export function locationAliases(value: string) {
  const name = normalizeLocation(value);
  return [name, ...Object.keys(formerProvinces).filter(old => formerProvinces[old] === name)];
}
