import {
  avatarGeneratorOptions,
  generateAvatarDataUri,
  generateAvatarSvg
} from "./AvatarGenerator.js";

const byId = (id) => document.getElementById(id);
const controls = {
  seed: byId("seed"),
  palette: byId("palette"),
  hair: byId("hair"),
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
const defaults = {
  seed: "npc-daniel-morales", palette: "0", hair: "short", clothes: "scavenger",
  accessory: "none", eyes: "normal", mouth: "tight", exhausted: false, anomaly: false
};

function readOptions() {
  return {
    seed: controls.seed.value.trim() || "npc-sin-id",
    paletteIndex: Number(controls.palette.value),
    hair: controls.hair.value,
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
    image.src = generateAvatarDataUri(`hair-study-${hair}`, {
      paletteIndex: Number(controls.palette.value),
      hair,
      clothes: controls.clothes.value,
      accessory: "none",
      eyeType: controls.eyes.value,
      mouthType: controls.mouth.value
    });
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
  containerState();
  [...byId("hair-gallery").querySelectorAll(".hair-card")].forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.hair === controls.hair.value));
    const image = button.querySelector("img");
    image.src = generateAvatarDataUri(`hair-study-${button.dataset.hair}`, {
      paletteIndex: Number(controls.palette.value),
      hair: button.dataset.hair,
      clothes: controls.clothes.value,
      accessory: "none",
      eyeType: controls.eyes.value,
      mouthType: controls.mouth.value
    });
  });
}
function containerState() {
  const paletteIndex = Number(controls.palette.value);
  [...byId("palette-swatches").querySelectorAll(".palette-swatch")].forEach(button => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.palette) === paletteIndex));
  });
}
function update() {
  const options = readOptions();
  const { seed, ...visualOptions } = options;
  const svg = generateAvatarSvg(seed, visualOptions);
  const palette = avatarGeneratorOptions.palettes[options.paletteIndex];
  portrait.src = generateAvatarDataUri(seed, visualOptions);
  portrait.dataset.hairStyle = options.hair;
  portrait.dataset.paletteIndex = String(options.paletteIndex);
  portrait.dataset.npcId = seed;
  byId("preview-id").textContent = seed.toUpperCase().replace(/[^A-Z0-9_-]/g, "_").slice(0, 34);
  byId("preview-state").textContent = options.anomaly ? "ANOMALÍA REVELADA" : "SIN REVELAR";
  byId("skin-hex").textContent = `PIEL ${palette.skin.toUpperCase()}`;
  byId("hair-hex").textContent = `PELO ${palette.hair.toUpperCase()}`;
  byId("accent-hex").textContent = `ACENTO ${palette.accent.toUpperCase()}`;
  document.querySelector(".skin-dot").style.background = palette.skin;
  document.querySelector(".hair-dot").style.background = palette.hair;
  document.querySelector(".accent-dot").style.background = palette.accent;
  byId("source-summary").textContent = `generateAvatarSvg("${seed}", ${JSON.stringify(visualOptions)})`;
  svgSource.textContent = svg;
  byId("render-status").textContent = "RENDER OK";
  byId("render-status").classList.remove("render-error");
  containerState();
  updateHairGallery();
}
function setDefaults() {
  controls.seed.value = defaults.seed;
  controls.palette.value = defaults.palette;
  controls.hair.value = defaults.hair;
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

Object.values(controls).forEach(control => {
  control.addEventListener("input", update);
  control.addEventListener("change", update);
});
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
document.querySelectorAll("#pxl-gallery img").forEach(img => {
  img.addEventListener("load", () => img.closest(".pxl-frame")?.classList.add("asset-loaded"));
  img.addEventListener("error", () => {
    img.closest(".pxl-frame")?.classList.add("asset-missing");
    img.alt = "PNG pendiente de generar: " + img.alt;
  });
});

makePaletteSwatches();
makeHairGallery();
update();
