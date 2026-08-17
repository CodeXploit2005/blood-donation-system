export const API_BASE_URL = '/api';

export const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'unknown'];

export const BLOOD_TYPE_LABELS = {
  'O+': 'Nhóm máu O (Rh+)',
  'O-': 'Nhóm máu O (Rh-)',
  'A+': 'Nhóm máu A (Rh+)',
  'A-': 'Nhóm máu A (Rh-)',
  'B+': 'Nhóm máu B (Rh+)',
  'B-': 'Nhóm máu B (Rh-)',
  'AB+': 'Nhóm máu AB (Rh+)',
  'AB-': 'Nhóm máu AB (Rh-)',
  'unknown': 'Chưa xác định rõ',
};

export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  OPEN: 'open',
  CLOSED: 'closed',
  COMPLETED: 'completed',
};

export const EVENT_STATUS_LABELS = {
  upcoming: 'Sắp diễn ra',
  open: 'Đang mở đăng ký',
  closed: 'Đã đóng tiếp nhận',
  completed: 'Đã hoàn thành',
};

export const EVENT_STATUS_COLORS = {
  upcoming: 'bg-amber-100 text-amber-800 border-amber-200',
  open: 'bg-crimson-light text-crimson border-crimson/20',
  closed: 'bg-gray-100 text-gray-700 border-gray-200',
  completed: 'bg-sage-light text-sage-deep border-sage/30',
};

export const REGISTRATION_STATUS_LABELS = {
  registered: 'Đã đăng ký',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã hiến máu thành công',
};

export const REGISTRATION_STATUS_COLORS = {
  registered: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-amber-50 text-amber-800 border-amber-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  completed: 'bg-sage-light text-sage-deep border-sage/40',
};

export const SCREENING_RESULT_LABELS = {
  eligible: 'Đủ điều kiện sơ bộ',
  ineligible: 'Tạm thời chưa đủ điều kiện',
  pending_review: 'Cần bác sĩ khám sàng lọc lại',
};

export const SCREENING_RESULT_COLORS = {
  eligible: 'bg-sage-light text-sage-deep border-sage/40',
  ineligible: 'bg-rose-50 text-rose-700 border-rose-200',
  pending_review: 'bg-amber-50 text-amber-800 border-amber-200',
};

export const TIME_SLOTS = [
  '07:30 - 09:00',
  '09:00 - 10:30',
  '10:30 - 11:30',
  '13:30 - 15:00',
  '15:00 - 16:30',
];
