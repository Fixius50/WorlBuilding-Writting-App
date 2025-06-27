import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private final String DATA_FOLDER = "src/main/resources/static/data";

    @PostMapping
    public ResponseEntity<?> crearProyecto(@RequestBody ProyectoRequest proyectoRequest) {
        try {
            String nombre = proyectoRequest.getNombre();
            Path proyectoDir = Paths.get(DATA_FOLDER, nombre);

            if (Files.exists(proyectoDir)) {
                return ResponseEntity.badRequest().body("El proyecto ya existe");
            }

            Files.createDirectories(proyectoDir);

            // Crear archivo SQL vacío
            Path archivoSQL = proyectoDir.resolve(nombre + ".sql");
            Files.createFile(archivoSQL);

            return ResponseEntity.ok(proyectoRequest);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creando proyecto");
        }
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre) {
        Path proyectoDir = Paths.get(DATA_FOLDER, nombre);
        if (Files.exists(proyectoDir) && Files.isDirectory(proyectoDir)) {
            // Aquí devolveríamos info, o simplemente confirmamos que existe
            return ResponseEntity.ok().body(new ProyectoResponse(nombre));
        } else {
            return ResponseEntity.status(404).body("Proyecto no encontrado");
        }
    }
}

class ProyectoRequest {
    private String nombre;
    private String enfoque;

    // Getters y setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEnfoque() { return enfoque; }
    public void setEnfoque(String enfoque) { this.enfoque = enfoque; }
}

class ProyectoResponse {
    private String nombre;

    public ProyectoResponse(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }
}