import { act } from '../../DialogueActions.js';

export const lore_archivist = {
    id: 'lore_archivist',
    unique: true,
    tags: ['fanatic', 'lore'],
    clue: "Los registros indican que la hemoglobina es la única prueba irrevocable. Los escaneos manuales pueden ser engañados por la distorsión mental.",
    mechanicHint: "DATO: El análisis de sangre ignora las alucinaciones por baja cordura.",
    appearanceDay: 5, // Fase 1.2 Roadmap: NPC tardío para jugadores avanzados
    root: 'la_n1',
    nodes: {
        'la_n1': {
            id: 'la_n1',
            text: "*No levanta la vista de las marcas del brazo. Las cuenta con el pulgar y vuelve a empezar cuando pierde la cuenta.* \"Puse una fecha junto a cada corte. No siempre anoté quién lo hizo. Si buscas una historia ordenada, no la vas a encontrar aquí. Hay nombres tachados y fechas que no coinciden.\"",
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
            text: "*En una marca hay una fecha tachada tres veces.* \"Día 402: Kystra murió. Eso sí lo recuerdo. La causa no. Escribí primero 'fiebre', después 'agua contaminada' y al final 'accidente'. Ninguna versión explica por qué la puerta del filtro estaba cerrada por fuera.\"",
            options: [
                { id: 'la_o2a', label: '¿Quién era Kystra?', next: 'la_n4', sets: ['known_kystra'] },
                { id: 'la_o2b', label: 'Seguir leyendo el brazo', next: 'la_n2_b' }
            ]
        },
        'la_n2_b': {
            id: 'la_n2_b',
            text: "*Cerca de la muñeca se lee: 'Día 450. Comimos musgo de los filtros. Sabe a hierro'.* \"Lo anoté para que nadie volviera a llamarlo alimento. Tres días después lo servían en la cocina como si fuera una receta normal.\"",
            options: [
                { id: 'la_o2b_1', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n3': {
            id: 'la_n3',
            text: "*Toma un trozo de vidrio y se acerca al pecho, pero se detiene antes de cortar.* \"No te voy a obligar a leer. Ya hice eso con otros y solo conseguí que mintieran. Si te vas, al menos no digas que nunca te lo mostré.\"",
            options: [
                { id: 'la_o3a', label: 'Irse', next: null }
            ]
        },
        'la_n4': {
            id: 'la_n4',
            text: "*Se limpia la mejilla con la manga. La sangre deja una línea sobre una fecha.* \"Kystra bebió del pozo después de que el filtro dio la alarma. Dijo que alguien la llamaba desde la tubería. Yo escribí 'fiebre' porque era lo único que el informe aceptaba. Firmé abajo.\"",
            options: [
                { id: 'la_o4a', label: '¿Qué pozo?', next: 'la_n4_a' },
                { id: 'la_o4b', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n4_a': {
            id: 'la_n4_a',
            text: "\"En los planos antiguos figura como Pozo Profundo. El acceso de mantenimiento está debajo del generador, detrás de una puerta que ya no aparece en los mapas nuevos. No sé qué hay al fondo. Nunca bajé.\"",
            options: [
                { id: 'la_o4a_1', label: 'Anotado', next: 'la_n1', sets: ['known_deep_well'] }
            ]
        },
        'la_n5': {
            id: 'la_n5',
            text: "*Se gira. Las cicatrices de la espalda tienen números, no nombres.* \"Esto fue después del motín por la ventilación. El informe dice que nos atacaron desde dentro. Yo estaba en la sala de control: nadie entró. Alguien abrió la compuerta usando una orden válida.\"",
            options: [
                { id: 'la_o5a', label: '¿Hubo una rebelión?', next: 'la_n6' },
                { id: 'la_o5b', label: 'Tocar una cicatriz quemada', next: 'la_n7' }
            ]
        },
        'la_n6': {
            id: 'la_n6',
            text: "\"Voren abrió la compuerta. Dijo que el aire exterior estaba limpio; no tenía ninguna medición para demostrarlo. Tres personas llegaron al corredor y se asfixiaron. Después votamos para culparlo a él. Yo también levanté la mano.\"",
            options: [
                { id: 'la_o6a', label: '¿Quién lideraba?', next: 'la_n6_a' },
                { id: 'la_o6b', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n6_a': {
            id: 'la_n6_a',
            text: "\"El cuerpo de Voren no salió del sector. En el registro figura como material enviado al reactor. No hay firma de autorización, solo mi nota de recepción. Durante meses fingí no recordar quién la escribió.\"",
            options: [
                { id: 'la_o6a_1', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n7': {
            id: 'la_n7',
            text: "*Se aparta cuando una gota de vapor cae sobre su brazo. La piel se contrae, pero no grita.* \"La fuga ocurrió durante el turno de noche. Nos ordenaron esperar a que llegara el supervisor. Esperamos nueve minutos. Las quemaduras tienen el número del turno para que nadie confunda el orden.\"",
            options: [
                { id: 'la_o7a', label: '¿Disfrutas el dolor?', next: 'la_n7_a' },
                { id: 'la_o7b', label: 'Apartar la mano', next: 'la_n1' }
            ]
        },
        'la_n7_a': {
            id: 'la_n7_a',
            text: "\"No disfruto del dolor. Me ayuda a ubicar el recuerdo: la quemadura del hombro fue antes del cierre del sector; esta del costado, después. Si dejo de sentirlas, temo mezclar las dos cosas.\"",
            options: [
                { id: 'la_o7a_1', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n8': {
            id: 'la_n8',
            text: "*Un símbolo pequeño cruza una cicatriz antigua. Lo cubre con la mano al notar que lo miras.* \"Prometí no hablar de lo que encontramos bajo la estación. Rompí la promesa cuando vi que el archivo oficial terminaba tres días antes del accidente. Faltan tres días enteros. Alguien decidió que no ocurrieron.\"",
            options: [
                { id: 'la_o8a', label: '¿Por qué hablar entonces?', next: 'la_n9' },
                { id: 'la_o8b', label: 'No hables más', next: null }
            ]
        },
        'la_n9': {
            id: 'la_n9',
            text: "\"No sé si esto se está acabando. Me cuesta recordar quién me contó cada cosa y quién estaba presente. Si encuentras un documento que contradiga mis marcas, guárdalo. No quiero que mi versión sea la única solo porque fui el último en escribir.\"",
            options: [
                { id: 'la_o9a', label: '¿Qué final?', next: 'la_n9_a' },
                { id: 'la_o9b', label: 'Volver', next: 'la_n1' }
            ]
        },
        'la_n9_a': {
            id: 'la_n9_a',
            text: "\"Alguien llama a esto la Gran Edición: el día en que no quede nadie capaz de corregir los registros. No sé si es una profecía o una amenaza. Desde que empezó el nombre, cada semana desaparece otra carpeta.\"",
            options: [
                { id: 'la_o9a_1', label: 'Terminar', next: null }
            ]
        }
    }
};
