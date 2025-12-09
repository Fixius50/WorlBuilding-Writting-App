/**
 * API Client para WorldbuildingApp V2
 * Wrapper para todas las llamadas fetch al backend
 */

const API = {
    baseUrl: '',

    // === Utilidades ===
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Error desconocido' };
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // === Proyectos ===
    proyectos: {
        async crear(nombreProyecto, tipo) {
            return API.request('/api/proyectos/crear', {
                method: 'POST',
                body: JSON.stringify({ nombreProyecto, tipo })
            });
        },

        async abrir(nombre) {
            return API.request(`/api/proyectos/${encodeURIComponent(nombre)}`);
        },

        async activo() {
            return API.request('/api/proyectos/activo');
        },

        async listar() {
            return API.request('/api/proyectos');
        },

        async cerrar() {
            return API.request('/api/proyectos/cerrar', { method: 'POST' });
        }
    },

    // === Base de Datos (Entidades) ===
    bd: {
        async insertar(tipoEntidad, datos) {
            return API.request('/api/bd/insertar', {
                method: 'PUT',
                body: JSON.stringify({ tipoEntidad, ...datos })
            });
        },

        async modificar(tipoEntidad, id, datos) {
            return API.request('/api/bd/modificar', {
                method: 'PATCH',
                body: JSON.stringify({ tipoEntidad, id, ...datos })
            });
        },

        async listar(tipo) {
            return API.request(`/api/bd/${tipo}`);
        },

        async buscar(tipo, id) {
            return API.request(`/api/bd/${tipo}/${id}`);
        },

        async eliminar(tipo, id) {
            return API.request(`/api/bd/${tipo}/${id}`, { method: 'DELETE' });
        },

        async activarNodo(entidadId, tipoEntidad, caracteristicaRelacional) {
            return API.request('/api/bd/activar-nodo', {
                method: 'POST',
                body: JSON.stringify({ entidadId, tipoEntidad, caracteristicaRelacional })
            });
        }
    },

    // === Carga de todos los datos del proyecto ===
    async cargarTodosLosDatos() {
        const tipos = [
            'entidadindividual',
            'entidadcolectiva',
            'zona',
            'construccion',
            'efectos',
            'interaccion'
        ];

        try {
            const promesas = tipos.map(tipo => this.bd.listar(tipo));
            const resultados = await Promise.all(promesas);

            return {
                entidadIndividual: resultados[0] || [],
                entidadColectiva: resultados[1] || [],
                zona: resultados[2] || [],
                construccion: resultados[3] || [],
                efectos: resultados[4] || [],
                interaccion: resultados[5] || []
            };
        } catch (error) {
            console.error('Error cargando datos:', error);
            return null;
        }
    }
};

// Hacer disponible globalmente
window.API = API;
