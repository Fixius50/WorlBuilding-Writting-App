package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.*;
import com.worldbuilding.app.model.dto.DatosTablaDTO;
import com.worldbuilding.app.repository.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador despachador que gestiona todas las entidades del worldbuilding.
 * Usa el campo "tipoEntidad" del DTO para determinar qué repositorio usar.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController {

    private static final String PROYECTO_ACTIVO = "proyectoActivo";

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
    private JdbcTemplate jdbcTemplate;

    // ==================== INSERTAR ====================

    @PutMapping("/insertar")
    public ResponseEntity<?> insertar(@RequestBody DatosTablaDTO dto, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute(PROYECTO_ACTIVO);
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No hay proyecto activo"));
        }

        String tipo = dto.getTipoEntidad();
        if (tipo == null || tipo.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "tipoEntidad es requerido"));
        }

        try {
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
                default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
            };

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "entidad", entidadGuardada));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== MODIFICAR ====================

    @PatchMapping("/modificar")
    public ResponseEntity<?> modificar(@RequestBody DatosTablaDTO dto, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute(PROYECTO_ACTIVO);
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
    public ResponseEntity<?> listarPorTipo(@PathVariable String tipo, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute(PROYECTO_ACTIVO);
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No hay proyecto activo"));
        }

        try {
            List<?> resultados = switch (tipo.toLowerCase()) {
                case "entidadindividual" -> entidadIndRepo.findByNombreProyecto(nombreProyecto);
                case "entidadcolectiva" -> entidadColRepo.findByNombreProyecto(nombreProyecto);
                case "zona" -> zonaRepo.findByNombreProyecto(nombreProyecto);
                case "construccion" -> construccionRepo.findByNombreProyecto(nombreProyecto);
                case "efectos" -> efectosRepo.findByNombreProyecto(nombreProyecto);
                case "interaccion" -> interaccionRepo.findByNombreProyecto(nombreProyecto);
                case "nodo" -> nodoRepo.findAll();
                case "relacion" -> relacionRepo.findAll();
                default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
            };

            return ResponseEntity.ok(resultados);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== BUSCAR POR ID ====================

    @GetMapping("/{tipo}/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable String tipo, @PathVariable Long id, HttpSession session) {
        try {
            Object resultado = switch (tipo.toLowerCase()) {
                case "entidadindividual" -> entidadIndRepo.findById(id).orElse(null);
                case "entidadcolectiva" -> entidadColRepo.findById(id).orElse(null);
                case "zona" -> zonaRepo.findById(id).orElse(null);
                case "construccion" -> construccionRepo.findById(id).orElse(null);
                case "efectos" -> efectosRepo.findById(id).orElse(null);
                case "interaccion" -> interaccionRepo.findById(id).orElse(null);
                case "nodo" -> nodoRepo.findById(id).orElse(null);
                case "relacion" -> relacionRepo.findById(id).orElse(null);
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
                default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
            }

            return ResponseEntity.ok(Map.of("success", true, "mensaje", "Eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

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

            // Llamar al procedimiento almacenado
            jdbcTemplate.update("CALL activarNodo(?, ?, ?)", entidadId, tipoEntidad, caracteristica);

            return ResponseEntity.ok(Map.of("success", true, "mensaje", "Nodo activado"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== OBTENER PROYECTO ACTIVO ====================

    @GetMapping("/proyecto-activo")
    public ResponseEntity<?> obtenerProyectoActivo(HttpSession session) {
        String nombreProyecto = (String) session.getAttribute(PROYECTO_ACTIVO);
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
}
