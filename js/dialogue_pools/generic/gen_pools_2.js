import { act } from '../../DialogueActions.js';

export const gen_pools_2 = {
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
                options: [
                    { id: 'gsh_o3a', label: 'No aceptamos inestables. Vete.', next: null, resultText: "*Se va mirando atrás.* \"Están ahí... sé que me siguen.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gsh_o3b', label: 'Descansa un momento, voy a revisarte.', next: null, resultText: "*Se apoya en la pared.* \"Al menos aquí hay luz... revisa lo que quieras.\"", onclick: act.test },
                    { id: 'gsh_o3e', label: 'Tranquilo', next: 'gsh_n4b' }
                ]
            },
            'gsh_n3b': {
                id: 'gsh_n3b',
                text: "*Se estremece.* \"Solo déjame entrar donde haya luz constante. Por favor.\"",
                options: [
                    { id: 'gsh_o3c', label: 'Lo siento, no hay espacio.', next: null, resultText: "*Retrocede hacia la oscuridad.* \"No me dejes con ellas...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gsh_o3d', label: 'Ponte bajo la luz, déjame ver.', next: null, resultText: "*Se pone bajo el foco.* \"No dejes que se apague la luz mientras miras.\"", onclick: act.test, log: { text: 'Comportamiento: Fobia a la oscuridad. Afirman que las sombras persisten incluso bajo luz directa.', icon: 'fa-eye-slash' } },
                    { id: 'gsh_o3f', label: 'Acércate', next: 'gsh_n4b' }
                ]
            },
            'gsh_n4b': {
                id: 'gsh_n4b',
                text: "*Estrés postraumático. Verifica PUPILAS para descartar alucinaciones inducidas.*",
                options: []
            }
        }
    },
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
                options: [
                    { id: 'gc_o3a', label: 'No es un hotel. Vete.', next: null, resultText: "*Se va abrazándose a sí mismo.* \"Tanto frío... nunca se va...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gc_o3b', label: 'Medir temperatura corporal', next: null, resultText: "*Tiembla violentamente.* \"Hazlo... necesito entrar al calor.\"", onclick: act.testThermo },
                    { id: 'gc_o3e', label: 'Espera', next: 'gc_n4b' }
                ]
            },
            'gc_n3b': {
                id: 'gc_n3b',
                text: "*Sus dientes castañean.* \"No... no estoy enfermo. Solo tengo frío.\"",
                options: [
                    { id: 'gc_o3c', label: 'Pareces enfermo. Aléjate.', next: null, resultText: "*Se aleja castañeteando los dientes.* \"No estoy enfermo... es el hielo...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gc_o3d', label: 'Verificar hipotermia', next: null, resultText: "*Intenta quedarse quieto.* \"Perdón... no puedo parar de temblar.\"", onclick: act.testThermo, log: { text: 'Síntoma: Temperatura corporal incompatible con la vida. La sangre parece haberse detenido o helado.', icon: 'fa-snowflake' } },
                    { id: 'gc_o3f', label: 'Quieto', next: 'gc_n4b' }
                ]
            },
            'gc_n4b': {
                id: 'gc_n4b',
                text: "*Temperatura baja. Usa el TERMÓMETRO para confirmar si es hipotermia o infección.*",
                options: []
            }
        }
    },
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
                options: [
                    { id: 'gh_o3a', label: 'Estás loco. Largo.', next: null, resultText: "*Se va contando tornillos.* \"Uno, dos... ellos no entienden el valor...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gh_o3b', label: 'Deja eso ahí. Procedo a escanear.', next: null, resultText: "*Deja la chatarra en el suelo.* \"Cuidado con eso, es de primera calidad.\"", onclick: act.testPulse, log: { text: 'Conducta: Recolección obsesiva de metal oxidado. Creen que el óxido \"alimenta\".', icon: 'fa-screwdriver' } },
                    { id: 'gh_o3e', label: 'Manos arriba', next: 'gh_n4b' }
                ]
            },
            'gh_n3b': {
                id: 'gh_n3b',
                text: "*Guarda sus cosas.* \"Solo déjame entrar. Puedo arreglar cosas. Soy útil.\"",
                options: [
                    { id: 'gh_o3c', label: 'No necesitamos chatarreros.', next: null, resultText: "*Recoge sus cosas ofendido.* \"Me llevaré mi talento a otra parte.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gh_o3d', label: 'Veraremos si eres útil. Espera.', next: null, resultText: "*Se endereza.* \"Verás que estoy sano como una tubería nueva.\"", onclick: act.testPulse },
                    { id: 'gh_o3f', label: 'Espera', next: 'gh_n4b' }
                ]
            },
            'gh_n4b': {
                id: 'gh_n4b',
                text: "*Conducta obsesiva. Verifica PULSO para detectar manía.*",
                options: []
            }
        }
    },
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
                options: [
                    { id: 'ge_o3a', label: 'Me das mala espina. Vete.', next: null, resultText: "*Imita tu gesto.* \"Vete... vete... adiós.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'ge_o3b', label: 'Solo... quédate quieto un segundo.', next: null, resultText: "*Se queda inmóvil.* \"Quieto... quieto... esperando.\"", onclick: act.test },
                    { id: 'ge_o3e', label: '...', next: 'ge_n4b' }
                ]
            },
            'ge_n3b': {
                id: 'ge_n3b',
                text: "*Te mira esperando una señal.* \"¿Puedo pasar? ¿Pasar?\"",
                options: [
                    { id: 'ge_o3c', label: 'No. No puedes pasar.', next: null, resultText: "*Se aleja.* \"Pasar... no pasar... no pasar...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'ge_o3d', label: 'Voy a procesar tu solicitud, espera.', next: null, resultText: "*Asiente al ritmo de un reloj invisible.* \"Procesando... procesando...\"", onclick: act.test, log: { text: 'Síntoma: Ecolalia y retraso en respuesta. Posiblemente procesando señales de una mente colmena.', icon: 'fa-comments' } },
                    { id: 'ge_o3f', label: 'Espera', next: 'ge_n4b' }
                ]
            },
            'ge_n4b': {
                id: 'ge_n4b',
                text: "*Patrones de habla atípicos. Usa LINTERNA UV para buscar marcas en el cuello.*",
                options: []
            }
        }
    },
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
                options: [
                    { id: 'gsl_o3a', label: 'Estás paranoico. Vete.', next: null, resultText: "*Se tambalea.* \"Dormiré... cuando esté muerto...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gsl_o3b', label: 'Tranquilo. Déjame hacer unas pruebas.', next: null, resultText: "*Abre mucho los ojos.* \"Hazlo rápido, antes de que me duerma de pie.\"", onclick: act.test },
                    { id: 'gsl_o3e', label: 'Rápido', next: 'gsl_n4b' }
                ]
            },
            'gsl_n3b': {
                id: 'gsl_n3b',
                text: "*Bosteza y se tambalea.* \"Por favor... solo una cama. O el suelo. Me da igual.\"",
                options: [
                    { id: 'gsl_o3c', label: 'No tenemos sitio. Lo siento.', next: null, resultText: "*Se arrastra lejos.* \"Solo quería cerrar los ojos un momento...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gsl_o3d', label: 'Aguanta un poco más, voy a revisar.', next: null, resultText: "*Se apoya en el marco.* \"Despierto... sigo despierto... revisa.\"", onclick: act.test, log: { text: 'Dato: Los infectados evitan dormir. Dicen que al cerrar los ojos \"algo se acerca\".', icon: 'fa-bed' } },
                    { id: 'gsl_o3f', label: 'Aguanta', next: 'gsl_n4b' }
                ]
            },
            'gsl_n4b': {
                id: 'gsl_n4b',
                text: "*Privación de sueño. Verifica PUPILAS para descartar estimulantes o infección.*",
                options: []
            }
        }
    }
};
