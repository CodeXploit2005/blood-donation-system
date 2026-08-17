import api from './api';

export const registrationService = {
  createRegistration: async (data) => {
    return api.post('/registrations', data);
  },

  getMyRegistrations: async () => {
    return api.get('/registrations/my');
  },

  getRegistrationById: async (id) => {
    return api.get(`/registrations/${id}`);
  },

  getEventRegistrations: async (eventId, params = {}) => {
    return api.get(`/registrations/event/${eventId}`, { params });
  },

  updateRegistrationStatus: async (id, data) => {
    return api.put(`/registrations/${id}`, data);
  },

  cancelRegistration: async (id) => {
    return api.delete(`/registrations/${id}`);
  },
};

export default registrationService;
