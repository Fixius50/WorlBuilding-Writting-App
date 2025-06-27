package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PagesController {

    private final String carpeta = "/html";
    // Página principal que redirige a menuInicialLog.html
    @GetMapping("/")
    public String menuInicial() {
        return "redirect:/menuInicialLog.html";
    }

    @GetMapping(carpeta + "/ventanaProyectos")
    public String ventanaProyectos() {
        return "html/ventanaProyectos.html";
    }

    @GetMapping(carpeta + "/ventanaCreacion")
    public String ventanaCreacion() {
        return "html/ventanaCreacion.html";
    }

    @GetMapping(carpeta + "/ventanaAjustes")
    public String ventanaAjustes() {
        return "html/ventanaAjustes.html";
    }
}