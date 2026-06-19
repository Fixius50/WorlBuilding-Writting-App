package com.worldbuilding.domains.linguistics.controller;

import com.worldbuilding.domains.linguistics.model.ConlangGlyph;
import com.worldbuilding.domains.linguistics.model.FontConfig;
import com.worldbuilding.domains.linguistics.service.FontCompilerService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/linguistics")
@CrossOrigin(origins = "*")
public class LinguisticsFontController {

    private final FontCompilerService fontCompilerService;

    public LinguisticsFontController(FontCompilerService fontCompilerService) {
        this.fontCompilerService = fontCompilerService;
    }

    @PostMapping("/font/compile")
    public ResponseEntity<Resource> compileConlangFont(@RequestBody Map<String, Object> payload) {
        ResponseEntity<Resource> response;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> configMap = (Map<String, Object>) payload.get("config");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> glyphsList = (List<Map<String, Object>>) payload.get("glyphs");

            FontConfig config = new FontConfig();
            boolean hasConfig = configMap != null;
            if (hasConfig) {
                config.setFontFamily((String) configMap.get("fontFamily"));
                config.setVersion((String) configMap.get("version"));
                config.setCopyright((String) configMap.get("copyright"));
                config.setUnitsPerEm(configMap.get("unitsPerEm") != null ? (int) configMap.get("unitsPerEm") : 1000);
                config.setAscender(configMap.get("ascender") != null ? (int) configMap.get("ascender") : 800);
                config.setDescender(configMap.get("descender") != null ? (int) configMap.get("descender") : -200);
            }

            List<ConlangGlyph> glyphs = new ArrayList<>();
            boolean hasGlyphs = glyphsList != null;
            if (hasGlyphs) {
                for (Map<String, Object> gMap : glyphsList) {
                    ConlangGlyph glyph = new ConlangGlyph();
                    glyph.setCharRepresented((String) gMap.get("charRepresented"));
                    glyph.setUnicodePoint((String) gMap.get("unicodePoint"));
                    glyph.setSvgPath((String) gMap.get("svgPath"));
                    glyph.setWidth(gMap.get("width") != null ? (int) gMap.get("width") : 1000);
                    glyph.setHeight(gMap.get("height") != null ? (int) gMap.get("height") : 1000);
                    glyphs.add(glyph);
                }
            }

            Path compiledFontPath = fontCompilerService.compileTrueTypeFont(config, glyphs);
            Resource resource = new UrlResource(compiledFontPath.toUri());

            boolean isResourceValid = resource.exists();
            if (isResourceValid) {
                MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
                response = ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                response = ResponseEntity.notFound().build();
            }

        } catch (MalformedURLException e) {
            response = ResponseEntity.badRequest().build();
        } catch (IOException e) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }
}
