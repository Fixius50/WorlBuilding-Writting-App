package com.worldbuilding;

import java.io.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * La clase SQLiteConnector gestiona la conexión y las operaciones con la base de datos del proyecto "actual".
 * Cada proyecto tiene su propia base de datos (proyecto.db), copiada de una plantilla general (worldbuilding.db) 
 * que se usa como plantilla y para posibles funciones generales si se requiere.
 *
 * La base de datos general se almacena en data junto a las carpetas que contienen dentro sus bases de datos propias.
 */
public class SQLiteConnector {
    
    private File rutaBaseDeDatosProyecto;
    private String nombreProyecto;
    private String tipoProyecto;

    public File getRutaBaseDeDatosProyecto() {return rutaBaseDeDatosProyecto;}

    public void setRutaBaseDeDatosProyecto(File rutaBaseDeDatosProyecto) {this.rutaBaseDeDatosProyecto = rutaBaseDeDatosProyecto;}

    public String getNombreProyecto() {return nombreProyecto;}

    public void setNombreProyecto(String nombreProyecto) {this.nombreProyecto = nombreProyecto;}

    public String getTipoProyecto() {return tipoProyecto;}

    public void setTipoProyecto(String tipoProyecto) {this.tipoProyecto = tipoProyecto;}

    public SQLiteConnector(String nombreProyecto, String tipoProyecto, File rutaBaseDeDatosProyecto){
        this.nombreProyecto = nombreProyecto;
        this.tipoProyecto = tipoProyecto;
        this.rutaBaseDeDatosProyecto = rutaBaseDeDatosProyecto;
    }

    public String rutaDBGeneral = "src/main/data/worldbuilding.db";
    public String rutaGlobal = "jdbc:sqlite:" + rutaDBGeneral;

    // Columnas esperadas por cada tabla, para mantener orden y seguridad
    private static final Map<String, List<String>> columnasPorTabla = Map.of(
        "CONSTRUCCION", List.of("Nombre", "Apellidos", "Descripcion", "Tamaño", "Tipo", "ExtensionDeOtra"),
        "EFECTOS", List.of("Nombre", "Apellidos", "Descripcion", "Origen", "Dureza", "Comportamiento"),
        "ENTIDADINDIVIDUAL", List.of("Nombre", "Apellidos", "Descripcion", "Estado", "Tipo", "Origen", "Comportamiento"),
        "ENTIDADCOLECTIVA", List.of("Nombre", "Apellidos", "Descripcion", "Estado", "Tipo", "Origen", "Comportamiento"),
        "RELACION", List.of("Nombre", "Apellidos", "Descripcion", "Direccion", "TipoDeDireccion", "NumeroDeAfectados")
    );

