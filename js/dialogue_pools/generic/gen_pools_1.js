import { act } from '../../DialogueActions.js';

export const gen_pools_1 = {
    "gen_scratch": {
        id: 'gen_scratch',
        tags: ['nervous', 'body_horror', 'generic'],
        unique: false,
        root: 'gs_n1',
        nodes: {
            'gs_n1': {
                id: 'gs_n1',
                text: "*Se frota el antebrazo compulsivamente.* \"El agua de las duchas... pica hoy. ¿No lo sientes?\" *Su piel está enrojecida.*",
                options: [
                    { id: 'gs_o1', label: 'Examinar brazo', next: 'gs_n2a' },
                    { id: 'gs_o3', label: '¡Deja de rascarte!', next: 'gs_n2c' }
                ]
            },
            'gs_n2a': {
                id: 'gs_n2a',
                text: "*La piel parece irritada, quizás es sarna o algo peor.* \"A veces siento que se mueve... pero debe ser el frío, ¿verdad?\" *Evita mirar la herida.*",
                options: [
                    { id: 'gs_o2a', label: 'Inspeccionar más de cerca', next: 'gs_n3a' },
                    { id: 'gs_o2b', label: 'Retroceder asqueado', next: 'gs_n3b' }
                ]
            },
            'gs_n2b': {
                id: 'gs_n2b',
                text: "*Acepta la venda con manos temblorosas.* \"Gracias... aunque taparlo no hace que pare. Nada hace que pare.\"",
                options: [
                    { id: 'gs_o2c', label: 'Preguntar desde cuándo', next: 'gs_n3b' },
                    { id: 'gs_o2d', label: 'Observar', next: 'gs_n3a' }
                ]
            },
            'gs_n2c': {
                id: 'gs_n2c',
                text: "*Te mira con ira, los ojos desorbitados.* \"¡No es por gusto! ¡Ellos caminan bajo mi piel! ¿Quieres verlos?\"",
                options: [
                    { id: 'gs_o2e', label: 'Calma, déjame ver', next: 'gs_n3a' },
                    { id: 'gs_o2f', label: 'Estás delirando', next: 'gs_n3b' }
                ]
            },
            'gs_n3a': {
                id: 'gs_n3a',
                text: "*Al presionar, la piel cede de forma extraña, como si hubiera aire o líquido debajo.* \"¡Ay! ¡Cuidado! No lo despiertes...\"",
                options: [
                    { id: 'gs_o3a', label: '¡Aléjate! Eso no es normal', next: null, resultText: "*Retrocede asustado.* \"¡No es nada, lo juro!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gs_o3d', label: 'Analizar movimiento subcutáneo', next: null, resultText: "*Tiembla mientras aplicas la luz.* \"Hazlo rápido... se agitan con la luz.\"", onclick: act.testUV, log: { text: 'Evidencia: Movimiento parasitario visible bajo la dermis al aplicar estrés.', icon: 'fa-bug' } },
                    { id: 'gs_o3e', label: 'Suficiente', next: 'gs_n4b' }
                ]
            },
            'gs_n3b': {
                id: 'gs_n3b',
                text: "*Se rasca hasta que brota una gota de sangre oscura.* \"Es el metal... el óxido del aire nos está cambiando.\"",
                options: [
                    { id: 'gs_o3b', label: 'No puedo arriesgarme. Vete.', next: null, resultText: "*Se aleja rascándose con furia.* \"El óxido... todo es óxido...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gs_o3c', label: 'Verificar temperatura de la sangre', next: null, resultText: "*Extiende el brazo sangrante.* \"Mira si quieres. La sangre no miente.\"", onclick: act.testThermo, log: { text: 'Dato: La sangre infectada suele estar fría al tacto inmediatamente después de brotar.', icon: 'fa-temperature-low' } },
                    { id: 'gs_o3f', label: 'Entendido', next: 'gs_n4b' }
                ]
            },
            'gs_n4b': {
                id: 'gs_n4b',
                text: "*Sujeto listo. Usa la LINTERNA UV para buscar parásitos subcutáneos.*",
                options: []
            }
        }
    },
    "gen_leak": {
        id: 'gen_leak',
        tags: ['fanatic', 'body_horror', 'generic'],
        unique: false,
        root: 'gl_n1',
        nodes: {
            'gl_n1': {
                id: 'gl_n1',
                text: "*Se limpia los ojos constantemente con un pañuelo sucio.* \"Hay mucho humo en los túneles hoy. Me arden los ojos.\" *Sus ojos están muy llorosos.*",
                options: [
                    { id: 'gl_o1', label: 'Examinar ojos', next: 'gl_n2a' },
                    { id: 'gl_o2', label: 'Ofrecer agua', next: 'gl_n2b' }
                ]
            },
            'gl_n2a': {
                id: 'gl_n2a',
                text: "*El lagrimal segrega un fluido ligeramente más denso y oscuro de lo normal.* \"Es solo irritación... o quizás conjuntivitis. No es nada grave.\"",
                options: [
                    { id: 'gl_o2a', label: 'Sospechar infección', next: 'gl_n3a' },
                    { id: 'gl_o2b', label: 'Preguntar si ve bien', next: 'gl_n3b' }
                ]
            },
            'gl_n2b': {
                id: 'gl_n2b',
                text: "*Bebe con avidez, pero el agua se le escapa por la comisura, mezclada con saliva oscura.* \"Gracias... tenía la garganta seca como lija.\"",
                options: [
                    { id: 'gl_o2c', label: 'Observar fluido', next: 'gl_n3a' }
                ]
            },
            'gl_n3a': {
                id: 'gl_n3a',
                text: "*Se frota la cara, extendiendo una mancha grisácea.* \"¿Por qué me miras así? ¿Tengo algo en la cara?\"",
                options: [
                    { id: 'gl_o3a', label: 'Estás infectado. Largo.', next: null, resultText: "*Se va cubriéndose la cara.* \"Solo necesito colirio...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gl_o3b', label: 'Analizar secreción con UV', next: null, resultText: "*Se limpia la cara con la manga.* \"Espero que tengas algo para esto.\"", onclick: act.testUV, log: { text: 'Síntoma: Secreción ocular viscosa. Reacciona a la luz UV mostrando patrones sintéticos.', icon: 'fa-eye' } },
                    { id: 'gl_o3e', label: 'Anotado', next: 'gl_n4b' }
                ]
            },
            'gl_n3b': {
                id: 'gl_n3b',
                text: "*Parpadea lentamente.* \"Veo... manchas. Como aceite flotando en agua. ¿Tú no las ves?\"",
                options: [
                    { id: 'gl_o3c', label: 'Estás alucinando. Fuera.', next: null, resultText: "*Se aleja tropezando.* \"Manchas... todo son manchas...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gl_o3d', label: 'Examinar reacción pupilar', next: null, resultText: "*Se acerca a la luz.* \"Dime que no ves las manchas tú también.\"", onclick: act.testPupils },
                    { id: 'gl_o3f', label: 'Silencio', next: 'gl_n4b' }
                ]
            },
            'gl_n4b': {
                id: 'gl_n4b',
                text: "*Secreción anómala. Usa el DILATADOR DE PUPILAS para verificar reacción.*",
                options: []
            }
        }
    },
    "gen_whisper": {
        id: 'gen_whisper',
        tags: ['paranoid', 'generic'],
        unique: false,
        root: 'gw_n1',
        nodes: {
            'gw_n1': {
                id: 'gw_n1',
                text: "*Inclina la cabeza hacia un lado, como escuchando algo lejano.* \"¿Oyes eso? Parece... agua corriendo. O gente susurrando.\"",
                options: [
                    { id: 'gw_o1', label: 'Escuchar también', next: 'gw_n2a' },
                    { id: 'gw_o2', label: '¿Qué dicen?', next: 'gw_n2b' }
                ]
            },
            'gw_n2a': {
                id: 'gw_n2a',
                text: "*Se pone tenso.* \"Están en las tuberías. Siempre empiezan bajito. Quizás es el eco del generador... o quizás no.\"",
                options: [
                    { id: 'gw_o2a', label: 'Es el viento', next: 'gw_n3a' },
                    { id: 'gw_o2b', label: 'Pedir silencio', next: 'gw_n3b' }
                ]
            },
            'gw_n2b': {
                id: 'gw_n2b',
                text: "*Cierra los ojos.* \"Nombres. Repiten nombres. Espero que no digan el mío... ni el tuyo.\"",
                options: [
                    { id: 'gw_o2c', label: 'Inquietante...', next: 'gw_n4b' }
                ]
            },
            'gw_n3a': {
                id: 'gw_n3a',
                text: "*Sacude la cabeza.* \"Ojalá fuera el viento. El viento no tiene ritmo.\"",
                options: [
                    { id: 'gw_o3a', label: 'Eres inestable. Vete.', next: null, resultText: "*Se va tapándose los oídos.* \"¡Callaos! ¡Dejadme en paz!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gw_o3b', label: 'Intenta calmarte, voy a hacer un chequeo', next: null, resultText: "*Asiente, tenso.* \"Hazlo antes de que vuelvan a empezar.\"", onclick: act.testPulse },
                    { id: 'gw_o3e', label: 'Cálmate', next: 'gw_n4b' }
                ]
            },
            'gw_n3b': {
                id: 'gw_n3b',
                text: "*Se queda quieto.* \"Shhh... si hacemos ruido, nos encontrarán.\"",
                options: [
                    { id: 'gw_o3c', label: 'No quiero locos aquí. Fuera.', next: null, resultText: "*Se aleja de puntillas.* \"Shhh... nos oirán si corremos.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gw_o3d', label: 'Silencio. Déjame trabajar.', next: null, resultText: "*Se tapa la boca.* \"Seré una tumba. Revisa lo que quieras.\"", onclick: act.testPupils, log: { text: 'Comportamiento: Escuchan voces en las tuberías. Afirman que el sistema de agua \"habla\" con nombres.', icon: 'fa-ear-listen' } },
                    { id: 'gw_o3f', label: '...', next: 'gw_n4b' }
                ]
            },
            'gw_n4b': {
                id: 'gw_n4b',
                text: "*Paranoia auditiva. Verifica PULSO y PUPILAS para descartar estrés extremo.*",
                options: []
            }
        }
    },
    "gen_mold": {
        id: 'gen_mold',
        tags: ['sick', 'body_horror', 'generic'],
        unique: false,
        root: 'gm_n1',
        nodes: {
            'gm_n1': {
                id: 'gm_n1',
                text: "*Huele intensamente a humedad y tierra mojada.* \"Perdón por el olor... mi refugio anterior tenía goteras. Todo se pudrió.\"",
                options: [
                    { id: 'gm_o1', label: 'Examinar ropa', next: 'gm_n2a' },
                    { id: 'gm_o2', label: 'Mantener distancia', next: 'gm_n2b' }
                ]
            },
            'gm_n2a': {
                id: 'gm_n2a',
                text: "*La ropa está manchada de moho, pero su piel también tiene un tono verdoso en el cuello.* \"Es difícil lavarse sin agua limpia...\"",
                options: [
                    { id: 'gm_o2a', label: '¿Eso es piel o moho?', next: 'gm_n3a' },
                    { id: 'gm_o2b', label: 'Parece contagioso', next: 'gm_n3b' }
                ]
            },
            'gm_n2b': {
                id: 'gm_n2b',
                text: "*Tose, y suena húmedo.* \"Solo necesito un lugar seco. Unos días al calor y estaré bien.\"",
                options: [{ id: 'gm_o2c', label: 'Dudar', next: 'gm_n3b' }]
            },
            'gm_n3a': {
                id: 'gm_n3a',
                text: "*Se toca el cuello.* \"Es... una erupción. Pica un poco. Nada que un poco de alcohol no cure.\"",
                options: [
                    { id: 'gm_o3a', label: 'Eso es hongo. Aléjate.', next: null, resultText: "*Se va cabizbajo.* \"Nadie quiere lo que está roto...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gm_o3b', label: 'Analizar esporas en piel', next: null, resultText: "*Baja las manos.* \"Ten cuidado, no quiero contagiarte si es malo.\"", onclick: act.testUV, log: { text: 'Evidencia: El moho no es superficial; las hifas penetran la dermis buscando el torrente sanguíneo.', icon: 'fa-bacterium' } },
                    { id: 'gm_o3e', label: 'Quédate quieto', next: 'gm_n4b' }
                ]
            },
            'gm_n3b': {
                id: 'gm_n3b',
                text: "*Te mira suplicante.* \"No me dejes fuera. La humedad me está comiendo vivo.\"",
                options: [
                    { id: 'gm_o3c', label: 'Lo siento, es muy arriesgado.', next: null, resultText: "*Se aleja tosiendo esporas.* \"La humedad siempre gana...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gm_o3d', label: 'Verificar temperatura corporal', next: null, resultText: "*Se pega al cristal.* \"Gracias... el aire aquí parece más seco.\"", onclick: act.testThermo },
                    { id: 'gm_o3f', label: 'Veremos', next: 'gm_n4b' }
                ]
            },
            'gm_n4b': {
                id: 'gm_n4b',
                text: "*Presencia de esporas fúngicas en dermis. Riesgo de propagación.*",
                options: []
            }
        }
    },
    "gen_teeth": {
        id: 'gen_teeth',
        tags: ['nervous', 'pain', 'generic'],
        unique: false,
        root: 'gt_n1',
        nodes: {
            'gt_n1': {
                id: 'gt_n1',
                text: "*Se lleva la mano a la mandíbula con gesto de dolor.* \"Me duele... creo que tengo una infección en la muela. ¿Tenéis antibióticos?\"",
                options: [
                    { id: 'gt_o1', label: 'Mostrar boca', next: 'gt_n2a' },
                    { id: 'gt_o2', label: 'No somos hospital', next: 'gt_n2b' }
                ]
            },
            'gt_n2a': {
                id: 'gt_n2a',
                text: "*Abre la boca. Sus encías están negras y retraídas.* \"Se mueven... siento que los dientes me bailan.\"",
                options: [
                    { id: 'gt_o2a', label: 'Eso no es caries', next: 'gt_n3a' },
                    { id: 'gt_o2b', label: 'Retroceder', next: 'gt_n3b' }
                ]
            },
            'gt_n2b': {
                id: 'gt_n2b',
                text: "*Escupe un poco de sangre.* \"Por favor... solo algo para el dolor. No puedo comer, no puedo dormir.\"",
                options: [{ id: 'gt_o2c', label: 'Proceder', next: 'gt_n4b' }]
            },
            'gt_n3a': {
                id: 'gt_n3a',
                text: "*Se toca un diente y este cae en su mano sin esfuerzo.* \"Oh no... otro más. Se me están cayendo solos.\"",
                options: [
                    { id: 'gt_o3a', label: '¡Qué asco! Vete.', next: null, resultText: "*Se va llorando.* \"Mis dientes... mis bonitos dientes...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gt_o3b', label: 'Examinar encías (Necrosis)', next: null, resultText: "*Guarda el diente en el bolsillo.* \"Dime que puedes arreglarme.\"", onclick: act.testUV, log: { text: 'Síntoma: Caída de dientes sin dolor ni sangrado. Las encías rechazan el hueso, indicando necrosis estructural.', icon: 'fa-tooth' } },
                    { id: 'gt_o3e', label: 'Abre la boca', next: 'gt_n4b' }
                ]
            },
            'gt_n3b': {
                id: 'gt_n3b',
                text: "*Te mira con desesperación.* \"¿Crees que es por el agua? He bebido de los charcos... no tenía opción.\"",
                options: [
                    { id: 'gt_o3c', label: 'Bebiste agua contaminada. Largo.', next: null, resultText: "*Escupe sangre al suelo.* \"Maldita agua... maldito lugar...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gt_o3d', label: 'Medir fiebre por infección', next: null, resultText: "*Abre la boca con dificultad.* \"Mira rápido, duele abrirla.\"", onclick: act.testThermo },
                    { id: 'gt_o3f', label: 'Veamos', next: 'gt_n4b' }
                ]
            },
            'gt_n4b': {
                id: 'gt_n4b',
                text: "*Necrosis gingival. Revisa TEMPERATURA y PULSO para descartar fallo sistémico.*",
                options: []
            }
        }
    },
    "gen_gift": {
        id: 'gen_gift',
        tags: ['friendly', 'generic'],
        unique: false,
        clue: "He oído que el generador consume menos si lo sobrecargas brevemente antes de apagarlo. No sé si es verdad.",
        mechanicHint: "DATO: Sobrecargar el generador aumenta la eficiencia temporalmente pero daña la integridad.",
        root: 'gg_n1',
        nodes: {
            'gg_n1': {
                id: 'gg_n1',
                text: "*Sostiene una caja con fuerza.* \"¡Espera! No estoy enfermo. Vengo a compartir.\"",
                options: [
                    { id: 'gg_o1', label: '¿Qué traes?', next: 'gg_n2' },
                    { id: 'gg_o2', label: 'Muestrame las manos', next: 'gg_n_hands' }
                ]
            },
            'gg_n2': {
                id: 'gg_n2',
                text: "*Abre la caja. Hay latas oxidadas pero selladas.* \"Encontré un viejo búnker. Me sobra esto. A cambio solo pido entrar.\"",
                options: [
                    { id: 'gg_o2a', label: 'Aceptar donación (+2 Suministros)', next: 'gg_n3', onclick: act.giveSupplies },
                    { id: 'gg_o2b', label: 'No confiamos en comida externa', next: 'gg_n_reject' }
                ]
            },
            'gg_n3': {
                id: 'gg_n3',
                text: "*Sonríe con alivio.* \"Gracias... la cortesía es rara estos días.\"",
                options: [
                    { id: 'gg_o3a', label: 'Bienvenido. Pasa al escáner.', next: 'gg_n_end' }
                ]
            },
            'gg_n_hands': {
                id: 'gg_n_hands',
                text: "*Muestra las manos limpias, salvo por mugre normal.* \"Limpio. Lo prometo.\"",
                options: [
                    { id: 'gg_o_h1', label: 'Volver a preguntar por la caja', next: 'gg_n2' }
                ]
            },
            'gg_n_reject': {
                id: 'gg_n_reject',
                text: "*Cierra la caja desilusionado.* \"Entiendo. La paranoia nos mantiene vivos... supongo.\"",
                options: [
                    { id: 'gg_o_r1', label: 'Examinar médicamente', next: 'gg_n_end' }
                ]
            },
            'gg_n_end': {
                id: 'gg_n_end',
                text: "*Sujeto cooperativo. Proceda con los tests estándar.*",
                options: []
            }
        }
    },
    // --- LORE-ALIGNED POOLS (Historia_Completa.md) ---
    "gen_cloro_memories": {
        id: 'gen_cloro_memories',
        tags: ['nervous', 'generic', 'lore'],
        unique: false,
        clue: "El cloro no solo limpia el cuerpo... borra los recuerdos. Hay gente que olvidó a sus familias después de las duchas.",
        mechanicHint: "DATO: La alta exposición al cloro reduce la paranoia pero puede tener efectos secundarios.",
        root: 'gcm_n1',
        nodes: {
            'gcm_n1': {
                id: 'gcm_n1',
                text: "*Se frota los ojos rojos.* \"Las duchas de descontaminación... ¿cuántas veces al día las activan? Ya no recuerdo el nombre de mi madre.\"",
                options: [
                    { id: 'gcm_o1', label: '¿Desde cuándo tienes problemas de memoria?', next: 'gcm_n2a' },
                    { id: 'gcm_o2', label: 'Es el estrés', next: 'gcm_n2b' }
                ]
            },
            'gcm_n2a': {
                id: 'gcm_n2a',
                text: "*Mira al vacío.* \"Desde que empezaron a aumentar la concentración. El aire tiene gusto a piscina. ¿Tú no lo notas?\"",
                options: [
                    { id: 'gcm_o2a', label: 'Revisar exposición química', next: null, onclick: act.testThermo, resultText: "*Exhala.* \"El cloro nos mantiene puros... pero ¿a qué costo?\"" },
                    { id: 'gcm_o2b', label: 'Interesante', next: 'gcm_n_end' }
                ]
            },
            'gcm_n2b': {
                id: 'gcm_n2b',
                text: "*Niega con la cabeza.* \"No es estrés. Es el protocolo de pureza. Dicen que es necesario, pero... ¿por qué siento que me estoy vaciando?\"",
                options: [
                    { id: 'gcm_o2c', label: 'Eso es paranoia', next: 'gcm_n_end' },
                    { id: 'gcm_o2d', label: 'Habla más sobre el protocolo', next: 'gcm_n_end' }
                ]
            },
            'gcm_n_end': {
                id: 'gcm_n_end',
                text: "*El sujeto parece desorientado pero cooperativo. Proceda con verificación estándar.*",
                options: []
            }
        }
    },
    "gen_tinta_visions": {
        id: 'gen_tinta_visions',
        tags: ['paranoid', 'body_horror', 'generic', 'lore'],
        unique: false,
        clue: "Hay algo en el agua oscura que viene de abajo. No es contaminación normal... tiene voluntad.",
        mechanicHint: "ALERTA: La Tinta es un contaminante inteligente. Evita el contacto directo.",
        root: 'gtv_n1',
        nodes: {
            'gtv_n1': {
                id: 'gtv_n1',
                text: "*Sus venas del cuello parecen más oscuras de lo normal.* \"He empezado a recordar cosas que no me pasaron a mí. Vidas de otros. Muertes de otros.\"",
                options: [
                    { id: 'gtv_o1', label: 'Examinar cuello', next: 'gtv_n2a' },
                    { id: 'gtv_o2', label: '¿Qué tipo de recuerdos?', next: 'gtv_n2b' }
                ]
            },
            'gtv_n2a': {
                id: 'gtv_n2a',
                text: "*Las venas pulsan con un ritmo lento, antinatural.* \"Desde que bebí de aquel charco negro... todo cambió. Pero me siento... conectado. Como si ya no estuviera solo.\"",
                options: [
                    { id: 'gtv_o2a', label: '¡Estás infectado!', next: null, onclick: act.ignore, resultText: "*Sonríe sereno.* \"¿Infectado? No... estoy evolucionando.\"", cssClass: 'horror-btn-dismiss' },
                    { id: 'gtv_o2b', label: 'Hacer test UV en venas', next: null, onclick: act.testUV, resultText: "*La luz revela patrones ramificados bajo la piel.* \"¿Lo ves ahora? La Madre habla a través de todos nosotros.\"" }
                ]
            },
            'gtv_n2b': {
                id: 'gtv_n2b',
                text: "*Cierra los ojos.* \"Siento cómo murió el anterior ocupante de este sector. Y el anterior. Y el anterior. Todos los dolores, todos los placeres... en un solo río oscuro.\"",
                options: [
                    { id: 'gtv_o2c', label: 'Deliras. Vete.', next: null, onclick: act.ignore, resultText: "*Abre los ojos, ahora con pupilas dilatadas.* \"Ella te recordará cuando llegue tu momento.\"", cssClass: 'horror-btn-dismiss' },
                    { id: 'gtv_o2d', label: 'Verificar pupilas', next: null, onclick: act.testPupils, resultText: "*Las pupilas no reaccionan a la luz.* \"Todo se ve más claro en la oscuridad.\"" }
                ]
            }
        }
    },
    "gen_station_alive": {
        id: 'gen_station_alive',
        tags: ['obsessive', 'generic', 'lore'],
        unique: false,
        clue: "Los antiguos ingenieros decían que Kael 'El Nervio' se fusionó con el sistema central. Si escuchas los conductos, puedes oír sollozos.",
        mechanicHint: "NOTA: Las tuberías del sector de Pulmones muestran signos de actividad biológica.",
        root: 'gsa_n1',
        nodes: {
            'gsa_n1': {
                id: 'gsa_n1',
                text: "*Pega la oreja a la pared.* \"Shhh. ¿Lo oyes? Las tuberías... lloran. Dicen que hay alguien atrapado ahí dentro desde el principio.\"",
                options: [
                    { id: 'gsa_o1', label: 'Son solo ruidos de agua', next: 'gsa_n2a' },
                    { id: 'gsa_o2', label: '¿Quién está atrapado?', next: 'gsa_n2b' }
                ]
            },
            'gsa_n2a': {
                id: 'gsa_n2a',
                text: "*Te mira con lástima.* \"El agua no tiene ritmo cardíaco. Esto sí. Escucha.\" *Golpea la tubería y el sonido cambia, como carne contra metal.*",
                options: [
                    { id: 'gsa_o2a', label: 'Inquietante', next: 'gsa_n_end' },
                    { id: 'gsa_o2b', label: 'Aléjate de la pared', next: 'gsa_n_end' }
                ]
            },
            'gsa_n2b': {
                id: 'gsa_n2b',
                text: "*Baja la voz.* \"Kael. El primer Administrador. Dicen que intentó desconectar el generador principal y... la estación no lo dejó. Ahora él ES la estación.\"",
                options: [
                    { id: 'gsa_o2c', label: 'Eso es un mito', next: 'gsa_n_end' },
                    { id: 'gsa_o2d', label: 'Continúa...', next: 'gsa_n3' }
                ]
            },
            'gsa_n3': {
                id: 'gsa_n3',
                text: "*Señala el techo.* \"Sus intestinos son los cables. Sus pulmones son los conductos de aire. Si lo desconectas... todo muere. Él mantiene vivo este lugar... y este lugar lo mantiene prisionero.\"",
                options: [
                    { id: 'gsa_o3a', label: 'Suficiente', next: 'gsa_n_end' }
                ]
            },
            'gsa_n_end': {
                id: 'gsa_n_end',
                text: "*El sujeto parece obsesionado pero no hostil. Proceda con verificación estándar.*",
                options: []
            }
        }
    }
};
