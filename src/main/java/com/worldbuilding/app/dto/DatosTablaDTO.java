package com.worldbuilding.app.dto;

/**
 * DTO unificado para transferencia de datos entre frontend y backend.
 * El campo "tipoEntidad" determina qué repositorio usa el controlador.
 */
public class DatosTablaDTO {

    // Identificación
    private Long id;
    private String tipoEntidad; // "entidadIndividual", "zona", "construccion", etc.
    private String nombreProyecto;

    // Campos comunes
    private String nombre;
    private String apellidos;
    private String tipo;
    private String descripcion;

    // EntidadIndividual
    private String estado;
    private String origen;
    private String comportamiento;

    // EntidadColectiva
    private Integer cantidadMiembros;

    // Zona
    private String tamanno;
    private String desarrollo;

    // Construccion
    private String tipoEdificio;

    // Efectos
    private String tipoEfecto;
    private String alcance;

    // Interaccion
    private String contexto;
    private String resultado;

    // Nodos
    private Long entidadId;
    private String caracteristicaRelacional;

    // Relaciones
    private Long nodoOrigenId;
    private Long nodoDestinoId;
    private String tipoRelacion;

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipoEntidad() {
        return tipoEntidad;
    }

    public void setTipoEntidad(String tipoEntidad) {
        this.tipoEntidad = tipoEntidad;
    }

    public String getNombreProyecto() {
        return nombreProyecto;
    }

    public void setNombreProyecto(String nombreProyecto) {
        this.nombreProyecto = nombreProyecto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getOrigen() {
        return origen;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }

    public String getComportamiento() {
        return comportamiento;
    }

    public void setComportamiento(String comportamiento) {
        this.comportamiento = comportamiento;
    }

    public Integer getCantidadMiembros() {
        return cantidadMiembros;
    }

    public void setCantidadMiembros(Integer cantidadMiembros) {
        this.cantidadMiembros = cantidadMiembros;
    }

    public String getTamanno() {
        return tamanno;
    }

    public void setTamanno(String tamanno) {
        this.tamanno = tamanno;
    }

    public String getDesarrollo() {
        return desarrollo;
    }

    public void setDesarrollo(String desarrollo) {
        this.desarrollo = desarrollo;
    }

    public String getTipoEdificio() {
        return tipoEdificio;
    }

    public void setTipoEdificio(String tipoEdificio) {
        this.tipoEdificio = tipoEdificio;
    }

    public String getTipoEfecto() {
        return tipoEfecto;
    }

    public void setTipoEfecto(String tipoEfecto) {
        this.tipoEfecto = tipoEfecto;
    }

    public String getAlcance() {
        return alcance;
    }

    public void setAlcance(String alcance) {
        this.alcance = alcance;
    }

    public String getContexto() {
        return contexto;
    }

    public void setContexto(String contexto) {
        this.contexto = contexto;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public Long getEntidadId() {
        return entidadId;
    }

    public void setEntidadId(Long entidadId) {
        this.entidadId = entidadId;
    }

    public String getCaracteristicaRelacional() {
        return caracteristicaRelacional;
    }

    public void setCaracteristicaRelacional(String caracteristicaRelacional) {
        this.caracteristicaRelacional = caracteristicaRelacional;
    }

    public Long getNodoOrigenId() {
        return nodoOrigenId;
    }

    public void setNodoOrigenId(Long nodoOrigenId) {
        this.nodoOrigenId = nodoOrigenId;
    }

    public Long getNodoDestinoId() {
        return nodoDestinoId;
    }

    public void setNodoDestinoId(Long nodoDestinoId) {
        this.nodoDestinoId = nodoDestinoId;
    }

    public String getTipoRelacion() {
        return tipoRelacion;
    }

    public void setTipoRelacion(String tipoRelacion) {
        this.tipoRelacion = tipoRelacion;
    }

    // Relaciones (Extended)
    private String tipoOrigen;
    private String tipoDestino;
    private String metadata;

    // Linea de Tiempo
    private Boolean esRaiz;

    // Evento de Tiempo
    private String fechaTexto;
    private Long ordenAbsoluto;
    private Long lineaTiempoId;

    public String getTipoOrigen() {
        return tipoOrigen;
    }

    public void setTipoOrigen(String tipoOrigen) {
        this.tipoOrigen = tipoOrigen;
    }

    public String getTipoDestino() {
        return tipoDestino;
    }

    public void setTipoDestino(String tipoDestino) {
        this.tipoDestino = tipoDestino;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public Boolean getEsRaiz() {
        return esRaiz;
    }

    public void setEsRaiz(Boolean esRaiz) {
        this.esRaiz = esRaiz;
    }

    public String getFechaTexto() {
        return fechaTexto;
    }

    public void setFechaTexto(String fechaTexto) {
        this.fechaTexto = fechaTexto;
    }

    public Long getOrdenAbsoluto() {
        return ordenAbsoluto;
    }

    public void setOrdenAbsoluto(Long ordenAbsoluto) {
        this.ordenAbsoluto = ordenAbsoluto;
    }

    public Long getLineaTiempoId() {
        return lineaTiempoId;
    }

    public void setLineaTiempoId(Long lineaTiempoId) {
        this.lineaTiempoId = lineaTiempoId;
    }
}
