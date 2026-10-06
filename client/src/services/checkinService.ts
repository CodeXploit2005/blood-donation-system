import api from './api';

export const checkinService = {
  lookup: async (data) => api.post('/checkin', { ...data, preview: true }),
  verifyAndCheckIn: async (data) => {
    return api.post('/checkin', data);
  },

  getEventCheckinList: async (eventId) => {
    return api.get(`/checkin/event/${eventId}`);
  },

  undoCheckIn: async (registrationId) => {
    return api.post(`/checkin/undo/${registrationId}`);
  },
};

export default checkinService;
