import { act } from '../../DialogueActions.js';

export const lore_archivist = {
    id: 'lore_archivist',
    unique: true,
    tags: ['fanatic', 'lore'],
    root: 'la_n1',
    nodes: {
        'la_n1': {
            id: 'la_n1',
            text: "*Su cuerpo es un mapa de cicatrices con texto ilegible.* \"Lee... la historia está en la carne. Cada corte es un día de supervivencia.\" *Te ofrece una lupa.*",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'la_o1', label: 'Leer brazo', next: 'la_n2' },
                { id: 'la_o2', label: 'Rechazar', next: 'la_n3' }
            ]
        },
        'la_n2': {
            id: 'la_n2',
            text: "*Lees: 'Día 402. El agua sabe a ceniza. Kystra ha muerto'.* \"¿Ves? No se puede borrar. La tinta se va, la cicatriz se queda.\"",
            options: [
                { id: 'la_o2a', label: 'Preguntar por Kystra', next: 'la_n4' }
            ]
        },
        'la_n3': {
            id: 'la_n3',
            text: "*Se corta una nueva línea en el pecho con un vidrio.* \"Si no lees, no existes. Escribiré tu ignorancia aquí.\"",
            options: [
                { id: 'la_o3a', label: 'Irse', next: null }
            ]
        },
        'la_n4': {
            id: 'la_n4',
            text: "*Llora sangre.* \"Ella fue la primera en beber. Ahora es parte del ciclo. Todos volveremos al agua.\"",
            options: []
        }
    }
};
