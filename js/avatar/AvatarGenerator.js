/**
 * Deterministic pixel-art portraits for Piel de Cloro.
 * Pure presentation code: never reads or mutates game state.
 */
const PALETTES = [
  { skin: "#b9a18b", shadow: "#75645d", hair: "#24252b", eye: "#d8d8c8", accent: "#7eaaa1", background: "#172022", shirt: "#3e5557" },
  { skin: "#d0b59a", shadow: "#806c65", hair: "#3b2927", eye: "#d6e5d4", accent: "#b8a15c", background: "#202126", shirt: "#6c4b45" },
  { skin: "#8d796e", shadow: "#51484b", hair: "#17191e", eye: "#d7d2bd", accent: "#a44f4f", background: "#191b20", shirt: "#424957" },
  { skin: "#c2a58b", shadow: "#786357", hair: "#b4a17e", eye: "#d7e7e1", accent: "#7097b5", background: "#1b2228", shirt: "#3d596f" },
  { skin: "#a98e7e", shadow: "#66534f", hair: "#4b4b46", eye: "#e0d7c5", accent: "#9b665f", background: "#242022", shirt: "#55534b" }
];

const HAIR = {
  bald: { rear: [], top: [] },
  short: { rear: [], top: [[8, 3, 8, 2], [7, 4, 10, 2], [7, 6, 2, 2], [15, 6, 2, 1]] },
  shaved: { rear: [], top: [[8, 4, 8, 1], [7, 5, 10, 1]] },
  long: { rear: [[6, 7, 2, 9], [16, 7, 2, 9]], top: [[8, 3, 8, 2], [7, 4, 10, 2], [7, 6, 10, 1]] },
  bob: { rear: [[6, 7, 2, 7], [16, 7, 2, 7]], top: [[8, 3, 8, 2], [7, 4, 10, 2], [7, 6, 10, 2]] },
  ponytail: { rear: [[17, 7, 3, 3], [19, 10, 2, 4], [18, 13, 2, 3]], top: [[8, 3, 8, 2], [7, 4, 10, 2], [7, 6, 9, 1], [7, 7, 2, 3]] },
  bun: { rear: [[16, 7, 2, 7]], top: [[10, 1, 4, 2], [9, 2, 6, 2], [8, 3, 8, 2], [7, 4, 10, 2], [7, 6, 10, 1]] },
  wild: { rear: [[6, 8, 2, 6], [16, 8, 2, 7]], top: [[9, 1, 3, 3], [13, 2, 3, 3], [7, 3, 4, 3], [10, 3, 7, 3], [7, 6, 10, 2]] },
  mohawk: { rear: [], top: [[10, 1, 4, 2], [10, 3, 4, 3], [11, 6, 2, 2]] },
  punk: { rear: [], top: [[7, 3, 3, 3], [10, 1, 3, 5], [13, 2, 3, 4], [7, 5, 10, 2]] }
};

const SKIN_PALETTE = {
  "--avatar-skin-1": 0, "--avatar-skin-2": 1, "--avatar-skin-3": 3,
  "--avatar-skin-4": 2, "--avatar-skin-5": 4
};

