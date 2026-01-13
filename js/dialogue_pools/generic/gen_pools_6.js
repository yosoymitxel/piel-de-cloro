import { act } from '../../DialogueActions.js';

export const gen_pools_6 = {
    "gen_hungry": {
        id: 'gen_hungry',
        tags: ['aggressive', 'body_horror', 'generic'],
        unique: false,
        root: 'ghn_n1',
        nodes: {
            'ghn_n1': {
                id: 'ghn_n1',
                text: "*Se lame los labios secos constantemente.* \"El olor... aquí huele a comida. A carne caliente.\"",
                options: [
                    { id: 'ghn_o1', label: 'No hay comida aquí', next: 'ghn_n2a' },
                    { id: 'ghn_o2', label: '¿Qué hueles?', next: 'ghn_n2b' }
                ]
            },
            'ghn_n2a': {
                id: 'ghn_n2a',
                text: "\"Mientes. Huelo la circulation. La sangre bajo la piel. Es... apetitoso.\"",
                options: [
                    { id: 'ghn_o2a', label: 'Amenazar', next: 'ghn_n3a' }
                ]
            },
            'ghn_n2b': {
                id: 'ghn_n2b',
                text: "\"Huelo... vida. Fuera todo está seco. Muerto. Aquí dentro hay jugo.\"",
                options: [
                    { id: 'ghn_o2b', label: 'Qué asco', next: 'ghn_n3b' }
                ]
            },
            'ghn_n3a': {
                id: 'ghn_n3a',
                text: "*Retrocede, pero sigue mirando tu cuello.* \"Tranquilo... puedo controlarme. Si me das raciones dobles.\"",
                options: [
                    { id: 'ghn_o3a', label: 'Ni hablar. Largo.', next: null, resultText: "*Se va relamiéndose.* \"Encontraré algo... o a alguien...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'ghn_o3b', label: 'Verificar pulso (Agitación)', next: null, resultText: "*Sonríe mostrando dientes afilados.* \"Cerrada... por ahora.\"", onclick: act.testPulse },
                    { id: 'ghn_o3e', label: 'Atrás', next: 'ghn_n4b' }
                ]
            },
            'ghn_n3b': {
                id: 'ghn_n3b',
                text: "\"Es la naturaleza. El fuerte come al débil. ¿Me dejarás entrar o serás comida?\"",
                options: [
                    { id: 'ghn_o3c', label: 'Eres una amenaza. Vete.', next: null, resultText: "*Gruñe.* \"La carne se desperdicia...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'ghn_o3d', label: 'Analizar metabolismo (Termómetro)', next: null, resultText: "*Abre la boca.* \"Mira dentro si te atreves.\"", onclick: act.testThermo, log: { text: 'Síntoma: Polifagia agresiva. Posible alteración metabólica por el parásito.', icon: 'fa-utensils' } },
                    { id: 'ghn_o3f', label: 'Quieto', next: 'ghn_n4b' }
                ]
            },
            'ghn_n4b': {
                id: 'ghn_n4b',
                text: "*Metabolismo acelerado. Verifica PULSO y TEMPERATURA para confirmar estado depredador.*",
                options: []
            }
        }
    },
    "gen_clean": {
        id: 'gen_clean',
        tags: ['obsessive', 'nervous', 'generic'],
        unique: false,
        root: 'gcl_n1',
        nodes: {
            'gcl_n1': {
                id: 'gcl_n1',
                text: "*Se frota las manos con un trapo inexistente.* \"Está sucio... todo está sucio. El aire deja grasa en la piel.\"",
                options: [
                    { id: 'gcl_o1', label: 'Cálmate', next: 'gcl_n2a' },
                    { id: 'gcl_o2', label: '¿Qué grasa?', next: 'gcl_n2b' }
                ]
            },
            'gcl_n2a': {
                id: 'gcl_n2a',
                text: "\"No puedo calmarme hasta que esté limpio. ¿Tenéis duchas de descontaminación? ¿Ácido?\"",
                options: [
                    { id: 'gcl_o2a', label: 'Tenemos agua', next: 'gcl_n3a' }
                ]
            },
            'gcl_n2b': {
                id: 'gcl_n2b',
                text: "\"La que sueltan ellos. Los infectados. Respiran y el aire se vuelve aceite. Lo siento en mis poros.\"",
                options: [
                    { id: 'gcl_o2b', label: 'Interesante teoría', next: 'gcl_n3b' }
                ]
            },
            'gcl_n3a': {
                id: 'gcl_n3a',
                text: "*Mira sus manos rojas de tanto frotar.* \"El agua no basta. Necesito raspar. Quitar la capa de arriba.\"",
                options: [
                    { id: 'gcl_o3a', label: 'Estás obsesionado. Vete.', next: null, resultText: "*Sigue frotando mientras se aleja.* \"Sucio... todo sucio...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gcl_o3b', label: 'Deja de frotar y déjame ver.', next: null, resultText: "*Extiende las manos en carne viva.* \"¿Ves la grasa? ¿La ves?\"", onclick: act.test },
                    { id: 'gcl_o3e', label: 'Para', next: 'gcl_n4b' }
                ]
            },
            'gcl_n3b': {
                id: 'gcl_n3b',
                text: "\"No es teoría. Es higiene. Si me dejas entrar, limpiaré. Limpiaré todo.\"",
                options: [
                    { id: 'gcl_o3c', label: 'No necesitamos limpieza obsesiva.', next: null, resultText: "*Escupe al suelo.* \"Os pudriréis en vuestra mugre.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gcl_o3d', label: 'Veremos si estás limpio por dentro.', next: null, resultText: "*Asiente frenéticamente.* \"Por dentro estoy impoluto. Lo juro.\"", onclick: act.test, log: { text: 'Conducta: Ablutomanía extrema. Se han arrancado capas de piel intentando \"limpiarse\".', icon: 'fa-soap' } },
                    { id: 'gcl_o3f', label: 'Veremos', next: 'gcl_n4b' }
                ]
            },
            'gcl_n4b': {
                id: 'gcl_n4b',
                text: "*Dermatitis por fricción. Usa LINTERNA UV para ver si hay infección bajo las heridas.*",
                options: []
            }
        }
    },
    "gen_forget": {
        id: 'gen_forget',
        tags: ['confused', 'stoic', 'generic'],
        unique: false,
        root: 'gfg_n1',
        nodes: {
            'gfg_n1': {
                id: 'gfg_n1',
                text: "*Mira su reflejo en el cristal.* \"Ese... ¿ese soy yo? No me reconozco. Parezco más viejo.\"",
                options: [
                    { id: 'gfg_o1', label: '¿Cómo te llamas?', next: 'gfg_n2a' },
                    { id: 'gfg_o2', label: 'El viaje cambia a todos', next: 'gfg_n2b' }
                ]
            },
            'gfg_n2a': {
                id: 'gfg_n2a',
                text: "\"Creo que... era Jaren. O tal vez Soren. Se me ha olvidado. La niebla se lleva los nombres.\"",
                options: [
                    { id: 'gfg_o2a', label: 'Amnesia', next: 'gfg_n3a' }
                ]
            },
            'gfg_n2b': {
                id: 'gfg_n2b',
                text: "\"No es solo cambio. Es sustitución. Siento que alguien más usa mi cara.\"",
                options: [
                    { id: 'gfg_o2b', label: 'Síndrome de Capgras', next: 'gfg_n3b' }
                ]
            },
            'gfg_n3a': {
                id: 'gfg_n3a',
                text: "*Se toca la cara.* \"Si no sé quién soy, ¿cómo sabes tú si debo entrar?\"",
                options: [
                    { id: 'gfg_o3a', label: 'Buen punto. Vete.', next: null, resultText: "*Se aleja tocándose la cara.* \"¿Quién soy...?\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gfg_o3b', label: 'Tus constantes me dirán quién eres.', next: null, resultText: "*Baja la mano.* \"Espero que la máquina sepa más que yo.\"", onclick: act.test },
                    { id: 'gfg_o3e', label: 'Veamos', next: 'gfg_n4b' }
                ]
            },
            'gfg_n3b': {
                id: 'gfg_n3b',
                text: "\"A veces pienso que el verdadero yo murió en el túnel. Y yo soy solo el eco.\"",
                options: [
                    { id: 'gfg_o3c', label: 'No admitimos ecos. Fuera.', next: null, resultText: "*Se desvanece en la oscuridad.* \"Solo un eco...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gfg_o3d', label: 'Déjame comprobar si eres real.', next: null, resultText: "*Se acerca al cristal.* \"Comprueba. Tócame. ¿Soy real?\"", onclick: act.test, log: { text: 'Síntoma: Despersonalización. El sujeto cree haber sido reemplazado o haber muerto.', icon: 'fa-user-slash' } },
                    { id: 'gfg_o3f', label: 'Acércate', next: 'gfg_n4b' }
                ]
            },
            'gfg_n4b': {
                id: 'gfg_n4b',
                text: "*Amnesia disociativa. Verifica PUPILAS para descartar daño cerebral.*",
                options: []
            }
        }
    },
    "gen_fever": {
        id: 'gen_fever',
        tags: ['sick', 'generic'],
        unique: false,
        root: 'gfv_n1',
        nodes: {
            'gfv_n1': {
                id: 'gfv_n1',
                text: "*Suda profusamente y se abanica con la mano.* \"Uf... hace un calor infernal en los túneles hoy. ¿No lo notáis?\"",
                options: [
                    { id: 'gfv_o1', label: 'La temperatura es normal', next: 'gfv_n2a' },
                    { id: 'gfv_o2', label: 'Estás ardiendo', next: 'gfv_n2b' }
                ]
            },
            'gfv_n2a': {
                id: 'gfv_n2a',
                text: "\"Será que he caminado rápido. Llevo prisa. Solo necesito agua y un sitio fresco.\"",
                options: [
                    { id: 'gfv_o2a', label: 'Parece fiebre', next: 'gfv_n3a' }
                ]
            },
            'gfv_n2b': {
                id: 'gfv_n2b',
                text: "\"Mira, si fuera 'eso', ya estaría muerto, ¿no? Llevo así dos días y sigo en pie.\"",
                options: [
                    { id: 'gfv_o2b', label: 'Dudar', next: 'gfv_n3b' }
                ]
            },
            'gfv_n3a': {
                id: 'gfv_n3a',
                text: "*Se seca el sudor, que parece ligeramente viscoso.* \"No es nada contagioso, lo prometo. Solo agotamiento.\"",
                options: [
                    { id: 'gfv_o3a', label: 'Ese sudor no es normal. Vete.', next: null, resultText: "*Se marcha tambaleándose.* \"Solo es calor... mucho calor...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gfv_o3b', label: 'Déjame medir tu temperatura.', next: null, resultText: "*Se apoya en la pared.* \"Vale, pero rápido. Me mareo.\"", onclick: act.testThermo },
                    { id: 'gfv_o3e', label: 'Espera', next: 'gfv_n4b' }
                ]
            },
            'gfv_n3b': {
                id: 'gfv_n3b',
                text: "\"Mira, si fuera 'eso', ya estaría muerto, ¿no? Llevo así dos días y sigo en pie.\"",
                options: [
                    { id: 'gfv_o3c', label: 'Buen punto, pero no me fío.', next: null, resultText: "*Escupe al suelo.* \"Paranoicos...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gfv_o3d', label: 'A ver esos ojos. Acércate.', next: null, resultText: "*Se acerca, sus pupilas oscilan.* \"¿Ves? Normales.\"", onclick: act.testPupils },
                    { id: 'gfv_o3f', label: 'Acércate', next: 'gfv_n4b' }
                ]
            },
            'gfv_n4b': {
                id: 'gfv_n4b',
                text: "*Hipertermia. Usa el TERMÓMETRO para confirmar fiebre o infección.*",
                options: []
            }
        }
    },
    "gen_euphoria": {
        id: 'gen_euphoria',
        tags: ['manic', 'energetic', 'generic'],
        unique: false,
        root: 'geu_n1',
        nodes: {
            'geu_n1': {
                id: 'geu_n1',
                text: "*Tiene los ojos muy abiertos y una sonrisa fija.* \"¡Qué día tan maravilloso! El aire huele a... a limpio. A nuevo.\"",
                options: [
                    { id: 'geu_o1', label: 'El aire está viciado', next: 'geu_n2a' },
                    { id: 'geu_o2', label: '¿Te encuentras bien?', next: 'geu_n2b' }
                ]
            },
            'geu_n2a': {
                id: 'geu_n2a',
                text: "\"¡Para nada! Nunca había respirado tan bien. Siento que mis pulmones se han expandido.\"",
                options: [
                    { id: 'geu_o2a', label: 'Eso suena sospechoso', next: 'geu_n3a' }
                ]
            },
            'geu_n2b': {
                id: 'geu_n2b',
                text: "\"¡Mejor que bien! Me siento... evolucionado. Como si me hubiera quitado un peso de encima.\"",
                options: [
                    { id: 'geu_o2b', label: '¿Qué peso?', next: 'geu_n3b' }
                ]
            },
            'geu_n3a': {
                id: 'geu_n3a',
                text: "*Inspira profundamente.* \"Quizás es que tú no estás acostumbrado a la pureza. Deberías probarlo.\"",
                options: [
                    { id: 'geu_o3a', label: 'Estás delirando. Fuera.', next: null, resultText: "*Se va saltando.* \"¡Aire puro! ¡Vida pura!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'geu_o3b', label: 'Quieto. Voy a escanearte.', next: null, resultText: "*Abre los brazos.* \"Escanea. Verás la perfection.\"", onclick: act.test, log: { text: 'Síntoma: Euforia química. El parásito libera dopamina para asegurar la cooperación del huésped.', icon: 'fa-face-grin-stars' } },
                    { id: 'geu_o3e', label: 'Quieto', next: 'geu_n4b' }
                ]
            },
            'geu_n3b': {
                id: 'geu_n3b',
                text: "\"El peso de ser... frágil. Ahora me siento fuerte. Resistente.\"",
                options: [
                    { id: 'geu_o3c', label: 'Eso es síntoma de infección. Largo.', next: null, resultText: "*Te mira con lástima.* \"Te quedas atrás en la evolución...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'geu_o3f', label: 'Veamos', next: 'geu_n4b' }
                ]
            },
            'geu_n4b': {
                id: 'geu_n4b',
                text: "*Euforia anómala. Verifica PULSO para detectar sobrecarga química.*",
                options: []
            }
        }
    }
};
