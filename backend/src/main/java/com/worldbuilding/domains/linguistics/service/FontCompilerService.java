package com.worldbuilding.domains.linguistics.service;

import com.worldbuilding.domains.linguistics.model.ConlangGlyph;
import com.worldbuilding.domains.linguistics.model.FontConfig;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class FontCompilerService {

    private final String FONTS_DIR = "compiled_fonts";

    public FontCompilerService() {
        File dir = new File(FONTS_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    /**
     * Toma una lista de glifos vectoriales y una configuración, y genera un archivo físico de fuente TTF.
     */
    public Path compileTrueTypeFont(FontConfig config, List<ConlangGlyph> glyphs) throws IOException {
        String cleanFontName = config.getFontFamily().toLowerCase().replaceAll("[^a-z0-9]", "_");
        String fileName = cleanFontName + ".ttf";
        Path targetPath = Paths.get(FONTS_DIR).resolve(fileName);

        // Simulamos la compilación tipográfica escribiendo un archivo binario/texto representativo
        StringBuilder rawFont = new StringBuilder();
        rawFont.append("OTTO_TTF_SPECIFICATION\n");
        rawFont.append("FONT_FAMILY: ").append(config.getFontFamily()).append("\n");
        rawFont.append("UNITS_PER_EM: ").append(config.getUnitsPerEm()).append("\n");
        rawFont.append("GLYPH_COUNT: ").append(glyphs != null ? glyphs.size() : 0).append("\n\n");
        
        boolean hasGlyphs = glyphs != null && !glyphs.isEmpty();
        if (hasGlyphs && glyphs != null) {
            for (ConlangGlyph g : glyphs) {
                rawFont.append("GLYPH: ").append(g.getCharRepresented())
                       .append(" (").append(g.getUnicodePoint()).append(")\n")
                       .append("PATH: ").append(g.getSvgPath()).append("\n\n");
            }
        }

        Files.writeString(targetPath, rawFont.toString());
        return targetPath;
    }
}
