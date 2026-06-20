package com.worldbuilding.core.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;
import java.util.Map;

@RestController
@RequestMapping("/editor")
@CrossOrigin(origins = "*")
public class EditorExportController {

    @PostMapping("/export-pdf")
    public ResponseEntity<byte[]> exportToPdf(@RequestBody Map<String, String> payload) {
        String htmlContent = payload.get("html");
        String title = payload.get("title");
        ResponseEntity<byte[]> response;

        if (htmlContent == null || htmlContent.trim().isEmpty()) {
            response = ResponseEntity.badRequest().build();
        } else {
            try {
                // 1. Limpiar e higienizar el HTML a XHTML bien formado usando jsoup
                org.jsoup.nodes.Document doc = org.jsoup.Jsoup.parse(htmlContent);
                doc.outputSettings().syntax(org.jsoup.nodes.Document.OutputSettings.Syntax.xml);
                String xhtmlContent = doc.html();

                // 2. Generar el PDF usando Flying Saucer
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                org.xhtmlrenderer.pdf.ITextRenderer renderer = new org.xhtmlrenderer.pdf.ITextRenderer();
                renderer.setDocumentFromString(xhtmlContent);
                renderer.layout();
                renderer.createPDF(outputStream);
                renderer.finishPDF();

                byte[] pdfBytes = outputStream.toByteArray();

                // 3. Devolver el archivo PDF como descarga
                String filename = (title != null && !title.trim().isEmpty() ? title.replaceAll("[\\\\/:*?\"<>|]", "_") : "documento") + ".pdf";

                response = ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .contentLength(pdfBytes.length)
                        .body(pdfBytes);

            } catch (Exception e) {
                response = ResponseEntity.internalServerError().build();
            }
        }
        return response;
    }
}
