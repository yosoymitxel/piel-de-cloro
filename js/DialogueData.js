export const DialogueData = {
    personalities: ['nervous', 'aggressive', 'stoic', 'confused'],
    // Pools of dialogues (each pool is an independent tree of nodes)
    pools: {
        "generic_01": {
            id: 'generic_01',
            tags: ['nervous', 'generic'],
            unique: false,
            root: 'g1_n1',
            nodes: {
                'g1_n1': {
                    id: 'g1_n1',
                    text: "*{npcName} aparece temblando.* " +
                        "Puedes notar que mira hacia el generador: {generatorStatus}. " +
                        "Rumor: {rumor}",
                    audio: 'ui_dialogue_type',
                    options: [
                        { id: 'g1_o1', label: 'Preguntar por su estado', next: 'g1_n2a', sets: ['asked_health'] },
                        { id: 'g1_o2', label: 'Insistir en su origen', next: 'g1_n2b', sets: ['pressed_origin'] }
                    ]
                },

                'g1_n2a': {
                    id: 'g1_n2a',
                    text: "*Dice que tiene frío y su pulso parece errático.* (Referencia a la elección anterior: {prevChoiceLabel})",
                    options: [
                        { id: 'g1_o2a', label: 'Hacer un test rápido', next: 'g1_n3a', audio: 'tool_thermometer_beep' },
                        { id: 'g1_o2b', label: 'Confiar y admitir', next: 'g1_n3b', sets: ['admitted_trust'] }
                    ]
                },
                'g1_n2b': {
                    id: 'g1_n2b',
                    text: "*Su voz se agita cuando hablas del pasado. " +
                        "Menciona un nombre que no recuerdas exactamente.*",
                    options: [
                        { id: 'g1_o2c', label: 'Presionar más', next: 'g1_n3c', sets: ['press_success'] },
                        { id: 'g1_o2d', label: 'Cambiar tema', next: 'g1_n3d' }
                    ]
                },
                'g1_n3a': {
                    id: 'g1_n3a',
                    text: "El termómetro marca 34.1°C — algo no está bien. *A partir de lo que dijiste ({prevChoiceLabel}), el sujeto parece... diferente.*",
                    options: [
                        { id: 'g1_o3a', label: 'Purgar discretamente', next: 'g1_n4a', sets: ['purged_by_guard'], audio: 'purge_confirm' },
                        { id: 'g1_o3b', label: 'Admitir con observación', next: null, sets: ['admitted_observe'] }
                    ]
                },
                'g1_n3b': {
                    id: 'g1_n3b',
                    text: "*Al confiar, el sujeto sonríe. Su respuesta es vaga, pero sincera.*",
                    options: [
                        { id: 'g1_o3c', label: 'Enviar al refugio', next: null, sets: ['admitted_trust'] },
                        { id: 'g1_o3d', label: 'Mantener en observación', next: 'g1_n4b' }
                    ]
                },
                'g1_n3c': {
                    id: 'g1_n3c',
                    text: "*Logras sacarle información útil. Dice:* 'No confíes en la tubería.'",
                    options: [
                        { id: 'g1_o3e', label: 'Agradecer y decidir', next: 'g1_n4c' }
                    ],
                    onChooseAudio: 'lore_interlude_heard'
                },
                'g1_n3d': {
                    id: 'g1_n3d',
                    text: "*El tema cambia; el sujeto se relaja pero no da más información.*",
                    options: [
                        { id: 'g1_o3f', label: 'Tomar decisión', next: null }
                    ]
                },
                'g1_n4a': {
                    id: 'g1_n4a',
                    text: "Has elegido purgar basándote en la evidencia. La casa recuerda.",
                    options: []
                },
                'g1_n4b': {
                    id: 'g1_n4b',
                    text: "Observación prolongada: quizá no era necesario un juicio inmediato.",
                    options: []
                },
                'g1_n4c': {
                    id: 'g1_n4c',
                    text: "*La información se filtra por la tubería—una voz en el fondo canta algo que no entiendes.*",
                    audio: 'pipes_whisper',
                    options: []
                }
            }
        },
        "generic_02": {
            id: 'generic_02',
            tags: ['confused', 'generic'],
            unique: false,
            root: 'g2_n1',
            nodes: {
                'g2_n1': {
                    id: 'g2_n1',
                    text: "*{npcName} entra con las manos manchadas.* {generatorStatus}",
                    options: [
                        { id: 'g2_o1', label: '¿Qué te pasó?', next: 'g2_n2a', sets: ['asked_injury'] },
                        { id: 'g2_o2', label: 'Aléjate', next: 'g2_n2b', sets: ['rejected'] }
                    ]
                },
                'g2_n2a': {
                    id: 'g2_n2a',
                    text: "*Se arrastra hacia la luz, rascando el metal.* \"El generador... ruge como un animal herido\", susurra. Sabes que miente; lo viste hablar con el anterior guardia.",
                    options: [
                        { id: 'g2_o2a', label: 'Insistir detalles', next: 'g2_n3a' },
                        { id: 'g2_o2b', label: 'Calmarlo', next: 'g2_n3b' }
                    ]
                },
                'g2_n2b': {
                    id: 'g2_n2b',
                    text: "*Se ofende y da un paso atrás; su mirada es extraña.*",
                    options: [
                        { id: 'g2_o2c', label: 'Confrontar', next: 'g2_n3c' },
                        { id: 'g2_o2d', label: 'Retirarte', next: null }
                    ]
                },
                'g2_n3a': {
                    id: 'g2_n3a',
                    text: "*Habla de una voz en las tuberías que le dicta movimientos.* {prevChoiceLabel}",
                    options: [
                        { id: 'g2_o3a', label: 'Detener la entrevista', next: null },
                        { id: 'g2_o3b', label: 'Registrar nota', next: 'g2_n4a', sets: ['noted_voice'], audio: 'pipes_whisper' }
                    ]
                },
                'g2_n3b': {
                    id: 'g2_n3b',
                    text: "*Se tranquiliza y escupe algo blanco; no parece humano.*",
                    options: [
                        { id: 'g2_o3c', label: 'Observar', next: 'g2_n4b' }
                    ]
                },
                'g2_n3c': {
                    id: 'g2_n3c',
                    text: "*La confrontación revela una cicatriz que brilla con sal.*",
                    options: [
                        { id: 'g2_o3d', label: 'Purgar', next: 'g2_n4c', sets: ['purged_by_guard'] },
                        { id: 'g2_o3e', label: 'Regañar', next: null }
                    ]
                },
                'g2_n4a': { id: 'g2_n4a', text: "Notas registradas. El informe se añade al archivo.", options: [{ id: 'g2_o4a1', label: 'Enviar informe', next: 'g2_n5a', requires: ['noted_voice'] }, { id: 'g2_o4a2', label: 'No enviar', next: null }] },
                'g2_n5a': { id: 'g2_n5a', text: "*El informe fue enviado y causa un murmullo en la radio.*", audio: 'lore_interlude_seen', options: [{ id: 'g2_o5a1', label: 'Investigar el origen del murmullo', next: 'g2_n6a' }, { id: 'g2_o5a2', label: 'Ignorar y seguir', next: null }] },
                'g2_n6a': { id: 'g2_n6a', text: "*Sigues la pista y llegas a una vieja estación de radio. Hay marcas en las paredes.*", options: [{ id: 'g2_o6a1', label: 'Examinar marcas', next: 'g2_n7a' }, { id: 'g2_o6a2', label: 'Volver', next: null }] },
                'g2_n7a': { id: 'g2_n7a', text: "*Encuentras un registro con nombres que se repiten. Uno de ellos aparece también en tu memoria.*", options: [{ id: 'g2_o7a1', label: 'Compartir con el grupo', next: null, sets: ['reported_names'] }, { id: 'g2_o7a2', label: 'Guardar en secreto', next: null, sets: ['secret_names'] }] },

                'g2_n4b': { id: 'g2_n4b', text: "Observación prolongada demuestra un patrón repetitivo.", options: [{ id: 'g2_o4b1', label: 'Marcar secuencia', next: 'g2_n5b' }] },
                'g2_n5b': { id: 'g2_n5b', text: "La secuencia sugiere una sincronía con el generador.", options: [{ id: 'g2_o5b1', label: 'Investigar conexión', next: 'g2_n6b' }] },
                'g2_n6b': { id: 'g2_n6b', text: "Al mirar las tuberías cerca del generador encuentras una nota: \"'No confiar en la noche'\"", options: [{ id: 'g2_o6b1', label: 'Leer la nota en voz alta', next: null }] },

                'g2_n4c': { id: 'g2_n4c', text: "*La purga revela marcas extrañas; algo se mueve dentro.*", audio: 'purge_blood_flash', options: [] }
            }
        },

        "generic_03": {
            id: 'generic_03',
            tags: ['aggressive', 'generic'],
            unique: false,
            root: 'g3_n1',
            nodes: {
                'g3_n1': { id: 'g3_n1', text: "*Entra con la mirada cortante; tiene algo clavado en la chaqueta.*", options: [{ id: 'g3_o1', label: 'Interrogar', next: 'g3_n2' }, { id: 'g3_o2', label: 'Retroceder', next: 'g3_n3' }] },
                'g3_n2': { id: 'g3_n2', text: "*Dice palabras fragmentadas sobre 'el ruido' y la 'cosecha'.*", options: [{ id: 'g3_o2a', label: 'Atacar', next: 'g3_n4', sets: ['confronted'] }, { id: 'g3_o2b', label: 'Calmar', next: 'g3_n5' }] },
                'g3_n3': { id: 'g3_n3', text: "*Se retira pero deja una tarjeta con símbolos.*", options: [{ id: 'g3_o3a', label: 'Tomar la tarjeta', next: 'g3_n5' }, { id: 'g3_o3b', label: 'Ignorar', next: null }] },
                'g3_n4': { id: 'g3_n4', text: "*La confrontación degenera; el sujeto escupe sangre y dice* 'no somos lo que pensamos'.", options: [{ id: 'g3_o4a', label: 'Purgar', next: null, sets: ['purged_by_guard'] }, { id: 'g3_o4b', label: 'Agarrar la tarjeta', next: 'g3_n5' }] },
                'g3_n5': { id: 'g3_n5', text: "La tarjeta contiene un verso: 'A quien escuchó, no le fue bien'. Puede que sea una advertencia.", options: [{ id: 'g3_o5a', label: 'Compartir con el radio', next: null, sets: ['shared_warning'] }] }
            }
        },
    },

    // Lore subjects: unique NPCs with fixed, deeper dialogues
    loreSubjects: [
        {
            id: 'lore_witness_01',
            unique: true,
            tags: ['stoic', 'lore'],
            root: 'lw1_n1',
            nodes: {
                'lw1_n1': {
                    id: 'lw1_n1',
                    text: "'Entré en la cámara y la piel ya no era piel', *dice {npcName} con voz baja.* {generatorStatus}",
                    audio: 'lore_interlude_seen',
                    options: [
                        { id: 'lw1_o1', label: 'Preguntar por el origen', next: 'lw1_n2' },
                        { id: 'lw1_o2', label: 'Pedir detalles', next: 'lw1_n3' }
                    ]
                },
                'lw1_n2': {
                    id: 'lw1_n2',
                    text: "*Dice que lo vio en el agua: piel que se disuelve y retorna en patrones; la palabra que usa es* 'memoria húmeda'.",
                    options: [
                        { id: 'lw1_o2a', label: '¿Quién lo vio?', next: 'lw1_n4', sets: ['heard_lore'], audio: 'lore_interlude_heard' },
                        { id: 'lw1_o2b', label: 'Mantener distancia', next: null }
                    ]
                },
                'lw1_n3': {
                    id: 'lw1_n3',
                    text: "*El sujeto recita un verso equivocado. Sus ojos no parpadean. Al terminar, hace una pausa que no parece humana.*",
                    options: [
                        { id: 'lw1_o3a', label: 'Escuchar hasta el final', next: 'lw1_n4', audio: 'lore_final_corrupted' },
                        { id: 'lw1_o3b', label: 'Interrumpir y retirarte', next: null }
                    ]
                },
                'lw1_n4': {
                    id: 'lw1_n4',
                    text: "*Fragmentos de la historia quedan: alguien trajo agua a la ciudad. El nombre que repite es el mismo que te hace temblar.*",
                    options: []
                }
            }
        }
    ]
};
