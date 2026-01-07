export const DialogueData = {
    personalities: ['nervous', 'aggressive', 'stoic', 'confused', 'fanatic', 'broken', 'body_horror'],
    // Pools of dialogues (each pool is an independent tree of nodes)
    pools: {
        // 1. THE SCRATCHER (El que se rasca)
        "gen_scratch": {
            id: 'gen_scratch',
            tags: ['nervous', 'body_horror'],
            unique: false,
            root: 'gs_n1',
            nodes: {
                'gs_n1': {
                    id: 'gs_n1',
                    text: "*Se rasca el antebrazo con uñas negras hasta sangrar.* \"Hay algo debajo... caminando bajo mi dermis.\" *El olor a cobre es intenso en el aire.*",
                    options: [
                        { id: 'gs_o1', label: 'Examinar brazo', next: 'gs_n2a' },
                        { id: 'gs_o2', label: 'Ofrecer vendaje', next: 'gs_n2b' }
                    ]
                },
                'gs_n2a': {
                    id: 'gs_n2a',
                    text: "*La piel se ondula visiblemente; algo se mueve contra la corriente sanguínea.* \"No es una vena... las venas no tienen dientes.\" *Dicen que el agua del nivel 3 trajo los parásitos.*",
                    options: [
                        { id: 'gs_o2a', label: 'Sajadura de emergencia', next: 'gs_n3a', sets: ['performed_surgery'] },
                        { id: 'gs_o2b', label: 'Retroceder asqueado', next: 'gs_n3b' }
                    ]
                },
                'gs_n2b': {
                    id: 'gs_n2b',
                    text: "*Rechaza la venda violentamente, arañando la tela.* \"¡Lo asfixias! ¡Necesita respirar!\" *Sus ojos están inyectados en ictericia.*",
                    options: [
                        { id: 'gs_o2c', label: 'Someter', next: 'gs_n3b' },
                        { id: 'gs_o2d', label: 'Observar', next: 'gs_n3a' }
                    ]
                },
                'gs_n3a': {
                    id: 'gs_n3a',
                    text: "*Al abrir la piel, brota un líquido gris y espeso que sisea al tocar el suelo.* \"¡Lo liberaste! ¡Ahora está en el aire!\" *El vapor huele a amoníaco.*",
                    options: [{ id: 'gs_o3a', label: 'Expulsar del sector', next: null, resultText: "*Huye hacia la oscuridad convulsionando, mientras el líquido gris gotea tras él.* \"Volveré... cuando duermas...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gs_o3b', label: 'Testear fluido', next: 'gs_n4b' }]
                },
                'gs_n3b': {
                    id: 'gs_n3b',
                    text: "*Se arranca una tira de piel, revelando músculo palpitante.* \"Mira... es hermoso...\" *Se ríe con burbujas de sangre.*",
                    options: [{ id: 'gs_o3b', label: 'Ahuyentar', next: null, resultText: "*Huye hacia la oscuridad convulsionando, mientras el líquido gris gotea tras él.* \"Volveré... cuando duermas...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gs_o3c', label: 'Testear y admitir', next: 'gs_n4b' }]
                },
                'gs_n4b': {
                    id: 'gs_n4b',
                    text: "*El análisis confirma parásitos activos, pero aislables.*",
                    options: [{ id: 'gs_o4b1', label: 'Admitir (Riesgo)', next: null, sets: ['admitted'] }, { id: 'gs_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 2. THE LEAKER (El que gotea)
        "gen_leak": {
            id: 'gen_leak',
            tags: ['fanatic', 'body_horror'],
            unique: false,
            root: 'gl_n1',
            nodes: {
                'gl_n1': {
                    id: 'gl_n1',
                    text: "*Líquido negro gotea de su lagrimal, manchando su camisa.* \"Lloro aceite... la máquina me acepta como su hijo.\" *El generador zumba en aprobación.*",
                    options: [
                        { id: 'gl_o1', label: 'Analizar fluido', next: 'gl_n2a' },
                        { id: 'gl_o2', label: 'Cuestionar cordura', next: 'gl_n2b' }
                    ]
                },
                'gl_n2a': {
                    id: 'gl_n2a',
                    text: "*Tose una flema viscosa en tu mano si te acercas.* \"Es el bautismo... ¿no hueles la santidad del óxido?\" *Rumores dicen que beben del cárter.*",
                    options: [
                        { id: 'gl_o2a', label: 'Limpiarse y amenazar', next: 'gl_n3a' },
                        { id: 'gl_o2b', label: 'Preguntar por el rito', next: 'gl_n3b' }
                    ]
                },
                'gl_n2b': {
                    id: 'gl_n2b',
                    text: "*Se frota el fluido por la cara como pintura de guerra.* \"¿Locura? Es evolución. Tú eres el obsoleto.\" *Su piel brilla, grasienta.*",
                    options: [
                        { id: 'gl_o2c', label: 'Declarar contaminado', next: 'gl_n3a' }
                    ]
                },
                'gl_n3a': {
                    id: 'gl_n3a',
                    text: "*Se lanza hacia ti intentando mancharte con sus secreciones.* \"¡Deja que te unja! ¡Sé uno con el engranaje!\"",
                    options: [{ id: 'gl_o3a', label: 'Echar a patadas', next: null, resultText: "*Se aleja ahogándose en sus propios fluidos, buscando otra entrada.* \"El tanque... se desborda...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gl_o3b', label: 'Testear', next: 'gl_n4b' }]
                },
                'gl_n3b': {
                    id: 'gl_n3b',
                    text: "*Sonríe, mostrando dientes negros.* \"La Gran Válvula se abrirá... y todos nos ahogaremos en su gracia.\"",
                    options: [{ id: 'gl_o3c', label: 'Cerrar puerta', next: null, resultText: "*Se aleja ahogándose en sus propios fluidos, buscando otra entrada.* \"El tanque... se desborda...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gl_o3d', label: 'Testear', next: 'gl_n4b' }]
                },
                'gl_n4b': {
                    id: 'gl_n4b',
                    text: "*El fluido es aceite industrial mezclado con sangre. Tóxico pero no contagioso.*",
                    options: [{ id: 'gl_o4b1', label: 'Admitir', next: null, sets: ['admitted'] }, { id: 'gl_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 3. THE LISTENER (El que escucha)
        "gen_whisper": {
            id: 'gen_whisper',
            tags: ['paranoid', 'generic'],
            unique: false,
            root: 'gw_n1',
            nodes: {
                'gw_n1': {
                    id: 'gw_n1',
                    text: "*Pega la oreja a la tubería caliente, ignorando la quemadura.* \"Shhh... están cantando la lista de nombres.\" *La tubería vibra levemente.*",
                    options: [
                        { id: 'gw_o1', label: 'Escuchar también', next: 'gw_n2a' },
                        { id: 'gw_o2', label: 'Alejarlo', next: 'gw_n2b' }
                    ]
                },
                'gw_n2a': {
                    id: 'gw_n2a',
                    text: "*Solo oyes vapor, pero él asiente frenéticamente.* \"Dicen tu nombre... dicen que estás vacío por dentro.\" *Una vieja superstición de los mineros.*",
                    options: [
                        { id: 'gw_o2a', label: 'Negar', next: 'gw_n3a' },
                        { id: 'gw_o2b', label: 'Preguntar qué más dicen', next: 'gw_n3b' }
                    ]
                },
                'gw_n2b': {
                    id: 'gw_n2b',
                    text: "*Se golpea la cabeza contra el metal.* \"¡No puedo dejar de oírlo si me alejas! ¡Gritan!\" *Sangre mancha el óxido.*",
                    options: [
                        { id: 'gw_o2c', label: 'Sedar', next: 'gw_n4a' }
                    ]
                },
                'gw_n3a': {
                    id: 'gw_n3a',
                    text: "*Grita a la pared, desgarrándose la garganta.* \"¡Cállense! ¡No le diré nada! ¡Él no sabe!\"",
                    options: [{ id: 'gw_o3a', label: 'Gritar para que se vaya', next: null, resultText: "*Huye tapándose los oídos, perdiéndose en el pasillo.* \"El ruido... me ha encontrado...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gw_o3b', label: 'Testear', next: 'gw_n4b' }]
                },
                'gw_n3b': {
                    id: 'gw_n3b',
                    text: "*Susurra con voz que no es la suya.* \"La purga no limpia... solo alimenta al suelo.\" *Sientes un escalofrío.*",
                    options: [{ id: 'gw_o3c', label: 'Ignorar y cerrar', next: null, resultText: "*Huye tapándose los oídos, perdiéndose en el pasillo.* \"El ruido... me ha encontrado...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gw_o3d', label: 'Testear', next: 'gw_n4b' }]
                },
                'gw_n4b': {
                    id: 'gw_n4b',
                    text: "*No muestra signos físicos de infección, solo psicosis auditiva.*",
                    options: [{ id: 'gw_o4b1', label: 'Admitir', next: null, sets: ['admitted'] }, { id: 'gw_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 4. THE MOLDER (El mohoso)
        "gen_mold": {
            id: 'gen_mold',
            tags: ['sick', 'body_horror'],
            unique: false,
            root: 'gm_n1',
            nodes: {
                'gm_n1': {
                    id: 'gm_n1',
                    text: "*Esporas caen de su cabello cuando se mueve.* \"El aire aquí... es fértil, ¿verdad?\" *Huele a tierra mojada y podredumbre.*",
                    options: [
                        { id: 'gm_o1', label: 'Examinar piel', next: 'gm_n2a' },
                        { id: 'gm_o2', label: 'Ofrecer máscara', next: 'gm_n2b' }
                    ]
                },
                'gm_n2a': {
                    id: 'gm_n2a',
                    text: "*Muestra un parche verde aterciopelado en el cuello.* \"Mi jardín... florece en la oscuridad. No duele, solo... conecta.\" *La infección parece sistémica.*",
                    options: [
                        { id: 'gm_o2a', label: 'Quemar esporas', next: 'gm_n3a' },
                        { id: 'gm_o2b', label: 'Tomar muestra', next: 'gm_n3b' }
                    ]
                },
                'gm_n2b': {
                    id: 'gm_n2b',
                    text: "*Toma la máscara y la llena de una sustancia negra antes de ponérsela.* \"Filtro... para que ellos no escapen.\" *Su respiración es gorgoteante.*",
                    options: [{ id: 'gm_o2c', label: 'Purgar', next: 'gm_n4a' }]
                },
                'gm_n3a': {
                    id: 'gm_n3a',
                    text: "*Intenta soplar una nube de polvo amarillo hacia ti.* \"¡Respira! ¡Sé tierra para ellos!\" *La alarma de toxicidad se dispara.*",
                    options: [{ id: 'gm_o3a', label: 'Activar ventilación (Echar)', next: null, resultText: "*Se retira arrastrándose, buscando un lugar húmedo donde echar raíces.* \"Raíces... profundas...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gm_o3b', label: 'Testear', next: 'gm_n4b' }]
                },
                'gm_n3b': {
                    id: 'gm_n3b',
                    text: "*Se arranca el parche, dejando un hueco fibroso.* \"Toma... plántalo en tus pulmones.\" *Te ofrece el trozo de carne.*",
                    options: [{ id: 'gm_o3c', label: 'Cerrar compuerta', next: null, resultText: "*Se retira arrastrándose, buscando un lugar húmedo donde echar raíces.* \"Raíces... profundas...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gm_o3d', label: 'Testear', next: 'gm_n4b' }]
                },
                'gm_n4b': {
                    id: 'gm_n4b',
                    text: "*Esporas altamente contagiosas detectadas. Peligro biológico.*",
                    options: [{ id: 'gm_o4b1', label: 'Admitir (Peligro)', next: null, sets: ['admitted_infected'] }, { id: 'gm_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 5. THE TOOTHLESS (El desdentado)
        "gen_teeth": {
            id: 'gen_teeth',
            tags: ['nervous', 'pain'],
            unique: false,
            root: 'gt_n1',
            nodes: {
                'gt_n1': {
                    id: 'gt_n1',
                    text: "*Juega obsesivamente con un diente flojo.* \"Vibran... reciben señales del exterior. No me dejan dormir.\" *Su boca es un desastre de sangre seca.*",
                    options: [
                        { id: 'gt_o1', label: 'Detenerlo', next: 'gt_n2a' },
                        { id: 'gt_o2', label: 'Preguntar por la señal', next: 'gt_n2b' }
                    ]
                },
                'gt_n2a': {
                    id: 'gt_n2a',
                    text: "*Escupe un molar en su mano y te lo muestra.* \"La transmisión se corta si los saco. ¿Ves el cable?\" *No hay cable, solo nervio.*",
                    options: [
                        { id: 'gt_o2a', label: 'Confiscar diente', next: 'gt_n3a' },
                        { id: 'gt_o2b', label: 'Ignorar delirio', next: 'gt_n3b' }
                    ]
                },
                'gt_n2b': {
                    id: 'gt_n2b',
                    text: "*Sonríe con encías sangrantes.* \"Dicen que la purga es una mentira. Que nos reciclan.\" *Rumor peligroso.*",
                    options: [{ id: 'gt_o2c', label: 'Reportar herejía', next: 'gt_n4a' }]
                },
                'gt_n3a': {
                    id: 'gt_n3a',
                    text: "*Se lanza a morderte con las encías.* \"¡Devuélveme mi receptor! ¡No oigo al Amo!\"",
                    options: [{ id: 'gt_o3a', label: 'Empujar fuera', next: null, resultText: "*Se aleja tosiendo sangre y dientes, buscando silencio en otro lado.* \"Glug... silencio...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gt_o3b', label: 'Testear', next: 'gt_n4b' }]
                },
                'gt_n3b': {
                    id: 'gt_n3b',
                    text: "*Empieza a arrancarse otro diente.* \"Uno por uno... silencio... por fin silencio.\"",
                    options: [{ id: 'gt_o3c', label: 'Ignorar', next: null, resultText: "*Se aleja tosiendo sangre y dientes, buscando silencio en otro lado.* \"Glug... silencio...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gt_o3d', label: 'Testear', next: 'gt_n4b' }]
                },
                'gt_n4b': {
                    id: 'gt_n4b',
                    text: "*Sujeto estable, aunque automutilado. Sin patógenos.*",
                    options: [{ id: 'gt_o4b1', label: 'Admitir', next: null, sets: ['admitted'] }, { id: 'gt_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 6. THE SHADOW (El de la sombra)
        "gen_shadow": {
            id: 'gen_shadow',
            tags: ['paranoid', 'dark'],
            unique: false,
            root: 'gsh_n1',
            nodes: {
                'gsh_n1': {
                    id: 'gsh_n1',
                    text: "*Mira su sombra con terror absoluto.* \"No se mueve cuando yo me muevo. Mírala.\" *La luz parpadea.*",
                    options: [
                        { id: 'gsh_o1', label: 'Mirar sombra', next: 'gsh_n2a' },
                        { id: 'gsh_o2', label: 'Iluminar cara', next: 'gsh_n2b' }
                    ]
                },
                'gsh_n2a': {
                    id: 'gsh_n2a',
                    text: "*La sombra parece estirarse hacia ti independientemente de la luz.* \"Quiere cambiar de dueño. Tiene hambre de luz nueva.\" *Sientes frío en los tobillos.*",
                    options: [
                        { id: 'gsh_o2a', label: 'Disparar a la sombra', next: 'gsh_n3a' },
                        { id: 'gsh_o2b', label: 'Racionalizar', next: 'gsh_n3b' }
                    ]
                },
                'gsh_n2b': {
                    id: 'gsh_n2b',
                    text: "*Grita y se cubre los ojos.* \"¡La luz la alimenta! ¡La hace crecer!\" *Se hace un ovillo.*",
                    options: [{ id: 'gsh_o2c', label: 'Apagar linterna', next: 'gsh_n3b' }]
                },
                'gsh_n3a': {
                    id: 'gsh_n3a',
                    text: "*La bala rebota, pero él se retuerce de dolor como si le hubieras dado.* \"¡Le diste a mi alma! ¡La mataste!\"",
                    options: [{ id: 'gsh_o3a', label: 'Iluminar (Ahuyentar)', next: null, resultText: "*Huye de la luz, pero su sombra parece quedarse un segundo más.* \"...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gsh_o3b', label: 'Testear', next: 'gsh_n4b' }]
                },
                'gsh_n3b': {
                    id: 'gsh_n3b',
                    text: "*Se lanza contra la lámpara del pasillo.* \"¡Apágalo! ¡Me va a comer si hay luz!\"",
                    options: [{ id: 'gsh_o3c', label: 'Cerrar puerta', next: null, resultText: "*Huye de la luz, pero su sombra parece quedarse un segundo más.* \"...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gsh_o3d', label: 'Testear', next: 'gsh_n4b' }]
                },
                'gsh_n4b': {
                    id: 'gsh_n4b',
                    text: "*Anomalía visual confirmada. Sin riesgo biológico, posible riesgo psíquico.*",
                    options: [{ id: 'gsh_o4b1', label: 'Admitir', next: null, sets: ['admitted'] }, { id: 'gsh_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 7. THE COLD (El frío)
        "gen_cold": {
            id: 'gen_cold',
            tags: ['sick', 'weak'],
            unique: false,
            root: 'gc_n1',
            nodes: {
                'gc_n1': {
                    id: 'gc_n1',
                    text: "*Tiembla violentamente, labios azules, piel escarchada.* \"El generador... ¿por qué está tan lejos? No llega el calor...\" *Hace 30 grados aquí.*",
                    options: [
                        { id: 'gc_o1', label: 'Tomar temperatura', next: 'gc_n2a' },
                        { id: 'gc_o2', label: 'Dar manta', next: 'gc_n2b' }
                    ]
                },
                'gc_n2a': {
                    id: 'gc_n2a',
                    text: "*El termómetro marca error: bajo cero.* \"La sangre se congela... se vuelve cristal. Siento las agujas dentro.\" *Sus venas se ven negras.*",
                    options: [
                        { id: 'gc_o2a', label: 'Cuarentena térmica', next: 'gc_n3a' },
                        { id: 'gc_o2b', label: 'Alejarse', next: 'gc_n3b' }
                    ]
                },
                'gc_n2b': {
                    id: 'gc_n2b',
                    text: "*La manta se endurece al tocarlo.* \"No sirve... el frío viene de dentro. Del vacío.\" *Sus dientes castañean hasta romperse.*",
                    options: [{ id: 'gc_o2c', label: 'Observar', next: 'gc_n3a' }]
                },
                'gc_n3a': {
                    id: 'gc_n3a',
                    text: "*Intenta abrazarte para robarte calor.* \"¡Dame tu calor! ¡Lo necesito! ¡Arde para mí!\"",
                    options: [{ id: 'gc_o3a', label: 'Echar del umbral', next: null, resultText: "*Se aleja temblando, dejando escarcha en el suelo.* \"Frío... eterno...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gc_o3b', label: 'Testear', next: 'gc_n4b' }]
                },
                'gc_n3b': {
                    id: 'gc_n3b',
                    text: "*Se queda mirando sus manos congeladas.* \"Estatuas de hielo... en el infierno...\"",
                    options: [{ id: 'gc_o3c', label: 'Ignorar', next: null, resultText: "*Se aleja temblando, dejando escarcha en el suelo.* \"Frío... eterno...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gc_o3d', label: 'Testear', next: 'gc_n4b' }]
                },
                'gc_n4b': {
                    id: 'gc_n4b',
                    text: "*Temperatura corporal crítica (22°C). Hipotermia anómala.*",
                    options: [{ id: 'gc_o4b1', label: 'Admitir (Enfermería)', next: null, sets: ['admitted'] }, { id: 'gc_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 8. THE EATER (El comedor de óxido)
        "gen_rust": {
            id: 'gen_rust',
            tags: ['aggressive', 'fanatic'],
            unique: false,
            root: 'gr_n1',
            nodes: {
                'gr_n1': {
                    id: 'gr_n1',
                    text: "*Mastica ruidosamente un trozo de metal oxidado.* \"Hierro... para la sangre. El cuerpo es débil.\" *Sangre le baja por la barbilla.*",
                    options: [
                        { id: 'gr_o1', label: 'Quitar metal', next: 'gr_n2a' },
                        { id: 'gr_o2', label: 'Preguntar por qué', next: 'gr_n2b' }
                    ]
                },
                'gr_n2a': {
                    id: 'gr_n2a',
                    text: "*Te escupe un trozo de tornillo.* \"¡Es mi medicina! ¡Me fortifico contra la corrosión exterior!\" *Su piel tiene tono grisáceo.*",
                    options: [
                        { id: 'gr_o2a', label: 'Someter', next: 'gr_n3a' }
                    ]
                },
                'gr_n2b': {
                    id: 'gr_n2b',
                    text: "*Muestra dientes rotos y encías negras.* \"Para ser como la nave. Duro. Eterno. ¿Quieres?\" *Te ofrece un clavo.*",
                    options: [
                        { id: 'gr_o2b', label: 'Rechazar', next: 'gr_n3b' },
                        { id: 'gr_o2c', label: 'Aceptar (fingir)', next: 'gr_n3b' }
                    ]
                },
                'gr_n3a': {
                    id: 'gr_n3a',
                    text: "*Intenta morderte el brazo.* \"¡Carne blanda! ¡Inútil! ¡Necesitas hierro!\"",
                    options: [{ id: 'gr_o3a', label: 'Amenazar con agua', next: null, resultText: "*Se marcha tosiendo chatarra, buscando metal en otro sector.* \"Duro... demasiado duro...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gr_o3b', label: 'Testear', next: 'gr_n4b' }]
                },
                'gr_n3b': {
                    id: 'gr_n3b',
                    text: "*Se traga el clavo entero.* \"Sentiré cómo baja... rasgando... haciéndome fuerte.\"",
                    options: [{ id: 'gr_o3c', label: 'Ignorar', next: null, resultText: "*Se marcha tosiendo chatarra, buscando metal en otro sector.* \"Duro... demasiado duro...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gr_o3d', label: 'Testear', next: 'gr_n4b' }]
                },
                'gr_n4b': {
                    id: 'gr_n4b',
                    text: "*Niveles de tétanos y metales pesados letales. Peligroso.*",
                    options: [{ id: 'gr_o4b1', label: 'Admitir (Riesgo)', next: null, sets: ['admitted_infected'] }, { id: 'gr_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 9. THE MIMIC (El eco)
        "gen_echo": {
            id: 'gen_echo',
            tags: ['confused', 'uncanny'],
            unique: false,
            root: 'ge_n1',
            nodes: {
                'ge_n1': {
                    id: 'ge_n1',
                    text: "*Te mira sin parpadear, inclinando la cabeza.* \"Te mira sin parpadear...\" *Su voz es plana, sin tono.*",
                    options: [
                        { id: 'ge_o1', label: '¿Quién eres?', next: 'ge_n2a' },
                        { id: 'ge_o2', label: 'Ordenarle parar', next: 'ge_n2b' }
                    ]
                },
                'ge_n2a': {
                    id: 'ge_n2a',
                    text: "*Su cara intenta copiar tu expresión de confusión.* \"¿Quién eres?... ¿Quién eres?...\" *Sus músculos faciales tiemblan.*",
                    options: [
                        { id: 'ge_o2a', label: 'Amenazar', next: 'ge_n3a' }
                    ]
                },
                'ge_n2b': {
                    id: 'ge_n2b',
                    text: "*Repite tus palabras con voz distorsionada, como una radio mal sintonizada.* \"...parar... parar...\" *Se golpea la garganta.*",
                    options: [
                        { id: 'ge_o2b', label: 'Examinar garganta', next: 'ge_n3b' }
                    ]
                },
                'ge_n3a': {
                    id: 'ge_n3a',
                    text: "*Sonríe demasiado ancho, rasgándose las comisuras.* \"Soy tú... mejor que tú. Versión nueva.\"",
                    options: [{ id: 'ge_o3a', label: 'Ahuyentar', next: null, resultText: "*Huye cubriéndose la cara mientras se derrite como cera.* \"No puedo... sostener la forma...\"", cssClass: 'horror-btn-dismiss' }, { id: 'ge_o3b', label: 'Testear', next: 'ge_n4b' }]
                },
                'ge_n3b': {
                    id: 'ge_n3b',
                    text: "*Abre la boca y solo hay estática de radio.* \"Kzzzt... señal... perdida...\"",
                    options: [{ id: 'ge_o3c', label: 'Cortar comunicación', next: null, resultText: "*Huye cubriéndose la cara mientras se derrite como cera.* \"No puedo... sostener la forma...\"", cssClass: 'horror-btn-dismiss' }, { id: 'ge_o3d', label: 'Testear', next: 'ge_n4b' }]
                },
                'ge_n4b': {
                    id: 'ge_n4b',
                    text: "*ADN inestable. No es humano, es una imitación biológica.*",
                    options: [{ id: 'ge_o4b1', label: 'Admitir (Error)', next: null, sets: ['admitted_infected'] }, { id: 'ge_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 10. THE SLEEPLESS (El insomne)
        "gen_sleep": {
            id: 'gen_sleep',
            tags: ['nervous', 'paranoid'],
            unique: false,
            root: 'gsl_n1',
            nodes: {
                'gsl_n1': {
                    id: 'gsl_n1',
                    text: "*Tiene los párpados pegados con cinta adhesiva a la frente.* \"Si cierro los ojos... cambian las paredes. No puedo parpadear.\" *Sus ojos son rojos.*",
                    options: [
                        { id: 'gsl_o1', label: 'Arrancar cinta', next: 'gsl_n2a' },
                        { id: 'gsl_o2', label: 'Preguntar qué ve', next: 'gsl_n2b' }
                    ]
                },
                'gsl_n2a': {
                    id: 'gsl_n2a',
                    text: "*Grita mientras la piel se desgarra.* \"¡No! ¡Entrarán! ¡Los vi mover la puerta cuando pestañeé hace tres días!\"",
                    options: [
                        { id: 'gsl_o2a', label: 'Sedar', next: 'gsl_n3a' }
                    ]
                },
                'gsl_n2b': {
                    id: 'gsl_n2b',
                    text: "*Llora sin poder cerrar los ojos.* \"Veo los huecos entre los segundos. Donde ellos viven.\" *Señala al aire vacío.*",
                    options: [
                        { id: 'gsl_o2b', label: 'Mirar al aire', next: 'gsl_n3b' }
                    ]
                },
                'gsl_n3a': {
                    id: 'gsl_n3a',
                    text: "*Lucha contra el sueño.* \"¡No! ¡Oscuridad no! ¡Me llevarán al sótano!\"",
                    options: [{ id: 'gsl_o3a', label: 'Echar del sector', next: null, resultText: "*Se aleja tambaleándose, luchando por no dormir.* \"Vigilancia... constante...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gsl_o3b', label: 'Testear', next: 'gsl_n4b' }]
                },
                'gsl_n3b': {
                    id: 'gsl_n3b',
                    text: "*Te agarra los párpados.* \"¡No parpadees tú tampoco! ¡Te estoy salvando!\"",
                    options: [{ id: 'gsl_o3c', label: 'Cerrar puerta', next: null, resultText: "*Se aleja tambaleándose, luchando por no dormir.* \"Vigilancia... constante...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gsl_o3d', label: 'Testear', next: 'gsl_n4b' }]
                },
                'gsl_n4b': {
                    id: 'gsl_n4b',
                    text: "*Privación de sueño extrema. Alucinaciones. Inofensivo.*",
                    options: [{ id: 'gsl_o4b1', label: 'Admitir', next: null, sets: ['admitted'] }, { id: 'gsl_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 11. THE TWITCHER (El de los espasmos)
        "gen_twitch": {
            id: 'gen_twitch',
            tags: ['nervous', 'body_horror'],
            unique: false,
            root: 'gtw_n1',
            nodes: {
                'gtw_n1': {
                    id: 'gtw_n1',
                    text: "*Su cuello se sacude violentamente hacia la izquierda cada pocos segundos.* \"No soy yo... son los cables bajo la piel. Tiran de mí.\" *Se oye un crujido cervical.*",
                    options: [
                        { id: 'gtw_o1', label: 'Examinar cuello', next: 'gtw_n2a' },
                        { id: 'gtw_o2', label: 'Sujetar cabeza', next: 'gtw_n2b' }
                    ]
                },
                'gtw_n2a': {
                    id: 'gtw_n2a',
                    text: "*Bajo la piel se ven bultos moviéndose como gusanos de metal.* \"¿Lo ves? Están recableando mi columna. Quieren que mire atrás.\" *Sus ojos giran hacia atrás.*",
                    options: [
                        { id: 'gtw_o2a', label: 'Cortar bulto', next: 'gtw_n3a', sets: ['performed_surgery'] },
                        { id: 'gtw_o2b', label: 'Alejarse', next: 'gtw_n3b' }
                    ]
                },
                'gtw_n2b': {
                    id: 'gtw_n2b',
                    text: "*Grita de dolor cuando intentas detener el tic.* \"¡Si paras el movimiento, la carga se acumula! ¡Explotará!\"",
                    options: [{ id: 'gtw_o2c', label: 'Soltar', next: 'gtw_n3b' }]
                },
                'gtw_n3a': {
                    id: 'gtw_n3a',
                    text: "*Sacas un filamento de cobre ensangrentado.* \"¡Mi antena! ¡Ahora estoy sordo ante Él!\" *Se tambalea llorando estática.*",
                    options: [{ id: 'gtw_o3a', label: 'Expulsar', next: null, resultText: "*Se aleja con espasmos violentos, chocando contra las paredes.* \"...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gtw_o3b', label: 'Testear', next: 'gtw_n4b' }]
                },
                'gtw_n3b': {
                    id: 'gtw_n3b',
                    text: "*El espasmo le tuerce el cuello en un ángulo antinatural.* \"Ahora... miro... atrás...\"",
                    options: [{ id: 'gtw_o3c', label: 'Ignorar', next: null, resultText: "*Se aleja con espasmos violentos, chocando contra las paredes.* \"...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gtw_o3d', label: 'Testear', next: 'gtw_n4b' }]
                },
                'gtw_n4b': {
                    id: 'gtw_n4b',
                    text: "*Implantes mecánicos en la columna. Tecnología desconocida.*",
                    options: [{ id: 'gtw_o4b1', label: 'Admitir (Investigar)', next: null, sets: ['admitted'] }, { id: 'gtw_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 12. THE HUMMER (El sintonizador)
        "gen_hum": {
            id: 'gen_hum',
            tags: ['fanatic', 'stoic'],
            unique: false,
            root: 'ghu_n1',
            nodes: {
                'ghu_n1': {
                    id: 'ghu_n1',
                    text: "*Emite un zumbido grave y constante con la garganta cerrada.* \"Mmmm... calibrando... mmmm... no rompas la frecuencia.\" *El suelo vibra en simpatía.*",
                    options: [
                        { id: 'ghu_o1', label: 'Interrumpir', next: 'ghu_n2a' },
                        { id: 'ghu_o2', label: 'Escuchar tono', next: 'ghu_n2b' }
                    ]
                },
                'ghu_n2a': {
                    id: 'ghu_n2a',
                    text: "*Te mira con odio sin dejar de zumbar, subiendo el volumen hasta que te duelen los dientes.* \"¡MMMMMM! ¡El escudo cae si callo!\"",
                    options: [
                        { id: 'ghu_o2a', label: 'Golpear garganta', next: 'ghu_n3a' }
                    ]
                },
                'ghu_n2b': {
                    id: 'ghu_n2b',
                    text: "*El tono te provoca náuseas y visiones de geometría imposible.* \"Lo ves, ¿verdad? La estructura real detrás del óxido.\" *Sangra por la nariz.*",
                    options: [
                        { id: 'ghu_o2b', label: 'Unirse al zumbido', next: 'ghu_n3b' },
                        { id: 'ghu_o2c', label: 'Alejarse', next: null }
                    ]
                },
                'ghu_n3a': {
                    id: 'ghu_n3a',
                    text: "*Se agarra la garganta, interrumpiendo el zumbido bruscamente.* \"Entran... ya entran...\" *Mira al techo aterrorizado.*",
                    options: [{ id: 'ghu_o3a', label: 'Ahuyentar', next: null, resultText: "*Se marcha zumbando, manteniendo el mundo unido lejos de aquí.* \"Mmmm...\"", cssClass: 'horror-btn-dismiss' }, { id: 'ghu_o3b', label: 'Testear', next: 'ghu_n4b' }]
                },
                'ghu_n3b': {
                    id: 'ghu_n3b',
                    text: "*Ambos vibran en armonía. Sientes que tu piel se vuelve transparente.* \"Somos la onda... somos la señal.\"",
                    options: [{ id: 'ghu_o3c', label: 'Cortar conexión', next: null, resultText: "*Se marcha zumbando, manteniendo el mundo unido lejos de aquí.* \"Mmmm...\"", cssClass: 'horror-btn-dismiss' }, { id: 'ghu_o3d', label: 'Testear', next: 'ghu_n4b' }]
                },
                'ghu_n4b': {
                    id: 'ghu_n4b',
                    text: "*Resonancia craneal anómala. Podría desestabilizar equipos.*",
                    options: [{ id: 'ghu_o4b1', label: 'Admitir (Riesgo)', next: null, sets: ['admitted'] }, { id: 'ghu_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 13. THE DIGGER (El excavador)
        "gen_dig": {
            id: 'gen_dig',
            tags: ['aggressive', 'obsessive'],
            unique: false,
            root: 'gd_n1',
            nodes: {
                'gd_n1': {
                    id: 'gd_n1',
                    text: "*Raspa el suelo metálico con una cuchara afilada.* \"Abajo... el aire limpio está abajo. Debajo de las placas.\" *Hay virutas de metal por todas partes.*",
                    options: [
                        { id: 'gd_o1', label: 'Confiscar cuchara', next: 'gd_n2a' },
                        { id: 'gd_o2', label: 'Preguntar qué hay abajo', next: 'gd_n2b' }
                    ]
                },
                'gd_n2a': {
                    id: 'gd_n2a',
                    text: "*Se lanza a tu cuello con las manos desnudas.* \"¡No me dejarás aquí! ¡Me asfixio! ¡Necesito el núcleo!\"",
                    options: [
                        { id: 'gd_o2a', label: 'Repeler ataque', next: 'gd_n3a' }
                    ]
                },
                'gd_n2b': {
                    id: 'gd_n2b',
                    text: "*Señala una grieta microscópica.* \"El jardín de los pulmones. Donde respiran los dioses muertos. ¿No oyes su exhalación?\"",
                    options: [
                        { id: 'gd_o2b', label: 'Escuchar grieta', next: 'gd_n3b' }
                    ]
                },
                'gd_n3a': {
                    id: 'gd_n3a',
                    text: "*Retrocede de golpe, rompiéndose las uñas contra el suelo.* \"Tan cerca... solo tres metros de acero...\"",
                    options: [{ id: 'gd_o3a', label: 'Patear lejos', next: null, resultText: "*Se va arañando las paredes, buscando otro punto débil.* \"Abre... abre...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gd_o3b', label: 'Testear', next: 'gd_n4b' }]
                },
                'gd_n3b': {
                    id: 'gd_n3b',
                    text: "*Un gas verde sale de la grieta y él lo inhala con éxtasis.* \"Ahhh... dulce espora...\" *Su cara se llena de moho instantáneamente.*",
                    options: [{ id: 'gd_o3c', label: 'Sellar y echar', next: null, resultText: "*Se va arañando las paredes, buscando otro punto débil.* \"Abre... abre...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gd_o3d', label: 'Testear', next: 'gd_n4b' }]
                },
                'gd_n4b': {
                    id: 'gd_n4b',
                    text: "*Contaminación fúngica detectada en ropa y piel.*",
                    options: [{ id: 'gd_o4b1', label: 'Admitir (Descontaminar)', next: null, sets: ['admitted'] }, { id: 'gd_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        },
        // 14. THE MAPPER (El cartógrafo de piel)
        "gen_map": {
            id: 'gen_map',
            tags: ['confused', 'pain'],
            unique: false,
            root: 'gmp_n1',
            nodes: {
                'gmp_n1': {
                    id: 'gmp_n1',
                    text: "*Se dibuja líneas en el brazo con un bolígrafo sin tinta, cortando la piel.* \"Este pasillo va aquí... y esta vena es el túnel de ventilación.\" *Sangre gotea formando un mapa.*",
                    options: [
                        { id: 'gmp_o1', label: 'Ver mapa', next: 'gmp_n2a' },
                        { id: 'gmp_o2', label: 'Vendar', next: 'gmp_n2b' }
                    ]
                },
                'gmp_n2a': {
                    id: 'gmp_n2a',
                    text: "*El mapa en su brazo coincide con el sector, pero hay una habitación extra dibujada en su muñeca.* \"La sala que no está. Donde guardan los ojos.\" *Señala su muñeca pulsante.*",
                    options: [
                        { id: 'gmp_o2a', label: 'Preguntar por la sala', next: 'gmp_n3a' }
                    ]
                },
                'gmp_n2b': {
                    id: 'gmp_n2b',
                    text: "*Te mira confundido.* \"Si tapas el mapa, nos perdemos. La casa cambia si no la escribes.\" *Intenta quitarse la venda.*",
                    options: [
                        { id: 'gmp_o2b', label: 'Impedirlo', next: 'gmp_n3b' }
                    ]
                },
                'gmp_n3a': {
                    id: 'gmp_n3a',
                    text: "*Clava el bolígrafo en la 'sala extra' de su muñeca.* \"Aquí. Entra. Es profunda.\" *La sangre sale a borbotones.*",
                    options: [{ id: 'gmp_o3a', label: 'Testear y curar', next: 'gmp_n4b' }, { id: 'gmp_o3b', label: 'Expulsar', next: null, resultText: "*Se aleja dejando un rastro de sangre que forma un nuevo mapa.* \"La puerta... se cierra...\"", cssClass: 'horror-btn-dismiss' }]
                },
                'gmp_n3b': {
                    id: 'gmp_n3b',
                    text: "*Llora mientras la venda se empapa.* \"Se borró el camino... estamos atrapados en el bucle...\"",
                    options: [{ id: 'gmp_o3c', label: 'Ignorar', next: null, resultText: "*Se aleja dejando un rastro de sangre que forma un nuevo mapa.* \"La puerta... se cierra...\"", cssClass: 'horror-btn-dismiss' }, { id: 'gmp_o3d', label: 'Testear', next: 'gmp_n4b' }]
                },
                'gmp_n4b': {
                    id: 'gmp_n4b',
                    text: "*Heridas autoinfligidas. Sin infección, pero mentalmente inestable.*",
                    options: [{ id: 'gmp_o4b1', label: 'Admitir', next: null, sets: ['admitted'] }, { id: 'gmp_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss' }]
                }
            }
        }
    },

    // Lore subjects: unique NPCs with fixed, deeper dialogues
    loreSubjects: [
        // LORE 1: KAEL, THE WALL-MERGED
        {
            id: 'lore_kael',
            unique: true,
            tags: ['stoic', 'lore', 'body_horror'],
            root: 'lk_n1',
            nodes: {
                'lk_n1': {
                    id: 'lk_n1',
                    text: "*Un rostro sobresale de la pared de metal, la piel fusionada con el acero.* \"La arquitectura... me abraza. Ya no necesito caminar.\" *Cables entran por su cuello.*",
                    audio: 'lore_interlude_seen',
                    options: [
                        { id: 'lk_o1', label: '¿Cómo pasó esto?', next: 'lk_n2' },
                        { id: 'lk_o2', label: 'Intentar liberarlo', next: 'lk_n3' }
                    ]
                },
                'lk_n2': {
                    id: 'lk_n2',
                    text: "*Sonríe, y chispas saltan de sus dientes.* \"Me apoyé demasiado tiempo. La casa sintió mi cansancio y me sostuvo. Ahora soy soporte vital.\" *El panel parpadea al ritmo de su voz.*",
                    options: [
                        { id: 'lk_o2a', label: 'Preguntar qué controla', next: 'lk_n4', sets: ['heard_lore'] },
                        { id: 'lk_o2b', label: 'Dejarlo ahí', next: null }
                    ]
                },
                'lk_n3': {
                    id: 'lk_n3',
                    text: "*Grita cuando tocas la unión de carne y metal.* \"¡No! ¡Soy estructural! ¡Si me sacas, el pasillo colapsa!\" *La pared tiembla.*",
                    options: [
                        { id: 'lk_o3a', label: 'Retroceder', next: 'lk_n2' }
                    ]
                },
                'lk_n4': {
                    id: 'lk_n4',
                    text: "*Cierra los ojos y la luz del pasillo se apaga.* \"Controlo... el miedo. Y el oxígeno. No me olvides.\" *Se funde más en el metal.*",
                    options: []
                }
            }
        },
        // LORE 2: THE HIVE CHILD
        {
            id: 'lore_hive',
            unique: true,
            tags: ['creepy', 'lore'],
            root: 'lh_n1',
            nodes: {
                'lh_n1': {
                    id: 'lh_n1',
                    text: "*Un niño pequeño te mira, pero su voz suena como una multitud.* \"Tenemos hambre... todos nosotros. ¿Traes biomasa?\" *Su piel se mueve sola.*",
                    audio: 'lore_interlude_seen',
                    options: [
                        { id: 'lh_o1', label: '¿Quiénes son?', next: 'lh_n2' },
                        { id: 'lh_o2', label: 'Amenazar', next: 'lh_n3' }
                    ]
                },
                'lh_n2': {
                    id: 'lh_n2',
                    text: "*Abre la boca demasiado grande, mostrando oscuridad.* \"La colonia. Los que vivían en el filtro de agua. Ahora somos el niño.\" *Zumbido de insectos.*",
                    options: [
                        { id: 'lh_o2a', label: 'Preguntar propósito', next: 'lh_n4' }
                    ]
                },
                'lh_n3': {
                    id: 'lh_n3',
                    text: "*Se ríe con mil voces.* \"No puedes matar lo que es legión. Solo dañarás el envase.\" *El niño sangra icor negro.*",
                    options: [
                        { id: 'lh_o3a', label: 'Huir', next: null }
                    ]
                },
                'lh_n4': {
                    id: 'lh_n4',
                    text: "*Se dispersa en las sombras.* \"Purificar... consumiendo. Nos vemos en el tanque principal.\"",
                    options: []
                }
            }
        },
        // LORE 3: THE ARCHIVIST
        {
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
        }
    ]
};
