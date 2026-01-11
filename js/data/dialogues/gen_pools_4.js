import { DialogueActions as act } from '../../DialogueActions.js';

export const gen_jester = {
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
};

export const gen_soldier = {
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
};

export const gen_carrier = {
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
            options: [
                { id: 'gca_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gca_o4b1', label: 'Admitir (Riesgo)', next: null, sets: ['admitted'], cssClass: 'text-alert border-alert', onclick: act.admit }
            ]
        }
    }
};
