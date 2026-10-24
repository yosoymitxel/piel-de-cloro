// Central registry of inspection/bio-validation tests.
// Adding a test = one entry here + one animation in ToolsRenderer + one attribute in NPC.generateAttributes (auto via this registry).
export const TESTS = [
    // --- Core field tests (also used during inspection at the puesto) ---
    {
        id: 'thermometer',
        key: 'temperature',
        label: 'TEMP',
        statLabel: 'Temperatura',
        toolLabel: 'TERMÓMETRO',
        icon: 'fa-temperature-half',
        animMethod: 'animateToolThermometer',
        audioKey: 'tool_thermometer_beep',
        duration: 2200,
        cost: { reagents: 0, power: 5 },
        requiresLab: false,
        shelterOnly: false,
        puestoSelectable: true,
        requiredForValidation: true,
        unit: '°C',
        hallucination: { infected: () => (36.5 + Math.random() * 0.5).toFixed(1), human: () => (34 + Math.random() * 1).toFixed(1) },
        generate: (infected) => infected ? (32 + Math.random() * 2).toFixed(1) : (36.5 + Math.random() * 1).toFixed(1),
        formatStat: (v) => `${v}°C`,
        formatResult: (v) => `TEMP: ${v}°C`,
        colorFn: (v) => (parseFloat(v) < 35) ? 'green' : null,
        vhs: 0.4
    },
    {
        id: 'flashlight',
        key: 'skinTexture',
        label: 'DERMIS',
        statLabel: 'Dermis',
        toolLabel: 'LINTERNA UV',
        icon: 'fa-lightbulb',
        animMethod: 'animateToolFlashlight',
        audioKey: 'tool_uv_toggle',
        duration: 900,
        cost: { reagents: 0, power: 5 },
        requiresLab: false,
        shelterOnly: false,
        puestoSelectable: true,
        requiredForValidation: true,
        hallucination: { infected: () => 'normal', human: () => 'dry' },
        generate: (infected) => infected ? (Math.random() > 0.5 ? 'dry' : 'normal') : 'normal',
        formatStat: (v) => (v === 'dry' ? 'SECA' : 'NORMAL'),
        formatResult: (v) => `DERMIS: ${v === 'dry' ? 'SECA' : 'NORMAL'}`,
        vhs: 0.7
    },
    {
        id: 'pupils',
        key: 'pupils',
        label: 'PUPILAS',
        statLabel: 'Pupilas',
        toolLabel: 'PUPILAS',
        icon: 'fa-eye',
        animMethod: 'animateToolPupils',
        audioKey: 'tool_pupils_lens',
        duration: 2700,
        cost: { reagents: 0, power: 5 },
        requiresLab: false,
        shelterOnly: false,
        puestoSelectable: true,
        requiredForValidation: true,
        hallucination: { infected: () => 'normal', human: () => 'dilated' },
        generate: (infected) => infected ? (Math.random() > 0.7 ? 'dilated' : 'normal') : 'normal',
        formatStat: (v) => (v === 'dilated' ? 'DILATADAS' : 'NORMAL'),
        formatResult: (v) => `PUPILAS: ${v === 'dilated' ? 'DILATADAS' : 'NORMAL'}`,
        vhs: 0.6
    },
    {
        id: 'pulse',
        key: 'pulse',
        label: 'PULSO',
        statLabel: 'Pulso',
        toolLabel: 'PULSO',
        icon: 'fa-heart-pulse',
        animMethod: 'animateToolPulse',
        audioKey: 'tool_pulse_beep',
        duration: 2200,
        cost: { reagents: 0, power: 5 },
        requiresLab: false,
        shelterOnly: false,
        puestoSelectable: true,
        requiredForValidation: true,
        unit: 'PPM',
        hallucination: { infected: () => 70 + Math.floor(Math.random() * 20), human: () => 10 + Math.floor(Math.random() * 10) },
        generate: (infected) => infected ? Math.floor(Math.random() * 20) : Math.floor(60 + Math.random() * 40),
        formatStat: (v) => `${v} PPM`,
        formatResult: (v) => `PULSO: ${v} PPM`,
        colorFn: (v) => (parseInt(v) < 40) ? 'red' : null,
        vhs: 0.5
    },
    // --- Shelter-only tests (bio-validation / laboratorio) ---
    {
        id: 'oximetry',
        key: 'oxygen',
        label: 'OXIMETRÍA',
        statLabel: 'Oxígeno',
        toolLabel: 'OXÍMETRO',
        icon: 'fa-lungs',
        animMethod: 'animateToolOximeter',
        audioKey: 'tool_pulse_beep',
        duration: 2000,
        cost: { reagents: 0, power: 0 },
        requiresLab: false,
        shelterOnly: true,
        puestoSelectable: true,
        requiredForValidation: false,
        unit: '%',
        hallucination: { infected: () => 97 + Math.floor(Math.random() * 3), human: () => 88 + Math.floor(Math.random() * 5) },
        generate: (infected) => infected ? Math.floor(85 + Math.random() * 6) : Math.floor(96 + Math.random() * 4),
        formatStat: (v) => `${v}%`,
        formatResult: (v) => (parseInt(v) < 92) ? 'O₂: COMPROMETIDO' : 'O₂: ESTABLE',
        formatStat: (v) => (parseInt(v) < 92) ? 'COMPROMETIDO' : 'ESTABLE',
        vhs: 0.3
    },
    {
        id: 'skinTurgor',
        key: 'skinTurgor',
        label: 'TURGOR',
        statLabel: 'Turgor',
        toolLabel: 'TURGOR CUTÁNEO',
        icon: 'fa-hand-dots',
        animMethod: 'animateToolSkinTurgor',
        audioKey: 'tool_uv_toggle',
        duration: 1500,
        cost: { reagents: 0, power: 0 },
        requiresLab: false,
        shelterOnly: true,
        puestoSelectable: true,
        requiredForValidation: false,
        hallucination: { infected: () => 'normal', human: () => 'slow' },
        generate: (infected) => infected ? (Math.random() > 0.6 ? 'slow' : 'normal') : 'normal',
        formatStat: (v) => (v === 'slow' ? 'LENTO' : 'NORMAL'),
        formatResult: (v) => (v === 'slow' ? 'TURGOR: LENTO' : 'TURGOR: NORMAL'),
        vhs: 0.3
    },
    {
        id: 'glucose',
        key: 'glucose',
        label: 'GLUCOSA',
        statLabel: 'Glucosa',
        toolLabel: 'GLUCÓMETRO',
        icon: 'fa-droplet',
        animMethod: 'animateToolGlucose',
        audioKey: 'tool_thermometer_beep',
        duration: 1800,
        cost: { reagents: 1, power: 0 },
        requiresLab: true,
        shelterOnly: true,
        puestoSelectable: true,
        requiredForValidation: false,
        unit: 'mg/dL',
        hallucination: { infected: () => 90 + Math.floor(Math.random() * 25), human: () => 160 + Math.floor(Math.random() * 45) },
        generate: (infected) => infected ? Math.floor(180 + Math.random() * 40) : Math.floor(80 + Math.random() * 30),
        formatStat: (v) => (parseInt(v) > 140) ? 'ELEVADA' : 'NORMAL',
        formatResult: (v) => (parseInt(v) > 140) ? 'GLUCOSA: ELEVADA' : 'GLUCOSA: NORMAL',
        colorFn: (v) => (parseInt(v) > 140) ? 'red' : null,
        vhs: 0.4
    }
];

export function getTest(idOrKey) {
    return TESTS.find(t => t.id === idOrKey || t.key === idOrKey) || null;
}

export function getPuestoSelectable() {
    return TESTS.filter(t => t.puestoSelectable);
}

export function getShelterTests() {
    return TESTS.slice(); // all tests are listed in shelter
}

export function getRequiredTests() {
    return TESTS.filter(t => t.requiredForValidation);
}