    //Métodos generales para la manipulación de los datos
    /**
     * @see insertarDatosDB(): inserta los datos en la base de datos del proyecto.
     * @param queInserto --> dice en qué tabla va a meter los datos (CONSTRUCCION, EFECTOS...)
     * @param valores --> son los valores de cada uno de los datos de su propia tabla; este array será distinto 
     * según las tablas donde se vaya a insertar.
     */
    public void insertarDatosDB(String queInserto, Map<String, String> valores) {
        // Establecemos la conexión
        try (Connection conn = DriverManager.getConnection(rutaDBGeneral)) {
            Statement stmt = conn.createStatement();

            stmt.execute("ATTACH DATABASE '" + rutaGlobal + "' AS global");

            List<String> columnas = columnasPorTabla.get(queInserto.toUpperCase());
            if (columnas == null) {
                throw new SQLException();
            }

            String tabla = queInserto;
            StringBuilder columnasSQL = new StringBuilder("(");
            StringBuilder placeholders = new StringBuilder("(");

            for (int i = 0; i < columnas.size(); i++) {
                columnasSQL.append(columnas.get(i));
                placeholders.append("?");
                if (i < columnas.size() - 1) {
                    columnasSQL.append(", ");
                    placeholders.append(", ");
                }
            }
            columnasSQL.append(")");
            placeholders.append(")");

            String query = "INSERT INTO " + tabla + " " + columnasSQL + " VALUES " + placeholders;

            try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                for (int i = 0; i < columnas.size(); i++) {
                    pstmt.setString(i + 1, valores.getOrDefault(columnas.get(i), null));
                }
                pstmt.executeUpdate();
            }

            stmt.execute("DETACH DATABASE global");
        } catch (SQLException e) {
            System.out.println("Error al insertar datos: " + e.getMessage());
        }
    }


    /**
     * @see eliminarDatosDB(): elimina los datos en la base de datos del proyecto.
     * @param queElimino --> dice en qué tabla va a eliminar los datos.
     * @param condiciones --> son los filtros que indican el qué se eliminará.
     */
    public void eliminarDatosDB(String queElimino, Map<String, String> condiciones) {
        // Establecemos la conexion
        try (Connection conn = DriverManager.getConnection(rutaDBGeneral)) {

            if (condiciones == null || condiciones.isEmpty()) {
                throw new SQLException("Se requieren condiciones para eliminar datos.");
            }

            StringBuilder whereClause = new StringBuilder(" WHERE ");
            int i = 0;
            for (String col : condiciones.keySet()) {
                whereClause.append(col).append(" = ?");
                if (++i < condiciones.size()) whereClause.append(" AND ");
            }

            String query = "DELETE FROM " + queElimino + whereClause;

            try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                int index = 1;
                for (String val : condiciones.values()) {
                    pstmt.setString(index++, val);
                }
                pstmt.executeUpdate();
            }

        } catch (SQLException e) {
            System.out.println("Error al eliminar datos: " + e.getMessage());
        }
    }

    /**
     * @see recogerDatosDB(): recoge los datos de la base de datos.
     * @param queRecojo --> dice en qué tabla va a recoger los datos.
     * @param filtros --> son los filtros que indican el qué se eliminará.
     * @return
     */
    public String recogerDatosDB(String queRecojo, Map<String, String> filtros) {
        StringBuilder datos = new StringBuilder();
        // Establecemos la conexion
        try (Connection conn = DriverManager.getConnection(rutaDBGeneral)) {

            // Verificamos que la tabla tenga un nombre válido para evitar SQL injection
            Set<String> tablasPermitidas = Set.of(
                "Construccion", "Efectos", "EntidadIndividual", "EntidadColectiva", "Relacion"
            );
            if (!tablasPermitidas.contains(queRecojo)) {
                throw new SQLException();
            }

            // Construir la consulta SQL
            StringBuilder query = new StringBuilder("SELECT * FROM " + queRecojo);
            List<String> condiciones = new ArrayList<>();

            if (filtros != null && !filtros.isEmpty()) {
                for (String columna : filtros.keySet()) {
                    condiciones.add(columna + " = ?");
                }
                query.append(" WHERE ").append(String.join(" AND ", condiciones));
            }

            PreparedStatement pstmt = conn.prepareStatement(query.toString());

            // Establecer los parámetros del filtro
            if (filtros != null && !filtros.isEmpty()) {
                int index = 1;
                for (String valor : filtros.values()) {
                    pstmt.setString(index++, valor);
                }
            }

            ResultSet rs = pstmt.executeQuery();
            ResultSetMetaData meta = rs.getMetaData();
            int columnas = meta.getColumnCount();

            while (rs.next()) {
                for (int i = 1; i <= columnas; i++) {
                    datos.append(meta.getColumnName(i)).append(": ").append(rs.getString(i));
                    if (i < columnas) datos.append(" | ");
                }
                datos.append("\n");
            }

        } catch (SQLException e) {
            System.out.println("Error al recoger datos: " + e.getMessage());
        }

        return datos.toString();
    }
}
/*
    SQLiteConnector db = new SQLiteConnector(); --> Constructor
   
    <-- INSERTAR DATOS -->
    Map<String, String> datosConstruccion = new HashMap<>();
    datosConstruccion.put("Nombre", "Castillo Negro");
    datosConstruccion.put("Apellidos", "del Norte");
    datosConstruccion.put("Descripcion", "Fortaleza en la muralla");
    datosConstruccion.put("Tamaño", "Grande");
    datosConstruccion.put("Tipo", "Defensiva");
    datosConstruccion.put("ExtensionDeOtra", "Muralla");

    db.insertarDatosDB("CONSTRUCCION", datosConstruccion);

    <-- ELIMINAR DATOS -->
    Map<String, String> condiciones = new HashMap<>();
    condiciones.put("Nombre", "Castillo Negro");

    db.eliminarDatosDB("CONSTRUCCION", condiciones);

    <-- RECOGER DATOS (SIN FILTROS) -->
    String resultados = db.recogerDatosDB("CONSTRUCCION", null);
    System.out.println("Todos los datos:\n" + resultados);

    <-- RECOGER DATOS (CON FILTROS) -->
    Map<String, String> filtros = new HashMap<>();
    filtros.put("Nombre", "Castillo Negro");

    String resultadoFiltrado = db.recogerDatosDB("CONSTRUCCION", filtros);
    System.out.println("Datos filtrados:\n" + resultadoFiltrado);
 */