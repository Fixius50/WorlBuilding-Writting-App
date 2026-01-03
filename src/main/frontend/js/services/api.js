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
            credentials: 'include',
        });

        if (!response.ok) {
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

export const projectService = {
    // Deprecated? No, used by ArchitectLayout. But simplified.
    // open: (name) => api.get(`/proyectos/${name}`),
    // getActive: () => api.get(`/proyectos/activo`),

    // Legacy mapping or just direct usage
    open: (name) => api.get(`/proyectos/${name}`),
    getActive: () => api.get(`/proyectos/activo`),
    close: () => api.post('/proyectos/cerrar', {}),
};

export const workspaceService = {
    list: () => api.get('/workspaces'),
    create: (name, title, genre, imageUrl) => api.post('/workspaces', { name, title, genre, imageUrl }),
    delete: (name) => api.delete('/workspaces/' + name),
    select: (projectName) => api.post('/workspaces/select', { projectName }),
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
        return fetch(`${BASE_URL}/conlang/vectorize`, {
            method: 'POST',
            body: formData,
        }).then(res => {
            if (!res.ok) throw new Error('Vectorization failed');
            return res.json();
        });
    },
};

export default api;
