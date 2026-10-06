import api from './api';

export const reportService = {
  getDashboardReport: async () => {
    return api.get('/reports/dashboard');
  },

  getEventReport: async (eventId) => {
    return api.get(`/reports/event/${eventId}`);
  },

  getEventFunnel: async (eventId) => {
    return api.get(`/reports/event/${eventId}/funnel`);
  },

  exportEventReportExcel: async (eventId) => {
    const response = await api.get(`/reports/event/${eventId}`);
    const { buildReportWorkbook } = await import('../utils/reportExcel');
    const workbook = await buildReportWorkbook(response.data);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_cao_hien_mau_${eventId}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

export default reportService;
