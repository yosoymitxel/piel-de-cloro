import {
  avatarGeneratorOptions,
  generateAvatarDataUri,
  generateAvatarSvg,
  resolveAvatarOptions
} from "./AvatarGenerator.js";

const byId = (id) => document.getElementById(id);
const controls = {
  seed: byId("seed"),
  palette: byId("palette"),
  paletteSkin: byId("palette-skin"),
  skinColor: byId("skin-color"),
  hair: byId("hair"),
  faceShape: byId("face-shape"),
  clothes: byId("clothes"),
  accessory: byId("accessory"),
  facialHair: byId("facial-hair"),
  eyes: byId("eyes"),
  mouth: byId("mouth"),
  exhausted: byId("exhausted"),
  anomaly: byId("anomaly")
};
const portrait = byId("current-portrait");
const svgSource = byId("svg-source");
const configStatus = byId("copy-status");
const hairLabels = {
  bald: "Calvo", shaved: "Rapado", short: "Corto", long: "Largo", bob: "Bob",
  ponytail: "Coleta", bun: "Rodete", wild: "Desprolijo", mohawk: "Mohicano", punk: "Punk"
};
const faceLabels = {
  oval: "Ovalado", round: "Redondo", square: "Cuadrado", long: "Alargado",
  broad: "Ancho", angular: "Angular", heart: "Corazón"
};
const defaults = {
  seed: "npc-daniel-morales", palette: "", paletteSkin: true, skinColor: "#b78f78",
  hair: "", faceShape: "", clothes: "", accessory: "", facialHair: "",
  eyes: "", mouth: "", exhausted: false, anomaly: false
};

function readOptions() {
  const options = { seed: controls.seed.value.trim() || "npc-sin-id" };
  if (controls.palette.value !== "") options.paletteIndex = Number(controls.palette.value);
  if (!controls.paletteSkin.checked) options.skinColor = controls.skinColor.value;
  const traitControls = [
    ["hair", "hair"], ["faceShape", "faceShape"], ["clothes", "clothes"],
    ["accessory", "accessory"], ["facialHair", "facialHair"],
    ["eyes", "eyeType"], ["mouth", "mouthType"]
  ];
  traitControls.forEach(([controlKey, optionKey]) => {
    const value = controls[controlKey].value;
    if (value !== "") options[optionKey] = value;
  });
  if (controls.exhausted.checked) options.exhausted = true;
  // Anomaly appearance is allowed only in this explicit, already-revealed preview.
  if (controls.anomaly.checked) {
    options.infected = true;
    options.revealed = true;
  }
  return options;
}
function makePaletteSwatches() {
  const container = byId("palette-swatches");
  container.replaceChildren();
  avatarGeneratorOptions.palettes.forEach((palette, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "palette-swatch";
    button.dataset.palette = String(index);
    button.setAttribute("aria-label", `Usar paleta ${palette.name}`);
    button.innerHTML = `
      <span class="palette-swatch-colors" aria-hidden="true">
        <i style="background:${palette.skin}"></i>
        <i style="background:${palette.hair}"></i>
        <i style="background:${palette.accent}"></i>
      </span>
      <span class="palette-swatch-name">${palette.name}</span>`;
    button.addEventListener("click", () => {
      controls.palette.value = String(index);
      update();
    });
    container.append(button);
  });
}
function makeHairGallery() {
  const container = byId("hair-gallery");
  container.replaceChildren();
  avatarGeneratorOptions.hairStyles.forEach((hair, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hair-card";
    button.dataset.hair = hair;
    button.setAttribute("aria-pressed", String(hair === controls.hair.value));
    button.setAttribute("aria-label", `Elegir peinado ${hairLabels[hair] || hair}`);
    const image = document.createElement("img");
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    const options = readOptions();
    const { seed, ...visualOptions } = options;
    image.src = generateAvatarDataUri(seed, { ...visualOptions, accessory: "none", hair });
    const title = document.createElement("span");
    title.textContent = hairLabels[hair] || hair;
    const key = document.createElement("small");
    key.textContent = `HAIR_0${index + 1} / ${hair.toUpperCase()}`;
    button.append(image, title, key);
    button.addEventListener("click", () => {
      controls.hair.value = hair;
      update();
      controls.hair.focus();
    });
    container.append(button);
  });
}
function updateHairGallery() {
  const options = readOptions();
  const { seed, ...visualOptions } = options;
  const resolved = resolveAvatarOptions(seed, visualOptions);
  [...byId("hair-gallery").querySelectorAll(".hair-card")].forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.hair === resolved.hair));
    const image = button.querySelector("img");
    image.src = generateAvatarDataUri(seed, { ...visualOptions, accessory: "none", hair: button.dataset.hair });
  });
}

