export const cvTemplates = ['professional', 'modern', 'minimal'] as const;
export const cvFields = {
  name: 'Họ và tên',
  headline: 'Vị trí mong muốn',
  email: 'Email',
  phone: 'Số điện thoại',
  location: 'Địa điểm',
  summary: 'Giới thiệu',
  experience: 'Kinh nghiệm làm việc',
  education: 'Học vấn',
  skills: 'Kỹ năng',
  projects: 'Dự án và thành tựu',
};
export type CVContent = Record<keyof typeof cvFields, string> & {
  template: (typeof cvTemplates)[number];
};
export function cleanCV(value: unknown): CVContent {
  const input = value as Record<string, unknown>;
  if (
    !input ||
    typeof input !== 'object' ||
    !cvTemplates.includes(input.template as CVContent['template'])
  )
    throw new Error('Mẫu CV không hợp lệ.');
  const content = { template: input.template } as CVContent;
  for (const key of Object.keys(cvFields) as (keyof typeof cvFields)[]) {
    if (
      typeof input[key] !== 'string' ||
      input[key].length >
        (['name', 'headline', 'email', 'phone', 'location'].includes(key)
          ? 200
          : 6000)
    )
      throw new Error('Nội dung CV quá dài hoặc không hợp lệ.');
    content[key] = (input[key] as string).trim();
  }
  if (!content.name) throw new Error('Vui lòng nhập họ và tên.');
  return content;
}
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();
export type CareerPreferences = {
  category?: string;
  location?: string;
  salary_min?: number | string;
  experience?: string;
  skills?: string;
};
export type CareerJob = {
  id: string;
  title: string;
  category: string;
  location: string;
  created_at: string;
  experience?: string;
  requirements?: string;
  tags?: string;
  salary_min: number;
  salary_max: number;
  company_name?: string;
};
export type CareerDocument = {
  id?: string;
  title: string;
  content: CVContent;
  updated_at?: string;
};
export type CareerData = {
  documents: CareerDocument[];
  preferences: CareerPreferences;
  recommendations: (CareerJob & { score: number; reasons: string[] })[];
};
export function recommend(jobs: CareerJob[], preferences: CareerPreferences) {
  const skills = [
    ...new Set(
      String(preferences.skills || '')
        .split(/[,;\n]/)
        .map((s) => fold(s.trim()))
        .filter((s) => s.length > 1),
    ),
  ].slice(0, 30);
  return jobs
    .map((j) => {
      let score = 0;
      const reasons: string[] = [];
      if (preferences.category && j.category === preferences.category) {
        score += 4;
        reasons.push('Đúng ngành mong muốn');
      }
      if (preferences.location && j.location === preferences.location) {
        score += 3;
        reasons.push('Đúng địa điểm');
      }
      if (preferences.experience && j.experience === preferences.experience) {
        score += 2;
        reasons.push('Phù hợp mức kinh nghiệm');
      }
      if (
        Number(preferences.salary_min) > 0 &&
        j.salary_max >= Number(preferences.salary_min)
      ) {
        score += 2;
        reasons.push('Đạt mức lương mong muốn');
      }
      const text = fold([j.title, j.requirements, j.tags].join(' '));
      const matched = skills.filter((s) => text.includes(s));
      if (matched.length) {
        score += Math.min(matched.length, 5);
        reasons.push('Kỹ năng trùng khớp: ' + matched.join(', '));
      }
      return { ...j, score, reasons };
    })
    .filter((j) => j.score > 0)
    .sort(
      (a, b) => b.score - a.score || b.created_at.localeCompare(a.created_at),
    )
    .slice(0, 20);
}
// Monthly resident employment income, 2026 schedule. Insurance is the actual
// employee deduction entered by the user, not an assumed contribution base.
export function salary2026(
  gross: number,
  insurance: number,
  dependents: number,
) {
  if (
    ![gross, insurance, dependents].every(Number.isFinite) ||
    gross < 0 ||
    insurance < 0 ||
    insurance > gross ||
    !Number.isInteger(dependents) ||
    dependents < 0 ||
    dependents > 20
  )
    throw new Error('Kiểm tra lại lương, bảo hiểm và số người phụ thuộc.');
  const deduction = 15500000 + dependents * 6200000;
  const taxable = Math.max(0, gross - insurance - deduction);
  let remaining = taxable,
    tax = 0;
  for (const [width, rate] of [
    [10000000, 0.05],
    [20000000, 0.1],
    [30000000, 0.2],
    [40000000, 0.3],
    [Infinity, 0.35],
  ]) {
    const part = Math.min(remaining, width);
    tax += part * rate;
    remaining -= part;
  }
  return {
    gross,
    insurance,
    deduction,
    taxable,
    tax: Math.round(tax),
    net: Math.round(gross - insurance - tax),
  };
}
export function grossFromNet(
  net: number,
  insurance: number,
  dependents: number,
) {
  if (!Number.isFinite(net) || net < 0 || net > 1e12)
    throw new Error('Lương net không hợp lệ.');
  salary2026(Math.max(insurance, 0), insurance, dependents);
  let lo = net + insurance,
    hi = (net + insurance + 15500000) * 2;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (salary2026(mid, insurance, dependents).net < net) lo = mid;
    else hi = mid;
  }
  return salary2026(Math.round(hi), insurance, dependents);
}
