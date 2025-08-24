package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Esta clase lo que hace es mapear las páginas para cuando se estén cambiando entre estas en el proyecto
 */

@Controller
public class PagesController {

    @GetMapping("/")
    public String menuInicial() {
        return "forward:/html/menuInicialLog.html";
    }

    @GetMapping("/ventanaProyectos")
    public String ventanaProyectos() {
        return "forward:/html/ventanaProyectos.html";
    }

    @GetMapping("/ventanaCreacion")
    public String ventanaCreacion() {
        return "forward:/html/ventanaCreacion.html";
    }

    @GetMapping("/ventanaAjustes")
    public String ventanaAjustes() {
        return "forward:/html/ventanaAjustes.html";
    }
}
