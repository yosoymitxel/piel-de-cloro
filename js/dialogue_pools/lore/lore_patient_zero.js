import { act } from '../../DialogueActions.js';

export const lore_patient_zero = {
    id: 'lore_patient_zero',
    unique: true,
    tags: ['lore', 'mysterious', 'patient_zero'],
    root: 'lpz_n1',
    nodes: {
        'lpz_n1': {
            id: 'lpz_n1',
            text: "*Un hombre anciano con bata de laboratorio hecha jirones. Su piel es translúcida, dejando ver venas negras pulsantes.* \"Ah... otro guardián de la puerta. ¿Sigues creyendo que puedes mantenerlo fuera?\"",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'lpz_o1', label: '¿Quién eres?', next: 'lpz_n2' },
                { id: 'lpz_o2', label: 'Estás infectado', next: 'lpz_n3' }
            ]
        },
        'lpz_n2': {
            id: 'lpz_n2',
            text: "\"Me llaman Paciente Cero. Pero es un error. Yo fui el Paciente Uno. El Cero... el Cero estaba esperando en el hielo.\"",
            options: [
                { id: 'lpz_o2a', label: '¿El hielo?', next: 'lpz_n4' }
            ]
        },
        'lpz_n3': {
            id: 'lpz_n3',
            text: "*Se ríe, y el sonido es como cristal rompiéndose.* \"No es una infección. Es una colonización. Y ya ha terminado. Solo estáis... negociando los términos de la rendición.\"",
            options: [
                { id: 'lpz_o3a', label: 'Explícate', next: 'lpz_n4' }
            ]
        },
        'lpz_n4': {
            id: 'lpz_n4',
            text: "\"Perforamos demasiado profundo. Buscábamos agua pura, encontramos... memoria líquida. Tiene sed de forma. Sed de ser nosotros.\"",
            options: [
                { id: 'lpz_o4a', label: '¿Hay cura?', next: 'lpz_n5' },
                { id: 'lpz_o4b', label: 'Vete', next: null, resultText: "*Se desvanece en la niebla.* \"La cura es el olvido...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }
            ]
        },
        'lpz_n5': {
            id: 'lpz_n5',
            text: "\"¿Cura para la evolución? No. Solo adaptación. O extinción. Tú eliges.\"",
            options: [
                 { id: 'lpz_o5a', label: 'No te dejaré entrar.', next: null, resultText: "*Asiente lentamente.* \"Ya estoy dentro. En el aire que respiras.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }
            ]
        }
    }
};