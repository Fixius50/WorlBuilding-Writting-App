const BASE_URL = '/api';

const api = {
    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const isFormData = options.body instanceof FormData;

        // NEW: Automatically inject project ID from URL if present to support iframe context
        let projectIdHeader = {};
        const pathParts = window.location.pathname.split('/');
        // URL Pattern: /username/projectName/...
        if (pathParts.length >= 3) {
            const projectName = pathParts[2];
            // Basic validation to avoid injecting obvious non-project slugs
            if (projectName && projectName !== 'settings' && projectName !== 'workspaces') {
                projectIdHeader['X-Project-ID'] = projectName;
            }
        }

        const headers = {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...projectIdHeader,
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.warn("Session expired or unauthorized. Redirecting to project selection.");
                window.location.href = '/'; // Force redirect to Project Selection
                return null;
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        return response.json();
    },

    get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers });
    },

    post(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
            headers,
        });
    },

    put(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body),
            headers,
        });
    },

    patch(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: body instanceof FormData ? body : JSON.stringify(body),
            headers,
        });
    },

    delete(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'DELETE', headers });
    }
};

export const projectService = {
    open: (name) => invoke('get_proyecto_by_name', { name }),
    getActive: () => Promise.resolve(null),
    close: () => Promise.resolve(true),
};

import { invoke } from './invoke.js';

export const workspaceService = {
    list: () => invoke('get_proyectos'),
    create: (name, title, genre, imageUrl) => 
        invoke('create_proyecto', { name, title, tag: genre, imageUrl: imageUrl || '' })
            .then(res => ({ success: true, data: res }))
            .catch(err => { throw new Error(err) }),
    delete: (name) => api.delete('/workspaces/' + name), // TODO: Migrate to Rust
    update: (name, data) => api.put('/workspaces/' + name, data), // TODO: Migrate to Rust
    select: (projectName) => Promise.resolve({ success: true, redirect: `/local/${projectName}` }),
};

export const entityService = {
    list: (type) => invoke('get_entidades', { projectId: JSON.parse(localStorage.getItem('user'))?.username, tipoEntidad: type }),
    getById: (type, id) => invoke('get_entidad_by_id', { id: parseInt(id) }),
    create: (type, data) => invoke('create_entidad', { 
        name: data.name, 
        tipoEntidad: type, 
        projectId: JSON.parse(localStorage.getItem('user'))?.username,
        description: data.description,
        imageUrl: data.imageUrl,
        tags: data.tags?.join(','),
        attributes: JSON.stringify(data.attributes || {})
    }),
    update: (type, id, data) => Promise.reject("Not implemented yet"), // TODO: Implement update entity rust command
    delete: (type, id) => invoke('delete_entidad', { id: parseInt(id) }),
    toggleFavorite: (id) => Promise.reject("Not implemented yet"), // TODO: Implement toggle
};

export const timelineService = {
    listEvents: () => invoke('get_eventos', { projectId: JSON.parse(localStorage.getItem('user'))?.username, lineId: null }),
    listByLine: (lineId) => invoke('get_eventos', { projectId: JSON.parse(localStorage.getItem('user'))?.username, lineId: lineId?.toString() }),
    createEvent: (data) => invoke('create_evento', {
        title: data.title,
        projectId: JSON.parse(localStorage.getItem('user'))?.username,
        lineId: data.lineId?.toString(),
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        importance: data.importance || 1,
        color: data.color,
        relatedEntities: JSON.stringify(data.relatedEntities || [])
    }),
};

export const conlangService = {
    list: () => invoke('get_lenguas', { projectId: JSON.parse(localStorage.getItem('user'))?.username }),
    vectorize: (formData) => Promise.reject("File loading requires Rust logic migration"), // TODO: File streaming from Rust
};

export default api;
