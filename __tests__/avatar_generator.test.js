import { generateAvatarSvg, generateAvatarDataUri, avatarGeneratorOptions } from "../js/avatar/AvatarGenerator.js";

describe("AvatarGenerator", () => {
  test("preserva identidad: misma semilla y opciones producen el mismo SVG", () => {
    expect(generateAvatarSvg("npc-004", { hair: "ponytail", paletteIndex: 2 }))
      .toBe(generateAvatarSvg("npc-004", { hair: "ponytail", paletteIndex: 2 }));
  });

  test("distintas semillas crean identidad visual distinta", () => {
    expect(generateAvatarSvg("npc-004")).not.toBe(generateAvatarSvg("npc-005"));
  });

  test("genera un retrato de busto con rejilla lógica 32×40", () => {
    const svg = generateAvatarSvg("test-npc");
    expect(svg).toContain('viewBox="0 0 32 40"');
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain("<polygon");
    expect(svg).toContain("</svg>");
  });

  test("la coleta es una silueta explícita que sobresale de la cabeza", () => {
    const svg = generateAvatarSvg("same-npc", { hair: "ponytail", paletteIndex: 1 });
    expect(svg).toContain('x="24" y="12" width="3" height="7"');
    expect(svg).toContain('x="23" y="12" width="3" height="1"');
    expect(svg).not.toBe(generateAvatarSvg("same-npc", { hair: "short", paletteIndex: 1 }));
  });

  test("el pelo, ropa, accesorios, ojos y expresiones son variantes del generador, no fotos", () => {
    const base = generateAvatarSvg("skin-editor", { paletteIndex: 2, hair: "short" });
    expect(generateAvatarSvg("skin-editor", { paletteIndex: 2, hair: "mohawk" })).not.toBe(base);
    expect(generateAvatarSvg("skin-editor", { paletteIndex: 2, accessory: "glasses" })).not.toBe(base);
    expect(generateAvatarSvg("skin-editor", { paletteIndex: 2, clothes: "worker" })).not.toBe(base);
    expect(generateAvatarSvg("skin-editor", { paletteIndex: 2, eyeType: "tired" })).not.toBe(base);
  });

  test("permite fijar cualquiera de las cinco paletas", () => {
    expect(avatarGeneratorOptions.palettes).toHaveLength(5);
    for (let paletteIndex = 0; paletteIndex < 5; paletteIndex += 1) {
      const svg = generateAvatarSvg("same-npc", { paletteIndex });
      expect(svg).toContain(avatarGeneratorOptions.palettes[paletteIndex].background);
    }
  });

  test("el dato de infección no afecta el retrato normal sin revelación explícita", () => {
    expect(generateAvatarSvg("npc-004", { infected: true }))
      .toBe(generateAvatarSvg("npc-004", { infected: false }));
  });

  test("la anomalía solo se dibuja cuando la vista ya la revela", () => {
    const ordinary = generateAvatarSvg("npc-004", { infected: true });
    const revealed = generateAvatarSvg("npc-004", { infected: true, revealed: true });
    expect(revealed).not.toBe(ordinary);
  });

  test("expone un data URI SVG autocontenido", () => {
    expect(generateAvatarDataUri("npc-004")).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});
