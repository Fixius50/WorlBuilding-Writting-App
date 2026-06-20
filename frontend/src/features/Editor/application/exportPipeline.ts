import { Editor } from "@tiptap/react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import JSZip from "jszip";

export type ExportFormat = "pdf" | "html" | "txt" | "md" | "docx" | "epub";

interface ExportContext {
  editor: Editor;
  title: string;
}

const buildHtmlDocument = (context: ExportContext): string => {
  const htmlBody = context.editor.getHTML();
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&amp;family=Outfit:wght@100..900&amp;display=swap" rel="stylesheet" />
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: 'Cormorant Garamond', serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
            margin: 0;
            padding: 0;
          }
          h1 {
            font-size: 32px;
            font-family: 'Outfit', sans-serif;
            font-weight: bold;
            margin-bottom: 2rem;
          }
          p {
            margin-bottom: 0.3em;
            text-align: justify;
          }
          .mention {
            font-weight: bold;
            color: #000000;
            text-decoration: none;
          }
          img {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 1.5rem auto;
          }
        </style>
      </head>
      <body>
        <h1>${context.title || "Documento"}</h1>
        <div>${htmlBody}</div>
      </body>
    </html>
  `;
};

const htmlToMarkdown = (htmlContent: string): string => {
  return htmlContent
    .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<li>(.*?)<\/li>/gi, "* $1\n")
    .replace(/<ul>(.*?)<\/ul>/gi, "$1\n")
    .replace(/<ol>(.*?)<\/ol>/gi, "$1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
};

const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const exportPdf = async (
  context: ExportContext,
  onFallbackPrint: () => void,
): Promise<void> => {
  const response = await fetch("/api/editor/export-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html: buildHtmlDocument(context),
      title: context.title,
    }),
  });

  if (!response.ok) {
    onFallbackPrint();
    return;
  }

  const blob = await response.blob();
  downloadBlob(blob, `${context.title || "documento"}.pdf`);
};

const exportHtml = (context: ExportContext): void => {
  const blob = new Blob([context.editor.getHTML()], {
    type: "text/html;charset=utf-8",
  });
  downloadBlob(blob, `${context.title || "documento"}.html`);
};

const exportTxt = (context: ExportContext): void => {
  const blob = new Blob([context.editor.getText()], {
    type: "text/plain;charset=utf-8",
  });
  downloadBlob(blob, `${context.title || "documento"}.txt`);
};

const exportMd = (context: ExportContext): void => {
  const markdown = htmlToMarkdown(context.editor.getHTML());
  const blob = new Blob([markdown], {
    type: "text/markdown;charset=utf-8",
  });
  downloadBlob(blob, `${context.title || "documento"}.md`);
};

const exportDocx = async (context: ExportContext): Promise<void> => {
  const plainText = context.editor.getText();
  const paragraphs = plainText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => {
      const isTitle = index === 0;
      return new Paragraph({
        heading: isTitle ? HeadingLevel.HEADING_1 : undefined,
        children: [new TextRun(line)],
      });
    });

  const doc = new Document({
    sections: [
      {
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph(" ")],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${context.title || "documento"}.docx`);
};

const exportEpub = async (context: ExportContext): Promise<void> => {
  const htmlBody = context.editor.getHTML();
  const title = context.title || "Documento";
  const zip = new JSZip();

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  );

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${title}</dc:title>
    <dc:creator>Worldbuilding App</dc:creator>
    <dc:language>es</dc:language>
    <dc:identifier id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="chapter1"/>
  </spine>
</package>`,
  );

  zip.file(
    "OEBPS/toc.ncx",
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${crypto.randomUUID()}"/>
  </head>
  <docTitle><text>${title}</text></docTitle>
  <navMap>
    <navPoint id="navpoint-1" playOrder="1">
      <navLabel><text>${title}</text></navLabel>
      <content src="chapter1.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`,
  );

  zip.file(
    "OEBPS/chapter1.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es" lang="es">
  <head><title>${title}</title></head>
  <body>
    <h1>${title}</h1>
    ${htmlBody}
  </body>
</html>`,
  );

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
  });
  downloadBlob(blob, `${title}.epub`);
};

export const runExportPipeline = async (
  format: ExportFormat,
  context: ExportContext,
  onFallbackPrint: () => void,
): Promise<void> => {
  switch (format) {
    case "pdf":
      await exportPdf(context, onFallbackPrint);
      break;
    case "html":
      exportHtml(context);
      break;
    case "txt":
      exportTxt(context);
      break;
    case "md":
      exportMd(context);
      break;
    case "docx":
      await exportDocx(context);
      break;
    case "epub":
      await exportEpub(context);
      break;
    default:
      onFallbackPrint();
      break;
  }
};
