package com.worldbuilding.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller to support Client-Side Routing (SPA).
 * Forwards any unmapped paths (that don't look like static files) to
 * index.html.
 * This allows React Router to handle the URL.
 */
@Controller
public class SpaController {

    // Matches any path that does NOT have a dot in it (so not .js, .css, .png)
    // and is NOT starting with /api
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        return "forward:/index.html";
    }

    // Capture nested paths like /project/5
    @RequestMapping(value = "/**/{path:[^\\.]*}")
    public String redirectNested() {
        return "forward:/index.html";
    }
}
