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
        async crear(nombreProyecto, tipo, descripcion, genero, imagenUrl) {
            return API.request('/api/proyectos/crear', {
                method: 'POST',
                body: JSON.stringify({ nombreProyecto, tipo, descripcion, genero, imagenUrl })
            });
        },

        async abrir(nombre) {
            return API.request(`/api/proyectos/${encodeURIComponent(nombre)}`);
        },

        async activo() {
            return API.request(`/api/proyectos/activo?t=${Date.now()}`);
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
            const promesas = [
                ...tipos.map(tipo => this.bd.listar(tipo)),
                this.timeline.listarEventos(),
                this.conlang.listar()
            ];
            const resultados = await Promise.all(promesas);

            return {
                entidadIndividual: resultados[0] || [],
                entidadColectiva: resultados[1] || [],
                zona: resultados[2] || [],
                construccion: resultados[3] || [],
                efectos: resultados[4] || [],
                interaccion: resultados[5] || [],
                eventos: resultados[6] || [],
                lenguas: resultados[7] || []
            };
        } catch (error) {
            console.error('Error cargando datos:', error);
            return null;
        }
    },

    escritura: {
        async listarCuadernos() {
            return API.request('/api/escritura/cuadernos');
        },
        async crearCuaderno(titulo, descripcion) {
            return API.request('/api/escritura/cuaderno', {
                method: 'POST',
                body: JSON.stringify({ titulo, descripcion })
            });
        },
        async listarHojas(cuadernoId) {
            return API.request(`/api/escritura/cuaderno/${cuadernoId}/hojas`);
        },
        async añadirHoja(cuadernoId) {
            return API.request(`/api/escritura/cuaderno/${cuadernoId}/hoja`, {
                method: 'POST'
            });
        },
        async obtenerHoja(hojaId) {
            return API.request(`/api/escritura/hoja/${hojaId}`);
        },
        async guardarHoja(hojaId, contenido) {
            return API.request(`/api/escritura/hoja/${hojaId}`, {
                method: 'PUT',
                body: JSON.stringify({ contenido })
            });
        }
    },

    // --- Módulo Lingüístico (Conlangs) ---
    conlang: {
        async listar() { return API.request('/api/conlang/lenguas'); },
        async crear(datos) { return API.request('/api/conlang/lengua', { method: 'POST', body: JSON.stringify(datos) }); },
        async agregarPalabra(lenguaId, palabra) { return API.request(`/api/conlang/${lenguaId}/palabra`, { method: 'POST', body: JSON.stringify(palabra) }); },
        async listarDiccionario(lenguaId) { return API.request(`/api/conlang/${lenguaId}/diccionario`); }
    },

    // --- Módulo Cronológico (Timeline) ---
    timeline: {
        async listarEventos() { return API.request('/api/timeline/eventos'); },
        async crearEvento(evento) { return API.request('/api/timeline/evento', { method: 'POST', body: JSON.stringify(evento) }); },
        async actualizarEvento(id, evento) { return API.request(`/api/timeline/evento/${id}`, { method: 'PUT', body: JSON.stringify(evento) }); }
    }
};

// Hacer disponible globalmente
window.API = API;
