package com.worldbuilding.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "carpeta")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE carpeta SET deleted = true, deleted_date = CURRENT_TIMESTAMP WHERE id = ?")
@org.hibernate.annotations.Where(clause = "deleted = false")
public class Carpeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Cuaderno proyecto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "padre_id")
    private Carpeta padre;

    @OneToMany(mappedBy = "padre", cascade = CascadeType.ALL)
    private List<Carpeta> subcarpetas;

    @OneToMany(mappedBy = "carpeta", cascade = CascadeType.ALL)
    private List<AtributoPlantilla> plantillas;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private boolean deleted = false;

    @Column(name = "deleted_date")
    private LocalDateTime deletedDate;

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Cuaderno getProyecto() {
        return proyecto;
    }

    public void setProyecto(Cuaderno proyecto) {
        this.proyecto = proyecto;
    }

    public Carpeta getPadre() {
        return padre;
    }

    public void setPadre(Carpeta padre) {
        this.padre = padre;
    }

    public List<Carpeta> getSubcarpetas() {
        return subcarpetas;
    }

    public void setSubcarpetas(List<Carpeta> subcarpetas) {
        this.subcarpetas = subcarpetas;
    }

    public List<AtributoPlantilla> getPlantillas() {
        return plantillas;
    }

    public void setPlantillas(List<AtributoPlantilla> plantillas) {
        this.plantillas = plantillas;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public LocalDateTime getDeletedDate() {
        return deletedDate;
    }

    public void setDeletedDate(LocalDateTime deletedDate) {
        this.deletedDate = deletedDate;
    }
}
