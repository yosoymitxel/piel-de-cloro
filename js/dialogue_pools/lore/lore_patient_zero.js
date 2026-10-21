import { act } from '../../DialogueActions.js';

export const lore_patient_zero = {
    id: 'lore_patient_zero',
    unique: true,
    tags: ['lore', 'mysterious', 'patient_zero'],
    clue: "Yo fui el primero. La Madre no busca matarnos, busca refinarnos. El pulso lento es la señal de que la carne se está rindiendo.",
    mechanicHint: "AVISO: Un pulso por debajo de 40 PPM es un indicador crítico de asimilación avanzada.",
    appearanceDay: 4, // Fase 1.2 Roadmap: NPC más importante aparece tarde
    root: 'lpz_n1',
    nodes: {
        'lpz_n1': {
            id: 'lpz_n1',
            text: "*El anciano mantiene las manos a la vista. Las venas negras se mueven bajo la piel, pero su voz es precisa y tranquila.* \"Antes de preguntarme si estoy infectado, dime qué significa esa palabra aquí. ¿Fiebre? ¿Contagio? ¿Algo que ya no puedes tratar como una persona?\"",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'lpz_o1', label: '¿Quién eres?', next: 'lpz_n2' },
                { id: 'lpz_o2', label: 'Estás infectado', next: 'lpz_n3' }
            ]
        },
        'lpz_n2': {
            id: 'lpz_n2',
            text: "\"En los informes me llamaron Paciente Cero porque fui el primero que sobrevivió a la exposición. No fui el primero en encontrarlo. Esa distinción desapareció cuando quemaron los registros del equipo de perforación.\"",
            options: [
                { id: 'lpz_o2a', label: '¿El hielo?', next: 'lpz_n4' },
                { id: 'lpz_o2b', label: '¿Quién era el Cero?', next: 'lpz_n_zero_origin' }
            ]
        },
        'lpz_n3': {
            id: 'lpz_n3',
            text: "\"Puedes llamarlo infección si te ayuda a decidir qué hacer conmigo. Yo lo llamo colonización porque el organismo no se limita a destruir tejido: conserva patrones, recuerdos y respuestas. Eso no demuestra que siga siendo la persona original.\"",
            options: [
                { id: 'lpz_o3a', label: 'Explícate', next: 'lpz_n4' },
                { id: 'lpz_o3b', label: 'Mientes', next: 'lpz_n_deny' }
            ]
        },
        'lpz_n4': {
            id: 'lpz_n4',
            text: "\"El proyecto Horizonte Profundo buscaba agua potable. Encontramos una estructura viva bajo el acuífero y la perforamos. Después, varios trabajadores describieron recuerdos que no eran suyos. El informe final los clasificó como intoxicación. Yo firmé ese informe.\"",
            options: [
                { id: 'lpz_o4a', label: '¿Hay cura?', next: 'lpz_n5' },
                { id: 'lpz_o4b', label: '¿Qué es la memoria líquida?', next: 'lpz_n_liquid' },
                { id: 'lpz_o4c', label: '¿Pozo Profundo?', next: 'lpz_n_deep_well_details', sets: ['known_deep_well'] },
                { id: 'lpz_o4d', label: 'Vete', next: null, resultText: "*Se desvanece en la niebla.* \"La cura es el olvido...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }
            ]
        },
        'lpz_n_deep_well_details': {
            id: 'lpz_n_deep_well_details',
            text: "\"El Útero Negro. Abajo, donde la presión aplasta los submarinos como latas. Allí flotan las ciudades muertas. Y allí... allí sueña Ella.\"",
            options: [
                { id: 'lpz_o_dwd_1', label: '¿Ella?', next: 'lpz_n_mother_hint' },
                { id: 'lpz_o_dwd_2', label: 'Suficiente', next: 'lpz_n5' }
            ]
        },
        'lpz_n_mother_hint': {
            id: 'lpz_n_mother_hint',
            text: "\"La Madre. No la despiertes con tus bombas de cloro. Le gusta el silencio.\"",
            options: [
                { id: 'lpz_o_mh_1', label: 'Entendido', next: 'lpz_n5', sets: ['known_mother'] },
                { id: 'lpz_o_mh_2', label: '¿La Canción?', next: 'lpz_n_song' }
            ]
        },
        'lpz_n_song': {
            id: 'lpz_n_song',
            text: "\"Ah, ¿tú también la oyes? No es sonido. Es resonancia. Tus huesos vibran a la misma frecuencia que el Pozo. Es una nana... para que duermas y te dejes llevar.\"",
            options: [
                { id: 'lpz_o_song_1', label: '¿Cómo paro la música?', next: 'lpz_n_cure_rumor' }
            ]
        },
        'lpz_n_cure_rumor': {
            id: 'lpz_n_cure_rumor',
            text: "\"Dicen... los rumores de los conductos dicen que hay una frecuencia inversa. En la Sala de Control Auxiliar, sellada hace años. El 'Silencio Blanco'. Pero yo creo que es un mito para mantenernos dóciles.\"",
            options: [
                { id: 'lpz_o_cr_1', label: 'Buscaré el Silencio', next: 'lpz_n5', sets: ['rumour_white_silence'] }
            ]
        },
        'lpz_n5': {
            id: 'lpz_n5',
            text: "\"No conozco una cura. Conozco métodos que retrasan algunos síntomas y procedimientos que empeoran otros. El fuego no lo elimina: cambia lo que se dispersa por el aire. Eso lo medimos. Lo que no medimos fue quién respiró después.\"",
            options: [
                { id: 'lpz_o5a', label: 'No te dejaré entrar.', next: null, resultText: "*Asiente lentamente.* \"Ya estoy dentro. En el aire que respiras.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'lpz_o5b', label: 'Te debo revisar primero.', next: null, resultText: "\"Sí, necesito que me revises.\"" },
                { id: 'lpz_o5c_hive', label: '¿La Colmena?', next: 'lpz_n_hive_connection' }
            ]
        },
        'lpz_n_hive_connection': {
            id: 'lpz_n_hive_connection',
            text: "\"Todos somos nodos. Yo fui el primero, pero ahora hay miles. Si escuchas atentamente, puedes oír sus pensamientos superpuestos. Es... ruidoso. Pero nunca estás solo.\"",
            options: [
                { id: 'lpz_o_hc_1', label: 'Prefiero la soledad', next: null, resultText: "\"La soledad es un lujo del pasado.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }
            ]
        },
        'lpz_n_zero_origin': {
            id: 'lpz_n_zero_origin',
            text: "\"No era humano. O ya no lo era. Una masa de... potencial. Lo despertamos con taladros térmicos. Nos agradeció... consumiendo al equipo Beta en segundos.\"",
            options: [
                { id: 'lpz_o_z1', label: 'Horrible', next: 'lpz_n4' }
            ]
        },
        'lpz_n_deny': {
            id: 'lpz_n_deny',
            text: "\"¿Miento? Mírate las manos. ¿No notas las venas un poco más oscuras hoy? ¿No oyes el zumbido cuando hay silencio?\"",
            options: [
                { id: 'lpz_o_d1', label: 'Calla', next: 'lpz_n4' }
            ]
        },
        'lpz_n_liquid': {
            id: 'lpz_n_liquid',
            text: "\"Información sin soporte físico. ADN cuántico. Escribe sobre tu código genético como si fuera tiza en una pizarra. Quiere recordar lo que fuimos, mejor que nosotros.\"",
            options: [
                { id: 'lpz_o_l1', label: 'Fascinante y aterrador', next: 'lpz_n5' }
            ]
        }
    }
};
