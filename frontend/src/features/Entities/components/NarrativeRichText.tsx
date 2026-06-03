import React, { useMemo } from "react";

interface NarrativeRichTextProps {
  content: string;
  galleryImages?: string[];
}

const sanitizeHtml = (rawHtml: string): string => {
  let cleanHtml = rawHtml;

  cleanHtml = cleanHtml.replace(
    /<(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\/\1>/gi,
    "",
  );
  cleanHtml = cleanHtml.replace(/\son\w+\s*=\s*"[^"]*"/gi, "");
  cleanHtml = cleanHtml.replace(/\son\w+\s*=\s*'[^']*'/gi, "");
  cleanHtml = cleanHtml.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
  cleanHtml = cleanHtml.replace(
    /\s(href|src)\s*=\s*"\s*javascript:[^"]*"/gi,
    "",
  );
  cleanHtml = cleanHtml.replace(
    /\s(href|src)\s*=\s*'\s*javascript:[^']*'/gi,
    "",
  );

  return cleanHtml;
};

const escapeHtml = (plainText: string): string => {
  return plainText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const renderPlainTextFormatting = (plainText: string): string => {
  let html = escapeHtml(plainText);

  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

  html = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
  html = html.replace(/\n/g, "<br />");

  return html;
};

const extractImages = (text: string, galleryImages?: string[]): { processedText: string; images: string[] } => {
  const images: string[] = [];
  let processedText = text;
  let index = 0;

  while (processedText.indexOf("![", index) !== -1) {
    const startIdx = processedText.indexOf("![", index);
    const closeBracket = processedText.indexOf("]", startIdx + 2);
    const hasCloseBracket = closeBracket !== -1;
    
    const nextIndex = hasCloseBracket && processedText[closeBracket + 1] === "("
      ? (() => {
          const closeParen = processedText.indexOf(")", closeBracket + 2);
          const hasCloseParen = closeParen !== -1;
          
          return hasCloseParen
            ? (() => {
                const alt = processedText.substring(startIdx + 2, closeBracket);
                let url = processedText.substring(closeBracket + 2, closeParen);
                
                // Resolver referencia de galería: gallery:index
                const isGalleryRef = url.startsWith("gallery:");
                url = isGalleryRef && galleryImages
                  ? (() => {
                      const imgIdx = parseInt(url.split(":")[1], 10);
                      const resolvedUrl = galleryImages[imgIdx];
                      return resolvedUrl || url;
                    })()
                  : url;

                const placeholder = `MKDIMGPLH${images.length}`;
                const imgHtml = `<img src="${url}" alt="${alt}" class="float-left mr-6 mb-4 max-w-[45%] md:max-w-[35%] h-auto rounded border border-foreground/10 my-2 shadow-lg" />`;
                images.push(imgHtml);
                processedText = processedText.substring(0, startIdx) + placeholder + processedText.substring(closeParen + 1);
                return startIdx + placeholder.length;
              })()
            : closeBracket + 2;
        })()
      : startIdx + 2;
      
    index = nextIndex;
  }

  const result = { processedText, images };
  return result;
};

const restoreImages = (text: string, images: string[]): string => {
  let restored = text;
  images.forEach((imgHtml, i) => {
    restored = restored.replace(`MKDIMGPLH${i}`, imgHtml);
  });
  return restored;
};

const NarrativeRichText: React.FC<NarrativeRichTextProps> = ({ content, galleryImages }) => {
  const normalizedContent = (content || "").trim();

  const renderedContent = useMemo(() => {
    const { processedText, images } = extractImages(normalizedContent, galleryImages);
    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(processedText);

    const baseHtml = hasHtml
      ? sanitizeHtml(processedText)
      : renderPlainTextFormatting(processedText);

    let finalHtml = baseHtml;

    // Renderizar enlaces Markdown: [texto](url)
    finalHtml = finalHtml.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>',
    );

    const output = restoreImages(finalHtml, images);
    return output;
  }, [normalizedContent, galleryImages]);

  switch (normalizedContent.length > 0) {
    case true:
      return (
        <div
          className="prose prose-invert max-w-none flow-root text-lg text-foreground/80 leading-relaxed font-light [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_strong]:font-black [&_em]:italic"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      );
    default:
      return (
        <div className="text-lg text-foreground/60 leading-relaxed font-light italic">
          Sin descripcion.
        </div>
      );
  }
};

export default NarrativeRichText;
