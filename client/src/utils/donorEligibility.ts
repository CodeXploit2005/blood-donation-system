// Compare calendar dates in Vietnam, without browser/server timezone offsets.
export const vietnamToday = (now = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

export const isCalendarDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const ageOnDate = (birthDate: string, reference = vietnamToday()): number | null => {
  if (!isCalendarDate(birthDate) || !isCalendarDate(reference) || birthDate > reference) return null;
  return Number(reference.slice(0, 4)) - Number(birthDate.slice(0, 4)) - (reference.slice(5) < birthDate.slice(5) ? 1 : 0);
};

export const birthDateError = (value: string, reference = vietnamToday()): string | null => {
  if (!value) return 'Vui lòng chọn ngày sinh';
  if (!isCalendarDate(value)) return 'Ngày sinh không hợp lệ';
  if (value > reference) return 'Ngày sinh không được ở tương lai';
  const age = ageOnDate(value, reference)!;
  if (age < 18) return 'Bạn chưa đủ 18 tuổi. Vui lòng quay lại khi đến sinh nhật 18 tuổi';
  if (age > 60) return 'Độ tuổi đăng ký người hiến máu của hệ thống là từ đủ 18 đến 60 tuổi';
  return null;
};

export const birthDateBounds = (reference = vietnamToday()) => {
  const [year, month, day] = reference.split('-').map(Number);
  const shift = (years: number) => {
    const lastDay = new Date(Date.UTC(year - years, month, 0)).getUTCDate();
    return new Date(Date.UTC(year - years, month - 1, Math.min(day, lastDay)));
  };
  const min = shift(61);
  min.setUTCDate(min.getUTCDate() + 1);
  return { min: min.toISOString().slice(0, 10), max: shift(18).toISOString().slice(0, 10) };
};

export const normalizeVietnamPhone = (value: string): string => value.trim().replace(/[\s().-]/g, '').replace(/^\+84/, '0');
export const isVietnamPhone = (value: string): boolean => /^(0[35789]\d{8}|02\d{9})$/.test(normalizeVietnamPhone(value));
