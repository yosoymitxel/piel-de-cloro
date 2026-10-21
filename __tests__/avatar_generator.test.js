import { generateAvatarSvg, generateAvatarDataUri } from "../js/avatar/AvatarGenerator.js";

describe("AvatarGenerator", () => {
  test("mantiene el mismo retrato para la misma semilla", () => {
    expect(generateAvatarSvg("npc-004")).toBe(generateAvatarSvg("npc-004"));
  });

  test("distingue identidades y conserva peinados definidos", () => {
    expect(generateAvatarSvg("npc-004")).not.toBe(generateAvatarSvg("npc-005"));
    expect(generateAvatarSvg("same-npc", { hair: "ponytail" }))
      .not.toBe(generateAvatarSvg("same-npc", { hair: "short" }));
  });

  test("el peinado ponytail incluye una coleta visible fuera de la silueta de la cabeza", () => {
    const svg = generateAvatarSvg("ponytail-check", { hair: "ponytail" });
    expect(svg).toContain('<rect x="19" y="10" width="2" height="4"');
  });

  test("produce un SVG válido con bordes de píxel nítidos", () => {
    const svg = generateAvatarSvg("test-npc");
    expect(svg).toContain("<svg");
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain("</svg>");
  });

  test("no revela infección oculta en el retrato normal", () => {
    expect(generateAvatarSvg("npc-004", { infected: true }))
      .toBe(generateAvatarSvg("npc-004", { infected: false }));
  });

  test("permite fijar una paleta y respeta cosméticos existentes", () => {
    expect(generateAvatarSvg("npc-004", { paletteIndex: 2, hair: "bob" }))
      .toBe(generateAvatarSvg("npc-004", { paletteIndex: 2, hair: "bob" }));
    expect(generateAvatarSvg("npc-004", { accessory: "glasses" })).toContain("#111318");
  });

  test("expone el retrato como una data URI local sin petición de red", () => {
    expect(generateAvatarDataUri("npc-004")).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});
