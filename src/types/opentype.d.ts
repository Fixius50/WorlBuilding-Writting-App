declare module 'opentype.js' {
    interface PathOptions {
        x?: number;
        y?: number;
        unitsPerEm?: number;
        ascender?: number;
        descender?: number;
    }

    class Path {
        constructor();
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void;
        quadraticCurveTo(x1: number, y1: number, x: number, y: number): void;
        close(): void;
        toPathData(decimalPlaces?: number): string;
        fill: string | null;
        stroke: string | null;
        strokeWidth: number;
    }

    class Glyph {
        constructor(options: {
            name: string;
            unicode?: number;
            unicodes?: number[];
            advanceWidth?: number;
            path?: Path;
        });
        path: Path;
        name: string;
        unicode: number;
        advanceWidth: number;
    }

    class Font {
        constructor(options: {
            familyName: string;
            styleName: string;
            unitsPerEm: number;
            ascender: number;
            descender: number;
            glyphs?: Glyph[];
        });
        glyphs: { push: (g: Glyph) => void; length: number };
        toArrayBuffer(): ArrayBuffer;
        download(fileName?: string): void;
    }

    const Font: typeof Font;
    const Glyph: typeof Glyph;
    const Path: typeof Path;

    export { Font, Glyph, Path };
    export default { Font, Glyph, Path };
}
