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
            text: "*El niño te mira. Su respiración llega un instante antes que el sonido de sus palabras; detrás de su voz, alguien tose.* \"¿Trajiste comida? No para mí. Para los que no pueden pedirla.\" *La piel de su muñeca se contrae bajo la manga.*",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'lh_o1', label: '¿Quiénes sois?', next: 'lh_n2' },
                { id: 'lh_o2', label: '¿Qué queréis comer?', next: 'lh_n5' },
                { id: 'lh_o3', label: 'Amenazar', next: 'lh_n3' }
            ]
        },
        'lh_n2': {
            id: 'lh_n2',
            text: "*Abre la boca para responder, pero la voz que sale es la de un hombre mayor.* \"Avisé que el agua olía a cobre.\" *Otra voz, más pequeña, interrumpe:* \"Yo me escondí en el filtro.\" *El niño parpadea.* \"No recuerdo haber dicho eso.\"",
            options: [
                { id: 'lh_o2a', label: 'Preguntar por el anciano', next: 'lh_n2_a' },
                { id: 'lh_o2b', label: 'Preguntar por el propósito', next: 'lh_n4' }
            ]
        },
        'lh_n2_a': {
            id: 'lh_n2_a',
            text: "*La voz cambia a un tono rasposo y senil.* \"Dije que el agua estaba mal. Dije que olía a cobre y a tiempo. Nadie escuchó. Ahora escuchan. Ahora soy el ruido.\"",
            options: [
                { id: 'lh_o2a_1', label: 'Volver', next: 'lh_n1' }
            ]
        },
        'lh_n3': {
            id: 'lh_n3',
            text: "*Se ríe con mil voces disonantes.* \"No puedes matar lo que es legión. Solo dañarás el envase. Tenemos repuestos. Tú eres un repuesto potencial.\" *El niño sangra icor negro por los ojos.*",
            options: [
                { id: 'lh_o3a', label: 'Huir', next: null, onclick: act.leave },
                { id: 'lh_o3b', label: 'Disculparse', next: 'lh_n1' }
            ]
        },
        'lh_n4': {
            id: 'lh_n4',
            text: "*Por un segundo, el niño deja de moverse. Las voces continúan.* \"Vamos al tanque principal porque creemos que allí nadie volverá a quedarse solo.\" *Pausa.* \"No todos estamos de acuerdo en que eso sea bueno.\"",
            options: [
                { id: 'lh_o4a', label: '¿Tanque principal?', next: 'lh_n4_a' },
                { id: 'lh_o4b', label: 'Terminar', next: null }
            ]
        },
        'lh_n4_a': {
            id: 'lh_n4_a',
            text: "\"Donde el agua duerme. Donde la Madre espera. Ella teje los cuerpos. Nosotros solo recolectamos los hilos. Su útero es todo el océano.\"",
            options: [
                { id: 'lh_o4a_1', label: '¿Cómo es ella?', next: 'lh_n_mother_desc' },
                { id: 'lh_o4a_2', label: 'Anotado', next: 'lh_n1', sets: ['known_mother'] }
            ]
        },
        'lh_n_mother_desc': {
            id: 'lh_n_mother_desc',
            text: "\"No tiene forma, porque las tiene todas. Es la tinta que escribe la historia. Es el silencio después del grito. ¿Quieres que le hablemos de ti?\"",
            options: [
                { id: 'lh_o_md_1', label: 'No', next: 'lh_n1' },
                { id: 'lh_o_md_2', label: 'Sí', next: 'lh_n_mother_contact', paranoia: 10 }
            ]
        },
        'lh_n_mother_contact': {
            id: 'lh_n_mother_contact',
            text: "*Todos los ojos del niño se vuelven blancos.* \"Ella dice... que tu piel le parece... seca. Pronto la humedecerá.\"",
            options: [
                { id: 'lh_o_mc_1', label: 'Horrorizado', next: 'lh_n1', sanity: -5 }
            ]
        },
        'lh_n5': {
            id: 'lh_n5',
            text: "*Mira la boca del guardia, luego aparta los ojos como si hubiera cometido una falta.* \"La carne nos mantiene aquí. Los recuerdos nos dicen quién falta. A veces recibimos uno y no sabemos a quién pertenece.\"",
            options: [
                { id: 'lh_o5a', label: 'Ofrecer un recuerdo falso', next: 'lh_n6' },
                { id: 'lh_o5b', label: 'Negarse', next: 'lh_n1' }
            ]
        },
        'lh_n6': {
            id: 'lh_n6',
            text: "*Aspira por la nariz. Una voz susurra 'ceniza'; otra la corrige: 'mentira'.* \"Sabemos que no es verdad. Pero alguien aquí quería creerlo. No sabemos si eso cuenta como alimento.\"",
            options: [
                { id: 'lh_o6a', label: 'Volver', next: 'lh_n1' }
            ]
        }
    }
};
