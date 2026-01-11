import { DialogueActions as act } from '../../DialogueActions.js';

export const gen_prophet = {
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
            options: [
                { id: 'gp_o3a', label: 'Aquí no queremos tu religión.', next: null, resultText: "*Escupe.* \"¡Herejes! ¡Os ahogaréis en vuestra ignorancia!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gp_o3b', label: 'Voy a ver si esa "luz" es fiebre.', next: null, resultText: "*Levanta la barbilla.* \"Examina mi carne. Verás la verdad escrita en ella.\"", onclick: act.testThermo, log: { text: 'Lore: Culto a la Niebla. Creen que el cloro es un "bautismo" que filtra a los débiles.', icon: 'fa-book-quran' } },
                { id: 'gp_o3e', label: 'Veremos', next: 'gp_n4b' }
            ]
        },
        'gp_n3b': {
            id: 'gp_n3b',
            text: "\"No puedes detener la marea con una puerta de metal.\"",
            options: [
                { id: 'gp_o3c', label: 'Puedo y lo haré. Largo.', next: null, resultText: "*Se aleja riendo.* \"¡La marea llega! ¡La marea llega para todos!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gp_o3d', label: 'Cállate y déjame escanearte.', next: null, resultText: "*Te mira con lástima.* \"Pobre alma ciega... haz tus pruebas inútiles.\"", onclick: act.testPupils },
                { id: 'gp_o3f', label: 'Silencio', next: 'gp_n4b' }
            ]
        },
        'gp_n4b': {
            id: 'gp_n4b',
            text: "*Signos de inhalación leve. Delirio místico.*",
            options: [
                { id: 'gp_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gp_o4b1', label: 'Admitir (Riesgo Ideológico)', next: null, sets: ['admitted'], cssClass: 'text-alert border-alert', onclick: act.admit }
            ]
        }
    }
};

export const gen_silent = {
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
            options: [
                { id: 'gsi_o3a', label: 'Estás loco. Vete.', next: null, resultText: "*Recoge la nota y huye despavorido.*", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gsi_o3b', label: 'Entiendo. Déjame revisarte en silencio.', next: null, resultText: "*Asiente lentamente y te ofrece el brazo en silencio.*", onclick: act.test, log: { text: 'Lore: "Los que escuchan". Entidades en las tuberías que reaccionan al sonido de la voz humana.', icon: 'fa-note-sticky' } }
            ]
        },
        'gsi_n3b': {
            id: 'gsi_n3b',
            text: "*Te muestra el cuello. Las venas están hinchadas, como si quisiera gritar pero se contuviera.*",
            options: [
                { id: 'gsi_o3c', label: 'Demasiado inestable. Fuera.', next: null, resultText: "*Huye sin hacer ruido, con los ojos llenos de pánico.*", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gsi_o3d', label: 'Voy a medir tu pulso.', next: null, resultText: "*Extiende la muñeca temblando, sin emitir sonido.*", onclick: act.test }
            ]
        },
        'gsi_n4b': {
            id: 'gsi_n4b',
            text: "*Mudez voluntaria. Verifica PULSO para detectar estrés extremo.*",
            options: []
        }
    }
};

export const gen_bribe = {
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
            options: [
                { id: 'gbr_o3a', label: 'Información insuficiente. Vete.', next: null, resultText: "*Golpea el cristal.* \"¡Te arrepentirás! ¡Esa información valía oro!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gbr_o3b', label: 'Veremos. Primero el chequeo.', next: null, resultText: "*Se cruza de brazos.* \"Bien. Revisa. Pero recuerda lo del moho.\"", onclick: act.testPulse, log: { text: 'Lore: El moho negro es una red neuronal. Se extiende por ventilación. El fuego es lo único que lo detiene.', icon: 'fa-fire' } }
            ]
        },
        'gbr_n3b': {
            id: 'gbr_n3b',
            text: "\"¡Te estoy haciendo un favor! ¡Maldito burócrata!\"",
            options: [
                { id: 'gbr_o3c', label: 'No tolero insultos. Largo.', next: null, resultText: "*Se aleja maldiciendo.* \"¡Ojalá se te pudra el filtro de aire!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gbr_o3d', label: 'Cállate y coopera.', next: null, resultText: "*Bufa.* \"Venga, acaba ya. Tengo cosas que hacer.\"", onclick: act.testPulse }
            ]
        },
        'gbr_n4b': {
            id: 'gbr_n4b',
            text: "*Sujeto manipulador. Usa LINTERNA UV para verificar si oculta algo.*",
            options: []
        }
    }
};
