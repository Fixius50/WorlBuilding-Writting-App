Este documento explica la estrategia de distribución para el stack híbrido **Vite (Frontend)** + **Spring Boot (Helper)**.

## 1. Naturaleza del Paquete

La aplicación **World Bible** no es un ejecutable monolítico simple, sino una **Web App de Escritorio Local-First** que consta de:

1.  **Vite App (UI):** Accedida vía navegador o WebView local.
2.  **Servidor Auxiliar (Java):** Un binario `.jar` que corre en segundo plano para gestionar archivos del sistema.

## 2. Proceso de "Build"

### Frontend (React + Vite)
```powershell
npm run build
```
Esto genera la carpeta `dist/` optimizada.

### Backend Auxiliar (Java/Maven)
```powershell
mvn clean package
```
Esto genera `server-aux/target/server-aux.jar`.

## 3. Estrategia de Lanzamiento (Run-App)

Actualmente, la distribución se realiza mediante el script `run-app.bat` que orquesta ambos servicios:

1. Levanta el servidor Java en un puerto local.
2. Lanza el servidor de desarrollo/producción de Vite.
3. Abre el navegador predeterminado en la dirección local.

*(Futuro)* Se implementará un empaquetador jPackage/Electron para encapsular ambos procesos en un único `.exe` instalable.

## 3. Resultado Final

Al finalizar, la carpeta `dist` alojará:

- **Ejecutable**: `Chronos Atlas Setup.exe` (Instalador estándar).
- O una carpeta `win-unpacked` si se define para empaquetado portable.

## 4.- **Local-First (SQLocal):** Los datos se almacenan en la tabla `entidades` de SQLite local a través de `entityService`. Cero latencia de red.
- **Estructura JSON:** Las propiedades visuales de los glifos (`svgPathData`, `layers`) se encapsulan en el campo `contenido_json` de la entidad tipo `Word`.
- **Exportación:** Capacidad de descargar la fuente compilada (`.ttf`) directamente desde el navegador o usar el **Servidor Auxiliar** para salvarla en el disco duro físico del usuario.

## 4. Distribución

Simplemente entrega el archivo `.exe`.
El usuario ya no necesitará instalar Java ni abrir una consola CMD. Al hacer doble clic sobre el ejecutable transiluminado, se abrirá la interfaz gráfica `Chronos Atlas` de forma 100% nativa.
