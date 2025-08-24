package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Esta clase lo que hace es mapear las páginas para cuando se estén cambiando entre estas en el proyecto
 */

@Controller
public class PagesController {

    // Página principal del proyecto
    @GetMapping("/")
    public String menuInicial() {
        return "redirect:/frontEnd/menuInicialLog.html";
    }
    // Página principal del proyecto
    @GetMapping("/ventanaProyectos")
    public String ventanaProyectos() {
        return "forward:frontEnd/html/ventanaProyectos.html";
    }
    // Página principal de la creación del proyecto
    @GetMapping("/ventanaCreacion")
    public String ventanaCreacion() {
        return "forward:frontEnd/html/ventanaCreacion.html";
    }
    // Página principal de los ajustes del proyecto
    @GetMapping("/ventanaAjustes")
    public String ventanaAjustes() {
        return "forward:frontEnd/html/ventanaAjustes.html";
    }
}