function makeFaceGallery() {
  const container = byId("face-gallery");
  container.replaceChildren();
  avatarGeneratorOptions.faceShapes.forEach((faceShape, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hair-card face-card";
    button.dataset.faceShape = faceShape;
    button.setAttribute("aria-pressed", String(faceShape === controls.faceShape.value));
    button.setAttribute("aria-label", `Elegir forma de rostro ${faceLabels[faceShape] || faceShape}`);
    const image = document.createElement("img");
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    const { seed, ...visualOptions } = readOptions();
    image.src = generateAvatarDataUri(seed, { ...visualOptions, faceShape });
    const title = document.createElement("span");
    title.textContent = faceLabels[faceShape] || faceShape;
    const key = document.createElement("small");
    key.textContent = `FACE_0${index + 1} / ${faceShape.toUpperCase()}`;
    button.append(image, title, key);
    button.addEventListener("click", () => {
      controls.faceShape.value = faceShape;
      update();
      controls.faceShape.focus();
    });
    container.append(button);
  });
}
function updateFaceGallery() {
  const options = readOptions();
  const { seed, ...visualOptions } = options;
  const resolved = resolveAvatarOptions(seed, visualOptions);
  [...byId("face-gallery").querySelectorAll(".hair-card")].forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.faceShape === resolved.faceShape));
    const image = button.querySelector("img");
    image.src = generateAvatarDataUri(seed, { ...visualOptions, accessory: "none", faceShape: button.dataset.faceShape });
  });
}
function containerState() {
  const chosenPalette = controls.palette.value;
  [...byId("palette-swatches").querySelectorAll(".palette-swatch")].forEach(button => {
    button.setAttribute("aria-pressed", String(chosenPalette !== "" && button.dataset.palette === chosenPalette));
  });
}
function update() {
  const options = readOptions();
  const { seed, ...visualOptions } = options;
  const resolved = resolveAvatarOptions(seed, visualOptions);
  const svg = generateAvatarSvg(seed, visualOptions);
  const palette = avatarGeneratorOptions.palettes[resolved.paletteIndex];
  const visibleSkin = resolved.skinColor;

  controls.skinColor.disabled = controls.paletteSkin.checked;
  if (controls.paletteSkin.checked) controls.skinColor.value = palette.skin;

  portrait.src = generateAvatarDataUri(seed, visualOptions);
  portrait.dataset.hairStyle = resolved.hair;
  portrait.dataset.faceShape = resolved.faceShape;
  portrait.dataset.paletteIndex = String(resolved.paletteIndex);
  portrait.dataset.npcId = seed;
  portrait.dataset.clothes = resolved.clothes;
  portrait.dataset.facialHair = resolved.facialHair;
  portrait.dataset.generatedSignature = JSON.stringify([
    resolved.paletteIndex, resolved.skinColor, resolved.hair, resolved.faceShape,
    resolved.clothes, resolved.accessory, resolved.facialHair,
    resolved.eyeType, resolved.mouthType
  ]);

  byId("preview-id").textContent = seed.toUpperCase().replace(/[^A-Z0-9_-]/g, "_").slice(0, 34);
  byId("preview-state").textContent = options.revealed ? "ANOMALÍA REVELADA" : "SIN REVELAR";
  byId("skin-hex").textContent = `PIEL ${visibleSkin.toUpperCase()}`;
  byId("hair-hex").textContent = `PELO ${palette.hair.toUpperCase()}`;
  byId("accent-hex").textContent = `ACENTO ${palette.accent.toUpperCase()}`;
  document.querySelector(".skin-dot").style.background = visibleSkin;
  document.querySelector(".hair-dot").style.background = palette.hair;
  document.querySelector(".accent-dot").style.background = palette.accent;

  const clothesLabels = { worker: "MANTENIMIENTO", civilian: "CIVIL", scavenger: "CHATARRERO", suit: "FORMAL", rags: "HARAPOS" };
  const accessoryLabels = { none: "NINGUNO", glasses: "LENTES", mask: "MÁSCARA", scar: "CICATRIZ", patch: "PARCHE", earring: "ARO", hood: "CAPUCHA" };
  const facialHairLabels = { none: "SIN VELLO", beard: "BARBA", stubble: "BARBA DE DÍAS", mustache: "BIGOTE" };
  byId("resolved-traits").textContent = [
    `PELO: ${hairLabels[resolved.hair] || resolved.hair}`,
    `ROSTRO: ${faceLabels[resolved.faceShape] || resolved.faceShape}`,
    `ROPA: ${clothesLabels[resolved.clothes] || resolved.clothes}`,
    `VELLO: ${facialHairLabels[resolved.facialHair] || resolved.facialHair}`,
    `ACCESORIO: ${accessoryLabels[resolved.accessory] || resolved.accessory}`,
    `OJOS: ${resolved.eyeType.toUpperCase()}`,
    `BOCA: ${resolved.mouthType.toUpperCase()}`
  ].join("  /  ");

  byId("source-summary").textContent = `generateAvatarSvg("${seed}", ${JSON.stringify(visualOptions)})`;
  svgSource.textContent = svg;
  byId("render-status").textContent = "RENDER OK";
  byId("render-status").classList.remove("render-error");
  containerState();
  updateHairGallery();
  updateFaceGallery();
}
function setDefaults() {
  controls.seed.value = defaults.seed;
  controls.palette.value = defaults.palette;
  controls.paletteSkin.checked = defaults.paletteSkin;
  controls.skinColor.value = defaults.skinColor;
  controls.hair.value = defaults.hair;
  controls.faceShape.value = defaults.faceShape;
  controls.clothes.value = defaults.clothes;
  controls.accessory.value = defaults.accessory;
  controls.facialHair.value = defaults.facialHair;
  controls.eyes.value = defaults.eyes;
  controls.mouth.value = defaults.mouth;
  controls.exhausted.checked = defaults.exhausted;
  controls.anomaly.checked = defaults.anomaly;
  update();
}
async function copyText(value, successMessage) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const helper = document.createElement("textarea");
      helper.value = value;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      const ok = document.execCommand("copy");
      helper.remove();
      if (!ok) throw new Error("No se pudo copiar");
    }
    configStatus.textContent = successMessage;
  } catch {
    configStatus.textContent = "El navegador bloqueó el portapapeles; seleccioná el código manualmente.";
  }
}

Object.values(controls).forEach(control => control.addEventListener("input", update));
byId("new-seed").addEventListener("click", () => {
  const next = Number((controls.seed.value.match(/(\d+)$/) || [])[1] || 0) + 1;
  controls.seed.value = `npc-subject-${String(next).padStart(3, "0")}`;
  update();
  controls.seed.focus();
});
byId("reset").addEventListener("click", setDefaults);
byId("copy-config").addEventListener("click", () => {
  const { seed, ...options } = readOptions();
  copyText(JSON.stringify({ seed, options }, null, 2), "Configuración copiada.");
});
byId("copy-svg").addEventListener("click", () => copyText(svgSource.textContent, "SVG copiado."));
byId("current-portrait").addEventListener("error", () => {
  byId("render-status").textContent = "ERROR SVG";
  byId("render-status").classList.add("render-error");
});
fetch("art/npcs.px.js")
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  })
  .then(source => { byId("pxl-source").textContent = source; })
  .catch(() => { byId("pxl-source").textContent = "No se pudo leer art/npcs.px.js. Abrí el archivo desde el enlace de la sección."; });

makePaletteSwatches();
makeHairGallery();
makeFaceGallery();
update();
