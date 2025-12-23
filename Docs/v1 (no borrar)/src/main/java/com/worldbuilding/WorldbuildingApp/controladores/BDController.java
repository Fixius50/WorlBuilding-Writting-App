package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Importamos TODOS los repositorios
import com.worldbuilding.interfaces.*;

// Importamos TODOS los modelos
import com.worldbuilding.WorldbuildingApp.modelos.*;
import com.worldbuilding.WorldbuildingApp.servicios.ProyectoService;

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
    @Autowired private ProyectoService proyectoService;

    /**
     * Inserta datos usando el DTO.
     * Refactorizado con switch y un solo punto de retorno en el try-catch.
     * También agrega la operación SQL al archivo del proyecto.
     */
    @PostMapping("/insertar")
    public ResponseEntity<?> insertarDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        System.out.println("\n[BDController.insertarDatosDTO] ===== INICIO =====");
        System.out.println("[BDController.insertarDatosDTO] proyectoActivo=" + nombreProyecto);
        
        if (nombreProyecto == null) {
            System.out.println("[BDController.insertarDatosDTO] ERROR: No hay proyecto activo en sesión");
            return ResponseEntity.badRequest().body("No hay proyecto activo");
        }

        System.out.println("[BDController.insertarDatosDTO] tipo=" + datosDTO.getTipo());
        System.out.println("[BDController.insertarDatosDTO] nombre=" + datosDTO.getNombre());
        
        ResponseEntity<?> response;
        try {
            String tipo = datosDTO.getTipo();
            if (tipo == null) {
                System.out.println("[BDController.insertarDatosDTO] ERROR: tipo es null");
                return ResponseEntity.badRequest().body("El campo 'tipo' es obligatorio");
            }

            System.out.println("[BDController.insertarDatosDTO] Procesando tipo: " + tipo.toLowerCase());
            
            switch (tipo.toLowerCase()) {
                case "entidadindividual":
                    System.out.println("[BDController.insertarDatosDTO] Mapeando a EntidadIndividual...");
                    EntidadIndividual entidad = mapearAEntidadIndividual(datosDTO, new EntidadIndividual(), nombreProyecto);
                    System.out.println("[BDController.insertarDatosDTO] Entidad mapeada: " + entidad.getNombre());
                    
                    System.out.println("[BDController.insertarDatosDTO] Guardando en BD...");
                    EntidadIndividual guardadoInd = entidadIndRepo.save(entidad);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Guardado en BD con ID: " + guardadoInd.getId());
                    
                    System.out.println("[BDController.insertarDatosDTO] Agregando operación SQL...");
                    agregarOperacionSQLAlProyecto(nombreProyecto, "entidadIndividual", entidad);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Operación SQL agregada");
                    
                    response = ResponseEntity.ok(guardadoInd);
                    break;

                case "entidadcolectiva":
                    System.out.println("[BDController.insertarDatosDTO] Mapeando a EntidadColectiva...");
                    EntidadColectiva entidadCol = mapearAEntidadColectiva(datosDTO, new EntidadColectiva(), nombreProyecto);
                    System.out.println("[BDController.insertarDatosDTO] Entidad mapeada: " + entidadCol.getNombre());
                    
                    EntidadColectiva guardadoCol = entidadColRepo.save(entidadCol);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Guardado en BD con ID: " + guardadoCol.getId());
                    
                    agregarOperacionSQLAlProyecto(nombreProyecto, "entidadColectiva", entidadCol);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Operación SQL agregada");
                    response = ResponseEntity.ok(guardadoCol);
                    break;

                case "zona":
                    System.out.println("[BDController.insertarDatosDTO] Mapeando a Zona...");
                    Zona zona = mapearAZona(datosDTO, new Zona(), nombreProyecto);
                    System.out.println("[BDController.insertarDatosDTO] Zona mapeada: " + zona.getNombre());
                    
                    Zona guardadaZona = zonaRepo.save(zona);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Guardado en BD con ID: " + guardadaZona.getId());
                    
                    agregarOperacionSQLAlProyecto(nombreProyecto, "zona", zona);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Operación SQL agregada");
                    response = ResponseEntity.ok(guardadaZona);
                    break;

                case "construccion":
                    System.out.println("[BDController.insertarDatosDTO] Mapeando a Construccion...");
                    Construccion construccion = mapearAConstruccion(datosDTO, new Construccion(), nombreProyecto);
                    System.out.println("[BDController.insertarDatosDTO] Construcción mapeada: " + construccion.getNombre());
                    
                    Construccion guardadaCons = construccionRepo.save(construccion);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Guardado en BD con ID: " + guardadaCons.getId());
                    
                    agregarOperacionSQLAlProyecto(nombreProyecto, "construccion", construccion);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Operación SQL agregada");
                    response = ResponseEntity.ok(guardadaCons);
                    break;
            
                case "efectos":
                    System.out.println("[BDController.insertarDatosDTO] Mapeando a Efectos...");
                    Efectos efectos = mapearAEfectos(datosDTO, new Efectos(), nombreProyecto);
                    System.out.println("[BDController.insertarDatosDTO] Efectos mapeados: " + efectos.getNombre());
                    
                    Efectos guardadoEfectos = efectosRepo.save(efectos);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Guardado en BD con ID: " + guardadoEfectos.getId());
                    
                    agregarOperacionSQLAlProyecto(nombreProyecto, "efectos", efectos);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Operación SQL agregada");
                    response = ResponseEntity.ok(guardadoEfectos);
                    break;

                case "interaccion":
                    System.out.println("[BDController.insertarDatosDTO] Mapeando a Interaccion...");
                    Interaccion interaccion = mapearAInteraccion(datosDTO, new Interaccion(), nombreProyecto);
                    System.out.println("[BDController.insertarDatosDTO] Interacción mapeada: " + interaccion.getNombre());
                    
                    Interaccion guardadoInt = interaccionRepo.save(interaccion);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Guardado en BD con ID: " + guardadoInt.getId());
                    
                    agregarOperacionSQLAlProyecto(nombreProyecto, "interaccion", interaccion);
                    System.out.println("[BDController.insertarDatosDTO] ✓ Operación SQL agregada");
                    response = ResponseEntity.ok(guardadoInt);
                    break;
            
                default:
                    System.out.println("[BDController.insertarDatosDTO] ERROR: Tipo desconocido: " + tipo);
                    response = ResponseEntity.badRequest().body("Tipo de dato desconocido: " + tipo);
            }
            
            System.out.println("[BDController.insertarDatosDTO] ===== ÉXITO =====\n");
        } catch (Exception e) {
            System.out.println("[BDController.insertarDatosDTO] ===== EXCEPCIÓN =====");
            System.out.println("[BDController.insertarDatosDTO] Error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("[BDController.insertarDatosDTO] ===== FIN EXCEPCIÓN =====\n");
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
                        EntidadIndividual entidad = mapearAEntidadIndividual(datosDTO, optInd.get(), nombreProyecto);
                        EntidadIndividual guardado = entidadIndRepo.save(entidad);
                        response = ResponseEntity.ok(guardado);
                    }
                    break;

                case "entidadcolectiva":
                    Optional<EntidadColectiva> optCol = entidadColRepo.findById(id);
                    if (optCol.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        EntidadColectiva entidad = mapearAEntidadColectiva(datosDTO, optCol.get(), nombreProyecto);
                        EntidadColectiva guardado = entidadColRepo.save(entidad);
                        response = ResponseEntity.ok(guardado);
                    }
                    break;

                case "zona":
                    Optional<Zona> optZona = zonaRepo.findById(id);
                    if (optZona.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        Zona entidad = mapearAZona(datosDTO, optZona.get(), nombreProyecto);
                        Zona guardada = zonaRepo.save(entidad);
                        response = ResponseEntity.ok(guardada);
                    }
                    break;

                case "construccion":
                    Optional<Construccion> optCons = construccionRepo.findById(id);
                    if (optCons.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        Construccion entidad = mapearAConstruccion(datosDTO, optCons.get(), nombreProyecto);
                        Construccion guardada = construccionRepo.save(entidad);
                        response = ResponseEntity.ok(guardada);
                    }
                    break;

                case "efectos":
                    Optional<Efectos> optEfectos = efectosRepo.findById(id);
                    if (optEfectos.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        Efectos entidad = mapearAEfectos(datosDTO, optEfectos.get(), nombreProyecto);
                        Efectos guardado = efectosRepo.save(entidad);
                        response = ResponseEntity.ok(guardado);
                    }
                    break;

                case "interaccion":
                    Optional<Interaccion> optInt = interaccionRepo.findById(id);
                    if (optInt.isEmpty()) {
                        response = ResponseEntity.status(404).body("No se encontró " + tipo + " con ID: " + id);
                    } else {
                        Interaccion entidad = mapearAInteraccion(datosDTO, optInt.get(), nombreProyecto);
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
     * Lista todos los elementos de un tipo específico del proyecto activo.
     * Refactorizado con switch y filtra por proyecto.
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
                var entidadesInd = entidadIndRepo.findAll().stream()
                    .filter(e -> nombreProyecto.equals(e.getNombreProyecto()))
                    .toList();
                response = ResponseEntity.ok(entidadesInd);
                break;
            case "entidadcolectiva":
                var entidadesCol = entidadColRepo.findAll().stream()
                    .filter(e -> nombreProyecto.equals(e.getNombreProyecto()))
                    .toList();
                response = ResponseEntity.ok(entidadesCol);
                break;
            case "zona":
                var zonas = zonaRepo.findAll().stream()
                    .filter(z -> nombreProyecto.equals(z.getNombreProyecto()))
                    .toList();
                response = ResponseEntity.ok(zonas);
                break;
            case "construccion":
                var construcciones = construccionRepo.findAll().stream()
                    .filter(c -> nombreProyecto.equals(c.getNombreProyecto()))
                    .toList();
                response = ResponseEntity.ok(construcciones);
                break;
            case "efectos":
                var efectosList = efectosRepo.findAll().stream()
                    .filter(e -> nombreProyecto.equals(e.getNombreProyecto()))
                    .toList();
                response = ResponseEntity.ok(efectosList);
                break;
            case "interaccion":
                var interacciones = interaccionRepo.findAll().stream()
                    .filter(i -> nombreProyecto.equals(i.getNombreProyecto()))
                    .toList();
                response = ResponseEntity.ok(interacciones);
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

    private EntidadIndividual mapearAEntidadIndividual(DatosTablaDTO dto, EntidadIndividual entidad, String nombreProyecto) {
        entidad.setNombreProyecto(nombreProyecto);
        entidad.setNombre(dto.getNombre());
        entidad.setApellidos(dto.getApellidos());
        entidad.setDescripcion(dto.getDescripcion());
        entidad.setEstado(dto.getEstado());
        entidad.setOrigen(dto.getOrigenEntidad());
        entidad.setComportamiento(dto.getComportamientoEntidad());
        entidad.setTipo(dto.getTipo());
        return entidad;
    }

    private EntidadColectiva mapearAEntidadColectiva(DatosTablaDTO dto, EntidadColectiva entidad, String nombreProyecto) {
        entidad.setNombreProyecto(nombreProyecto);
        entidad.setNombre(dto.getNombre());
        entidad.setApellidos(dto.getApellidos());
        entidad.setDescripcion(dto.getDescripcion());
        entidad.setEstado(dto.getEstado());
        entidad.setOrigen(dto.getOrigenEntidad());
        entidad.setComportamiento(dto.getComportamientoEntidad());
        entidad.setTipo(dto.getTipo());
        return entidad;
    }

    private Zona mapearAZona(DatosTablaDTO dto, Zona zona, String nombreProyecto) {
        zona.setNombreProyecto(nombreProyecto);
        zona.setNombre(dto.getNombre());
        zona.setApellidos(dto.getApellidos());
        zona.setDescripcion(dto.getDescripcion());
        zona.setTamanno(dto.getTamannoZona());
        zona.setDesarrollo(dto.getDesarrolloZona());
        zona.setTipo(dto.getTipo());
        return zona;
    }

    private Construccion mapearAConstruccion(DatosTablaDTO dto, Construccion construccion, String nombreProyecto) {
        construccion.setNombreProyecto(nombreProyecto);
        construccion.setNombre(dto.getNombre());
        construccion.setApellidos(dto.getApellidos());
        construccion.setDescripcion(dto.getDescripcion());
        construccion.setTamanno(dto.getTamannoCons());
        construccion.setDesarrollo(dto.getDesarrolloCons());
        construccion.setTipo(dto.getTipo());
        return construccion;
    }

    private Efectos mapearAEfectos(DatosTablaDTO dto, Efectos efectos, String nombreProyecto) {
        efectos.setNombreProyecto(nombreProyecto);
        efectos.setNombre(dto.getNombre());
        efectos.setApellidos(dto.getApellidos());
        efectos.setDescripcion(dto.getDescripcion());
        efectos.setOrigen(dto.getOrigenEfecto());
        efectos.setDureza(dto.getDureza());
        efectos.setComportamiento(dto.getComportamientoEfecto());
        // 'tipo' no parece estar en la tabla 'efectos' según tu SQL
        return efectos;
    }

    private Interaccion mapearAInteraccion(DatosTablaDTO dto, Interaccion interaccion, String nombreProyecto) {
        interaccion.setNombreProyecto(nombreProyecto);
        interaccion.setNombre(dto.getNombre());
        interaccion.setApellidos(dto.getApellidos());
        interaccion.setDescripcion(dto.getDescripcion());
        interaccion.setDireccion(dto.getDireccion());
        interaccion.setAfectados(dto.getAfectados());
        interaccion.setTipo(dto.getTipo());
        return interaccion;
    }

    /**
     * Método auxiliar para agregar una operación INSERT al archivo SQL del proyecto
     */
    private void agregarOperacionSQLAlProyecto(String nombreProyecto, String nombreTabla, Object entidad) {
        try {
            String insertSQL = generarInsertSQL(nombreTabla, entidad);
            proyectoService.agregarOperacionAlArchivo(nombreProyecto, insertSQL);
        } catch (Exception e) {
            e.printStackTrace();
            // No lanzamos excepción para no interrumpir la inserción en BD
            System.err.println("Error al agregar operación SQL al archivo del proyecto: " + e.getMessage());
        }
    }

    /**
     * Genera una sentencia SQL INSERT basada en el tipo de entidad
     */
    private String generarInsertSQL(String nombreTabla, Object entidad) {
        if (entidad instanceof EntidadIndividual) {
            EntidadIndividual e = (EntidadIndividual) entidad;
            return String.format(
                "INSERT INTO %s (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s');",
                nombreTabla, escaparSQL(e.getNombre()), escaparSQL(e.getApellidos()), escaparSQL(e.getEstado()),
                escaparSQL(e.getTipo()), escaparSQL(e.getOrigen()), escaparSQL(e.getComportamiento()), escaparSQL(e.getDescripcion())
            );
        } else if (entidad instanceof EntidadColectiva) {
            EntidadColectiva e = (EntidadColectiva) entidad;
            return String.format(
                "INSERT INTO %s (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s');",
                nombreTabla, escaparSQL(e.getNombre()), escaparSQL(e.getApellidos()), escaparSQL(e.getEstado()),
                escaparSQL(e.getTipo()), escaparSQL(e.getOrigen()), escaparSQL(e.getComportamiento()), escaparSQL(e.getDescripcion())
            );
        } else if (entidad instanceof Zona) {
            Zona z = (Zona) entidad;
            return String.format(
                "INSERT INTO %s (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES ('%s', '%s', '%s', '%s', '%s', '%s');",
                nombreTabla, escaparSQL(z.getNombre()), escaparSQL(z.getApellidos()), escaparSQL(z.getTamanno()),
                escaparSQL(z.getTipo()), escaparSQL(z.getDesarrollo()), escaparSQL(z.getDescripcion())
            );
        } else if (entidad instanceof Construccion) {
            Construccion c = (Construccion) entidad;
            return String.format(
                "INSERT INTO %s (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES ('%s', '%s', '%s', '%s', '%s', '%s');",
                nombreTabla, escaparSQL(c.getNombre()), escaparSQL(c.getApellidos()), escaparSQL(c.getTamanno()),
                escaparSQL(c.getTipo()), escaparSQL(c.getDesarrollo()), escaparSQL(c.getDescripcion())
            );
        } else if (entidad instanceof Efectos) {
            Efectos ef = (Efectos) entidad;
            return String.format(
                "INSERT INTO %s (nombre, apellidos, origen, dureza, comportamiento, descripcion) VALUES ('%s', '%s', '%s', '%s', '%s', '%s');",
                nombreTabla, escaparSQL(ef.getNombre()), escaparSQL(ef.getApellidos()), escaparSQL(ef.getOrigen()),
                escaparSQL(ef.getDureza()), escaparSQL(ef.getComportamiento()), escaparSQL(ef.getDescripcion())
            );
        } else if (entidad instanceof Interaccion) {
            Interaccion i = (Interaccion) entidad;
            return String.format(
                "INSERT INTO %s (nombre, apellidos, direccion, tipo, afectados, descripcion) VALUES ('%s', '%s', '%s', '%s', '%s', '%s');",
                nombreTabla, escaparSQL(i.getNombre()), escaparSQL(i.getApellidos()), escaparSQL(i.getDireccion()),
                escaparSQL(i.getTipo()), escaparSQL(i.getAfectados()), escaparSQL(i.getDescripcion())
            );
        }
        return "";
    }

    /**
     * Escapa caracteres especiales en strings SQL
     */
    private String escaparSQL(String str) {
        if (str == null) return "";
        return str.replace("'", "''");
    }
}