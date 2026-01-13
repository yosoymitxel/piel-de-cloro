import { act } from '../../DialogueActions.js';

export const gen_pools_5 = {
    "gen_silent": {
        id: 'gen_silent',
        tags: ['stoic', 'nervous', 'generic'],
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
                options: [
                    { id: 'gsi_o3a', label: 'Estás loco. Vete.', next: null, resultText: "*Recoge la nota y huye despavorido.*", cssClass: 'horror-btn-dismiss', onclick: act.ignore, paranoia: 5 },
                    { id: 'gsi_o3b', label: 'Entiendo. Déjame revisarte en silencio.', next: null, resultText: "*Asiente lentamente y te ofrece el brazo en silencio.*", onclick: act.test, sanity: -2, log: { text: 'Lore: "Los que escuchan". Entidades en las tuberías que reaccionan al sonido de la voz humana.', icon: 'fa-note-sticky' } },
                    { id: 'gsi_o3e', label: '...', next: 'gsi_n4b' }
                ]
            },
            'gsi_n3b': {
                id: 'gsi_n3b',
                text: "*Te muestra el cuello. Las venas están hinchadas, como si quisiera gritar pero se contuviera.*",
                options: [
                    { id: 'gsi_o3c', label: 'Demasiado inestable. Fuera.', next: null, resultText: "*Huye sin hacer ruido, con los ojos llenos de pánico.*", cssClass: 'horror-btn-dismiss', onclick: act.ignore, paranoia: 3 },
                    { id: 'gsi_o3d', label: 'Voy a medir tu pulso.', next: null, resultText: "*Extiende la muñeca temblando, sin emitir sonido.*", onclick: act.testPulse },
                    { id: 'gsi_o3f', label: 'Calma', next: 'gsi_n4b' }
                ]
            },
            'gsi_n4b': {
                id: 'gsi_n4b',
                text: "*Mudez voluntaria. Verifica PULSO para detectar estrés extremo.*",
                options: []
            }
        }
    },
    "gen_bribe": {
        id: 'gen_bribe',
        tags: ['aggressive', 'nervous', 'generic'],
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
                options: [
                    { id: 'gbr_o3a', label: 'Información insuficiente. Vete.', next: null, resultText: "*Golpea el cristal.* \"¡Te arrepentirás! ¡Esa información valía oro!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gbr_o3b', label: 'Veremos. Primero el chequeo.', next: null, resultText: "*Se cruza de brazos.* \"Bien. Revisa. Pero recuerda lo del moho.\"", onclick: act.testPulse, log: { text: 'Lore: El moho negro es una red neuronal. Se extiende por ventilación. El fuego es lo único que lo detiene.', icon: 'fa-fire' } },
                    { id: 'gbr_o3e', label: 'Veremos', next: 'gbr_n4b' }
                ]
            },
            'gbr_n3b': {
                id: 'gbr_n3b',
                text: "\"¡Te estoy haciendo un favor! ¡Maldito burócrata!\"",
                options: [
                    { id: 'gbr_o3c', label: 'No tolero insultos. Largo.', next: null, resultText: "*Se aleja maldiciendo.* \"¡Ojalá se te pudra el filtro de aire!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gbr_o3d', label: 'Cállate y coopera.', next: null, resultText: "*Bufa.* \"Venga, acaba ya. Tengo cosas que hacer.\"", onclick: act.testPulse },
                    { id: 'gbr_o3f', label: 'Silencio', next: 'gbr_n4b' }
                ]
            },
            'gbr_n4b': {
                id: 'gbr_n4b',
                text: "*Sujeto manipulador. Usa LINTERNA UV para verificar si oculta algo.*",
                options: []
            }
        }
    },
    "gen_jester": {
        id: 'gen_jester',
        tags: ['manic', 'loud', 'generic'],
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
                options: [
                    { id: 'gj_o3a', label: 'Demasiado ruido. Fuera.', next: null, resultText: "*Se aleja riendo a carcajadas.* \"¡El chiste eres tú! ¡Tú eres el chiste!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gj_o3b', label: 'Veamos si esa risa es síntoma.', next: null, resultText: "*Se muerde el labio.* \"Ji... ji... vale, me pongo serio. Serio como una tumba.\"", onclick: act.test, log: { text: 'Síntoma: Risa incontrolable. Posible daño cerebral por hipoxia o toxinas.', icon: 'fa-face-grin-squint' } },
                    { id: 'gj_o3e', label: 'Serio', next: 'gj_n4b' }
                ]
            },
            'gj_n3b': {
                id: 'gj_n3b',
                text: "\"Lo siento... el gas de la risa, ¿sabes? O quizás solo perdí el juicio en el Sector 4.\"",
                options: [
                    { id: 'gj_o3c', label: 'Estás loco. Largo.', next: null, resultText: "*Hace una reverencia burlona.* \"¡Hasta la próxima función!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gj_o3d', label: 'Quédate quieto. Voy a escanear.', next: null, resultText: "*Pone cara de estatua.* \"¿Así? ¿Estoy bastante quieto para su majestad?\"", onclick: act.test },
                    { id: 'gj_o3f', label: 'Quieto', next: 'gj_n4b' }
                ]
            },
            'gj_n4b': {
                id: 'gj_n4b',
                text: "*Euforia maníaca. Verifica PUPILAS para descartar intoxicación.*",
                options: []
            }
        }
    },
    "gen_soldier": {
        id: 'gen_soldier',
        tags: ['aggressive', 'stoic', 'generic'],
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
                options: [
                    { id: 'gso_o3a', label: 'Mentira. Estás contaminado.', next: null, resultText: "*Aprieta los dientes.* \"Error táctico. Se arrepentirá de perder a un combatiente.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gso_o3b', label: 'Verificar pulmones (Pulso)', next: null, resultText: "*Levanta la barbilla.* \"Proceda. Mis pulmones son de acero.\"", onclick: act.testPulse, log: { text: 'Lore: Hostiles gaseosos. La infección se mueve con el viento y vuelve a los aliados en contra.', icon: 'fa-mask' } },
                    { id: 'gso_o3e', label: 'Proceda', next: 'gso_n4b' }
                ]
            },
            'gso_n3b': {
                id: 'gso_n3b',
                text: "\"Solo rasguños. Daños colaterales. Soy apto para el servicio.\"",
                options: [
                    { id: 'gso_o3c', label: 'Demasiado riesgo. Retírese.', next: null, resultText: "*Se da media vuelta.* \"Retirada estratégica. Buscaré otro puesto.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gso_o3d', label: 'Inspección de heridas. Ahora.', next: null, resultText: "*Se descubre las heridas.* \"Solo son rasguños de guerra. Nada que no cure.\"", onclick: act.testUV },
                    { id: 'gso_o3f', label: 'Inspección', next: 'gso_n4b' }
                ]
            },
            'gso_n4b': {
                id: 'gso_n4b',
                text: "*Heridas superficiales. Usa LINTERNA UV para descartar infección en cortes.*",
                options: []
            }
        }
    },
    "gen_carrier": {
        id: 'gen_carrier',
        tags: ['nervous', 'protective', 'generic'],
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
                options: [
                    { id: 'gca_o3a', label: 'Eso no es humano. Fuera.', next: null, resultText: "*Cubre el bulto.* \"¡No le mires! ¡No eres digno!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gca_o3b', label: 'Escanear biomasa con UV', next: null, resultText: "*Te mira con odio.* \"Si le haces daño... te mataré.\"", onclick: act.testUV, log: { text: 'Lore: Portadores de biomasa. Protegen bultos de carne como si fueran hijos. Es el futuro de la plaga.', icon: 'fa-biohazard' } },
                    { id: 'gca_o3e', label: 'Cuidado', next: 'gca_n4b' }
                ]
            },
            'gca_n3b': {
                id: 'gca_n3b',
                text: "\"Era... antes. Ahora es mejor. No necesita comer, solo... calor.\"",
                options: [
                    { id: 'gca_o3c', label: 'Qué horror. Largo de aquí.', next: null, resultText: "*Arrulla al bulto.* \"Vámonos, pequeño... aquí no nos quieren.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gca_o3d', label: 'Déjame ver si es contagioso.', next: null, resultText: "*Acerca el bulto.* \"Mira... ¿ves cómo late? Es fuerte.\"", onclick: act.testUV },
                    { id: 'gca_o3f', label: 'Veamos', next: 'gca_n4b' }
                ]
            },
            'gca_n4b': {
                id: 'gca_n4b',
                text: "*Objeto biológico no identificado. Posible parásito o restos.*",
                options: []
            }
        }
    }
};
