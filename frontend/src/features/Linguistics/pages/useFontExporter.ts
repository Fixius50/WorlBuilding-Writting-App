import { Font as OpentypeFont, Glyph as OpentypeGlyph, Path as OpentypePath } from 'opentype.js';
import { Word } from '@domain/database';

export const useFontExporter = (fontName: string) => {
  const exportFont = async (foundryGlyphs: Word[]) => {
    try {
      const font = new OpentypeFont({
        familyName: fontName,
        styleName: 'Regular',
        unitsPerEm: 1000,
        ascender: 800,
        descender: -200,
      });

      foundryGlyphs.forEach((g: Word) => {
        if (!g.svgPathData || !g.unicodeCode) return;
        const unicode = parseInt(g.unicodeCode.replace('U+', ''), 16);
        const path = new OpentypePath();
        const commands = g.svgPathData.match(/[a-df-z][^a-df-z]*/gi);
        if (commands) {
          commands.forEach((cmdStr: string) => {
            const type = cmdStr[0].toUpperCase();
            const args = cmdStr.slice(1).trim().split(/[\s,]+/).map(parseFloat);
            if (type === 'M') path.moveTo(args[0], args[1]);
            else if (type === 'L') path.lineTo(args[0], args[1]);
            else if (type === 'C') path.curveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
            else if (type === 'Q') path.quadraticCurveTo(args[0], args[1], args[2], args[3]);
            else if (type === 'Z') path.close();
          });
        }

        const glyph = new OpentypeGlyph({
          name: `glyph_${g.unicodeCode}`,
          unicode: unicode,
          advanceWidth: 800,
          path: path
        });
        font.glyphs.push(glyph);
      });

      const buffer = font.toArrayBuffer();
      const blob = new Blob([buffer], { type: 'font/ttf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fontName}.ttf`;
      a.click();
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      // [LOG REMOVED]
      throw err;
    }
  };

  return {
    exportFont
  };
};
