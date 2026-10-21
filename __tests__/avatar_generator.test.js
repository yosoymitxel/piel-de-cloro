import { generateAvatarSvg, generateAvatarDataUri, avatarGeneratorOptions, resolveAvatarOptions } from "../js/avatar/AvatarGenerator.js";

describe("AvatarGenerator", () => {
  test("preserva identidad: misma semilla y opciones producen el mismo SVG", () => {
    expect(generateAvatarSvg("npc-004", { hair: "ponytail", paletteIndex: 2 }))
      .toBe(generateAvatarSvg("npc-004", { hair: "ponytail", paletteIndex: 2 }));
  });

  test("la semilla genera rasgos completos y reproducibles sin fijarlos uno por uno", () => {
    const first = resolveAvatarOptions("subject-alpha");
    expect(resolveAvatarOptions("subject-alpha")).toEqual(first);
    expect(resolveAvatarOptions("subject-beta")).not.toEqual(first);
    expect(generateAvatarSvg("subject-alpha")).not.toBe(generateAvatarSvg("subject-beta"));
  });

  test("forzar un rasgo no vuelve a sortear los demás rasgos del mismo NPC", () => {
    const automatic = resolveAvatarOptions("npc-independent-overrides");
    const ponytail = resolveAvatarOptions("npc-independent-overrides", { hair: "ponytail" });
    expect(ponytail.hair).toBe("ponytail");
    expect(ponytail.paletteIndex).toBe(automatic.paletteIndex);
    expect(ponytail.faceShape).toBe(automatic.faceShape);
    expect(ponytail.clothes).toBe(automatic.clothes);
    expect(ponytail.accessory).toBe(automatic.accessory);
    expect(ponytail.eyeType).toBe(automatic.eyeType);
    expect(ponytail.mouthType).toBe(automatic.mouthType);
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

  test("la coleta es una silueta explícita que sobresale detrás de la cabeza", () => {
    const svg = generateAvatarSvg("same-npc", { hair: "ponytail", paletteIndex: 1 });
    expect(svg).toContain('x="26" y="19" width="4" height="7"');
    expect(svg).toContain('x="25" y="12" width="3" height="2"');
    expect(svg).not.toBe(generateAvatarSvg("same-npc", { hair: "short", paletteIndex: 1 }));
  });

  test("un NPC calvo no recibe una franja oscura de pelo por el contorno facial", () => {
    const svg = generateAvatarSvg("bald-subject", {
      paletteIndex: 0, hair: "bald", facialHair: "none", accessory: "none"
    });
    expect(svg).not.toContain('fill="#20242c"');
    expect(svg).toContain('fill="#b78f78"');
  });

  test("las diez siluetas capilares generan diseños diferentes con la misma identidad", () => {
    const styles = avatarGeneratorOptions.hairStyles;
    const designs = styles.map(hair => generateAvatarSvg("same-subject", {
      paletteIndex: 0, hair, facialHair: "none", accessory: "none", faceShape: "oval"
    }));
    expect(styles).toHaveLength(10);
    expect(new Set(designs).size).toBe(10);
  });

  test("el pelo, ropa, accesorios, ojos y expresiones son variantes del generador, no fotos", () => {
    const base = generateAvatarSvg("skin-editor", { paletteIndex: 2, hair: "short" });
    expect(generateAvatarSvg("skin-editor", { paletteIndex: 2, hair: "mohawk" })).not.toBe(base);
    expect(generateAvatarSvg("skin-editor", { paletteIndex: 2, accessory: "glasses" })).not.toBe(base);
    expect(generateAvatarSvg("skin-editor", { paletteIndex: 2, clothes: "worker" })).not.toBe(base);
    expect(generateAvatarSvg("skin-editor", { paletteIndex: 2, eyeType: "tired" })).not.toBe(base);
  });

  test("ofrece siete siluetas faciales realmente distintas", () => {
    expect(avatarGeneratorOptions.faceShapes).toEqual([
      "oval", "round", "square", "long", "broad", "angular", "heart"
    ]);
    const faces = avatarGeneratorOptions.faceShapes.map(faceShape =>
      generateAvatarSvg("same-face", { paletteIndex: 0, hair: "short", faceShape })
    );
    expect(new Set(faces).size).toBe(7);
  });

  test("conserva exactamente los cinco tonos heredados de css/avatars.css", () => {
    const legacy = [
      ["var(--avatar-skin-1)", "#ffdbac"],
      ["var(--avatar-skin-2)", "#f1c27d"],
      ["var(--avatar-skin-3)", "#e0ac69"],
      ["var(--avatar-skin-4)", "#8d5524"],
      ["var(--avatar-skin-5)", "#c68642"]
    ];
    for (const [skinColor, expected] of legacy) {
      expect(generateAvatarSvg("legacy-skin", { paletteIndex: 0, skinColor }))
        .toContain(`fill="${expected}"`);
    }
  });

  test("acepta un tono hexadecimal personalizado y normaliza la forma corta", () => {
    expect(generateAvatarSvg("custom-skin", { skinColor: "#6a3f2e" }))
      .toContain('fill="#6a3f2e"');
    expect(generateAvatarSvg("custom-skin", { skinColor: "#abc" }))
      .toContain('fill="#aabbcc"');
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
