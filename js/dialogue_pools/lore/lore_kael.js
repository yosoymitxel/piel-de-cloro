import { act } from '../../DialogueActions.js';

export const lore_kael = {
    id: 'lore_kael',
    unique: true,
    tags: ['stoic', 'lore', 'body_horror'],
    clue: "La Anomalía actual es sensible a la luz UV intensa. El sensor de temperatura puede fallar bajo interferencia.",
    mechanicHint: "BONUS: Revela que la anomalía es de tipo 'Fotófoba'.",
    appearanceDay: 3, // Fase 1.2 Roadmap: NPCs lore aparecen después de día 3
    root: 'lk_n1',
    nodes: {
        'lk_n1': {
            id: 'lk_n1',
            text: "*La cara está atrapada en la pared. Un cable entra bajo la mandíbula y se pierde detrás del panel.* \"No tires de él. La última persona que lo intentó dejó de respirar antes de soltarlo.\" *Una luz de estado cambia de verde a ámbar.* \"Eso pasa cuando me asusto. O cuando el sistema cree que me asusté.\"",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'lk_o1', label: '¿Cómo pasó esto?', next: 'lk_n2' },
                { id: 'lk_o2', label: 'Intentar liberarlo', next: 'lk_n3' },
                { id: 'lk_o3_mother', label: '¿Conoces a la Madre?', next: 'lk_n_mother_reaction', req: ['known_mother'] }
            ]
        },
        'lk_n2': {
            id: 'lk_n2',
            text: "\"Me apoyé aquí durante un apagón. La pared se cerró sobre mi espalda y no pude moverme. Después el panel empezó a responder antes de que tocara los controles. Al principio pensé que alguien lo manejaba desde otra sala. Ya revisé el cableado: no hay otra sala conectada.\"",
            options: [
                { id: 'lk_o2a', label: '¿Qué controlas?', next: 'lk_n4', sets: ['heard_lore'] },
                { id: 'lk_o2b', label: '¿Qué sientes?', next: 'lk_n5' },
                { id: 'lk_o2c', label: '¿Hay otros?', next: 'lk_n6' },
                { id: 'lk_o2d', label: 'El Plano Maestro', next: 'lk_n_blueprint' }
            ]
        },
        'lk_n_blueprint': {
            id: 'lk_n_blueprint',
            text: "\"El Plano Maestro no estaba en el servidor. Lo encontré grabado en una placa debajo del suelo. Los pasillos más antiguos continúan por debajo de los cimientos, aunque los planos dicen que allí solo hay roca. Si vas a bajar, lleva un medidor de presión.\"",
            options: [
                { id: 'lk_o_bp1', label: '¿Hacia adentro?', next: 'lk_n_sector0' },
                { id: 'lk_o_bp2', label: 'Volver', next: 'lk_n2' }
            ]
        },
        'lk_n_sector0': {
            id: 'lk_n_sector0',
            text: "\"Sector 0. El registro de obra salta del nivel uno al nivel dos. Falta el plano de cimentación y alguien borró la fecha de instalación de la primera viga. No sé qué había allí; solo sé que tres equipos pidieron traslado después de trabajar en ese sector.\"",
            options: [
                { id: 'lk_o_s0_1', label: '¿Qué tocó?', next: 'lk_n4_a', sets: ['rumour_sector_zero'] }
            ]
        },
        'lk_n_mother_reaction': {
            id: 'lk_n_mother_reaction',
            text: "*El pasillo vibra y las luces pasan a rojo.* \"No repitas ese nombre cerca de los conductos. Cada vez que lo hago, la presión sube en tres sectores a la vez. Puede ser una respuesta del sistema, una coincidencia o algo que todavía no puedo medir. No voy a probarlo otra vez.\"",
            options: [
                { id: 'lk_o_mr1', label: 'Calma', next: 'lk_n1' }
            ]
        },
        'lk_n3': {
            id: 'lk_n3',
            text: "*Grita cuando tocas la unión de carne y metal. Un líquido oscuro sale de la junta.* \"¡No lo saques! Esa pieza sostiene el dintel. Si se rompe, el corredor puede caer.\" *El panel marca una pérdida de presión.* \"No sé si estoy conectado a la estructura o si la estructura está creciendo alrededor de mí.\"",
            options: [
                { id: 'lk_o3a', label: 'Retroceder', next: 'lk_n2' }
            ]
        },
        'lk_n4': {
            id: 'lk_n4',
            text: "*Las luces bajan cuando cierra el ojo humano.* \"Puedo leer los sensores y desviar parte del aire. No controlo la estación entera. Cuando me altero, la presión sube en los conductos; todavía no sé si la provoco yo o si el sistema detecta algo antes que yo.\"",
            options: [
                { id: 'lk_o4a', label: 'Sobre el aire', next: 'lk_n4_a' },
                { id: 'lk_o4b', label: 'Sobre el miedo', next: 'lk_n4_b' }
            ]
        },
        'lk_n4_a': {
            id: 'lk_n4_a',
            text: "\"El aire del conducto inferior huele a metal caliente. La temperatura sube incluso con los ventiladores apagados. Lo anoté tres veces; los informes dicen que el sensor está defectuoso, pero los otros dos marcan lo mismo.\"",
            options: [
                { id: 'lk_o4a_1', label: 'Entendido', next: 'lk_n1' }
            ]
        },
        'lk_n4_b': {
            id: 'lk_n4_b',
            text: "\"Cuando la gente corre, el generador recibe más carga. No porque el miedo produzca electricidad: las bombas se activan, las puertas se bloquean y el sistema intenta compensar. La estación consume más justo cuando todos creen que está ganando fuerza.\"",
            options: [
                { id: 'lk_o4b_1', label: 'Perturbador', next: 'lk_n1' }
            ]
        },
        'lk_n5': {
            id: 'lk_n5',
            text: "\"El sensor acústico registra pasos en el Sector 4, pero el acelerómetro del suelo no detecta movimiento. También hay un pulso en las tuberías cada once segundos. Si es una bomba, no figura en el inventario. Si es un organismo, no sé cómo sigue vivo ahí abajo.\"",
            options: [
                { id: 'lk_o5a', label: '¿Qué latido?', next: 'lk_n5_a', sets: ['known_heartbeat'] },
                { id: 'lk_o5b', label: 'Volver', next: 'lk_n2' }
            ]
        },
        'lk_n5_a': {
            id: 'lk_n5_a',
            text: "\"Once segundos entre pulsos. El intervalo no cambia cuando apagamos las bombas. Ayer el patrón pasó de tres golpes a dos. No sé qué significa, pero empezó después de que abrieron la compuerta inferior.\"",
            options: [
                { id: 'lk_o5a_1', label: 'Anotado', next: 'lk_n2' }
            ]
        },
        'lk_n6': {
            id: 'lk_n6',
            text: "\"Hay voces detrás de los paneles. Algunas usan nombres que solo aparecen en registros antiguos. He abierto tres secciones: encontré cableado, tejido y espacio vacío. Ninguna explicación sirve para las tres.\"",
            options: [
                { id: 'lk_o6a', label: '¿Piel de Cloro?', next: 'lk_n6_a' },
                { id: 'lk_o6b', label: 'Basta', next: null }
            ]
        },
        'lk_n6_a': {
            id: 'lk_n6_a',
            text: "\"El protocolo de limpieza llama 'blanqueo' al proceso. Después de cada ciclo, desaparecen nombres de los terminales y los trabajadores dejan de reconocer sus propias claves. El sistema lo registra como corrección de errores. Yo no creo que sea un error.\"",
            options: [
                { id: 'lk_o6a_1', label: 'Me voy', next: null }
            ]
        }
    }
};
