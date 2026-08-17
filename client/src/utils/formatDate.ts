export const formatDate = (dateString: string | Date | undefined | null, options: Intl.DateTimeFormatOptions = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(date);
};

export const formatDateTime = (dateString: string | Date | undefined | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (dateString: string | Date | undefined | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatVolumeMl = (ml: number | null | undefined) => {
  if (!ml) return '0 ml';
  return `${ml} ml`;
};
