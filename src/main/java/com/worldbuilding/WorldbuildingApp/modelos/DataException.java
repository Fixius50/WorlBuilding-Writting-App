package com.worldbuilding.WorldbuildingApp.modelos;

/**
 * Excepción personalizada para manejar errores relacionados con datos en la aplicación
 */
public class DataException extends Exception {
    
    public DataException(String message) {
        super(message);
    }
    
    public DataException(String message, Throwable cause) {
        super(message, cause);
    }
} 