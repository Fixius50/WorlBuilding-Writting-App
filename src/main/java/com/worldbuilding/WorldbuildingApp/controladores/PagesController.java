package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Esta clase lo que hace es mapear las páginas para cuando se estén cambiando entre estas en el proyecto
 */

@Controller
public class PagesController {

    private final String carpeta = "/html";
    // Página principal del proyecto
    @GetMapping("/")
    public String menuInicial() {
        return "redirect:/menuInicialLog.html";
    }
    // Página principal del proyecto
    @GetMapping(carpeta + "/ventanaProyectos")
    public String ventanaProyectos() {
        return "html/ventanaProyectos.html";
    }
    // Página principal de la creación del proyecto
    @GetMapping(carpeta + "/ventanaCreacion")
    public String ventanaCreacion() {
        return "html/ventanaCreacion.html";
    }
    // Página principal de los ajustes del proyecto
    @GetMapping(carpeta + "/ventanaAjustes")
    public String ventanaAjustes() {
        return "html/ventanaAjustes.html";
    }
}