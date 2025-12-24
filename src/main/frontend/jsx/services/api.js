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

export default api;
