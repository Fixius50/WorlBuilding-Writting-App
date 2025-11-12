package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Importamos TODOS los repositorios
import com.worldbuilding.interfaces.*;

// Importamos TODOS los modelos
import com.worldbuilding.WorldbuildingApp.modelos.*;

import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bd")
public class BDController {

    // Inyectamos todos los repositorios que necesitamos
    @Autowired private EntidadIndividualRepository entidadIndRepo;
    @Autowired private EntidadColectivaRepository entidadColRepo;
    @Autowired private ZonaRepository zonaRepo;
    @Autowired private ConstruccionRepository construccionRepo;
    @Autowired private EfectosRepository efectosRepo;
    @Autowired private InteraccionRepository interaccionRepo;
    @Autowired private NodoRepository nodoRepo;
    @Autowired private RelacionRepository relacionRepo;
    @Autowired private ProyectoRepository proyectoRepo;

    /**
     * Inserta datos usando el DTO.
     * Refactorizado con switch y un solo punto de retorno en el try-catch.
     */
    @PutMapping("/insertar")
    public ResponseEntity<?> insertarDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body("No hay proyecto activo");
        }

        ResponseEntity<?> response;
        try {
            String tipo = datosDTO.getTipo();
            if (tipo == null) {
                return ResponseEntity.badRequest().body("El campo 'tipo' es obligatorio");
            }

            switch (tipo.toLowerCase()) {
                case "entidadindividual":
                    EntidadIndividual entidad = mapearAEntidadIndividual(datosDTO, new EntidadIndividual());
                    EntidadIndividual guardadoInd = entidadIndRepo.save(entidad);
                    response = ResponseEntity.ok(guardadoInd);
                    break;

                case "entidadcolectiva":
                    EntidadColectiva entidadCol = mapearAEntidadColectiva(datosDTO, new EntidadColectiva());
                    EntidadColectiva guardadoCol = entidadColRepo.save(entidadCol);
                    response = ResponseEntity.ok(guardadoCol);
                    break;

                case "zona":
                    Zona zona = mapearAZona(datosDTO, new Zona());
                    Zona guardadaZona = zonaRepo.save(zona);
                    response = ResponseEntity.ok(guardadaZona);
                    break;

                case "construccion":
                    Construccion construccion = mapearAConstruccion(datosDTO, new Construccion());
                    Construccion guardadaCons = construccionRepo.save(construccion);
                    response = ResponseEntity.ok(guardadaCons);
                    break;
            
                case "efectos":
                    Efectos efectos = mapearAEfectos(datosDTO, new Efectos());
                    Efectos guardadoEfectos = efectosRepo.save(efectos);
                    response = ResponseEntity.ok(guardadoEfectos);
                    break;

                case "interaccion":
                    Interaccion interaccion = mapearAInteraccion(datosDTO, new Interaccion());
                    Interaccion guardadoInt = interaccionRepo.save(interaccion);
                    response = ResponseEntity.ok(guardadoInt);
                    break;
            
                default:
                    response = ResponseEntity.badRequest().body("Tipo de dato desconocido: " + tipo);
            }
        } catch (Exception e) {
            e.printStackTrace(); 
            response = ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
        return response;
    }

    /**
     * Modifica una entidad existente usando el DTO.
     * Refactorizado con switch y un solo punto de retorno en el try-catch.
     */
    @PatchMapping("/modificar")
    public ResponseEntity<?> modificarDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body("No hay proyecto activo");
        }

        Long idLong = datosDTO.getId();
        if (idLong == null) {
            return ResponseEntity.badRequest().body("El 'id' es obligatorio para modificar");
        }
        Integer id = idLong.intValue();
        String tipo = datosDTO.getTipo();
        if (tipo == null) {
            return ResponseEntity.badRequest().body("El campo 'tipo' es obligatorio");
        }

        ResponseEntity<?> response;
        try {
            switch (tipo.toLowerCase()) {
                case "entidadindividual":
                    Optional<EntidadIndividual> optInd = entidadIndRepo.findById(id);
                    if (optInd.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        EntidadIndividual entidad = mapearAEntidadIndividual(datosDTO, optInd.get());
                        EntidadIndividual guardado = entidadIndRepo.save(entidad);
                        response = ResponseEntity.ok(guardado);
                    }
                    break;

                case "entidadcolectiva":
                    Optional<EntidadColectiva> optCol = entidadColRepo.findById(id);
                    if (optCol.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        EntidadColectiva entidad = mapearAEntidadColectiva(datosDTO, optCol.get());
                        EntidadColectiva guardado = entidadColRepo.save(entidad);
                        response = ResponseEntity.ok(guardado);
                    }
                    break;

                case "zona":
                    Optional<Zona> optZona = zonaRepo.findById(id);
                    if (optZona.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        Zona entidad = mapearAZona(datosDTO, optZona.get());
                        Zona guardada = zonaRepo.save(entidad);
                        response = ResponseEntity.ok(guardada);
                    }
                    break;

                case "construccion":
                    Optional<Construccion> optCons = construccionRepo.findById(id);
                    if (optCons.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        Construccion entidad = mapearAConstruccion(datosDTO, optCons.get());
                        Construccion guardada = construccionRepo.save(entidad);
                        response = ResponseEntity.ok(guardada);
                    }
                    break;

                case "efectos":
                    Optional<Efectos> optEfectos = efectosRepo.findById(id);
                    if (optEfectos.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        Efectos entidad = mapearAEfectos(datosDTO, optEfectos.get());
                        Efectos guardado = efectosRepo.save(entidad);
                        response = ResponseEntity.ok(guardado);
                    }
                    break;

                case "interaccion":
                    Optional<Interaccion> optInt = interaccionRepo.findById(id);
                    if (optInt.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        Interaccion entidad = mapearAInteraccion(datosDTO, optInt.get());
                        Interaccion guardado = interaccionRepo.save(entidad);
                        response = ResponseEntity.ok(guardado);
                    }
                    break;

                default:
                    response = ResponseEntity.badRequest().body("Tipo de dato desconocido: " + tipo);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response = ResponseEntity.internalServerError().body("Error interno al modificar: " + e.getMessage());
        }
        return response;
    }

    /**
     * Lista todos los elementos de un tipo específico.
     * Refactorizado con switch y un solo punto de retorno.
     */
    @GetMapping("/{tipo}")
    public ResponseEntity<?> listarPorTipo(@PathVariable String tipo, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body("No hay proyecto activo");
        }

        ResponseEntity<?> response;
        
        switch (tipo.toLowerCase()) {
            case "entidadindividual":
                response = ResponseEntity.ok(entidadIndRepo.findAll());
                break;
            case "entidadcolectiva":
                response = ResponseEntity.ok(entidadColRepo.findAll());
                break;
            case "zona":
                response = ResponseEntity.ok(zonaRepo.findAll());
                break;
            case "construccion":
                response = ResponseEntity.ok(construccionRepo.findAll());
                break;
            case "efectos":
                response = ResponseEntity.ok(efectosRepo.findAll());
                break;
            case "interaccion":
                response = ResponseEntity.ok(interaccionRepo.findAll());
                break;
            default:
                response = ResponseEntity.badRequest().body("Tipo de dato desconocido: " + tipo);
        }
        return response;
    }

    /**
     * Busca un elemento específico por tipo e ID.
     * Refactorizado con switch y un solo punto de retorno.
     */
    @GetMapping("/{tipo}/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable String tipo, @PathVariable Integer id, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body("No hay proyecto activo");
        }

        ResponseEntity<?> response;

        switch (tipo.toLowerCase()) {
            case "entidadindividual":
                Optional<EntidadIndividual> optInd = entidadIndRepo.findById(id);
                response = optInd.isPresent() ? ResponseEntity.ok(optInd.get()) : ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                break;
            case "entidadcolectiva":
                Optional<EntidadColectiva> optCol = entidadColRepo.findById(id);
                response = optCol.isPresent() ? ResponseEntity.ok(optCol.get()) : ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                break;
            case "zona":
                Optional<Zona> optZona = zonaRepo.findById(id);
                response = optZona.isPresent() ? ResponseEntity.ok(optZona.get()) : ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                break;
            case "construccion":
                Optional<Construccion> optCons = construccionRepo.findById(id);
                response = optCons.isPresent() ? ResponseEntity.ok(optCons.get()) : ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                break;
            case "efectos":
                Optional<Efectos> optEfectos = efectosRepo.findById(id);
                response = optEfectos.isPresent() ? ResponseEntity.ok(optEfectos.get()) : ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                break;
            case "interaccion":
                Optional<Interaccion> optInt = interaccionRepo.findById(id);
                response = optInt.isPresent() ? ResponseEntity.ok(optInt.get()) : ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                break;
            default:
                response = ResponseEntity.badRequest().body("Tipo de dato desconocido: " + tipo);
        }
        return response;
    }

    /**
     * Elimina un elemento específico por tipo e ID.
     * Refactorizado con switch y un solo punto de retorno en el try-catch.
     */
    @DeleteMapping("/{tipo}/{id}")
    public ResponseEntity<?> eliminarPorId(@PathVariable String tipo, @PathVariable Integer id, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body("No hay proyecto activo");
        }

        ResponseEntity<?> response;
        try {
            switch (tipo.toLowerCase()) {
                case "entidadindividual":
                    entidadIndRepo.deleteById(id);
                    response = ResponseEntity.ok("Elemento de " + tipo + " con ID: " + id + " eliminado.");
                    break;
                case "entidadcolectiva":
                    entidadColRepo.deleteById(id);
                    response = ResponseEntity.ok("Elemento de " + tipo + " con ID: " + id + " eliminado.");
                    break;
                case "zona":
                    zonaRepo.deleteById(id);
                    response = ResponseEntity.ok("Elemento de " + tipo + " con ID: " + id + " eliminado.");
                    break;
                case "construccion":
                    construccionRepo.deleteById(id);
                    response = ResponseEntity.ok("Elemento de " + tipo + " con ID: " + id + " eliminado.");
                    break;
                case "efectos":
                    efectosRepo.deleteById(id);
                    response = ResponseEntity.ok("Elemento de " + tipo + " con ID: " + id + " eliminado.");
                    break;
                case "interaccion":
                    interaccionRepo.deleteById(id);
                    response = ResponseEntity.ok("Elemento de " + tipo + " con ID: " + id + " eliminado.");
                    break;
                default:
                    response = ResponseEntity.badRequest().body("Tipo de dato desconocido: " + tipo);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response = ResponseEntity.internalServerError().body("Error al eliminar: No se pudo eliminar el ID " + id + ". Puede que tenga nodos o relaciones dependientes.");
        }
        return response;
    }


    /**
     * Activa un nodo llamando al Procedimiento Almacenado.
     * Refactorizado con switch y un solo punto de retorno en el try-catch.
     */
    @PostMapping("/activar-nodo")
    public ResponseEntity<?> activarNodo(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body("No hay proyecto activo");
        }

        // --- Validación de entrada ---
        String tipo = datosDTO.getTipo();
        Long idLong = datosDTO.getId();
        String caracteristica = datosDTO.getCaracteristica();

        if (tipo == null) {
            return ResponseEntity.badRequest().body("El campo 'tipo' es obligatorio");
        }
        if (idLong == null) {
             return ResponseEntity.badRequest().body("El 'id' es obligatorio para activar un nodo");
        }
        if (caracteristica == null || caracteristica.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La 'caracteristica' es obligatoria para activar un nodo");
        }
        
        Integer id = idLong.intValue();
        ResponseEntity<?> response;

        try {
            switch (tipo.toLowerCase()) {
                case "entidadindividual":
                    entidadIndRepo.activarNodo(id, caracteristica);
                    response = ResponseEntity.ok("Nodo activado para " + tipo + " con ID: " + id);
                    break;
                case "entidadcolectiva":
                    entidadColRepo.activarNodo(id, caracteristica);
                    response = ResponseEntity.ok("Nodo activado para " + tipo + " con ID: " + id);
                    break;
                case "zona":
                    zonaRepo.activarNodo(id, caracteristica);
                    response = ResponseEntity.ok("Nodo activado para " + tipo + " con ID: " + id);
                    break;
                case "construccion":
                    construccionRepo.activarNodo(id, caracteristica);
                    response = ResponseEntity.ok("Nodo activado para " + tipo + " con ID: " + id);
                    break;
                case "efectos":
                    efectosRepo.activarNodo(id, caracteristica);
                    response = ResponseEntity.ok("Nodo activado para " + tipo + " con ID: " + id);
                    break;
                case "interaccion":
                    interaccionRepo.activarNodo(id, caracteristica);
                    response = ResponseEntity.ok("Nodo activado para " + tipo + " con ID: " + id);
                    break;
                default:
                    response = ResponseEntity.badRequest().body("Tipo de nodo desconocido: " + tipo);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response = ResponseEntity.internalServerError().body("Error al activar nodo: " + e.getMessage());
        }
        return response;
    }

    /**
     * Endpoint para obtener el proyecto activo
     */
    @GetMapping("/activo")
    public ResponseEntity<?> obtenerProyectoActivo(HttpSession session) {
        String nombre = (String) session.getAttribute("proyectoActivo");
        String enfoque = (String) session.getAttribute("enfoqueProyectoActivo");
        
        if (nombre != null && enfoque != null) {
            return ResponseEntity.ok(Map.of("nombre", nombre, "enfoque", enfoque));
        } else {
            return ResponseEntity.status(404).body("No hay proyecto activo");
        }
    }

    // --- MÉTODOS PRIVADOS DE AYUDA (HELPERS) ---
    // Estos métodos evitan repetir código en insertar y modificar
    // (Sin cambios, ya estaban bien)

    private EntidadIndividual mapearAEntidadIndividual(DatosTablaDTO dto, EntidadIndividual entidad) {
        entidad.setNombre(dto.getNombre());
        entidad.setApellidos(dto.getApellidos());
        entidad.setDescripcion(dto.getDescripcion());
        entidad.setEstado(dto.getEstado());
        entidad.setOrigen(dto.getOrigenEntidad());
        entidad.setComportamiento(dto.getComportamientoEntidad());
        entidad.setTipo(dto.getTipo());
        return entidad;
    }

    private EntidadColectiva mapearAEntidadColectiva(DatosTablaDTO dto, EntidadColectiva entidad) {
        entidad.setNombre(dto.getNombre());
        entidad.setApellidos(dto.getApellidos());
        entidad.setDescripcion(dto.getDescripcion());
        entidad.setEstado(dto.getEstado());
        entidad.setOrigen(dto.getOrigenEntidad());
        entidad.setComportamiento(dto.getComportamientoEntidad());
        entidad.setTipo(dto.getTipo());
        return entidad;
    }

    private Zona mapearAZona(DatosTablaDTO dto, Zona zona) {
        zona.setNombre(dto.getNombre());
        zona.setApellidos(dto.getApellidos());
        zona.setDescripcion(dto.getDescripcion());
        zona.setTamanno(dto.getTamannoZona());
        zona.setDesarrollo(dto.getDesarrolloZona());
        zona.setTipo(dto.getTipo());
        return zona;
    }

    private Construccion mapearAConstruccion(DatosTablaDTO dto, Construccion construccion) {
        construccion.setNombre(dto.getNombre());
        construccion.setApellidos(dto.getApellidos());
        construccion.setDescripcion(dto.getDescripcion());
        construccion.setTamanno(dto.getTamannoCons());
        construccion.setDesarrollo(dto.getDesarrolloCons());
        construccion.setTipo(dto.getTipo());
        return construccion;
    }

    private Efectos mapearAEfectos(DatosTablaDTO dto, Efectos efectos) {
        efectos.setNombre(dto.getNombre());
        efectos.setApellidos(dto.getApellidos());
        efectos.setDescripcion(dto.getDescripcion());
        efectos.setOrigen(dto.getOrigenEfecto());
        efectos.setDureza(dto.getDureza());
        efectos.setComportamiento(dto.getComportamientoEfecto());
        // 'tipo' no parece estar en la tabla 'efectos' según tu SQL
        return efectos;
    }

    private Interaccion mapearAInteraccion(DatosTablaDTO dto, Interaccion interaccion) {
        interaccion.setNombre(dto.getNombre());
        interaccion.setApellidos(dto.getApellidos());
        interaccion.setDescripcion(dto.getDescripcion());
        interaccion.setDireccion(dto.getDireccion());
        interaccion.setAfectados(dto.getAfectados());
        interaccion.setTipo(dto.getTipo());
        return interaccion;
    }
}