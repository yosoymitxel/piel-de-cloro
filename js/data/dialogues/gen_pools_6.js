import { DialogueActions as act } from '../../DialogueActions.js';

export const gen_fever = {
    id: 'gen_fever',
    tags: ['sick', 'generic'],
    unique: false,
    root: 'gfv_n1',
    nodes: {
        'gfv_n1': {
            id: 'gfv_n1',
            text: "*Suda profusamente y se abanica con la mano.* \"Uf... hace un calor infernal en los túneles hoy. ¿No lo notáis?\"",
            options: [
                { id: 'gfv_o1', label: 'La temperatura es normal', next: 'gfv_n2a' },
                { id: 'gfv_o2', label: 'Estás ardiendo', next: 'gfv_n2b' }
            ]
        },
        'gfv_n2a': {
            id: 'gfv_n2a',
            text: "\"Será que he caminado rápido. Llevo prisa. Solo necesito agua y un sitio fresco.\"",
            options: [
                { id: 'gfv_o2a', label: 'Parece fiebre', next: 'gfv_n3a' }
            ]
        },
        'gfv_n2b': {
            id: 'gfv_n2b',
            text: "\"Es solo una gripe. Me mojé ayer y cogí frío. Nada que no se cure durmiendo.\"",
            options: [
                { id: 'gfv_o2b', label: 'Dudar', next: 'gfv_n3b' }
            ]
        },
        'gfv_n3a': {
            id: 'gfv_n3a',
            text: "*Se seca el sudor, que parece ligeramente viscoso.* \"No es nada contagioso, lo prometo. Solo agotamiento.\"",
            options: [
                { id: 'gfv_o3a', label: 'Ese sudor no es normal. Vete.', next: null, resultText: "*Se marcha tambaleándose.* \"Solo es calor... mucho calor...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gfv_o3b', label: 'Déjame medir tu temperatura.', next: null, resultText: "*Se apoya en la pared.* \"Vale, pero rápido. Me mareo.\"", onclick: act.test }
            ]
        },
        'gfv_n3b': {
            id: 'gfv_n3b',
            text: "\"Mira, si fuera 'eso', ya estaría muerto, ¿no? Llevo así dos días y sigo en pie.\"",
            options: [
                { id: 'gfv_o3c', label: 'Buen punto, pero no me fío.', next: null, resultText: "*Escupe al suelo.* \"Paranoicos...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gfv_o3d', label: 'A ver esos ojos. Acércate.', next: null, resultText: "*Se acerca, sus pupilas oscilan.* \"¿Ves? Normales.\"", onclick: act.test }
            ]
        },
        'gfv_n4b': {
            id: 'gfv_n4b',
            text: "*Hipertermia. Usa el TERMÓMETRO para confirmar fiebre o infección.*",
            options: []
        }
    }
};

