import api from './api';

export const personalService = {
  buscar: async params => {
    return await api.get('/personal', { params });
  },

  exportar: async params => {
    return await api.get('/personal/exportar', {
      params,
      responseType: 'blob',
    });
  },

  obtenerPorId: async id => {
    return await api.get(`/personal/${id}`);
  },

  crear: async datos => {
    return await api.post('/personal', datos, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  create: async datos => {
    return await api.post('/personal', datos, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  actualizar: async (id, datos) => {
    return await api.put(`/personal/${id}`, datos);
  },

  eliminar: async id => {
    return await api.delete(`/personal/${id}`);
  },

  estadisticas: async () => {
    return await api.get('/personal/estadisticas');
  },

  subirFoto: async (id, formData) => {
    return await api.post(`/personal/${id}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  subirArchivos: async (id, formData) => {
    return await api.post(`/personal/${id}/archivos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  obtenerHistorial: async id => {
    return await api.get(`/personal/${id}/historial`);
  },

  // Aliases for compatibility
  getById: async id => {
    return await api.get(`/personal/${id}`);
  },

  update: async (id, datos) => {
    return await api.put(`/personal/${id}`, datos);
  },
};
