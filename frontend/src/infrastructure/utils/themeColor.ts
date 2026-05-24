const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const parsePrimaryHsl = (): [number, number, number] => {
  if (typeof window === "undefined") {
    return [0, 0, 0];
  }

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();

  const tokens = raw.split(/\s+/);
  if (tokens.length < 3) {
    return [0, 0, 0];
  }

  const h = Number.parseFloat(tokens[0]);
  const s = Number.parseFloat(tokens[1].replace("%", ""));
  const l = Number.parseFloat(tokens[2].replace("%", ""));

  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) {
    return [0, 0, 0];
  }

  return [h, s, l];
};

const hslToRgb = (
  h: number,
  s: number,
  l: number,
): [number, number, number] => {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const lig = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  switch (true) {
    case hue < 60:
      rPrime = c;
      gPrime = x;
      bPrime = 0;
      break;
    case hue < 120:
      rPrime = x;
      gPrime = c;
      bPrime = 0;
      break;
    case hue < 180:
      rPrime = 0;
      gPrime = c;
      bPrime = x;
      break;
    case hue < 240:
      rPrime = 0;
      gPrime = x;
      bPrime = c;
      break;
    case hue < 300:
      rPrime = x;
      gPrime = 0;
      bPrime = c;
      break;
    default:
      rPrime = c;
      gPrime = 0;
      bPrime = x;
      break;
  }

  return [
    Math.round((rPrime + m) * 255),
    Math.round((gPrime + m) * 255),
    Math.round((bPrime + m) * 255),
  ];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const parts = [r, g, b].map((value) => {
    const safe = clamp(Math.round(value), 0, 255);
    return safe.toString(16).padStart(2, "0");
  });
  return `#${parts.join("")}`;
};

export const getThemePrimaryRgb = (): [number, number, number] => {
  const [h, s, l] = parsePrimaryHsl();
  return hslToRgb(h, s, l);
};

export const getThemePrimaryHex = (): string => {
  const [r, g, b] = getThemePrimaryRgb();
  return rgbToHex(r, g, b);
};
