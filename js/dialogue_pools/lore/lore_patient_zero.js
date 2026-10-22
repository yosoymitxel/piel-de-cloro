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
            text: "*El anciano mantiene las manos a la vista. Tiene venas oscuras en las muñecas, pero habla con calma.* \"Antes de decir que estoy infectado, dime qué criterio estás usando. ¿Temperatura, pulso, reacción a la luz? Si la respuesta es solo mi aspecto, no estás haciendo una evaluación.\"",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'lpz_o1', label: '¿Quién eres?', next: 'lpz_n2' },
                { id: 'lpz_o2', label: 'Estás infectado', next: 'lpz_n3' }
            ]
        },
        'lpz_n2': {
            id: 'lpz_n2',
            text: "\"Me llamaron Paciente Cero porque fui el primero que sobrevivió a la exposición. No fui el primero en encontrar el organismo. El registro de perforación lo menciona seis días antes de mi ingreso. Yo vi ese registro y aprobé que lo retiraran del archivo.\"",
            options: [
                { id: 'lpz_o2a', label: '¿El hielo?', next: 'lpz_n4' },
                { id: 'lpz_o2b', label: '¿Quién era el Cero?', next: 'lpz_n_zero_origin' }
            ]
        },
        'lpz_n3': {
            id: 'lpz_n3',
            text: "\"En el informe usé la palabra 'colonización'. La elegí porque el tejido seguía funcionando después de que la infección destruyera partes del sistema nervioso. Eso no demuestra que la persona siguiera allí. Quería que el comité retrasara la orden de incineración; esa fue mi razón, no una certeza médica.\"",
            options: [
                { id: 'lpz_o3a', label: 'Explícate', next: 'lpz_n4' },
                { id: 'lpz_o3b', label: 'Mientes', next: 'lpz_n_deny' }
            ]
        },
        'lpz_n4': {
            id: 'lpz_n4',
            text: "\"El proyecto Horizonte Profundo buscaba agua potable. Perforamos el acuífero y encontramos tejido organizado en capas. Después, cuatro trabajadores describieron recuerdos que no eran suyos. Yo firmé el diagnóstico de intoxicación porque no teníamos una prueba aceptada para otra explicación.\"",
            options: [
                { id: 'lpz_o4a', label: '¿Hay cura?', next: 'lpz_n5' },
                { id: 'lpz_o4b', label: '¿Qué es la memoria líquida?', next: 'lpz_n_liquid' },
                { id: 'lpz_o4c', label: '¿Pozo Profundo?', next: 'lpz_n_deep_well_details', sets: ['known_deep_well'] },
                { id: 'lpz_o4d', label: 'Vete', next: null, resultText: "*Se desvanece en la niebla.* \"La cura es el olvido...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }
            ]
        },
        'lpz_n_deep_well_details': {
            id: 'lpz_n_deep_well_details',
            text: "\"El Útero Negro era el nombre informal del hueco bajo el acuífero. Los equipos de presión dejaron de enviar datos a cierta profundidad. Las historias sobre ciudades sumergidas aparecieron después, cuando ya no podíamos comprobar qué había abajo.\"",
            options: [
                { id: 'lpz_o_dwd_1', label: '¿Ella?', next: 'lpz_n_mother_hint' },
                { id: 'lpz_o_dwd_2', label: 'Suficiente', next: 'lpz_n5' }
            ]
        },
        'lpz_n_mother_hint': {
            id: 'lpz_n_mother_hint',
            text: "\"Los técnicos llamaban 'Madre' a la señal que aparecía en los sensores. Nunca probamos que fuera un ser ni que entendiera nuestras acciones. Aun así, yo autoricé el uso de cloro. La señal cambió después del primer tratamiento; no sabemos si fue una reacción o una coincidencia.\"",
            options: [
                { id: 'lpz_o_mh_1', label: 'Entendido', next: 'lpz_n5', sets: ['known_mother'] },
                { id: 'lpz_o_mh_2', label: '¿La Canción?', next: 'lpz_n_song' }
            ]
        },
        'lpz_n_song': {
            id: 'lpz_n_song',
            text: "\"No es una canción en el sentido acústico. Los sensores registran una vibración de baja frecuencia que se transmite por el suelo y las tuberías. Algunos pacientes dicen reconocerla. No tengo pruebas de que sea un mensaje, aunque yo también la he oído cuando el equipo está desconectado.\"",
            options: [
                { id: 'lpz_o_song_1', label: '¿Cómo paro la música?', next: 'lpz_n_cure_rumor' }
            ]
        },
        'lpz_n_cure_rumor': {
            id: 'lpz_n_cure_rumor',
            text: "\"Hay un informe sobre una señal inversa en la Sala de Control Auxiliar. El proyecto la llamó 'Silencio Blanco', pero nunca se completó una prueba clínica. Puede reducir la actividad del tejido, puede no hacer nada. No la llames cura hasta que alguien sobreviva a un ensayo controlado.\"",
            options: [
                { id: 'lpz_o_cr_1', label: 'Buscaré el Silencio', next: 'lpz_n5', sets: ['rumour_white_silence'] }
            ]
        },
        'lpz_n5': {
            id: 'lpz_n5',
            text: "\"No conozco una cura. Algunas intervenciones retrasan los síntomas; otras los empeoran. Quemar el tejido tampoco lo elimina: encontramos partículas en el filtro después de la combustión. Aprobé ese procedimiento antes de revisar los resultados.\"",
            options: [
                { id: 'lpz_o5a', label: 'No te dejaré entrar.', next: null, resultText: "*Asiente lentamente.* \"Ya estoy dentro. En el aire que respiras.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'lpz_o5b', label: 'Te debo revisar primero.', next: null, resultText: "\"Sí, necesito que me revises.\"" },
                { id: 'lpz_o5c_hive', label: '¿La Colmena?', next: 'lpz_n_hive_connection' }
            ]
        },
        'lpz_n_hive_connection': {
            id: 'lpz_n_hive_connection',
            text: "\"Los registros muestran patrones de actividad compartidos entre pacientes que no se conocían. No puedo afirmar que compartan pensamientos. Yo fui el primero en describirlo y también fui quien convenció al comité de ignorarlo durante dos semanas.\"",
            options: [
                { id: 'lpz_o_hc_1', label: 'Prefiero la soledad', next: null, resultText: "\"La soledad es un lujo del pasado.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }
            ]
        },
        'lpz_n_zero_origin': {
            id: 'lpz_n_zero_origin',
            text: "\"El equipo Beta encontró una masa organizada en la perforación inferior. Los taladros térmicos elevaron su temperatura y la estructura se movió. Tres trabajadores murieron antes de cerrar la cámara. El informe atribuyó las muertes a una fuga de presión; yo sabía que esa explicación no bastaba.\"",
            options: [
                { id: 'lpz_o_z1', label: 'Horrible', next: 'lpz_n4' }
            ]
        },
        'lpz_n_deny': {
            id: 'lpz_n_deny',
            text: "\"¿Crees que miento? Revisa tus datos: temperatura, pulso, reflejo pupilar. Si no los has medido, no tienes un diagnóstico. Si ya los mediste y aun así no me crees, entonces no estás buscando evidencia: estás buscando permiso para decidir.\"",
            options: [
                { id: 'lpz_o_d1', label: 'Calla', next: 'lpz_n4' }
            ]
        },
        'lpz_n_liquid': {
            id: 'lpz_n_liquid',
            text: "\"En mis notas usé 'memoria líquida' como nombre provisional para el material que alteraba la actividad neuronal en las muestras. 'ADN cuántico' fue una expresión de un informe posterior; no es un término aceptado y no debí repetirlo como si explicara el mecanismo.\"",
            options: [
                { id: 'lpz_o_l1', label: 'Fascinante y aterrador', next: 'lpz_n5' }
            ]
        }
    }
};