export const gen_euphoria = {
    id: 'gen_euphoria',
    tags: ['manic', 'energetic'],
    unique: false,
    root: 'geu_n1',
    nodes: {
        'geu_n1': {
            id: 'geu_n1',
            text: "*Tiene los ojos muy abiertos y una sonrisa fija.* \"¡Qué día tan maravilloso! El aire huele a... a limpio. A nuevo.\"",
            options: [
                { id: 'geu_o1', label: 'El aire está viciado', next: 'geu_n2a' },
                { id: 'geu_o2', label: '¿Te encuentras bien?', next: 'geu_n2b' }
            ]
        },
        'geu_n2a': {
            id: 'geu_n2a',
            text: "\"¡Para nada! Nunca había respirado tan bien. Siento que mis pulmones se han expandido.\"",
            options: [
                { id: 'geu_o2a', label: 'Eso suena sospechoso', next: 'geu_n3a' }
            ]
        },
        'geu_n2b': {
            id: 'geu_n2b',
            text: "\"¡Mejor que bien! Me siento... evolucionado. Como si me hubiera quitado un peso de encima.\"",
            options: [
                { id: 'geu_o2b', label: '¿Qué peso?', next: 'geu_n3b' }
            ]
        },
        'geu_n3a': {
            id: 'geu_n3a',
            text: "*Inspira profundamente.* \"Quizás es que tú no estás acostumbrado a la pureza. Deberías probarlo.\"",
            options: [
                { id: 'geu_o3a', label: 'Estás delirando. Fuera.', next: null, resultText: "*Se va saltando.* \"¡Aire puro! ¡Vida pura!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'geu_o3b', label: 'Quieto. Voy a escanearte.', next: null, resultText: "*Abre los brazos.* \"Escanea. Verás la perfection.\"", onclick: act.test, log: { text: 'Síntoma: Euforia química. El parásito libera dopamina para asegurar la cooperación del huésped.', icon: 'fa-face-grin-stars' } }
            ]
        },
        'geu_n3b': {
            id: 'geu_n3b',
            text: "\"El peso de ser... frágil. Ahora me siento fuerte. Resistente.\"",
            options: [
                { id: 'geu_o3c', label: 'Eso es síntoma de infección. Largo.', next: null, resultText: "*Te mira con lástima.* \"Te quedas atrás en la evolución...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'geu_o3f', label: 'Veamos', next: 'geu_n4b' }
            ]
        },
        'geu_n4b': {
            id: 'geu_n4b',
            text: "*Euforia anómala. Verifica PULSO para detectar sobrecarga química.*",
            options: []
        }
    }
};

export const gen_thirst = {
    id: 'gen_thirst',
    tags: ['weak', 'generic'],
    unique: false,
    root: 'gth_n1',
    nodes: {
        'gth_n1': {
            id: 'gth_n1',
            text: "*Tiene la voz rasposa y los labios agrietados.* \"Agua... por favor. Llevo días sin beber nada seguro.\"",
            options: [
                { id: 'gth_o1', label: 'Dar agua', next: 'gth_n2a' },
                { id: 'gth_o2', label: '¿Por qué no bebiste?', next: 'gth_n2b' }
            ]
        },
        'gth_n2a': {
            id: 'gth_n2a',
            text: "*Bebe desesperadamente, derramando agua.* \"Más... necesito más. Siento que me seco por dentro.\"",
            options: [
                { id: 'gth_o2a', label: 'Es suficiente', next: 'gth_n3a' }
            ]
        },
        'gth_n2b': {
            id: 'gth_n2b',
            text: "\"Todo sabe a metal. O a cloro. No me atreví. Pero ya no aguanto más.\"",
            options: [
                { id: 'gth_o2b', label: 'Entiendo', next: 'gth_n3b' }
            ]
        },
        'gth_n3a': {
            id: 'gth_n3a',
            text: "*Se toca la garganta.* \"Aún pica. Como si tuviera polvo en el esófago. ¿Me dejas entrar al baño?\"",
            options: [
                { id: 'gth_o3a', label: 'No. Vete a buscar agua fuera.', next: null, resultText: "*Se arrastra.* \"Agua... necesito agua...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gth_o3b', label: 'Espera. Voy a ver si estás deshidratado.', next: null, resultText: "*Asiente débilmente.* \"Rápido... me estoy secando.\"", onclick: act.test }
            ]
        },
        'gth_n3b': {
            id: 'gth_n3b',
            text: "\"Si entro, podré beber del grifo, ¿verdad? Dicen que aquí el agua es pura.\"",
            options: [
                { id: 'gth_o3c', label: 'Solo para residentes sanos.', next: null, resultText: "*Llora sin lágrimas.* \"Por favor... solo un trago...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gth_o3d', label: 'Comprobemos si estás sano.', next: null, resultText: "*Se lame los labios.* \"Lo que digas. Pero dame agua luego.\"", onclick: act.test, log: { text: 'Dato: La sed extrema puede ser deshidratación o el parásito consumiendo los fluidos corporales.', icon: 'fa-glass-water' } }
            ]
        },
        'gth_n4b': {
            id: 'gth_n4b',
            text: "*Deshidratación severa. Usa LINTERNA UV para verificar textura de la piel.*",
            options: []
        }
    }
};
