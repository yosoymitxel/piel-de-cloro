export const gen_pools_12 = {
    'g_pool_chlorine_gospel_1': {
        id: 'g_pool_chlorine_gospel_1',
        tags: ['generic', 'fanatic', 'religious'],
        root: 'n1',
        nodes: {
            'n1': {
                id: 'n1',
                text: "*El sujeto se frota la piel hasta enrojecerla.* \"¿Lo sientes? El Estrato Blanco. Está demasiado limpio. Necesitamos ensuciarnos para recordar.\"",
                options: [
                    { id: 'o1', label: '¿Qué quieres recordar?', next: 'n2' },
                    { id: 'o2', label: 'Toma tus pastillas', next: 'n3' }
                ]
            },
            'n2': {
                id: 'n2',
                text: "\"Mi nombre. El nombre de mi madre. El Cloro se lo llevó todo. Solo dejó la función. Soy 'Técnico de Valvulas 4'. Antes era... alguien.\"",
                options: [
                    { id: 'o2a', label: 'El Cloro nos protege', next: 'n4' },
                    { id: 'o2b', label: 'Lo siento', next: 'n_end_sad' }
                ]
            },
            'n3': {
                id: 'n3',
                text: "\"No. Las pastillas son blancas. Todo es blanco. Quiero ver negro. Quiero ver Tinta.\"",
                options: [
                    { id: 'o3a', label: 'Eso es peligroso', next: 'n4' },
                    { id: 'o3l', label: '¿Qué tinta?', next: null, resultText: "*Te da un frasco negro.* \"La que sangran las paredes.\"", onclick: (g) => act.giveLoreItem(g, 'item_black_ichor', 'Muestra de Icor Negro') }
                ]
            },
            'n4': {
                id: 'n4',
                text: "\"Peligroso es olvidar que tienes corazón hasta que deja de latir. He oído el bombeo en las tuberías. La estación está viva, y nosotros somos sus parásitos.\"",
                options: []
            },
            'n_end_sad': {
                id: 'n_end_sad',
                text: "*Baja la cabeza.* \"La lástima también se borra con lejía, doctor.\"",
                options: []
            }
        }
    },
    'g_pool_ink_visions_1': {
        id: 'g_pool_ink_visions_1',
        tags: ['generic', 'nervous', 'visionary'],
        root: 'n1',
        nodes: {
            'n1': {
                id: 'n1',
                text: "\"Anoche soñé con el Pozo Profundo. No estaba oscuro. Brillaba. Como petróleo ardiendo bajo el agua.\"",
                options: [
                    { id: 'o1', label: 'Son alucinaciones', next: 'n2' },
                    { id: 'o2', label: '¿Qué viste?', next: 'n3' }
                ]
            },
            'n2': {
                id: 'n2',
                text: "\"¿Y si su realidad es más real que esto? Aquí todo sabe a metal. Allí... allí sentí calor.\"",
                options: [
                    { id: 'o2a', label: 'Te estás enfermando', next: null },
                    { id: 'o2r', label: '¿Dónde está ese Pozo?', next: null, resultText: "*Susurra.* \"Debajo del Generador Principal. Donde el ruido tapa los gritos.\"", onclick: (g) => act.unlockRumor(g, 'Rumor: El Pozo Profundo bajo el Generador Principal.') }
                ]
            },
            'n3': {
                id: 'n3',
                text: "\"Vi a la Madre. No tenía cara, pero me sonreía. Dijo que la carne es solo un traje prestado.\"",
                options: [
                    { id: 'o3a', label: 'Anotar incidente', next: 'n4', log: { text: 'Sujeto reporta contacto onírico con entidad "Madre".', icon: 'psychosis' } }
                ]
            },
            'n4': {
                id: 'n4',
                text: "*Se toca las venas del cuello.* \"Pronto me quitaré el traje.\"",
                options: []
            }
        }
    },
    'g_pool_structure_fear': {
        id: 'g_pool_structure_fear',
        tags: ['generic', 'paranoid'],
        root: 'n1',
        nodes: {
            'n1': {
                id: 'n1',
                text: "*Mira al techo con terror.* \"Se están moviendo. Las vigas. Ayer estaban un centímetro más a la izquierda. La estación se está cerrando sobre nosotros.\"",
                options: [
                    { id: 'o1', label: 'Es la presión del agua', next: 'n2' },
                    { id: 'o2', label: 'Cálmate', next: 'n2' }
                ]
            },
            'n2': {
                id: 'n2',
                text: "\"No es el agua. Es digestión. Estamos en el estómago de una bestia de hormigón y acero. Y está empezando a segregar sus jugos.\"",
                options: [
                    { id: 'o2a', label: 'Silencio', next: null }
                ]
            }
        }
    }
};
