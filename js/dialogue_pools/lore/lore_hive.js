import { act } from '../../DialogueActions.js';

export const lore_hive = {
    id: 'lore_hive',
    unique: true,
    tags: ['creepy', 'lore'],
    clue: "La infección se propaga por vibraciones. El silencio en el generador reduce la tasa de mutación.",
    mechanicHint: "TIP: Mantener el generador en 'Save Mode' reduce la progresión de la anomalía.",
    appearanceDay: 3, // Fase 1.2 Roadmap: NPCs lore aparecen después de día 3
    root: 'lh_n1',
    nodes: {
        'lh_n1': {
            id: 'lh_n1',
            text: "*El niño mira la bolsa que llevas. Respira antes de que su voz termine de salir; otra persona tose dentro de la misma garganta.* \"¿Trajiste comida? Yo no tengo hambre. La mujer de la sala tres sí. Dice que no puede tragar desde que le cambiaron el agua.\" *La piel de su muñeca se contrae bajo la manga.*",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'lh_o1', label: '¿Quiénes sois?', next: 'lh_n2' },
                { id: 'lh_o2', label: '¿Qué queréis comer?', next: 'lh_n5' },
                { id: 'lh_o3', label: 'Amenazar', next: 'lh_n3' }
            ]
        },
        'lh_n2': {
            id: 'lh_n2',
            text: "*Abre la boca. Sale la voz ronca de un hombre.* \"Avisé que el agua olía a cobre.\" *Una voz pequeña se mete entre las palabras:* \"Tú no estabas allí.\" *El niño se queda quieto.* \"¿Quién dijo eso? Yo me acuerdo de la bomba. Nada más.\"",
            options: [
                { id: 'lh_o2a', label: 'Preguntar por el anciano', next: 'lh_n2_a' },
                { id: 'lh_o2b', label: 'Preguntar por el propósito', next: 'lh_n4' }
            ]
        },
        'lh_n2_a': {
            id: 'lh_n2_a',
            text: "*La voz ronca vuelve, más despacio.* \"El agua cambió de olor el martes. Lo anoté en el parte y me mandaron a limpiar el filtro. Al día siguiente ya nadie recordaba quién había dado la alarma. Yo sí. Creo.\"",
            options: [
                { id: 'lh_o2a_1', label: 'Volver', next: 'lh_n1' }
            ]
        },
        'lh_n3': {
            id: 'lh_n3',
            text: "*Varias voces responden a la vez y se pisan entre sí.* \"Si matas este cuerpo, las otras voces no se van. Pero no sabemos si eso significa que seguimos vivos.\" *Una voz infantil susurra:* \"No le digas que tenemos miedo.\"",
            options: [
                { id: 'lh_o3a', label: 'Huir', next: null },
                { id: 'lh_o3b', label: 'Disculparse', next: 'lh_n1' }
            ]
        },
        'lh_n4': {
            id: 'lh_n4',
            text: "*El niño se queda inmóvil; las voces continúan discutiendo.* \"Vamos al tanque principal porque creemos que allí empezó. Algunos quieren volver a entrar. Otros recuerdan que alguien cerró la compuerta desde dentro. No nos ponemos de acuerdo en quién estaba con nosotros.\"",
            options: [
                { id: 'lh_o4a', label: '¿Tanque principal?', next: 'lh_n4_a' },
                { id: 'lh_o4b', label: 'Terminar', next: null }
            ]
        },
        'lh_n4_a': {
            id: 'lh_n4_a',
            text: "\"El tanque está debajo de la estación. La gente de mantenimiento lo llamaba 'la Madre' antes de que empezaran los cambios. No sabemos si hablaban de algo que vieron o de una palabra que alguien les metió en la cabeza.\"",
            options: [
                { id: 'lh_o4a_1', label: '¿Cómo es ella?', next: 'lh_n_mother_desc' },
                { id: 'lh_o4a_2', label: 'Anotado', next: 'lh_n1', sets: ['known_mother'] }
            ]
        },
        'lh_n_mother_desc': {
            id: 'lh_n_mother_desc',
            text: "*Tres voces intentan contestar; una se impone por un instante.* \"No tenemos una descripción. Cada vez que intentamos recordarla, alguien recuerda una habitación distinta. ¿Quieres que le preguntemos tu nombre? No todos quieren saberlo.\"",
            options: [
                { id: 'lh_o_md_1', label: 'No', next: 'lh_n1' },
                { id: 'lh_o_md_2', label: 'Sí', next: 'lh_n_mother_contact', paranoia: 10 }
            ]
        },
        'lh_n_mother_contact': {
            id: 'lh_n_mother_contact',
            text: "*Los ojos del niño se vuelven blancos. Su voz se divide en un susurro y un tono adulto.* \"Dice que tu piel está seca.\" *Pausa.* \"No. Eso lo dijo el hombre de la sala tres. No sabemos quién habló primero.\"",
            options: [
                { id: 'lh_o_mc_1', label: 'Horrorizado', next: 'lh_n1', sanity: -5 }
            ]
        },
        'lh_n5': {
            id: 'lh_n5',
            text: "*Mira al guardia y luego al suelo.* \"A veces recordamos cosas que no vivimos. Sé el nombre de una mujer que nunca conocí y cómo murió, pero cada vez cambia un detalle. No sé si estamos recordándola o inventándola entre todos.\"",
            options: [
                { id: 'lh_o5a', label: 'Ofrecer un recuerdo falso', next: 'lh_n6' },
                { id: 'lh_o5b', label: 'Negarse', next: 'lh_n1' }
            ]
        },
        'lh_n6': {
            id: 'lh_n6',
            text: "*Aspira por la nariz. Una voz dice 'ceniza'; otra la corrige: 'desinfectante'.* \"Nos contaron que el humo venía del generador. El hombre que lo vio dice que salía del tanque. Ya no puede hablar, así que discutimos usando su recuerdo.\"",
            options: [
                { id: 'lh_o6a', label: 'Volver', next: 'lh_n1' }
            ]
        }
    }
};
