# Script de Auto-Reinicio del Backend

## ¿Qué hace este script?

`start-with-autorestart.bat` es un script de Windows que inicia el servidor Spring Boot y lo reinicia automáticamente cuando se detiene mediante el botón "Reiniciar Backend" de la interfaz.

## ¿Cómo funciona?

1. Inicia el servidor con `mvnw.cmd spring-boot:run`
2. Cuando presionas el botón "Reiniciar Backend" en la app, el servidor:
   - Crea un archivo `restart.flag`
   - Se detiene
3. El script detecta el archivo `restart.flag` y reinicia automáticamente el servidor
4. El ciclo continúa hasta que cierres el script con `Ctrl+C`

## Uso

### Iniciar el servidor con auto-reinicio

```batch
.\start-with-autorestart.bat
```

### Detener el servidor

- Presiona `Ctrl+C` en la terminal donde está corriendo el script
- O simplemente cierra la ventana de la terminal

## Ventajas

- ✅ No necesitas ir a la terminal para reiniciar el servidor
- ✅ Útil cuando aplicas migraciones de base de datos
- ✅ El botón "Reiniciar Backend" de la interfaz funciona completamente

## Alternativa Manual

Si prefieres no usar el script de auto-reinicio, puedes seguir usando:

```batch
.\mvnw.cmd spring-boot:run
```

En este caso, el botón "Reiniciar Backend" detendrá el servidor, pero tendrás que reiniciarlo manualmente desde la terminal.
