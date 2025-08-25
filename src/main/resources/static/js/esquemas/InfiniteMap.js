/**
 * InfiniteMap.js - Mapa infinito con líneas horizontales y verticales
 * Para la ventana de proyectos de Worldbuilding App
 */

class InfiniteMap {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        
        // Configuración por defecto
        this.config = {
            gridSize: options.gridSize || 100,
            gridColor: options.gridColor || '#000000ff',
            gridOpacity: options.gridOpacity || 0.3,
            backgroundColor: options.backgroundColor || '#007cf8ff',
            zoomLevel: options.zoomLevel || 1,
            minZoom: options.minZoom || 0.1,
            maxZoom: options.maxZoom || 5,
            panSpeed: options.panSpeed || 1,
            showCoordinates: options.showCoordinates || true,
            coordinateColor: options.coordinateColor || '#ff0000ff',
            coordinateFont: options.coordinateFont || '12px Arial',
            ...options
        };
        
        // Estado del mapa
        this.state = {
            offsetX: 0,
            offsetY: 0,
            isDragging: false,
            lastMouseX: 0,
            lastMouseY: 0,
            zoom: this.config.zoomLevel,
            mouseX: 0,
            mouseY: 0
        };
        
        this.init();
    }

    /**
     * Inicializa el mapa
     */
    init() {
        if (!this.container) {
            console.error('Contenedor no encontrado:', this.containerId);
            return;
        }

        this.createCanvas();
        this.setupEventListeners();
        this.resize();
        this.render();
        this.isInitialized = true;
        
        console.log('🗺️ Mapa infinito inicializado');
    }

    /**
     * Crea el canvas del mapa
     */
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'infinite-map-canvas';
        this.canvas.style.cssText = `
            display: flex;
            cursor: grab;
            background: ${this.config.backgroundColor};
            border: 1px solid #ddd;
            border-radius: 8px;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        // Configurar canvas para alta resolución
        this.setupHighDPI();
    }

    /**
     * Configura el canvas para alta resolución
     */
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Touch events para dispositivos móviles
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Maneja el evento mousedown
     */
    handleMouseDown(event) {
        event.preventDefault();
        this.state.isDragging = true;
        this.state.lastMouseX = event.clientX;
        this.state.lastMouseY = event.clientY;
        this.canvas.style.cursor = 'grabbing';
    }

    /**
     * Maneja el evento mousemove
     */
    handleMouseMove(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        this.state.mouseX = event.clientX - rect.left;
        this.state.mouseY = event.clientY - rect.top;
        
        if (this.state.isDragging) {
            const deltaX = event.clientX - this.state.lastMouseX;
            const deltaY = event.clientY - this.state.lastMouseY;
            
            this.state.offsetX += deltaX * this.config.panSpeed;
            this.state.offsetY += deltaY * this.config.panSpeed;
            
            this.state.lastMouseX = event.clientX;
            this.state.lastMouseY = event.clientY;
            
            this.render();
        }
    }

    /**
     * Maneja el evento mouseup
     */
    handleMouseUp(event) {
        event.preventDefault();
        this.state.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    /**
     * Maneja el evento wheel (zoom)
     */
    handleWheel(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(this.config.minZoom, 
                                Math.min(this.config.maxZoom, 
                                        this.state.zoom * zoomFactor));
        
        if (newZoom !== this.state.zoom) {
            // Zoom hacia el punto del mouse
            const zoomRatio = newZoom / this.state.zoom;
            this.state.offsetX = mouseX - (mouseX - this.state.offsetX) * zoomRatio;
            this.state.offsetY = mouseY - (mouseY - this.state.offsetY) * zoomRatio;
            
            this.state.zoom = newZoom;
            this.render();
        }
    }

    /**
     * Maneja el evento mouseleave
     */
    handleMouseLeave(event) {
        this.state.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    /**
     * Maneja el evento resize
     */
    handleResize(event) {
        this.resize();
        this.render();
    }

    /**
     * Maneja eventos de teclado
     */
    handleKeyDown(event) {
        const panAmount = 50;
        
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.state.offsetY += panAmount;
                this.render();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.state.offsetY -= panAmount;
                this.render();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.state.offsetX += panAmount;
                this.render();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.state.offsetX -= panAmount;
                this.render();
                break;
            case '+':
            case '=':
                event.preventDefault();
                this.zoomIn();
                break;
            case '-':
                event.preventDefault();
                this.zoomOut();
                break;
            case '0':
                event.preventDefault();
                this.resetView();
                break;
        }
    }

    /**
     * Redimensiona el canvas
     */
    resize() {
        if (!this.canvas) return;
        
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
    }

    /**
     * Renderiza el mapa
     */
    render() {
        if (!this.ctx) return;
        
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Aplicar transformaciones
        this.ctx.save();
        this.ctx.translate(this.state.offsetX, this.state.offsetY);
        this.ctx.scale(this.state.zoom, this.state.zoom);
        
        // Dibujar grid
        this.drawGrid(width, height);
        
        // Dibujar coordenadas si está habilitado
        if (this.config.showCoordinates) {
            this.drawCoordinates(width, height);
        }
        
        // Dibujar marcadores
        this.drawMarkers();
        
        this.ctx.restore();
        
        // Dibujar información de zoom
        this.drawZoomInfo();
    }

    /**
     * Dibuja la cuadrícula
     */
    drawGrid(width, height) {
        const gridSize = this.config.gridSize;
        const gridColor = this.config.gridColor;
        const opacity = this.config.gridOpacity;
        
        // Calcular el área visible
        const startX = Math.floor(-this.state.offsetX / this.state.zoom / gridSize) * gridSize;
        const startY = Math.floor(-this.state.offsetY / this.state.zoom / gridSize) * gridSize;
        const endX = startX + (width / this.state.zoom) + gridSize * 2;
        const endY = startY + (height / this.state.zoom) + gridSize * 2;
        
        this.ctx.strokeStyle = gridColor;
        this.ctx.globalAlpha = opacity;
        this.ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Dibuja los marcadores
     */
    drawMarkers() {
        if (!this.markers || this.markers.length === 0) return;
        
        this.markers.forEach(marker => {
            // Dibujar círculo del marcador
            this.ctx.beginPath();
            this.ctx.arc(marker.x, marker.y, marker.size, 0, 2 * Math.PI);
            this.ctx.fillStyle = marker.color;
            this.ctx.fill();
            
            // Borde del marcador
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Etiqueta del marcador
            if (marker.label) {
                this.ctx.fillStyle = '#333';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(marker.label, marker.x, marker.y + marker.size + 5);
            }
        });
    }

    /**
     * Dibuja las coordenadas
     */
    drawCoordinates(width, height) {
        const gridSize = this.config.gridSize;
        const fontSize = Math.max(10, 12 / this.state.zoom);
        
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = this.config.coordinateColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Calcular el área visible
        const startX = Math.floor(-this.state.offsetX / this.state.zoom / gridSize) * gridSize;
        const startY = Math.floor(-this.state.offsetY / this.state.zoom / gridSize) * gridSize;
        const endX = startX + (width / this.state.zoom) + gridSize * 2;
        const endY = startY + (height / this.state.zoom) + gridSize * 2;
        
        // Solo mostrar coordenadas si el zoom es suficiente
        if (this.state.zoom > 0.5) {
            // Coordenadas en los ejes principales
            for (let x = startX; x <= endX; x += gridSize * 5) {
                if (x !== 0) {
                    this.ctx.fillText(x.toString(), x, 0);
                }
            }
            
            for (let y = startY; y <= endY; y += gridSize * 5) {
                if (y !== 0) {
                    this.ctx.fillText(y.toString(), 0, y);
                }
            }
            
            // Origen
            this.ctx.fillStyle = '#007bff';
            this.ctx.fillText('0', 0, 0);
        }
    }

    /**
     * Dibuja información de zoom
     */
    drawZoomInfo() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        
        // Fondo del panel de información
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 80);
        
        // Texto de información
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        const zoomPercent = Math.round(this.state.zoom * 100);
        this.ctx.fillText(`Zoom: ${zoomPercent}%`, 20, 20);
        this.ctx.fillText(`Posición: (${Math.round(-this.state.offsetX)}, ${Math.round(-this.state.offsetY)})`, 20, 40);
        this.ctx.fillText(`Mouse: (${Math.round(this.state.mouseX)}, ${Math.round(this.state.mouseY)})`, 20, 60);
        
        this.ctx.restore();
    }

    /**
     * Zoom in
     */
    zoomIn() {
        const newZoom = Math.min(this.config.maxZoom, this.state.zoom * 1.2);
        if (newZoom !== this.state.zoom) {
            this.state.zoom = newZoom;
            this.render();
        }
    }

    /**
     * Zoom out
     */
    zoomOut() {
        const newZoom = Math.max(this.config.minZoom, this.state.zoom / 1.2);
        if (newZoom !== this.state.zoom) {
            this.state.zoom = newZoom;
            this.render();
        }
    }

    /**
     * Resetea la vista
     */
    resetView() {
        this.state.offsetX = 0;
        this.state.offsetY = 0;
        this.state.zoom = this.config.zoomLevel;
        this.render();
    }

    /**
     * Centra la vista en un punto específico
     */
    centerOn(x, y) {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.state.offsetX = width / 2 - x * this.state.zoom;
        this.state.offsetY = height / 2 - y * this.state.zoom;
        this.render();
    }

    /**
     * Obtiene las coordenadas del mundo en la posición del mouse
     */
    getWorldCoordinates(mouseX, mouseY) {
        const worldX = (mouseX - this.state.offsetX) / this.state.zoom;
        const worldY = (mouseY - this.state.offsetY) / this.state.zoom;
        return { x: worldX, y: worldY };
    }

    /**
     * Obtiene las coordenadas de pantalla de una posición del mundo
     */
    getScreenCoordinates(worldX, worldY) {
        const screenX = worldX * this.state.zoom + this.state.offsetX;
        const screenY = worldY * this.state.zoom + this.state.offsetY;
        return { x: screenX, y: screenY };
    }

    /**
     * Agrega un marcador al mapa
     */
    addMarker(x, y, options = {}) {
        const marker = {
            x: x,
            y: y,
            color: options.color || '#ff0000',
            size: options.size || 10,
            label: options.label || '',
            ...options
        };
        
        if (!this.markers) {
            this.markers = [];
        }
        
        this.markers.push(marker);
        this.render();
        
        return marker;
    }

    /**
     * Elimina un marcador
     */
    removeMarker(marker) {
        if (this.markers) {
            const index = this.markers.indexOf(marker);
            if (index > -1) {
                this.markers.splice(index, 1);
                this.render();
            }
        }
    }

    /**
     * Limpia todos los marcadores
     */
    clearMarkers() {
        this.markers = [];
        this.render();
    }

    /**
     * Obtiene el estado actual del mapa
     */
    getState() {
        return {
            offsetX: this.state.offsetX,
            offsetY: this.state.offsetY,
            zoom: this.state.zoom,
            markers: this.markers || []
        };
    }

    /**
     * Restaura el estado del mapa
     */
    setState(state) {
        if (state.offsetX !== undefined) this.state.offsetX = state.offsetX;
        if (state.offsetY !== undefined) this.state.offsetY = state.offsetY;
        if (state.zoom !== undefined) this.state.zoom = state.zoom;
        if (state.markers) this.markers = state.markers;
        
        this.render();
    }
}

// Exportar para uso global
window.InfiniteMap = InfiniteMap;