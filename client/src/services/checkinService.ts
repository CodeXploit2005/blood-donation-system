import api from './api';

export const checkinService = {
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
