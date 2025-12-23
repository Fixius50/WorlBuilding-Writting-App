import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data, // Directly return data
    (error) => {
        const message = error.response?.data?.error || error.message || 'Error de conexión';
        return Promise.reject(new Error(message));
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
};

export const projectService = {
    list: () => api.get('/proyectos'),
    create: (data) => api.post('/proyectos/crear', data),
    open: (name) => api.get(`/proyectos/${name}`),
    close: () => api.post('/proyectos/cerrar'),
    getActive: () => api.get('/proyectos/activo'),
};

// Generic Entity Service for BDController
// Types: 'entidadindividual', 'entidadcolectiva', 'zona', 'construccion', 'efectos', 'interaccion'
export const entityService = {
    list: (type) => api.get(`/bd/${type}`),
    getById: (type, id) => api.get(`/bd/${type}/${id}`),
    create: (type, data) => api.put('/bd/insertar', { ...data, tipoEntidad: type }),
    update: (type, id, data) => api.patch('/bd/modificar', { ...data, tipoEntidad: type, id }),
    delete: (type, id) => api.delete(`/bd/${type}/${id}`),
};

export const timelineService = {
    listEvents: () => api.get('/timeline/eventos'),
    listByLine: (lineId) => api.get(`/timeline/linea/${lineId}/eventos`),
    createEvent: (data) => api.post('/timeline/evento', data),
};

export const conlangService = {
    list: () => api.get('/conlang/lenguas'),
    vectorize: (formData) => api.post('/conlang/vectorize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