function hashSeed(value) {
  const input = String(value ?? "unknown-npc");
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rect = (x, y, width, height, fill, extra = "") =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" ${extra}/>`;

function drawRects(items, color) {
  return items.map(([x, y, w, h]) => rect(x, y, w, h, color)).join("");
}

function normalizeHair(style) {
  return Object.prototype.hasOwnProperty.call(HAIR, style) ? style : "short";
}

/**
 * Options accept existing NPC cosmetic fields. Infected status is intentionally
 * ignored by normal portraits; identity must be discovered through game tools.
 */
export function generateAvatarSvg(seed, options = {}) {
  const random = makeRandom(hashSeed(seed));
  const hintedPalette = SKIN_PALETTE[options.skinColor];
  const paletteIndex = Number.isInteger(options.paletteIndex)
    ? Math.abs(options.paletteIndex) % PALETTES.length
    : hintedPalette ?? Math.floor(random() * PALETTES.length);
  const p = PALETTES[paletteIndex];
  const hairStyle = normalizeHair(options.hair);
  const hair = HAIR[hairStyle];
  const ponytailTie = hairStyle === "ponytail" ? rect(17, 8, 3, 1, p.accent) : "";
  const faceWidth = random() > 0.5 ? 9 : 10;
  const faceX = Math.floor((24 - faceWidth) / 2);
  const eyeY = options.eyeType === "tired" ? 10 : 9 + Math.floor(random() * 2);
  const eye = options.eyeType === "big" ? 4 : options.eyeType === "narrow" || options.eyeType === "squint" ? 2 : 3;
  const eyeX1 = faceX + 1;
  const eyeX2 = faceX + faceWidth - eye - 1;
  const eyeColor = p.eye;
  const shirtColors = { worker: "#9a5934", civilian: "#39728a", scavenger: "#39434d", suit: "#24272d", rags: "#62645f" };
  const shirt = shirtColors[options.clothes] || p.shirt;
  const beard = options.facialHair === "beard"
    ? rect(faceX + 1, 12, faceWidth - 2, 3, p.hair) + rect(faceX + 2, 14, faceWidth - 4, 1, p.hair)
    : options.facialHair === "mustache"
      ? rect(faceX + 2, 12, faceWidth - 4, 1, p.hair)
      : options.facialHair === "stubble"
        ? rect(faceX + 1, 13, 1, 1, p.shadow) + rect(faceX + faceWidth - 2, 13, 1, 1, p.shadow) + rect(faceX + 3, 14, 1, 1, p.shadow)
        : "";
  const eyes = [
    rect(eyeX1, eyeY, eye, options.eyeType === "squint" ? 1 : 1, eyeColor),
    rect(eyeX2, eyeY, eye, options.eyeType === "squint" ? 1 : 1, eyeColor),
    rect(eyeX1 + 1, eyeY, 1, 1, "#17191b"),
    rect(eyeX2 + 1, eyeY, 1, 1, "#17191b")
  ].join("");
  const underEyes = options.eyeType === "tired"
    ? rect(eyeX1, eyeY + 1, eye, 1, p.shadow) + rect(eyeX2, eyeY + 1, eye, 1, p.shadow)
    : "";
  const mouth = options.mouthType === "smile"
    ? rect(faceX + 3, 14, faceWidth - 6, 1, p.shadow) + rect(faceX + 4, 15, faceWidth - 8, 1, p.shadow)
    : options.mouthType === "open"
      ? rect(faceX + 4, 14, faceWidth - 8, 2, "#17191b")
      : options.mouthType === "crooked"
        ? rect(faceX + 3, 14, faceWidth - 5, 1, p.shadow)
        : rect(faceX + 3, 14, faceWidth - 6, 1, p.shadow);
  const accessory = options.accessory === "glasses"
    ? rect(faceX, 9, 5, 2, "#111318") + rect(faceX + faceWidth - 5, 9, 5, 2, "#111318") + rect(faceX + 5, 9, faceWidth - 10, 1, "#111318")
    : options.accessory === "mask"
      ? rect(faceX + 1, 12, faceWidth - 2, 3, "#c5cbc6") + rect(faceX + 2, 12, faceWidth - 4, 1, "#929d9a")
      : options.accessory === "patch"
        ? rect(faceX + 1, 8, 3, 4, p.hair)
        : options.accessory === "scar"
          ? rect(faceX + faceWidth - 3, 10, 1, 3, p.accent)
          : options.accessory === "earring"
            ? rect(faceX + faceWidth, 12, 1, 2, p.accent)
            : options.accessory === "hood"
              ? rect(5, 4, 2, 12, "#34363d") + rect(17, 4, 2, 12, "#34363d") + rect(6, 3, 12, 2, "#34363d")
              : "";
  const scar = random() > 0.7 ? rect(faceX + faceWidth - 2, 11, 1, 2, p.shadow) : "";

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="180" height="180" shape-rendering="crispEdges" role="img" aria-label="Retrato pixel art de NPC">',
    rect(0, 0, 24, 24, p.background),
    rect(2, 18, 20, 6, "#101416"),
    drawRects(hair.rear, p.hair),
    ponytailTie,
    rect(5, 17, 14, 7, shirt),
    rect(9, 15, 6, 4, p.skin),
    rect(faceX - 1, 9, 1, 3, p.shadow),
    rect(faceX + faceWidth, 9, 1, 3, p.shadow),
    rect(faceX, 5, faceWidth, 11, p.skin),
    rect(faceX, 5, faceWidth, 2, p.shadow),
    drawRects(hair.top, p.hair),
    eyes,
    underEyes,
    rect(faceX + Math.floor(faceWidth / 2), 11, 1, 2, p.shadow),
    mouth,
    beard,
    scar,
    accessory,
    rect(0, 21, 24, 1, "#0b0d0e", 'opacity="0.35"'),
    rect(1, 3, 4, 1, p.accent, 'opacity="0.45"'),
    "</svg>"
  ].join("");
}

export function generateAvatarDataUri(seed, options = {}) {
  const svg = generateAvatarSvg(seed, options);
  const encoded = typeof btoa === "function"
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

export function renderAvatar(container, seed, options = {}) {
  if (!container || typeof container.appendChild !== "function") {
    throw new TypeError("renderAvatar necesita un contenedor DOM válido.");
  }
  const image = document.createElement("img");
  image.className = "npc-avatar npc-avatar--pixel";
  image.alt = options.alt ?? "Retrato de personaje";
  image.width = options.size ?? 96;
  image.height = options.size ?? 96;
  image.decoding = "async";
  image.src = generateAvatarDataUri(seed, options);
  container.replaceChildren(image);
  return image;
}
