package com.worldbuilding;

import java.io.*;
import java.sql.*;
import java.util.HashSet;
import java.util.List;
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

    //Métodos generales para la manipulación de los datos
    /**
     * @see insertarDatosDB(): inserta los datos en la base de datos del proyecto.
     * @param queInserto dice en qué tabla va a meter los datos (CONSTRUCCION, EFECTOS...)
     * @param valores son los valores de cada uno de los datos de su propia tabla; este array será distinto 
     * según las tablas donde se vaya a insertar.
     */
    public void insertarDatosDB(String queInserto, String[] valores) {
        try (Connection conn = DriverManager.getConnection(rutaDBGeneral)) {
            Statement stmt = conn.createStatement();

            // Adjuntar la base de datos del proyecto como 'global'
            stmt.execute("ATTACH DATABASE '" + rutaGlobal + "' AS global");

            String tabla = "";
            String columnas = "";
            switch (queInserto.toUpperCase()) {
                case "CONSTRUCCION":
                    tabla = "Construccion";
                    columnas = "(Nombre, Apellidos, Descripcion, Tamaño, Tipo, ExtensionDeOtra)";
                break;
                case "EFECTOS":
                    tabla = "Efectos";
                    columnas = "(Nombre, Apellidos, Descripcion, Origen, Dureza, Comportamiento)";
                break;
                case "ENTIDADINDIVIDUAL":
                    tabla = "EntidadIndividual";
                    columnas = "(Nombre, Apellidos, Descripcion, Estado, Tipo, Origen, Comportamiento)";
                break;
                case "ENTIDADCOLECTIVA":
                    tabla = "EntidadColectiva";
                    columnas = "(Nombre, Apellidos, Descripcion, Estado, Tipo, Origen, Comportamiento)";
                break;
                case "RELACION":
                    tabla = "Relacion";
                    columnas = "(Nombre, Apellidos, Descripcion, Direccion, TipoDeDireccion, NumeroDeAfectados)";
                break;
                default:
                    System.out.println("Tipo de inserción no reconocido");
                return;
            }

            // Construir las insercciones evitando las inyecciones SQL
            StringBuilder placeholdersBuilder = new StringBuilder();
            for (int i = 0; i < valores.length; i++) {
                placeholdersBuilder.append("?");
                if (i < valores.length - 1) {
                    placeholdersBuilder.append(", ");
                }
            }
            String placeholders = placeholdersBuilder.toString();
            String query = "INSERT INTO " + tabla + " " + columnas + " VALUES (" + placeholders + ")";

            try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                for (int i = 0; i < valores.length; i++) {
                    pstmt.setString(i + 1, valores[i]);
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
     * @param queElimino
     * @param columnas
     * @param valores
     */
    public void eliminarDatosDB(String queElimino, String[] columnas, String[] valores) {
        if (columnas.length != valores.length) {
            throw new IllegalArgumentException("Las columnas y los valores deben tener la misma longitud");
        }

        try (Connection conn = DriverManager.getConnection(rutaDBGeneral)) {

            // Crear cláusula WHERE dinámica
            StringBuilder whereClause = new StringBuilder(" WHERE ");
            for (int i = 0; i < columnas.length; i++) {
                whereClause.append(columnas[i]).append(" = ?");
                if (i < columnas.length - 1) {
                    whereClause.append(" AND ");
                }
            }

            String query = "DELETE FROM " + queElimino + whereClause.toString();

            PreparedStatement pstmt = conn.prepareStatement(query);
            for (int i = 0; i < valores.length; i++) {
                pstmt.setString(i + 1, valores[i]);
            }

            pstmt.executeUpdate();

        } catch (SQLException e) {
            System.out.println("Error al eliminar datos: " + e.getMessage());
        }
    }

    public String recogerDatosDB(String queRecojo){
        String datos = "";
        try (Connection conn = DriverManager.getConnection(rutaDBGeneral)) {
            
        } catch (SQLException e) {
            System.out.println("Error en " + e.getMessage());
        }
        return datos;
    }
}