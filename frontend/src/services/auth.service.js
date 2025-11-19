import api from './api';

export const authService = {
  login: async (username, password) => {
    return await api.post('/auth/login', { username, password });
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  cambiarPassword: async (passwordActual, passwordNueva) => {
    return await api.post('/auth/cambiar-password', {
      passwordActual,
      passwordNueva,
    });
  },

  getPerfil: async () => {
    return await api.get('/auth/perfil');
  },
};
