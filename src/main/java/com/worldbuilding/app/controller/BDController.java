package com.worldbuilding.app.controller;

// import com.worldbuilding.app.config.DynamicDataSourceConfig;
import com.worldbuilding.app.model.*;
import com.worldbuilding.app.dto.DatosTablaDTO;
import com.worldbuilding.app.repository.*;
import com.worldbuilding.app.exception.UnauthorizedException;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Controlador despachador que gestiona todas las entidades del worldbuilding.
 * Usa el campo "tipoEntidad" del DTO para determinar qué repositorio usar.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController {

    // private static final String PROYECTO_ACTIVO = "proyectoActivo"; // Ya no se
    // usa para switching de BD

    @Autowired
    private EntidadIndividualRepository entidadIndRepo;
    @Autowired
    private EntidadColectivaRepository entidadColRepo;
    @Autowired
    private ZonaRepository zonaRepo;
    @Autowired
    private ConstruccionRepository construccionRepo;
    @Autowired
    private EfectosRepository efectosRepo;
    @Autowired
    private InteraccionRepository interaccionRepo;
    @Autowired
    private NodoRepository nodoRepo;
    @Autowired
    private RelacionRepository relacionRepo;
    @Autowired
    private LineaTiempoRepository lineaTiempoRepo;
    @Autowired
    private EventoTiempoRepository eventoTiempoRepo;
    @Autowired
    private EntidadGenericaRepository entidadGenericaRepo;

    @Autowired
    private JdbcTemplate jdbcTemplate;
    // @Autowired
    // private DynamicDataSourceConfig dataSourceConfig;

    /**
     * Obtiene el nombre del proyecto activo de ThreadLocal o sesión
     */
    /**
     * Obtiene el nombre del proyecto activo de ThreadLocal o sesión
     */
    private String getProyectoActivo(HttpSession session) {
        String proyecto = (String) session.getAttribute("proyectoActivo");
        if (proyecto == null) {
            throw new UnauthorizedException("No hay proyecto activo en sesión.");
        }
        com.worldbuilding.app.config.TenantContext.setCurrentTenant(proyecto);
        return proyecto;
    }

    // ==================== INSERTAR ====================

    @PutMapping("/insertar")
    public ResponseEntity<?> insertar(@RequestBody DatosTablaDTO dto, HttpSession session) {
        String nombreProyecto = getProyectoActivo(session);
        // ... (rest of insert method is fine, it uses getProyectoActivo)

        String tipo = dto.getTipoEntidad();
        if (tipo == null || tipo.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "tipoEntidad es requerido"));
        }

        Object entidadGuardada = switch (tipo.toLowerCase()) {
            case "entidadindividual" -> {
                EntidadIndividual e = new EntidadIndividual();
                mapearEntidadIndividual(dto, e, nombreProyecto);
                yield entidadIndRepo.save(e);
            }
            case "entidadcolectiva" -> {
                EntidadColectiva e = new EntidadColectiva();
                mapearEntidadColectiva(dto, e, nombreProyecto);
                yield entidadColRepo.save(e);
            }
            case "zona" -> {
                Zona z = new Zona();
                mapearZona(dto, z, nombreProyecto);
                yield zonaRepo.save(z);
            }
            case "construccion" -> {
                Construccion c = new Construccion();
                mapearConstruccion(dto, c, nombreProyecto);
                yield construccionRepo.save(c);
            }
            case "efectos" -> {
                Efectos ef = new Efectos();
                mapearEfectos(dto, ef, nombreProyecto);
                yield efectosRepo.save(ef);
            }
            case "interaccion" -> {
                Interaccion i = new Interaccion();
                mapearInteraccion(dto, i, nombreProyecto);
                yield interaccionRepo.save(i);
            }
            case "relacion" -> {
                Relacion r = new Relacion();
                mapearRelacion(dto, r);
                yield relacionRepo.save(r);
            }
            case "lineatiempo" -> {
                LineaTiempo lt = new LineaTiempo();
                mapearLineaTiempo(dto, lt);
                yield lineaTiempoRepo.save(lt);
            }
            case "eventotiempo" -> {
                EventoTiempo et = new EventoTiempo();
                // Need to find LineaTiempo first
                LineaTiempo lt = lineaTiempoRepo.findById(dto.getLineaTiempoId())
                        .orElseThrow(() -> new IllegalArgumentException("LineaTiempo ID required"));
                mapearEventoTiempo(dto, et, lt);
                yield eventoTiempoRepo.save(et);
            }
            default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
        };

        return ResponseEntity.ok(Map.of(
                "success", true,
                "entidad", entidadGuardada));
    }

    // ==================== MODIFICAR ====================

    @PatchMapping("/modificar")
    public ResponseEntity<?> modificar(@RequestBody DatosTablaDTO dto, HttpSession session) {
        String nombreProyecto = getProyectoActivo(session);
        // ... (rest of modify method is fine)
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No hay proyecto activo"));
        }

        String tipo = dto.getTipoEntidad();
        Long id = dto.getId();
        if (tipo == null || id == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "tipoEntidad e id son requeridos"));
        }

        try {
            Object entidadModificada = switch (tipo.toLowerCase()) {
                case "entidadindividual" -> {
                    EntidadIndividual e = entidadIndRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Entidad no encontrada"));
                    mapearEntidadIndividual(dto, e, nombreProyecto);
                    yield entidadIndRepo.save(e);
                }
                case "entidadcolectiva" -> {
                    EntidadColectiva e = entidadColRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Entidad no encontrada"));
                    mapearEntidadColectiva(dto, e, nombreProyecto);
                    yield entidadColRepo.save(e);
                }
                case "zona" -> {
                    Zona z = zonaRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Zona no encontrada"));
                    mapearZona(dto, z, nombreProyecto);
                    yield zonaRepo.save(z);
                }
                case "construccion" -> {
                    Construccion c = construccionRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Construcción no encontrada"));
                    mapearConstruccion(dto, c, nombreProyecto);
                    yield construccionRepo.save(c);
                }
                case "efectos" -> {
                    Efectos ef = efectosRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Efecto no encontrado"));
                    mapearEfectos(dto, ef, nombreProyecto);
                    yield efectosRepo.save(ef);
                }
                case "interaccion" -> {
                    Interaccion i = interaccionRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Interacción no encontrada"));
                    mapearInteraccion(dto, i, nombreProyecto);
                    yield interaccionRepo.save(i);
                }
                case "relacion" -> {
                    Relacion r = relacionRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Relacion no encontrada"));
                    mapearRelacion(dto, r);
                    yield relacionRepo.save(r);
                }
                case "lineatiempo" -> {
                    LineaTiempo lt = lineaTiempoRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Linea Tiempo no encontrada"));
                    mapearLineaTiempo(dto, lt);
                    yield lineaTiempoRepo.save(lt);
                }
                case "eventotiempo" -> {
                    EventoTiempo et = eventoTiempoRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Evento Tiempo no encontrado"));
                    LineaTiempo lt = dto.getLineaTiempoId() != null
                            ? lineaTiempoRepo.findById(dto.getLineaTiempoId()).orElse(et.getLineaTiempo())
                            : et.getLineaTiempo();
                    mapearEventoTiempo(dto, et, lt);
                    yield eventoTiempoRepo.save(et);
                }
                default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
            };

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "entidad", entidadModificada));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== LISTAR POR TIPO ====================

    @GetMapping("/{tipo}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listarPorTipo(@PathVariable String tipo, HttpSession session) {
        String proyecto = getProyectoActivo(session);
        try {
            List<?> resultados = switch (tipo.toLowerCase()) {
                case "entidadindividual" ->
                    entidadGenericaRepo.findByNombreProyectoAndTipoEspecial(proyecto, "entidadindividual");
                case "entidadcolectiva" ->
                    entidadGenericaRepo.findByNombreProyectoAndTipoEspecial(proyecto, "entidadcolectiva");
                case "zona" -> entidadGenericaRepo.findByNombreProyectoAndTipoEspecial(proyecto, "zona");
                case "construccion" ->
                    entidadGenericaRepo.findByNombreProyectoAndTipoEspecial(proyecto, "construccion");
                case "mapa" -> entidadGenericaRepo.findByNombreProyectoAndTipoEspecial(proyecto, "map");
                case "efectos" -> efectosRepo.findByNombreProyecto(proyecto);
                case "interaccion" -> interaccionRepo.findByNombreProyecto(proyecto);
                case "nodo" -> nodoRepo.findAll(); // Nodo y Relacion son globales o necesitan repo method
                case "relacion" -> relacionRepo.findAll();
                case "lineatiempo" -> {
                    // Manual DTO mapping to prevent Jackson serialization issues with Hibernate
                    // Proxies (Open-In-View=false)
                    List<LineaTiempo> entities = lineaTiempoRepo.findAll();
                    yield entities.stream()
                            .filter(java.util.Objects::nonNull) // PREVENT NPE
                            .map(lt -> {
                                System.out.println(
                                        ">>> [BDController] Mapping Timeline ID: " + lt.getId() + ", Name: "
                                                + lt.getNombre());
                                java.util.Map<String, Object> dto = new java.util.HashMap<>();
                                dto.put("id", lt.getId());
                                dto.put("nombre", lt.getNombre());
                                dto.put("descripcion", lt.getDescripcion());
                                dto.put("esRaiz", lt.getEsRaiz());
                                return dto;
                            }).toList();
                }
                case "eventotiempo" -> eventoTiempoRepo.findAll();
                default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
            };

            return ResponseEntity.ok(resultados);
        } catch (Exception e) {
            System.out.println(">>> [BDController] ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== BUSCAR POR ID ====================

    @GetMapping("/{tipo}/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable String tipo, @PathVariable Long id, HttpSession session) {
        try {
            Object resultado = switch (tipo.toLowerCase()) {
                case "entidadindividual" -> entidadGenericaRepo.findById(id).orElse(null);
                case "entidadcolectiva" -> entidadGenericaRepo.findById(id).orElse(null);
                case "zona" -> entidadGenericaRepo.findById(id).orElse(null);
                case "construccion" -> entidadGenericaRepo.findById(id).orElse(null);
                case "mapa" -> entidadGenericaRepo.findById(id).orElse(null);
                case "efectos" -> efectosRepo.findById(id).orElse(null);
                case "interaccion" -> interaccionRepo.findById(id).orElse(null);
                case "nodo" -> nodoRepo.findById(id).orElse(null);
                case "relacion" -> relacionRepo.findById(id).orElse(null);
                case "lineatiempo" -> lineaTiempoRepo.findById(id).orElse(null);
                case "eventotiempo" -> eventoTiempoRepo.findById(id).orElse(null);
                default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
            };

            if (resultado == null) {
                return ResponseEntity.status(404).body(Map.of("error", "No encontrado"));
            }
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ELIMINAR ====================

    @DeleteMapping("/{tipo}/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String tipo, @PathVariable Long id, HttpSession session) {
        try {
            switch (tipo.toLowerCase()) {
                case "entidadindividual" -> entidadIndRepo.deleteById(id);
                case "entidadcolectiva" -> entidadColRepo.deleteById(id);
                case "zona" -> zonaRepo.deleteById(id);
                case "construccion" -> construccionRepo.deleteById(id);
                case "efectos" -> efectosRepo.deleteById(id);
                case "interaccion" -> interaccionRepo.deleteById(id);
                case "nodo" -> nodoRepo.deleteById(id);
                case "relacion" -> relacionRepo.deleteById(id);
                case "lineatiempo" -> lineaTiempoRepo.deleteById(id);
                case "eventotiempo" -> eventoTiempoRepo.deleteById(id);
                default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
            }

            return ResponseEntity.ok(Map.of("success", true, "mensaje", "Eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ACTIVAR NODO ====================

    @Autowired
    private com.worldbuilding.app.service.GraphService graphService;

    // ==================== ACTIVAR NODO ====================

    @PostMapping("/activar-nodo")
    public ResponseEntity<?> activarNodo(@RequestBody DatosTablaDTO dto, HttpSession session) {
        try {
            Long entidadId = dto.getEntidadId();
            String tipoEntidad = dto.getTipoEntidad();
            String caracteristica = dto.getCaracteristicaRelacional();

            if (entidadId == null || tipoEntidad == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "entidadId y tipoEntidad son requeridos"));
            }

            graphService.activarNodo(entidadId, tipoEntidad, caracteristica);
            System.out.println("Activando nodo en Grafo SQLite: " + entidadId);

            return ResponseEntity.ok(Map.of("success", true, "mensaje", "Nodo activado"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== OBTENER PROYECTO ACTIVO ====================

    @GetMapping("/proyecto-activo")
    public ResponseEntity<?> obtenerProyectoActivo(HttpSession session) {
        String nombreProyecto = getProyectoActivo(session);
        if (nombreProyecto == null) {
            return ResponseEntity.status(404).body(Map.of("error", "No hay proyecto activo"));
        }
        return ResponseEntity.ok(Map.of("nombreProyecto", nombreProyecto));
    }

    // ==================== MÉTODOS AUXILIARES DE MAPEO ====================

    private void mapearEntidadIndividual(DatosTablaDTO dto, EntidadIndividual e, String nombreProyecto) {
        e.setNombreProyecto(nombreProyecto);
        if (dto.getNombre() != null)
            e.setNombre(dto.getNombre());
        if (dto.getApellidos() != null)
            e.setApellidos(dto.getApellidos());
        if (dto.getEstado() != null)
            e.setEstado(dto.getEstado());
        if (dto.getTipo() != null)
            e.setTipo(dto.getTipo());
        if (dto.getOrigen() != null)
            e.setOrigen(dto.getOrigen());
        if (dto.getComportamiento() != null)
            e.setComportamiento(dto.getComportamiento());
        if (dto.getDescripcion() != null)
            e.setDescripcion(dto.getDescripcion());
    }

    private void mapearEntidadColectiva(DatosTablaDTO dto, EntidadColectiva e, String nombreProyecto) {
        e.setNombreProyecto(nombreProyecto);
        if (dto.getNombre() != null)
            e.setNombre(dto.getNombre());
        if (dto.getCantidadMiembros() != null)
            e.setCantidadMiembros(dto.getCantidadMiembros());
        if (dto.getTipo() != null)
            e.setTipo(dto.getTipo());
        if (dto.getComportamiento() != null)
            e.setComportamiento(dto.getComportamiento());
        if (dto.getDescripcion() != null)
            e.setDescripcion(dto.getDescripcion());
    }

    private void mapearZona(DatosTablaDTO dto, Zona z, String nombreProyecto) {
        z.setNombreProyecto(nombreProyecto);
        if (dto.getNombre() != null)
            z.setNombre(dto.getNombre());
        if (dto.getApellidos() != null)
            z.setApellidos(dto.getApellidos());
        if (dto.getTamanno() != null)
            z.setTamanno(dto.getTamanno());
        if (dto.getTipo() != null)
            z.setTipo(dto.getTipo());
        if (dto.getDesarrollo() != null)
            z.setDesarrollo(dto.getDesarrollo());
        if (dto.getDescripcion() != null)
            z.setDescripcion(dto.getDescripcion());
    }

    private void mapearConstruccion(DatosTablaDTO dto, Construccion c, String nombreProyecto) {
        c.setNombreProyecto(nombreProyecto);
        if (dto.getNombre() != null)
            c.setNombre(dto.getNombre());
        if (dto.getTipoEdificio() != null)
            c.setTipoEdificio(dto.getTipoEdificio());
        if (dto.getDesarrollo() != null)
            c.setDesarrollo(dto.getDesarrollo());
        if (dto.getDescripcion() != null)
            c.setDescripcion(dto.getDescripcion());
    }

    private void mapearEfectos(DatosTablaDTO dto, Efectos ef, String nombreProyecto) {
        ef.setNombreProyecto(nombreProyecto);
        if (dto.getNombre() != null)
            ef.setNombre(dto.getNombre());
        if (dto.getTipoEfecto() != null)
            ef.setTipoEfecto(dto.getTipoEfecto());
        if (dto.getOrigen() != null)
            ef.setOrigen(dto.getOrigen());
        if (dto.getAlcance() != null)
            ef.setAlcance(dto.getAlcance());
        if (dto.getDescripcion() != null)
            ef.setDescripcion(dto.getDescripcion());
    }

    private void mapearInteraccion(DatosTablaDTO dto, Interaccion i, String nombreProyecto) {
        i.setNombreProyecto(nombreProyecto);
        if (dto.getNombre() != null)
            i.setNombre(dto.getNombre());
        if (dto.getTipo() != null)
            i.setTipo(dto.getTipo());
        if (dto.getContexto() != null)
            i.setContexto(dto.getContexto());
        if (dto.getResultado() != null)
            i.setResultado(dto.getResultado());
        if (dto.getDescripcion() != null)
            i.setDescripcion(dto.getDescripcion());
    }

    private void mapearRelacion(DatosTablaDTO dto, Relacion r) {
        if (dto.getNodoOrigenId() != null)
            r.setNodoOrigenId(dto.getNodoOrigenId());
        if (dto.getNodoDestinoId() != null)
            r.setNodoDestinoId(dto.getNodoDestinoId());
        if (dto.getTipoRelacion() != null)
            r.setTipoRelacion(dto.getTipoRelacion());
        if (dto.getTipoOrigen() != null)
            r.setTipoOrigen(dto.getTipoOrigen());
        if (dto.getTipoDestino() != null)
            r.setTipoDestino(dto.getTipoDestino());
        if (dto.getDescripcion() != null)
            r.setDescripcion(dto.getDescripcion());
        if (dto.getMetadata() != null)
            r.setMetadata(dto.getMetadata());
    }

    private void mapearLineaTiempo(DatosTablaDTO dto, LineaTiempo lt) {
        if (dto.getNombre() != null)
            lt.setNombre(dto.getNombre());
        if (dto.getDescripcion() != null)
            lt.setDescripcion(dto.getDescripcion());
        if (dto.getEsRaiz() != null)
            lt.setEsRaiz(dto.getEsRaiz());
    }

    private void mapearEventoTiempo(DatosTablaDTO dto, EventoTiempo et, LineaTiempo lt) {
        if (dto.getNombre() != null)
            et.setNombre(dto.getNombre());
        if (dto.getDescripcion() != null)
            et.setDescripcion(dto.getDescripcion());
        if (dto.getFechaTexto() != null)
            et.setFechaTexto(dto.getFechaTexto());
        if (dto.getOrdenAbsoluto() != null)
            et.setOrdenAbsoluto(dto.getOrdenAbsoluto());
        et.setLineaTiempo(lt);
    }
}
