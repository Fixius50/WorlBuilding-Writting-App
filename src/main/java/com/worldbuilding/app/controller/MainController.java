package com.worldbuilding.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.worldbuilding.app.repository.CuadernoRepository cuadernoRepository;

    @org.springframework.web.bind.annotation.ResponseBody
    @GetMapping("/api/debug/inspect")
    public java.util.Map<String, Object> inspect(jakarta.servlet.http.HttpSession session) {
        String tenant = com.worldbuilding.app.config.TenantContext.getCurrentTenant();
        String sessionProject = (String) session.getAttribute("proyectoActivo");

        java.util.List<com.worldbuilding.app.model.Cuaderno> all = cuadernoRepository.findAll();

        return java.util.Map.of(
                "tenant", tenant != null ? tenant : "NULL",
                "sessionProject", sessionProject != null ? sessionProject : "NULL",
                "count", all.size(),
                "items", all.stream().map(c -> c != null ? c.getNombreProyecto() : "NULL_ITEM").toList());
    }

    @GetMapping(value = { "/", "/{path:[^\\.]*}" })
    public String index() {
        return "forward:/index.html";
    }
}
