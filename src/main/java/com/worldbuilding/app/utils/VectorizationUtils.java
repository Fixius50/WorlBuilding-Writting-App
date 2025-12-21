package com.worldbuilding.app.utils;

import org.apache.batik.anim.dom.SAXSVGDocumentFactory;
import org.apache.batik.util.XMLResourceDescriptor;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

public class VectorizationUtils {

    /**
     * Converts a raster image file to an SVG path data string.
     * This is a simplified vectorizer using a basic thresholding and contour
     * tracing approach.
     * intended to simulate ImageTracer functionality.
     */
    public static String rasterToSVG(File imageFile) throws IOException {
        BufferedImage image = ImageIO.read(imageFile);
        if (image == null) {
            throw new IOException("Could not read image: " + imageFile.getAbsolutePath());
        }

        // 1. Thresholding (Convert to monochrome boolean map)
        boolean[][] booleanMap = thresholdImage(image);

        // 2. Trace Contours (Simplified Marching Squares / Edge following)
        String pathData = traceContours(booleanMap);

        return pathData;
    }

    private static boolean[][] thresholdImage(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();
        boolean[][] map = new boolean[width][height];

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = image.getRGB(x, y);
                // Simple luminosity
                int r = (pixel >> 16) & 0xFF;
                int g = (pixel >> 8) & 0xFF;
                int b = pixel & 0xFF;
                double luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                // Assume dark on light background. If dark (<128), it's part of the glyph
                // (true).
                map[x][y] = luma < 128;
            }
        }
        return map;
    }

    // A very naive tracer that creates a pixel-perfect path (M x y L x+1 y ...).
    // A real tracer would simplify this curve.
    private static String traceContours(boolean[][] map) {
        StringBuilder path = new StringBuilder();
        int width = map.length;
        int height = map[0].length;

        // Optimized: Trace rectangles for consecutive pixels
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (map[x][y]) {
                    // Start of a segment
                    path.append("M").append(x).append(" ").append(y).append(" ");
                    path.append("L").append(x + 1).append(" ").append(y).append(" ");
                    path.append("L").append(x + 1).append(" ").append(y + 1).append(" ");
                    path.append("L").append(x).append(" ").append(y + 1).append(" ");
                    path.append("Z ");
                }
            }
        }

        // Return a group if empty
        if (path.length() == 0)
            return "";

        return path.toString();
    }

    /**
     * Converts an SVG string to a Batik Document
     */
    public static Document createSVGDocument(String svgContent) throws IOException {
        String parser = XMLResourceDescriptor.getXMLParserClassName();
        SAXSVGDocumentFactory f = new SAXSVGDocumentFactory(parser);
        return f.createDocument(null, new StringReader(svgContent));
    }
}
