import api from './api';

export const eventService = {
  getEvents: async (params = {}) => {
    return api.get('/events', { params });
  },

  getEventById: async (id) => {
    return api.get(`/events/${id}`);
  },

  createEvent: async (eventData) => {
    return api.post('/events', eventData);
  },

  updateEvent: async (id, eventData) => {
    return api.put(`/events/${id}`, eventData);
  },

  deleteEvent: async (id) => {
    return api.delete(`/events/${id}`);
  },
};

export default eventService;
