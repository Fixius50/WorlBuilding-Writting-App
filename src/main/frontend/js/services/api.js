const BASE_URL = '/api';

const api = {
    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            // Global 401 handler (Session Expired)
            // Skip this for login requests, as they naturally return 401 on failure
            if (response.status === 401 && !endpoint.includes('/auth/login')) {
                localStorage.removeItem('user');
                sessionStorage.clear();
                if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers });
    },

    post(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers,
        });
    },

    put(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers,
        });
    },

    patch(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers,
        });
    },

    delete(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'DELETE', headers });
    }
};

// Export services matching the previous file structure but using our fetch wrapper
export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout', {}),
    getCurrentUser: () => api.get('/auth/me'),
};

export const projectService = {
    list: () => api.get('/proyectos'),
    create: (data) => api.post('/proyectos/crear', data),
    open: (name) => api.get(`/proyectos/${name}`),
    close: () => api.post('/proyectos/cerrar', {}),
    getActive: () => api.get('/proyectos/activo'),
};

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
    vectorize: (formData) => {
        // Custom handling for multipart/form-data as we shouldn't set Content-Type to application/json
        return fetch(`${BASE_URL}/conlang/vectorize`, {
            method: 'POST',
            body: formData,
            // fetch automatically sets Content-Type for FormData
        }).then(res => {
            if (!res.ok) throw new Error('Vectorization failed');
            return res.json();
        });
    },
};

export default api;
