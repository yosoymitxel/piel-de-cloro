import { act } from '../../DialogueActions.js';

export const lore_archivist = {
    id: 'lore_archivist',
    unique: true,
    tags: ['fanatic', 'lore'],
    root: 'la_n1',
    nodes: {
        'la_n1': {
            id: 'la_n1',
            text: "*Su cuerpo es un mapa de cicatrices con texto ilegible.* \"Lee... la historia está en la carne. Cada corte es un día de supervivencia. ¿Qué capítulo deseas conocer hoy?\" *Te ofrece una lupa.*",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'la_o1', label: 'Leer brazo izquierdo', next: 'la_n2' },
                { id: 'la_o2', label: 'Examinar la espalda', next: 'la_n5' },
                { id: 'la_o3', label: 'Mirar el pecho', next: 'la_n8' },
                { id: 'la_o4', label: 'Rechazar', next: 'la_n3' }
            ]
        },
        'la_n2': {
            id: 'la_n2',
            text: "*La piel está apergaminada. Lees: 'Día 402. El agua sabe a ceniza. Kystra ha muerto'.* \"¿Ves? No se puede borrar. La tinta se va, la cicatriz se queda.\"",
            options: [
                { id: 'la_o2a', label: '¿Quién era Kystra?', next: 'la_n4', sets: ['known_kystra'] },
                { id: 'la_o2b', label: 'Seguir leyendo el brazo', next: 'la_n2_b' }
            ]
        },
        'la_n2_b': {
            id: 'la_n2_b',
            text: "*Más abajo, cerca de la muñeca: 'Día 450. Hemos comido musgo de los filtros. Sabe a hierro'.* \"Tiempos de hambruna. El sabor nunca se va de la boca.\"",
            options: [
                { id: 'la_o2b_1', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n3': {
            id: 'la_n3',
            text: "*Se corta una nueva línea en el pecho con un vidrio.* \"Si no lees, no existes. Escribiré tu ignorancia aquí, junto a los cobardes.\"",
            options: [
                { id: 'la_o3a', label: 'Irse', next: null, onclick: act.leave }
            ]
        },
        'la_n4': {
            id: 'la_n4',
            text: "*Llora sangre.* \"Ella fue la primera en beber directamente del pozo. Dijo que escuchaba el mar. Ahora es parte del ciclo. Todos volveremos al agua.\"",
            options: [
                { id: 'la_o4a', label: '¿Qué pozo?', next: 'la_n4_a' },
                { id: 'la_o4b', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n4_a': {
            id: 'la_n4_a',
            text: "\"El Pozo Profundo. Debajo del generador. Donde las raíces de metal tocan el acuífero primordial. No vayas allí. O ve, y conviértete en tinta.\"",
            options: [
                { id: 'la_o4a_1', label: 'Anotado', next: 'la_n1', sets: ['known_deep_well'] }
            ]
        },
        'la_n5': {
            id: 'la_n5',
            text: "*Te pide que gires. Su espalda es un caos de cortes profundos y quemaduras.* \"Aquí está la rebelión. Cuando intentamos tomar el control de la ventilación.\"",
            options: [
                { id: 'la_o5a', label: '¿Hubo una rebelión?', next: 'la_n6' },
                { id: 'la_o5b', label: 'Tocar una cicatriz quemada', next: 'la_n7' }
            ]
        },
        'la_n6': {
            id: 'la_n6',
            text: "\"Hace tres ciclos de líderes. Queríamos aire puro. Pero el aire puro nos quemaba los pulmones. Nos habíamos adaptado al cloro. La libertad nos asfixió.\"",
            options: [
                { id: 'la_o6a', label: '¿Quién lideraba?', next: 'la_n6_a' },
                { id: 'la_o6b', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n6_a': {
            id: 'la_n6_a',
            text: "\"El Capitán Voren. Sus restos alimentan el reactor ahora. Una combustión lenta y útil. Un final digno.\"",
            options: [
                { id: 'la_o6a_1', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n7': {
            id: 'la_n7',
            text: "*Se estremece de placer.* \"Cuidado. Esa es de cuando el vapor se soltó. Siento el calor todavía. El dolor es memoria. Sin dolor, olvidamos.\"",
            options: [
                { id: 'la_o7a', label: '¿Disfrutas el dolor?', next: 'la_n7_a' },
                { id: 'la_o7b', label: 'Apartar la mano', next: 'la_n1' }
            ]
        },
        'la_n7_a': {
            id: 'la_n7_a',
            text: "\"Disfruto recordar. ¿Tú recuerdas tu primer corte? ¿Tu primera caída? Eso eres tú. Tu colección de daños.\"",
            options: [
                { id: 'la_o7a_1', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n8': {
            id: 'la_n8',
            text: "*El pecho tiene un símbolo grande tallado, aún supurando.* \"El Juramento de Silencio. Lo rompí para hablar contigo. Cada palabra me cuesta sangre.\"",
            options: [
                { id: 'la_o8a', label: '¿Por qué hablar entonces?', next: 'la_n9' },
                { id: 'la_o8b', label: 'No hables más', next: null }
            ]
        },
        'la_n9': {
            id: 'la_n9',
            text: "\"Porque el final del libro se acerca. Y alguien debe leer el epílogo. Tú tienes ojos de lector. Ojos que han visto el abismo.\"",
            options: [
                { id: 'la_o9a', label: '¿Qué final?', next: 'la_n9_a' },
                { id: 'la_o9b', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n9_a': {
            id: 'la_n9_a',
            text: "\"Cuando la tinta cubra toda la página. Cuando no quede piel virgen en el mundo. La Gran Edición. Prepárate.\"",
            options: [
                { id: 'la_o9a_1', label: 'Terminar', next: null, onclick: act.leave }
            ]
        }
    }
};
