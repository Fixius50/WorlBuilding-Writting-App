package com.worldbuilding.WorldbuildingApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorldbuildingAppApplication {
	/**
	 * Primero arrancar XAMPP e iniciar MySQL
	 * Luego: ejecutar la app y poner en el navegador http://localhost:8080 y de seguido la ruta relativa.
	 */
	public static void main(String[] args) {
		SpringApplication.run(WorldbuildingAppApplication.class, args);
	}
}