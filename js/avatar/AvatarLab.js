import {
  avatarGeneratorOptions,
  generateAvatarDataUri,
  generateAvatarSvg
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
  seed: "npc-daniel-morales", palette: "0", paletteSkin: true, skinColor: "#b78f78",
  hair: "short", faceShape: "oval", clothes: "scavenger", accessory: "none",
  eyes: "normal", mouth: "tight", exhausted: false, anomaly: false
};

function readOptions() {
  return {
    seed: controls.seed.value.trim() || "npc-sin-id",
    paletteIndex: Number(controls.palette.value),
    skinColor: controls.paletteSkin.checked ? undefined : controls.skinColor.value,
    hair: controls.hair.value,
    faceShape: controls.faceShape.value,
    clothes: controls.clothes.value,
    accessory: controls.accessory.value,
    eyeType: controls.eyes.value,
    mouthType: controls.mouth.value,
    exhausted: controls.exhausted.checked,
    // A diagnostic can be previewed only through an explicit revealed state.
    infected: controls.anomaly.checked,
    revealed: controls.anomaly.checked
  };
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
  [...byId("hair-gallery").querySelectorAll(".hair-card")].forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.hair === controls.hair.value));
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
  [...byId("face-gallery").querySelectorAll(".hair-card")].forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.faceShape === controls.faceShape.value));
    const image = button.querySelector("img");
    image.src = generateAvatarDataUri(seed, { ...visualOptions, accessory: "none", faceShape: button.dataset.faceShape });
  });
}
function containerState() {
  const paletteIndex = Number(controls.palette.value);
  [...byId("palette-swatches").querySelectorAll(".palette-swatch")].forEach(button => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.palette) === paletteIndex));
  });
}
let selectedLorePortrait = null;
const lorePortraits = [
  { id: "lore_hive", name: "La Colmena", file: "npc_lore_hive.png", detail: "Tres rostros, garganta compartida e icor negro" },
  { id: "lore_kael", name: "Kael", file: "npc_lore_kael.png", detail: "Rostro y cable fusionados con la pared" },
  { id: "lore_archivist", name: "El Archivista", file: "npc_lore_archivist.png", detail: "Cicatrices fechadas, lentes y placa de latón" },
  { id: "lore_patient_zero", name: "Paciente Cero", file: "npc_lore_patient_zero.png", detail: "Científico anciano, venas oscuras y cuello clínico" }
];

function makeLoreGallery() {
  const container = byId("lore-gallery");
  container.replaceChildren();
  lorePortraits.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pxl-card lore-pxl-card";
    button.dataset.loreId = item.id;
    button.setAttribute("aria-label", `Inspeccionar ${item.name}`);
    button.setAttribute("aria-pressed", "false");
    const frame = document.createElement("span");
    frame.className = "pxl-frame";
    const image = document.createElement("img");
    image.src = `assets/pixel/npcs/sprites/${item.file}`;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.onerror = () => {
      image.alt = "PNG pendiente de compilar";
      button.classList.add("lore-pxl-missing");
    };
    const title = document.createElement("strong");
    title.textContent = item.name;
    const detail = document.createElement("small");
    detail.textContent = item.detail;
    frame.append(image);
    button.append(frame, title, detail);
    button.addEventListener("click", () => {
      selectedLorePortrait = item;
      [...container.querySelectorAll(".lore-pxl-card")].forEach(card => {
        card.setAttribute("aria-pressed", String(card.dataset.loreId === item.id));
      });
      portrait.src = `assets/pixel/npcs/sprites/${item.file}`;
      portrait.dataset.npcId = item.id;
      byId("preview-id").textContent = item.name.toUpperCase();
      byId("preview-state").textContent = "LORE / SPRITE FIJO";
      byId("portrait-size").textContent = "CLAUDEPXL / PNG";
      byId("source-summary").textContent = `sprite("${item.id}")`;
      svgSource.textContent = `Sprite ClaudePXL: ${item.id}\nArchivo compilado: assets/pixel/npcs/sprites/${item.file}\n\nRasgos narrativos: ${item.detail}\n\nLa fuente editable está en art/npcs.px.js.`;
      byId("render-status").textContent = "LORE PNG";
      byId("render-status").classList.remove("render-error");
    });
    container.append(button);
  });
}

function update() {
  selectedLorePortrait = null;
  [...byId("lore-gallery").querySelectorAll(".lore-pxl-card")].forEach(card => card.setAttribute("aria-pressed", "false"));
  const options = readOptions();
  const { seed, ...visualOptions } = options;
  const svg = generateAvatarSvg(seed, visualOptions);
  const palette = avatarGeneratorOptions.palettes[options.paletteIndex];
  const visibleSkin = options.skinColor || palette.skin;
  controls.skinColor.disabled = controls.paletteSkin.checked;
  if (controls.paletteSkin.checked) controls.skinColor.value = palette.skin;
  portrait.src = generateAvatarDataUri(seed, visualOptions);
  portrait.dataset.hairStyle = options.hair;
  portrait.dataset.faceShape = options.faceShape;
  portrait.dataset.paletteIndex = String(options.paletteIndex);
  portrait.dataset.npcId = seed;
  byId("preview-id").textContent = seed.toUpperCase().replace(/[^A-Z0-9_-]/g, "_").slice(0, 34);
  byId("preview-state").textContent = options.anomaly ? "ANOMALÍA REVELADA" : "SIN REVELAR";
  byId("skin-hex").textContent = `PIEL ${visibleSkin.toUpperCase()}`;
  byId("hair-hex").textContent = `PELO ${palette.hair.toUpperCase()}`;
  byId("accent-hex").textContent = `ACENTO ${palette.accent.toUpperCase()}`;
  document.querySelector(".skin-dot").style.background = visibleSkin;
  document.querySelector(".hair-dot").style.background = palette.hair;
  document.querySelector(".accent-dot").style.background = palette.accent;
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
makeLoreGallery();
makeHairGallery();
makeFaceGallery();
update();
