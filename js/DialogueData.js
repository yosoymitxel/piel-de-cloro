// Helper functions for dialogue actions
const act = {
    ignore: () => document.getElementById('btn-ignore') && document.getElementById('btn-ignore').click(),
    admit: () => document.getElementById('btn-admit') && document.getElementById('btn-admit').click(),
    test: () => document.getElementById('btn-test') && document.getElementById('btn-test').click()
};

export const DialogueData = {
    personalities: [
        'nervous',
        'aggressive',
        'stoic',
        'confused',
        'fanatic',
        'broken',
        'body_horror'],
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
                    text: "*Se frota el antebrazo compulsivamente.* \"El agua de las duchas... pica hoy. ¿No lo sientes?\" *Su piel está enrojecida.*",
                    options: [
                        { id: 'gs_o1', label: 'Examinar brazo', next: 'gs_n2a' },
                        { id: 'gs_o2', label: 'Ofrecer vendaje', next: 'gs_n2b' },
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
                    options: [{ id: 'gs_o3a', label: '¡Aléjate! Eso no es normal', next: null, resultText: "*Retrocede asustado.* \"¡No es nada, lo juro!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gs_o3d', label: 'Espera, voy a analizarte', next: null, resultText: "*Tiembla mientras preparas el equipo.* \"Hazlo rápido, por favor... pica mucho.\"", onclick: act.test }]
                },
                'gs_n3b': {
                    id: 'gs_n3b',
                    text: "*Se rasca hasta que brota una gota de sangre oscura.* \"Es el metal... el óxido del aire nos está cambiando.\"",
                    options: [{ id: 'gs_o3b', label: 'No puedo arriesgarme. Vete.', next: null, resultText: "*Se aleja rascándose con furia.* \"El óxido... todo es óxido...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gs_o3c', label: 'Déjame verificar esa sangre', next: null, resultText: "*Extiende el brazo sangrante.* \"Mira si quieres. La sangre no miente.\"", onclick: act.test, log: { text: 'Sujeto reporta efectos del óxido en el aire.', icon: 'fa-wind' } }]
                },
                'gs_n4b': {
                    id: 'gs_n4b',
                    text: "*Requiere análisis clínico para descartar infección parasitaria.*",
                    options: [{ id: 'gs_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gs_o4b1', label: 'Admitir (Riesgo)', next: null, sets: ['admitted'], cssClass: 'text-alert border-alert', onclick: act.admit }]
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
                    options: [{ id: 'gl_o3a', label: 'Estás infectado. Largo.', next: null, resultText: "*Se va cubriéndose la cara.* \"Solo necesito colirio...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gl_o3b', label: 'Necesito verificar esa secreción', next: null, resultText: "*Se limpia la cara con la manga.* \"Espero que tengas algo para esto.\"", onclick: act.test, log: { text: 'Evidencia: Secreción ocular oscura y densa.', icon: 'fa-eye' } }]
                },
                'gl_n3b': {
                    id: 'gl_n3b',
                    text: "*Parpadea lentamente.* \"Veo... manchas. Como aceite flotando en agua. ¿Tú no las ves?\"",
                    options: [{ id: 'gl_o3c', label: 'Estás alucinando. Fuera.', next: null, resultText: "*Se aleja tropezando.* \"Manchas... todo son manchas...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gl_o3d', label: 'Espera, déjame ver tus ojos', next: null, resultText: "*Se acerca a la luz.* \"Dime que no ves las manchas tú también.\"", onclick: act.test }]
                },
                'gl_n4b': {
                    id: 'gl_n4b',
                    text: "*Secreción ocular anómala. Posible síntoma temprano.*",
                    options: [{ id: 'gl_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gl_o4b1', label: 'Proceder con análisis ocular', next: null }]
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
                    options: [{ id: 'gw_o3a', label: 'Eres inestable. Vete.', next: null, resultText: "*Se va tapándose los oídos.* \"¡Callaos! ¡Dejadme en paz!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gw_o3b', label: 'Intenta calmarte, voy a hacer un chequeo', next: null, resultText: "*Asiente, tenso.* \"Hazlo antes de que vuelvan a empezar.\"", onclick: act.test }]
                },
                'gw_n3b': {
                    id: 'gw_n3b',
                    text: "*Se queda quieto.* \"Shhh... si hacemos ruido, nos encontrarán.\"",
                    options: [{ id: 'gw_o3c', label: 'No quiero locos aquí. Fuera.', next: null, resultText: "*Se aleja de puntillas.* \"Shhh... nos oirán si corremos.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gw_o3d', label: 'Silencio. Déjame trabajar.', next: null, resultText: "*Se tapa la boca.* \"Seré una tumba. Revisa lo que quieras.\"", onclick: act.test, log: { text: 'Nota: Alucinaciones auditivas sobre voces en tuberías.', icon: 'fa-ear-listen' } }]
                },
                'gw_n4b': {
                    id: 'gw_n4b',
                    text: "*Paranoia auditiva. Común en aislamiento prolongado.*",
                    options: [{ id: 'gw_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gw_o4b1', label: 'Verificar pulso y estrés', next: null }]
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
                    options: [{ id: 'gm_o3a', label: 'Eso es hongo. Aléjate.', next: null, resultText: "*Se va cabizbajo.* \"Nadie quiere lo que está roto...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gm_o3b', label: 'No te toques. Voy a analizar eso.', next: null, resultText: "*Baja las manos.* \"Ten cuidado, no quiero contagiarte si es malo.\"", onclick: act.test, log: { text: 'Evidencia: Presencia de moho en ropa y piel.', icon: 'fa-bacterium' } }]
                },
                'gm_n3b': {
                    id: 'gm_n3b',
                    text: "*Te mira suplicante.* \"No me dejes fuera. La humedad me está comiendo vivo.\"",
                    options: [{ id: 'gm_o3c', label: 'Lo siento, es muy arriesgado.', next: null, resultText: "*Se aleja tosiendo esporas.* \"La humedad siempre gana...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gm_o3d', label: 'Quédate en la zona de contención.', next: null, resultText: "*Se pega al cristal.* \"Gracias... el aire aquí parece más seco.\"", onclick: act.test }]
                },
                'gm_n4b': {
                    id: 'gm_n4b',
                    text: "*Presencia de esporas fúngicas en dermis. Riesgo de propagación.*",
                    options: [{ id: 'gm_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gm_o4b1', label: 'Admitir (Peligro)', next: null, sets: ['admitted_infected'], cssClass: 'text-alert border-alert', onclick: act.admit }]
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
                    options: [{ id: 'gt_o3a', label: '¡Qué asco! Vete.', next: null, resultText: "*Se va llorando.* \"Mis dientes... mis bonitos dientes...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gt_o3b', label: 'Guarda eso. Necesito examinarte.', next: null, resultText: "*Guarda el diente en el bolsillo.* \"Dime que puedes arreglarme.\"", onclick: act.test, log: { text: 'Evidencia: Pérdida espontánea de piezas dentales.', icon: 'fa-tooth' } }]
                },
                'gt_n3b': {
                    id: 'gt_n3b',
                    text: "*Te mira con desesperación.* \"¿Crees que es por el agua? He bebido de los charcos... no tenía opción.\"",
                    options: [{ id: 'gt_o3c', label: 'Bebiste agua contaminada. Largo.', next: null, resultText: "*Escupe sangre al suelo.* \"Maldita agua... maldito lugar...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gt_o3d', label: 'Vamos a ver qué tienes. Espera.', next: null, resultText: "*Abre la boca con dificultad.* \"Mira rápido, duele abrirla.\"", onclick: act.test }]
                },
                'gt_n4b': {
                    id: 'gt_n4b',
                    text: "*Necrosis gingival avanzada. Posible intoxicación o infección.*",
                    options: [{ id: 'gt_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gt_o4b1', label: 'Buscar fiebre (Temperatura)', next: null }]
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
                    text: "*Mira constantemente a sus espaldas.* \"La luz aquí parpadea mucho, ¿verdad? Crea... formas raras.\"",
                    options: [
                        { id: 'gsh_o1', label: 'Es el generador', next: 'gsh_n2a' },
                        { id: 'gsh_o2', label: '¿Qué formas?', next: 'gsh_n2b' }
                    ]
                },
                'gsh_n2a': {
                    id: 'gsh_n2a',
                    text: "*Asiente, poco convencido.* \"Sí... seguro. Pero a veces parece que la oscuridad se queda quieta cuando la luz vuelve.\"",
                    options: [
                        { id: 'gsh_o2a', label: 'Estás cansado', next: 'gsh_n3a' },
                        { id: 'gsh_o2b', label: 'Ignorar', next: 'gsh_n3b' }
                    ]
                },
                'gsh_n2b': {
                    id: 'gsh_n2b',
                    text: "*Baja la voz.* \"Cosas que te siguen. Sombras que son demasiado largas para ser tuyas.\"",
                    options: [{ id: 'gsh_o2c', label: 'Psicosis', next: 'gsh_n4b' }]
                },
                'gsh_n3a': {
                    id: 'gsh_n3a',
                    text: "*Se frota los ojos.* \"Quizás. Llevo tres días caminando a oscuras. La mente juega trucos.\"",
                    options: [{ id: 'gsh_o3a', label: 'No aceptamos inestables. Vete.', next: null, resultText: "*Se va mirando atrás.* \"Están ahí... sé que me siguen.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsh_o3b', label: 'Descansa un momento, voy a revisarte.', next: null, resultText: "*Se apoya en la pared.* \"Al menos aquí hay luz... revisa lo que quieras.\"", onclick: act.test }]
                },
                'gsh_n3b': {
                    id: 'gsh_n3b',
                    text: "*Se estremece.* \"Solo déjame entrar donde haya luz constante. Por favor.\"",
                    options: [{ id: 'gsh_o3c', label: 'Lo siento, no hay espacio.', next: null, resultText: "*Retrocede hacia la oscuridad.* \"No me dejes con ellas...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsh_o3d', label: 'Ponte bajo la luz, déjame ver.', next: null, resultText: "*Se pone bajo el foco.* \"No dejes que se apague la luz mientras miras.\"", onclick: act.test, log: { text: 'Nota: Paranoia visual sobre sombras.', icon: 'fa-eye-slash' } }]
                },
                'gsh_n4b': {
                    id: 'gsh_n4b',
                    text: "*Estrés postraumático severo. Sin anomalías físicas.*",
                    options: [{ id: 'gsh_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsh_o4b1', label: 'Revisar pupilas y reflejos', next: null }]
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
                    text: "*Tiembla visiblemente y se abraza a sí mismo.* \"Hace... mucho frío aquí fuera. ¿Tenéis calefacción dentro?\"",
                    options: [
                        { id: 'gc_o1', label: 'No hace frío', next: 'gc_n2a' },
                        { id: 'gc_o2', label: 'Ofrecer abrigo', next: 'gc_n2b' }
                    ]
                },
                'gc_n2a': {
                    id: 'gc_n2a',
                    text: "*Sus labios tienen un tono azulado.* \"Yo lo siento en los huesos. Como si la sangre se me hubiera helado.\"",
                    options: [
                        { id: 'gc_o2a', label: 'Hipotermia posible', next: 'gc_n3a' },
                        { id: 'gc_o2b', label: 'Síntoma de infección', next: 'gc_n3b' }
                    ]
                },
                'gc_n2b': {
                    id: 'gc_n2b',
                    text: "*Acepta cualquier cosa que le des.* \"Gracias... gracias. No siento los dedos de los pies.\"",
                    options: [{ id: 'gc_o2c', label: 'Proceder', next: 'gc_n4b' }]
                },
                'gc_n3a': {
                    id: 'gc_n3a',
                    text: "*Te mira confundido.* \"Solo necesito entrar en calor. Unas horas. Por favor.\"",
                    options: [{ id: 'gc_o3a', label: 'No es un hotel. Vete.', next: null, resultText: "*Se va abrazándose a sí mismo.* \"Tanto frío... nunca se va...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gc_o3b', label: 'Vamos a medir tu temperatura, espera.', next: null, resultText: "*Tiembla violentamente.* \"Hazlo... necesito entrar al calor.\"", onclick: act.test }]
                },
                'gc_n3b': {
                    id: 'gc_n3b',
                    text: "*Sus dientes castañean.* \"No... no estoy enfermo. Solo tengo frío.\"",
                    options: [{ id: 'gc_o3c', label: 'Pareces enfermo. Aléjate.', next: null, resultText: "*Se aleja castañeteando los dientes.* \"No estoy enfermo... es el hielo...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gc_o3d', label: 'Si es solo frío, lo veremos pronto.', next: null, resultText: "*Intenta quedarse quieto.* \"Perdón... no puedo parar de temblar.\"", onclick: act.test, log: { text: 'Síntoma: Hipotermia severa visible.', icon: 'fa-snowflake' } }]
                },
                'gc_n4b': {
                    id: 'gc_n4b',
                    text: "*Temperatura corporal baja. Signos de hipotermia o shock.*",
                    options: [{ id: 'gc_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gc_o4b1', label: 'Medir constantes térmicas', next: null }]
                }
            }
        },
        // 8. THE HOARDER (El recolector)
        "gen_hoarder": {
            id: 'gen_hoarder',
            tags: ['obsessive', 'confused'],
            unique: false,
            root: 'gh_n1',
            nodes: {
                'gh_n1': {
                    id: 'gh_n1',
                    text: "*Lleva los bolsillos llenos de chatarra y cables.* \"Tengo repuestos. Cobre, acero... cosas útiles. Puedo pagar mi entrada.\"",
                    options: [
                        { id: 'gh_o1', label: 'Ver mercancía', next: 'gh_n2a' },
                        { id: 'gh_o2', label: 'No aceptamos basura', next: 'gh_n2b' }
                    ]
                },
                'gh_n2a': {
                    id: 'gh_n2a',
                    text: "*Saca un puñado de tornillos oxidados y un trozo de tubería.* \"Esto vale mucho. El metal es vida aquí abajo.\"",
                    options: [
                        { id: 'gh_o2a', label: 'Parece basura', next: 'gh_n3a' },
                        { id: 'gh_o2b', label: 'Aceptar soborno', next: 'gh_n3b' }
                    ]
                },
                'gh_n2b': {
                    id: 'gh_n2b',
                    text: "*Se aferra a sus bolsillos.* \"¡No es basura! ¡Es supervivencia! Ustedes los del refugio han olvidado lo que cuesta encontrar un buen tornillo.\"",
                    options: [
                        { id: 'gh_o2c', label: 'Calmarse', next: 'gh_n3b' }
                    ]
                },
                'gh_n3a': {
                    id: 'gh_n3a',
                    text: "*Te mira ofendido.* \"No sabes nada. El óxido alimenta.\"",
                    options: [{ id: 'gh_o3a', label: 'Estás loco. Largo.', next: null, resultText: "*Se va contando tornillos.* \"Uno, dos... ellos no entienden el valor...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gh_o3b', label: 'Deja eso ahí. Procedo a escanear.', next: null, resultText: "*Deja la chatarra en el suelo.* \"Cuidado con eso, es de primera calidad.\"", onclick: act.test, log: { text: 'Objeto: Chatarra oxidada recolectada.', icon: 'fa-screwdriver' } }]
                },
                'gh_n3b': {
                    id: 'gh_n3b',
                    text: "*Guarda sus cosas.* \"Solo déjame entrar. Puedo arreglar cosas. Soy útil.\"",
                    options: [{ id: 'gh_o3c', label: 'No necesitamos chatarreros.', next: null, resultText: "*Recoge sus cosas ofendido.* \"Me llevaré mi talento a otra parte.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gh_o3d', label: 'Veremos si eres útil. Espera.', next: null, resultText: "*Se endereza.* \"Verás que estoy sano como una tubería nueva.\"", onclick: act.test }]
                },
                'gh_n4b': {
                    id: 'gh_n4b',
                    text: "*Posible riesgo de tétanos. Conducta obsesiva.*",
                    options: [{ id: 'gh_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gh_o4b1', label: 'Revisar piel y temperatura', next: null }]
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
                    text: "*Te mira fijamente y mueve los labios en silencio antes de hablar.* \"Hola... hola. Vengo a... vengo a entrar.\"",
                    options: [
                        { id: 'ge_o1', label: '¿Quién eres?', next: 'ge_n2a' },
                        { id: 'ge_o2', label: 'Habla normal', next: 'ge_n2b' }
                    ]
                },
                'ge_n2a': {
                    id: 'ge_n2a',
                    text: "*Asiente con un retraso notable.* \"Bien... bien. Estoy bien. ¿Tú estás bien?\"",
                    options: [
                        { id: 'ge_o2a', label: 'Pareces confundido', next: 'ge_n3a' }
                    ]
                },
                'ge_n2b': {
                    id: 'ge_n2b',
                    text: "*Se toca la garganta.* \"La voz... cuesta. Cuesta usarla. Hace mucho que no hablo.\"",
                    options: [
                        { id: 'ge_o2b', label: 'Entiendo', next: 'ge_n3b' }
                    ]
                },
                'ge_n3a': {
                    id: 'ge_n3a',
                    text: "*Sonríe, pero la sonrisa no llega a sus ojos.* \"Confundido... sí. Todo es nuevo.\"",
                    options: [{ id: 'ge_o3a', label: 'Me das mala espina. Vete.', next: null, resultText: "*Imita tu gesto.* \"Vete... vete... adiós.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'ge_o3b', label: 'Solo... quédate quieto un segundo.', next: null, resultText: "*Se queda inmóvil.* \"Quieto... quieto... esperando.\"", onclick: act.test }]
                },
                'ge_n3b': {
                    id: 'ge_n3b',
                    text: "*Te mira esperando una señal.* \"¿Puedo pasar? ¿Pasar?\"",
                    options: [{ id: 'ge_o3c', label: 'No. No puedes pasar.', next: null, resultText: "*Se aleja.* \"Pasar... no pasar... no pasar...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'ge_o3d', label: 'Voy a procesar tu solicitud, espera.', next: null, resultText: "*Asiente al ritmo de un reloj invisible.* \"Procesando... procesando...\"", onclick: act.test, log: { text: 'Síntoma: Dificultad en el habla/Ecolalia.', icon: 'fa-comments' } }]
                },
                'ge_n4b': {
                    id: 'ge_n4b',
                    text: "*Patrones de habla atípicos. Posible afasia o disociación.*",
                    options: [{ id: 'ge_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'ge_o4b1', label: 'Analizar pupilas', next: null }]
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
                    text: "*Tiene ojeras profundas y los ojos inyectados en sangre.* \"No puedo dormir ahí fuera. Necesito un lugar seguro. Solo una noche.\"",
                    options: [
                        { id: 'gsl_o1', label: '¿Por qué no duermes?', next: 'gsl_n2a' },
                        { id: 'gsl_o2', label: 'Te ves mal', next: 'gsl_n2b' }
                    ]
                },
                'gsl_n2a': {
                    id: 'gsl_n2a',
                    text: "*Se frota la cara.* \"Ruidos. Pesadillas. Si cierro los ojos, siento que algo se acerca.\"",
                    options: [
                        { id: 'gsl_o2a', label: 'Es estrés', next: 'gsl_n3a' }
                    ]
                },
                'gsl_n2b': {
                    id: 'gsl_n2b',
                    text: "*Se ríe nerviosamente.* \"Llevo cuatro días despierto. Tú también te verías mal.\"",
                    options: [
                        { id: 'gsl_o2b', label: 'Proceder', next: 'gsl_n3b' }
                    ]
                },
                'gsl_n3a': {
                    id: 'gsl_n3a',
                    text: "*Niega con la cabeza.* \"No es estrés. Es instinto. El cuerpo sabe cuándo está en peligro.\"",
                    options: [{ id: 'gsl_o3a', label: 'Estás paranoico. Vete.', next: null, resultText: "*Se tambalea.* \"Dormiré... cuando esté muerto...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsl_o3b', label: 'Tranquilo. Déjame hacer unas pruebas.', next: null, resultText: "*Abre mucho los ojos.* \"Hazlo rápido, antes de que me duerma de pie.\"", onclick: act.test }]
                },
                'gsl_n3b': {
                    id: 'gsl_n3b',
                    text: "*Bosteza y se tambalea.* \"Por favor... solo una cama. O el suelo. Me da igual.\"",
                    options: [{ id: 'gsl_o3c', label: 'No tenemos sitio. Lo siento.', next: null, resultText: "*Se arrastra lejos.* \"Solo quería cerrar los ojos un momento...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsl_o3d', label: 'Aguanta un poco más, voy a revisar.', next: null, resultText: "*Se apoya en el marco.* \"Despierto... sigo despierto... revisa.\"", onclick: act.test, log: { text: 'Síntoma: Privación de sueño extrema.', icon: 'fa-bed' } }]
                },
                'gsl_n4b': {
                    id: 'gsl_n4b',
                    text: "*Privación de sueño severa. Alucinaciones leves.*",
                    options: [{ id: 'gsl_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsl_o4b1', label: 'Chequear pupilas y pulso', next: null }]
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
                    text: "*Su cabeza se sacude bruscamente hacia un lado.* \"Perdón... perdón. Es un tic. Nervios.\"",
                    options: [
                        { id: 'gtw_o1', label: '¿Te duele?', next: 'gtw_n2a' },
                        { id: 'gtw_o2', label: 'Cálmate', next: 'gtw_n2b' }
                    ]
                },
                'gtw_n2a': {
                    id: 'gtw_n2a',
                    text: "*Se frota el cuello.* \"A veces. Es como si algo tirara del músculo. Un calambre constante.\"",
                    options: [
                        { id: 'gtw_o2a', label: 'Examinar cuello', next: 'gtw_n3a' },
                        { id: 'gtw_o2b', label: 'Proceder', next: 'gtw_n3b' }
                    ]
                },
                'gtw_n2b': {
                    id: 'gtw_n2b',
                    text: "*El tic se repite, más fuerte.* \"Lo intento. Pero cuanto más lo pienso, peor es.\"",
                    options: [{ id: 'gtw_o2c', label: 'Entiendo', next: 'gtw_n3b' }]
                },
                'gtw_n3a': {
                    id: 'gtw_n3a',
                    text: "*Notas un bulto duro bajo la piel, cerca de la columna.* \"¡Ay! No aprietes ahí.\"",
                    options: [{ id: 'gtw_o3a', label: 'Eso no es normal. Fuera.', next: null, resultText: "*Se aleja con movimientos bruscos.* \"No puedo controlarlo... ¡no puedo!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gtw_o3b', label: 'No te muevas, por favor.', next: null, resultText: "*Aprieta los dientes.* \"Intentaré no moverme... lo juro.\"", onclick: act.test, log: { text: 'Evidencia: Quiste o bulto subdérmico en cuello.', icon: 'fa-circle-dot' } }]
                },
                'gtw_n3b': {
                    id: 'gtw_n3b',
                    text: "*Respira hondo.* \"¿Puedo pasar? Necesito sentarme.\"",
                    options: [{ id: 'gtw_o3c', label: 'No estás en condiciones. Vete.', next: null, resultText: "*Se marcha tropezando.* \"Nadie me quiere así...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gtw_o3d', label: 'Siéntate ahí, voy a verificar.', next: null, resultText: "*Se sienta en el suelo.* \"Aquí estoy más estable. Procede.\"", onclick: act.test }]
                },
                'gtw_n4b': {
                    id: 'gtw_n4b',
                    text: "*Espasmos musculares involuntarios. Posible daño neurológico.*",
                    options: [{ id: 'gtw_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gtw_o4b1', label: 'Monitorizar pulso', next: null }]
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
                    text: "*Tararea una melodía monótona y grave.* \"Mmmm... mmmm... ayuda a no pensar. ¿Te molesta?\"",
                    options: [
                        { id: 'ghu_o1', label: 'Por favor para', next: 'ghu_n2a' },
                        { id: 'ghu_o2', label: '¿Qué canción es?', next: 'ghu_n2b' }
                    ]
                },
                'ghu_n2a': {
                    id: 'ghu_n2a',
                    text: "*Deja de tararear, pero empieza a golpear rítmicamente su pierna.* \"El silencio es peor. En el silencio se oyen cosas.\"",
                    options: [
                        { id: 'ghu_o2a', label: 'Mantén la calma', next: 'ghu_n3a' }
                    ]
                },
                'ghu_n2b': {
                    id: 'ghu_n2b',
                    text: "*Se encoge de hombros.* \"No lo sé. La oí en los túneles. Se te pega.\"",
                    options: [
                        { id: 'ghu_o2b', label: 'Proceder', next: 'ghu_n3b' }
                    ]
                },
                'ghu_n3a': {
                    id: 'ghu_n3a',
                    text: "*Mira alrededor.* \"¿Seguro que es seguro aquí? El zumbido del generador... suena igual.\"",
                    options: [{ id: 'ghu_o3a', label: 'Si no te gusta, vete.', next: null, resultText: "*Se aleja con su melodía.* \"Mmmm... mmmm... el ruido me protege...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'ghu_o3b', label: 'Guarda silencio un momento, por favor.', next: null, resultText: "*Cierra la boca.* \"(Golpea el suelo con el pie rítmicamente)\"", onclick: act.test }]
                },
                'ghu_n3b': {
                    id: 'ghu_n3b',
                    text: "*Vuelve a tararear.* \"Mmmm... mmmm...\"",
                    options: [{ id: 'ghu_o3c', label: 'Ese ruido es insoportable. Fuera.', next: null, resultText: "*Sube el volumen de su tarareo al irse.* \"¡MMMM! ¡MMMM!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'ghu_o3d', label: 'Voy a revisarte mientras esperas.', next: null, resultText: "*Tararea muy bajito.* \"Es para calmarme... no te molestará.\"", onclick: act.test, log: { text: 'Nota: Comportamiento repetitivo (tarareo).', icon: 'fa-music' } }]
                },
                'ghu_n4b': {
                    id: 'ghu_n4b',
                    text: "*Conducta repetitiva. Mecanismo de defensa ante estrés.*",
                    options: [{ id: 'ghu_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'ghu_o4b1', label: 'Admitir (Riesgo)', next: null, sets: ['admitted'], cssClass: 'text-alert border-alert', onclick: act.admit }]
                }
            }
        },
        // 13. THE SEARCHER (El buscador)
        "gen_search": {
            id: 'gen_search',
            tags: ['obsessive', 'nervous'],
            unique: false,
            root: 'gsr_n1',
            nodes: {
                'gsr_n1': {
                    id: 'gsr_n1',
                    text: "*Mira al suelo constantemente.* \"Se me cayó... se me cayó algo importante. ¿Lo has visto?\"",
                    options: [
                        { id: 'gsr_o1', label: '¿Qué perdiste?', next: 'gsr_n2a' },
                        { id: 'gsr_o2', label: 'Aquí no hay nada', next: 'gsr_n2b' }
                    ]
                },
                'gsr_n2a': {
                    id: 'gsr_n2a',
                    text: "*Se arrodilla.* \"Una llave. O una moneda. Algo brillante. Brillaba en la oscuridad.\"",
                    options: [
                        { id: 'gsr_o2a', label: 'Levántate', next: 'gsr_n3a' }
                    ]
                },
                'gsr_n2b': {
                    id: 'gsr_n2b',
                    text: "*Te mira con desconfianza.* \"Seguro que te lo guardaste. Todos quieren lo que brilla.\"",
                    options: [
                        { id: 'gsr_o2b', label: 'No tengo nada', next: 'gsr_n3b' }
                    ]
                },
                'gsr_n3a': {
                    id: 'gsr_n3a',
                    text: "*Se levanta sacudiéndose el polvo.* \"Si no lo encuentro, no puedo pagar. ¿Aceptáis trabajo a cambio?\"",
                    options: [{ id: 'gsr_o3a', label: 'No aceptamos mendigos.', next: null, resultText: "*Sigue buscando mientras se aleja.* \"Tiene que estar por aquí...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsr_o3b', label: 'Ya buscaremos luego. Ahora el chequeo.', next: null, resultText: "*Se sacude el polvo.* \"Bien, bien. Pero si ves algo brillante, avísame.\"", onclick: act.test, log: { text: 'Nota: Obsesión por objetos brillantes perdidos.', icon: 'fa-key' } }]
                },
                'gsr_n3b': {
                    id: 'gsr_n3b',
                    text: "*Entrecierra los ojos.* \"Ya... claro. Ladrones.\"",
                    options: [{ id: 'gsr_o3c', label: 'Cuidado con lo que dices. Fuera.', next: null, resultText: "*Se marcha enfadado.* \"Ladrones... todos sois ladrones...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsr_o3d', label: 'Nadie te va a robar. Espera.', next: null, resultText: "*Te vigila de reojo.* \"No toques mis bolsillos durante el escaneo.\"", onclick: act.test }]
                },
                'gsr_n4b': {
                    id: 'gsr_n4b',
                    text: "*Sujeto desorientado. Sin posesiones de valor.*",
                    options: [{ id: 'gsr_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsr_o4b1', label: 'Iniciar escaneo físico', next: null }]
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
                    text: "*Tiene los brazos cubiertos de dibujos hechos con tinta.* \"Anoto el camino. Para no olvidar cómo volver.\"",
                    options: [
                        { id: 'gmp_o1', label: 'Ver mapa', next: 'gmp_n2a', log: { text: 'Evidencia: Mapa de túneles dibujado en piel.', icon: 'fa-map' } },
                        { id: 'gmp_o2', label: '¿Volver a dónde?', next: 'gmp_n2b' }
                    ]
                },
                'gmp_n2a': {
                    id: 'gmp_n2a',
                    text: "*Son líneas caóticas que imitan tuberías.* \"Aquí es donde estamos. Y aquí... aquí es donde se cortó la luz.\"",
                    options: [
                        { id: 'gmp_o2a', label: 'Parece confuso', next: 'gmp_n3a' }
                    ]
                },
                'gmp_n2b': {
                    id: 'gmp_n2b',
                    text: "*Señala hacia atrás.* \"Arriba. A la superficie. Algún día.\"",
                    options: [
                        { id: 'gmp_o2b', label: 'Optimista', next: 'gmp_n3b' }
                    ]
                },
                'gmp_n3a': {
                    id: 'gmp_n3a',
                    text: "*Se mira el brazo.* \"A veces la tinta se borra con el sudor. Tengo que repasarla.\"",
                    options: [{ id: 'gmp_o3b', label: 'No quiero gente rara aquí.', next: null, resultText: "*Se aleja trazando líneas.* \"Tendré que buscar otra ruta en el mapa...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gmp_o3a', label: 'Interesante. Déjame ver tus constantes.', next: null, resultText: "*Muestra sus brazos.* \"Lee mi piel. Todo está escrito ahí.\"", onclick: act.test }]
                },
                'gmp_n3b': {
                    id: 'gmp_n3b',
                    text: "*Sonríe tristemente.* \"La esperanza es lo último que se pierde, ¿no?\"",
                    options: [{ id: 'gmp_o3c', label: 'Aquí ya no hay esperanza. Vete.', next: null, resultText: "*Baja los brazos.* \"La esperanza también se pierde, supongo.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gmp_o3d', label: 'Mantén la esperanza. Voy a revisar.', next: null, resultText: "*Asiente.* \"Gracias. Aún queda camino por recorrer.\"", onclick: act.test }]
                },
                'gmp_n4b': {
                    id: 'gmp_n4b',
                    text: "*Tinta no tóxica. Sujeto estable.*",
                    options: [{ id: 'gmp_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gmp_o4b1', label: 'Examinar marcas en piel', next: null }]
                }
            }
        },
        // 15. THE IMPATIENT (El impaciente)
        "gen_wait": {
            id: 'gen_wait',
            tags: ['aggressive', 'generic'],
            unique: false,
            root: 'gwt_n1',
            nodes: {
                'gwt_n1': {
                    id: 'gwt_n1',
                    text: "*Golpea el marco de la puerta.* \"¡Vamos! ¡Llevo horas esperando! ¿Cuánto tarda un simple chequeo?\"",
                    options: [
                        { id: 'gwt_o1', label: 'Calma', next: 'gwt_n2a' },
                        { id: 'gwt_o2', label: 'Es el protocolo', next: 'gwt_n2b' }
                    ]
                },
                'gwt_n2a': {
                    id: 'gwt_n2a',
                    text: "\"¡No me calmo! ¡Tengo hambre y frío! ¡Abre la maldita puerta!\"",
                    options: [{ id: 'gwt_o2a', label: 'Amenazar', next: 'gwt_n3a' }]
                },
                'gwt_n2b': {
                    id: 'gwt_n2b',
                    text: "\"Protocolo, protocolo... siempre lo mismo. Mientras tanto nosotros nos pudrimos fuera.\"",
                    options: [{ id: 'gwt_o2b', label: 'Proceder', next: 'gwt_n3b' }]
                },
                'gwt_n3a': {
                    id: 'gwt_n3a',
                    text: "*Retrocede un paso.* \"Vale, vale... solo haz tu trabajo.\"",
                    options: [{ id: 'gwt_o3b', label: 'No tolero amenazas. Largo.', next: null, cssClass: 'horror-btn-dismiss', resultText: "*Golpea la puerta.* \"¡Maldita burocracia! ¡Nos matarán a todos!\"", onclick: act.ignore }, { id: 'gwt_o3a', label: 'Cálmate o no entras. Voy a empezar.', next: null, resultText: "*Resopla impaciente.* \"Venga, acaba con esto de una vez.\"", onclick: act.test }]
                },
                'gwt_n3b': {
                    id: 'gwt_n3b',
                    text: "*Cruza los brazos.* \"Rápido.\"",
                    options: [{ id: 'gwt_o3c', label: 'Será rápido si colaboras.', next: null, resultText: "*Mira su muñeca desnuda.* \"Tic, tac. El tiempo corre.\"", onclick: act.test }]
                },
                'gwt_n4b': {
                    id: 'gwt_n4b',
                    text: "*Signos de estrés y malnutrición. Sin infección.*",
                    options: [{ id: 'gwt_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gwt_o4b1', label: 'Proceder con toma de constantes', next: null }]
                }
            }
        },
        // 16. THE LOST (El perdido)
        "gen_lost": {
            id: 'gen_lost',
            tags: ['confused', 'generic'],
            unique: false,
            root: 'glo_n1',
            nodes: {
                'glo_n1': {
                    id: 'glo_n1',
                    text: "*Mira un papel arrugado.* \"Disculpa... ¿es este el acceso al sector 4? Me dijeron que mi hermano estaba aquí.\"",
                    options: [
                        { id: 'glo_o1', label: 'Esto es el refugio', next: 'glo_n2a' },
                        { id: 'glo_o2', label: 'No hay lista', next: 'glo_n2b' }
                    ]
                },
                'glo_n2a': {
                    id: 'glo_n2a',
                    text: "\"Ya... pero ¿es el 4? Los túneles son todos iguales.\"",
                    options: [{ id: 'glo_o2a', label: 'No lo sé', next: 'glo_n3a' }]
                },
                'glo_n2b': {
                    id: 'glo_n2b',
                    text: "*Baja la mirada.* \"Tiene que estar. Prometió esperarme.\"",
                    options: [{ id: 'glo_o2b', label: 'Lo siento', next: 'glo_n3b' }]
                },
                'glo_n3a': {
                    id: 'glo_n3a',
                    text: "\"Supongo que tendré que entrar para buscarlo.\"",
                    options: [{ id: 'glo_o3b', label: 'No puedes entrar sin autorización.', next: null, cssClass: 'horror-btn-dismiss', resultText: "*Se da la vuelta.* \"Seguiré buscando... tiene que estar en algún lado.\"", onclick: act.ignore }, { id: 'glo_o3a', label: 'Primero el protocolo. Espera.', next: null, resultText: "*Guarda el papel.* \"Haz lo que debas, pero déjame pasar luego.\"", onclick: act.test, log: { text: 'Nota: Sujeto busca familiar en Sector 4.', icon: 'fa-map-location-dot' } }]
                },
                'glo_n3b': {
                    id: 'glo_n3b',
                    text: "\"Solo déjame pasar. No molestaré.\"",
                    options: [{ id: 'glo_o3c', label: 'Veremos qué se puede hacer. Un momento.', next: null, resultText: "*Junta las manos.* \"Gracias... solo quiero encontrarlo.\"", onclick: act.test }]
                },
                'glo_n4b': {
                    id: 'glo_n4b',
                    text: "*Sujeto sano. Desorientado.*",
                    options: [{ id: 'glo_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'glo_o4b1', label: 'Realizar chequeo general', next: null }]
                }
            }
        },
        // 17. THE STOIC (El estoico)
        "gen_quiet": {
            id: 'gen_quiet',
            tags: ['stoic', 'generic'],
            unique: false,
            root: 'gqt_n1',
            nodes: {
                'gqt_n1': {
                    id: 'gqt_n1',
                    text: "*Espera con las manos en los bolsillos, mirando al frente.* \"Buenas noches. Listo para la inspección.\"",
                    options: [
                        { id: 'gqt_o1', label: 'Proceder', next: 'gqt_n2a' },
                        { id: 'gqt_o2', label: '¿Síntomas?', next: 'gqt_n2b' }
                    ]
                },
                'gqt_n2a': {
                    id: 'gqt_n2a',
                    text: "\"Adelante. No tengo nada que ocultar.\"",
                    options: [{ id: 'gqt_o2a', label: 'Bien, procedo a la inspección.', next: null, resultText: "*Se mantiene firme.* \"Estoy listo. Haz tu trabajo.\"", onclick: act.test }]
                },
                'gqt_n2b': {
                    id: 'gqt_n2b',
                    text: "\"Cansancio. Hambre. Lo normal.\"",
                    options: [{ id: 'gqt_o2b', label: 'Entendido. Iniciando escaneo.', next: null, resultText: "*Asiente.* \"Proceda con el escaneo.\"", onclick: act.test }]
                },
                'gqt_n4b': {
                    id: 'gqt_n4b',
                    text: "*Constantes vitales normales.*",
                    options: [{ id: 'gqt_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gqt_o4b1', label: 'Proceder con escaneo', next: null }]
                }
            }
        },
        // 18. THE SCARED (El asustado)
        "gen_scared": {
            id: 'gen_scared',
            tags: ['nervous', 'generic'],
            unique: false,
            root: 'gsc_n1',
            nodes: {
                'gsc_n1': {
                    id: 'gsc_n1',
                    text: "*Da un salto cuando le hablas.* \"¡Ah! Perdón... estoy un poco nervioso. ¿Es seguro aquí?\"",
                    options: [
                        { id: 'gsc_o1', label: 'Es seguro', next: 'gsc_n2a' },
                        { id: 'gsc_o2', label: 'Depende', next: 'gsc_n2b' }
                    ]
                },
                'gsc_n2a': {
                    id: 'gsc_n2a',
                    text: "\"Gracias a Dios. He oído historias horribles de los otros refugios.\"",
                    options: [{ id: 'gsc_o2a', label: 'Relájate, voy a revisarte.', next: null, resultText: "*Sonríe temblando.* \"Gracias... me siento más seguro si revisas.\"", onclick: act.test, log: { text: 'Nota: Rumores sobre otros refugios caídos.', icon: 'fa-house-crack' } }]
                },
                'gsc_n2b': {
                    id: 'gsc_n2b',
                    text: "*Traga saliva.* \"Bueno... mejor que fuera seguro que es.\"",
                    options: [{ id: 'gsc_o2b', label: 'No temas. Espera un segundo.', next: null, resultText: "*Se seca el sudor.* \"Vale... vale. Estoy listo.\"", onclick: act.test }]
                },
                'gsc_n4b': {
                    id: 'gsc_n4b',
                    text: "*Taquicardia leve por ansiedad. Sin infección.*",
                    options: [{ id: 'gsc_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsc_o4b1', label: 'Medir pulso y temperatura', next: null }]
                }
            }
        },
        // 19. THE GLITCHER (El fallo)
        "gen_glitch": {
            id: 'gen_glitch',
            tags: ['confused', 'broken'],
            unique: false,
            root: 'gg_n1',
            nodes: {
                'gg_n1': {
                    id: 'gg_n1',
                    text: "*Mira sus propias manos con fascinación.* \"La resolución... ha bajado. ¿Ves los bordes dentados en mi piel?\"",
                    options: [
                        { id: 'gg_o1', label: 'Estás alucinando', next: 'gg_n2a' },
                        { id: 'gg_o2', label: 'Enséñame', next: 'gg_n2b' }
                    ]
                },
                'gg_n2a': {
                    id: 'gg_n2a',
                    text: "\"No es alucinación. Es renderizado. El servidor está sobrecargado por la niebla.\"",
                    options: [
                        { id: 'gg_o2a', label: 'Esto es la vida real', next: 'gg_n3a' },
                        { id: 'gg_o2b', label: 'Reiníciate fuera', next: 'gg_n3b' }
                    ]
                },
                'gg_n2b': {
                    id: 'gg_n2b',
                    text: "*Mueve la mano rápidamente frente a su cara.* \"¿Ves el rastro? Caída de frames. Lag.\"",
                    options: [
                        { id: 'gg_o2c', label: 'Son temblores', next: 'gg_n3a' }
                    ]
                },
                'gg_n3a': {
                    id: 'gg_n3a',
                    text: "*Se toca la cara.* \"Si me dejas entrar, puedo optimizar el código. O al menos... descansar hasta el parche.\"",
                    options: [{ id: 'gg_o3a', label: 'Error 404: Acceso denegado.', next: null, resultText: "*Parpadea erráticamente.* \"Conexión rechazada... reintentando en otro servidor...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gg_o3b', label: 'Voy a escanear tu hardware.', next: null, resultText: "*Adopta pose en T.* \"Iniciando diagnóstico de sistema...\"", onclick: act.test, log: { text: 'Anomalía: Sujeto percibe la realidad como simulación.', icon: 'fa-bug' } }]
                },
                'gg_n3b': {
                    id: 'gg_n3b',
                    text: "\"No puedo reiniciar. Si me apago, quizás no vuelva a cargar.\"",
                    options: [{ id: 'gg_o3c', label: 'Ese no es mi problema.', next: null, resultText: "*Se congela.* \"Apagando sistema...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gg_o3d', label: 'Déjame ver tus ojos.', next: null, resultText: "*Abre los ojos al máximo.* \"Escanea mis datos. Busca el error.\"", onclick: act.test }]
                },
                'gg_n4b': {
                    id: 'gg_n4b',
                    text: "*Disociación severa. Posible intoxicación neurológica.*",
                    options: [{ id: 'gg_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gg_o4b1', label: 'Revisar pupilas y reflejos', next: null }]
                }
            }
        },
        // 20. THE PROPHET (El profeta)
        "gen_prophet": {
            id: 'gen_prophet',
            tags: ['fanatic'],
            unique: false,
            root: 'gp_n1',
            nodes: {
                'gp_n1': {
                    id: 'gp_n1',
                    text: "*Sonríe con los dientes manchados.* \"No temas a la niebla verde. Es el bautismo. Es el filtro que separa el trigo de la paja.\"",
                    options: [
                        { id: 'gp_o1', label: 'Estás infectado', next: 'gp_n2a' },
                        { id: 'gp_o2', label: 'Explícate', next: 'gp_n2b' }
                    ]
                },
                'gp_n2a': {
                    id: 'gp_n2a',
                    text: "\"Estoy iluminado. Mis pulmones arden con la verdad. ¿Sientes el ardor tú también?\"",
                    options: [
                        { id: 'gp_o2a', label: 'No, yo respiro aire limpio', next: 'gp_n3a' },
                        { id: 'gp_o2b', label: 'Aléjate de la ventanilla', next: 'gp_n3b' }
                    ]
                },
                'gp_n2b': {
                    id: 'gp_n2b',
                    text: "\"La humanidad era débil. El cloro nos hace fuertes... o nos mata. Yo sobreviví. Merezco entrar.\"",
                    options: [
                        { id: 'gp_o2c', label: 'Lógica retorcida', next: 'gp_n3a' }
                    ]
                },
                'gp_n3a': {
                    id: 'gp_n3a',
                    text: "\"Déjame pasar. Traigo la palabra del nuevo mundo.\"",
                    options: [{ id: 'gp_o3a', label: 'Aquí no queremos tu religión.', next: null, resultText: "*Escupe.* \"¡Herejes! ¡Os ahogaréis en vuestra ignorancia!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gp_o3b', label: 'Voy a ver si esa "luz" es fiebre.', next: null, resultText: "*Levanta la barbilla.* \"Examina mi carne. Verás la verdad escrita en ella.\"", onclick: act.test, log: { text: 'Nota: Fanatismo religioso relacionado con la niebla.', icon: 'fa-book-quran' } }]
                },
                'gp_n3b': {
                    id: 'gp_n3b',
                    text: "\"No puedes detener la marea con una puerta de metal.\"",
                    options: [{ id: 'gp_o3c', label: 'Puedo y lo haré. Largo.', next: null, resultText: "*Se aleja riendo.* \"¡La marea llega! ¡La marea llega para todos!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gp_o3d', label: 'Cállate y déjame escanearte.', next: null, resultText: "*Te mira con lástima.* \"Pobre alma ciega... haz tus pruebas inútiles.\"", onclick: act.test }]
                },
                'gp_n4b': {
                    id: 'gp_n4b',
                    text: "*Signos de inhalación leve. Delirio místico.*",
                    options: [{ id: 'gp_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gp_o4b1', label: 'Admitir (Riesgo Ideológico)', next: null, sets: ['admitted'], cssClass: 'text-alert border-alert', onclick: act.admit }]
                }
            }
        },
        // 21. THE SILENT (El mudo)
        "gen_silent": {
            id: 'gen_silent',
            tags: ['stoic', 'nervous'],
            unique: false,
            root: 'gsi_n1',
            nodes: {
                'gsi_n1': {
                    id: 'gsi_n1',
                    text: "*Se señala la boca, que está sellada con cinta aislante gris. Te tiende una nota arrugada.*",
                    options: [
                        { id: 'gsi_o1', label: 'Leer nota', next: 'gsi_n2a' },
                        { id: 'gsi_o2', label: 'Quítate la cinta', next: 'gsi_n2b' }
                    ]
                },
                'gsi_n2a': {
                    id: 'gsi_n2a',
                    text: "*La nota dice: \"NO ES MI VOZ. SI HABLO, ELLOS ME ENCUENTRAN\".*",
                    options: [
                        { id: 'gsi_o2a', label: '¿Quiénes?', next: 'gsi_n3a' },
                        { id: 'gsi_o2b', label: 'Escribir respuesta', next: 'gsi_n3b' }
                    ]
                },
                'gsi_n2b': {
                    id: 'gsi_n2b',
                    text: "*Niega violentamente con la cabeza y se lleva un dedo a los labios haciendo 'shhh'. Sus ojos están desorbitados.*",
                    options: [
                        { id: 'gsi_o2c', label: 'Insistir', next: 'gsi_n3b' }
                    ]
                },
                'gsi_n3a': {
                    id: 'gsi_n3a',
                    text: "*Escribe rápido en el papel: \"LOS QUE ESCUCHAN EN LAS TUBERÍAS\".*",
                    options: [{ id: 'gsi_o3a', label: 'Estás loco. Vete.', next: null, resultText: "*Recoge la nota y huye despavorido.*", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsi_o3b', label: 'Entiendo. Déjame revisarte en silencio.', next: null, resultText: "*Asiente lentamente y te ofrece el brazo en silencio.*", onclick: act.test, log: { text: 'Evidencia: Nota escrita sobre "los que escuchan".', icon: 'fa-note-sticky' } }]
                },
                'gsi_n3b': {
                    id: 'gsi_n3b',
                    text: "*Te muestra el cuello. Las venas están hinchadas, como si quisiera gritar pero se contuviera.*",
                    options: [{ id: 'gsi_o3c', label: 'Demasiado inestable. Fuera.', next: null, resultText: "*Huye sin hacer ruido, con los ojos llenos de pánico.*", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsi_o3d', label: 'Voy a medir tu pulso.', next: null, resultText: "*Extiende la muñeca temblando, sin emitir sonido.*", onclick: act.test }]
                },
                'gsi_n4b': {
                    id: 'gsi_n4b',
                    text: "*Estrés extremo. Mudez psicógena o voluntaria.*",
                    options: [{ id: 'gsi_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gsi_o4b1', label: 'Monitorizar pulso', next: null }]
                }
            }
        },
        // 22. THE BARGAINER (El negociador)
        "gen_bribe": {
            id: 'gen_bribe',
            tags: ['aggressive', 'nervous'],
            unique: false,
            root: 'gbr_n1',
            nodes: {
                'gbr_n1': {
                    id: 'gbr_n1',
                    text: "*Se apoya en el cristal con complicidad.* \"Sé lo que pasó en el Sector 7. Déjame entrar y te cuento cómo evitar que pase aquí.\"",
                    options: [
                        { id: 'gbr_o1', label: 'Cuéntamelo primero', next: 'gbr_n2a' },
                        { id: 'gbr_o2', label: 'No me interesa', next: 'gbr_n2b' }
                    ]
                },
                'gbr_n2a': {
                    id: 'gbr_n2a',
                    text: "\"Listo, eh. No murieron. Cambiaron. Vi los capullos en el techo. Si ves moho negro, quémalo.\"",
                    options: [
                        { id: 'gbr_o2a', label: '¿Eso es todo?', next: 'gbr_n3a' },
                        { id: 'gbr_o2b', label: 'Parece mentira', next: 'gbr_n3b' }
                    ]
                },
                'gbr_n2b': {
                    id: 'gbr_n2b',
                    text: "\"Debería interesarte. Se extiende por la ventilación. Si no sabes qué buscar, ya estás muerto.\"",
                    options: [
                        { id: 'gbr_o2c', label: 'Amenazar', next: 'gbr_n3b' }
                    ]
                },
                'gbr_n3a': {
                    id: 'gbr_n3a',
                    text: "\"Es información vital. Vale por una cama caliente, ¿no?\"",
                    options: [{ id: 'gbr_o3a', label: 'Información insuficiente. Vete.', next: null, resultText: "*Golpea el cristal.* \"¡Te arrepentirás! ¡Esa información valía oro!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gbr_o3b', label: 'Veremos. Primero el chequeo.', next: null, resultText: "*Se cruza de brazos.* \"Bien. Revisa. Pero recuerda lo del moho.\"", onclick: act.test, log: { text: 'Información: El moho negro es inflamable/peligroso.', icon: 'fa-fire' } }]
                },
                'gbr_n3b': {
                    id: 'gbr_n3b',
                    text: "\"¡Te estoy haciendo un favor! ¡Maldito burócrata!\"",
                    options: [{ id: 'gbr_o3c', label: 'No tolero insultos. Largo.', next: null, resultText: "*Se aleja maldiciendo.* \"¡Ojalá se te pudra el filtro de aire!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gbr_o3d', label: 'Cállate y coopera.', next: null, resultText: "*Bufa.* \"Venga, acaba ya. Tengo cosas que hacer.\"", onclick: act.test }]
                },
                'gbr_n4b': {
                    id: 'gbr_n4b',
                    text: "*Sujeto manipulador. Posiblemente sano pero conflictivo.*",
                    options: [{ id: 'gbr_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gbr_o4b1', label: 'Proceder con toma de constantes', next: null }]
                }
            }
        },
        // 23. THE JESTER (El bufón)
        "gen_jester": {
            id: 'gen_jester',
            tags: ['manic', 'loud'],
            unique: false,
            root: 'gj_n1',
            nodes: {
                'gj_n1': {
                    id: 'gj_n1',
                    text: "*Se ríe por lo bajo, una risa seca y quebrada.* \"Je... jeje. ¿Viste al guardia del turno anterior? Tenía la cara del revés.\"",
                    options: [
                        { id: 'gj_o1', label: 'No hubo guardia anterior', next: 'gj_n2a' },
                        { id: 'gj_o2', label: '¿De qué te ríes?', next: 'gj_n2b' }
                    ]
                },
                'gj_n2a': {
                    id: 'gj_n2a',
                    text: "\"¡Exacto! ¡Ese es el chiste! Nadie sale, nadie entra. Solo nosotros, dando vueltas en el desagüe.\"",
                    options: [
                        { id: 'gj_o2a', label: 'Cállate', next: 'gj_n3a' },
                        { id: 'gj_o2b', label: 'Estás histérico', next: 'gj_n3b' }
                    ]
                },
                'gj_n2b': {
                    id: 'gj_n2b',
                    text: "*Se limpia una lágrima de risa (o tristeza).* \"De la ironía. Buscamos aire limpio bajo tierra. Es... *hilarante*.\"",
                    options: [
                        { id: 'gj_o2c', label: 'No tiene gracia', next: 'gj_n3b' }
                    ]
                },
                'gj_n3a': {
                    id: 'gj_n3a',
                    text: "*Se tapa la boca, pero los hombros le tiemblan.* \"Mmm-hmm. Serio. Soy serio. Como un cadáver.\"",
                    options: [{ id: 'gj_o3a', label: 'Demasiado ruido. Fuera.', next: null, resultText: "*Se aleja riendo a carcajadas.* \"¡El chiste eres tú! ¡Tú eres el chiste!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gj_o3b', label: 'Veamos si esa risa es síntoma.', next: null, resultText: "*Se muerde el labio.* \"Ji... ji... vale, me pongo serio. Serio como una tumba.\"", onclick: act.test, log: { text: 'Nota: Risa maníaca inapropiada.', icon: 'fa-face-grin-squint' } }]
                },
                'gj_n3b': {
                    id: 'gj_n3b',
                    text: "\"Lo siento... el gas de la risa, ¿sabes? O quizás solo perdí el juicio en el Sector 4.\"",
                    options: [{ id: 'gj_o3c', label: 'Estás loco. Largo.', next: null, resultText: "*Hace una reverencia burlona.* \"¡Hasta la próxima función!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gj_o3d', label: 'Quédate quieto. Voy a escanear.', next: null, resultText: "*Pone cara de estatua.* \"¿Así? ¿Estoy bastante quieto para su majestad?\"", onclick: act.test }]
                },
                'gj_n4b': {
                    id: 'gj_n4b',
                    text: "*Euforia maníaca. Posible hipoxia o intoxicación.*",
                    options: [{ id: 'gj_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gj_o4b1', label: 'Revisar niveles de oxígeno (Pulso)', next: null }]
                }
            }
        },
        // 24. THE SOLDIER (El soldado)
        "gen_soldier": {
            id: 'gen_soldier',
            tags: ['stoic', 'aggressive'],
            unique: false,
            root: 'gso_n1',
            nodes: {
                'gso_n1': {
                    id: 'gso_n1',
                    text: "*Se cuadra militarmente, aunque le falta una bota y sangra por la frente.* \"Soldado 734 reportándose. El perímetro exterior ha caído.\"",
                    options: [
                        { id: 'gso_o1', label: 'Descansen, soldado', next: 'gso_n2a' },
                        { id: 'gso_o2', label: 'Informe de situación', next: 'gso_n2b' }
                    ]
                },
                'gso_n2a': {
                    id: 'gso_n2a',
                    text: "*No se relaja.* \"No hay descanso mientras la amenaza persista. Solicito munición y acceso a la enfermería.\"",
                    options: [
                        { id: 'gso_o2a', label: 'No tenemos munición', next: 'gso_n3a' }
                    ]
                },
                'gso_n2b': {
                    id: 'gso_n2b',
                    text: "\"Hostiles gaseosos. Se mueven con el viento. Mis hombres... inhalaron. Se volvieron contra mí.\"",
                    options: [
                        { id: 'gso_o2b', label: '¿Te mordieron?', next: 'gso_n3b' },
                        { id: 'gso_o2c', label: '¿Inhalaste tú?', next: 'gso_n3a' }
                    ]
                },
                'gso_n3a': {
                    id: 'gso_n3a',
                    text: "*Tose discretamente en su puño.* \"Negativo. La máscara aguantó... casi todo el tiempo.\"",
                    options: [{ id: 'gso_o3a', label: 'Mentira. Estás contaminado.', next: null, resultText: "*Aprieta los dientes.* \"Error táctico. Se arrepentirá de perder a un combatiente.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gso_o3b', label: 'Déjame verificar tus pulmones.', next: null, resultText: "*Levanta la barbilla.* \"Proceda. Mis pulmones son de acero.\"", onclick: act.test, log: { text: 'Amenaza: Posible gas alucinógeno o entidad gaseosa.', icon: 'fa-mask' } }]
                },
                'gso_n3b': {
                    id: 'gso_n3b',
                    text: "\"Solo rasguños. Daños colaterales. Soy apto para el servicio.\"",
                    options: [{ id: 'gso_o3c', label: 'Demasiado riesgo. Retírese.', next: null, resultText: "*Se da media vuelta.* \"Retirada estratégica. Buscaré otro puesto.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gso_o3d', label: 'Inspección de heridas. Ahora.', next: null, resultText: "*Se descubre las heridas.* \"Solo son rasguños de guerra. Nada que no cure.\"", onclick: act.test }]
                },
                'gso_n4b': {
                    id: 'gso_n4b',
                    text: "*Heridas superficiales infectadas. Signos de fatiga de combate.*",
                    options: [{ id: 'gso_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gso_o4b1', label: 'Revisar temperatura y piel', next: null }]
                }
            }
        },
        // 25. THE CARRIER (El portador)
        "gen_carrier": {
            id: 'gen_carrier',
            tags: ['nervous', 'protective'],
            unique: false,
            root: 'gca_n1',
            nodes: {
                'gca_n1': {
                    id: 'gca_n1',
                    text: "*Abraza un bulto de trapos contra su pecho.* \"Shhh... duerme. No hagas ruido ante el señor guardia.\"",
                    options: [
                        { id: 'gca_o1', label: '¿Qué llevas ahí?', next: 'gca_n2a' },
                        { id: 'gca_o2', label: 'Enséñame el bulto', next: 'gca_n2b' }
                    ]
                },
                'gca_n2a': {
                    id: 'gca_n2a',
                    text: "\"Es mi... mi salvación. Lo único que quedó limpio. No dejaré que lo toquen con sus guantes sucios.\"",
                    options: [
                        { id: 'gca_o2a', label: 'Debo inspeccionarlo', next: 'gca_n3a' },
                        { id: 'gca_o2b', label: '¿Es un bebé?', next: 'gca_n3b' }
                    ]
                },
                'gca_n2b': {
                    id: 'gca_n2b',
                    text: "*Retrocede protegiendo el bulto.* \"¡No! ¡Lo despertarán! Y cuando llora... atrae a las cosas.\"",
                    options: [
                        { id: 'gca_o2c', label: 'Es obligatorio', next: 'gca_n3a' }
                    ]
                },
                'gca_n3a': {
                    id: 'gca_n3a',
                    text: "*Entreabre los trapos. Ves algo que brilla húmedamente, quizás carne, quizás metal.* \"¿Ves? Es precioso.\"",
                    options: [{ id: 'gca_o3a', label: 'Eso no es humano. Fuera.', next: null, resultText: "*Cubre el bulto.* \"¡No le mires! ¡No eres digno!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gca_o3b', label: 'Necesito escanear eso.', next: null, resultText: "*Te mira con odio.* \"Si le haces daño... te mataré.\"", onclick: act.test, log: { text: 'Amenaza: Posible parásito o tejido biológico externo.', icon: 'fa-biohazard' } }]
                },
                'gca_n3b': {
                    id: 'gca_n3b',
                    text: "\"Era... antes. Ahora es mejor. No necesita comer, solo... calor.\"",
                    options: [{ id: 'gca_o3c', label: 'Qué horror. Largo de aquí.', next: null, resultText: "*Arrulla al bulto.* \"Vámonos, pequeño... aquí no nos quieren.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gca_o3d', label: 'Déjame ver si es contagioso.', next: null, resultText: "*Acerca el bulto.* \"Mira... ¿ves cómo late? Es fuerte.\"", onclick: act.test }]
                },
                'gca_n4b': {
                    id: 'gca_n4b',
                    text: "*Objeto biológico no identificado. Posible parásito o restos.*",
                    options: [{ id: 'gca_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore }, { id: 'gca_o4b1', label: 'Analizar con UV (Dermis)', next: null }]
                }
            }
        },

        // Test pool generic_01 for unit tests
        "generic_01": {
            id: 'generic_01',
            tags: ['test'],
            unique: true,
            root: 'g1_n1',
            nodes: {
                'g1_n1': { id: 'g1_n1', text: "*Hola* {rumor}", options: [{ id: 'g1_o1', label: 'Ask health', next: 'g1_n2a', sets: ['asked_health'] }, { id: 'g1_o2', label: 'Ignore', next: null }] },
                'g1_n2a': { id: 'g1_n2a', text: "Follow up", options: [{ id: 'g1_o2a', label: 'Next', next: 'g1_n3a' }] },
                'g1_n3a': { id: 'g1_n3a', text: "Then", options: [{ id: 'g1_o3a', label: 'Next', next: 'g1_n4a' }] },
                'g1_n4a': { id: 'g1_n4a', text: "End", options: [] }
            }
        },

        // Test pool generic_02 for requires
        "generic_02": {
            id: 'generic_02',
            tags: ['test'],
            unique: true,
            root: 'g2_n4a',
            nodes: {
                'g2_n4a': { id: 'g2_n4a', text: "Require test", options: [{ id: 'g2_o1', label: 'Require noted', requires: ['noted_voice'], next: 'g2_n5a' }, { id: 'g2_o2', label: 'No', next: null }] },
                'g2_n5a': { id: 'g2_n5a', text: "After require", options: [] }
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
