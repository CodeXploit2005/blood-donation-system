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

  exportEventReportCSVUrl: (eventId) => {
    return `/api/reports/event/${eventId}/export`;
  },
};

export default reportService;
