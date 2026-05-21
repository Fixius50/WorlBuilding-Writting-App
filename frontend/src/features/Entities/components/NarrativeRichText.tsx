import React, { useMemo } from "react";

interface NarrativeRichTextProps {
  content: string;
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

const NarrativeRichText: React.FC<NarrativeRichTextProps> = ({ content }) => {
  const normalizedContent = (content || "").trim();

  const renderedContent = useMemo(() => {
    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(normalizedContent);

    switch (hasHtml) {
      case true:
        return sanitizeHtml(normalizedContent);
      default:
        return renderPlainTextFormatting(normalizedContent);
    }
  }, [normalizedContent]);

  switch (normalizedContent.length > 0) {
    case true:
      return (
        <div
          className="prose prose-invert max-w-none text-lg text-foreground/80 leading-relaxed font-light [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_strong]:font-black [&_em]:italic"
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
