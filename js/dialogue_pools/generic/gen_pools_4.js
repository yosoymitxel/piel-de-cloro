import { act } from '../../DialogueActions.js';

export const gen_pools_4 = {
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
                options: [
                    { id: 'glo_o3b', label: 'No puedes entrar sin autorización.', next: null, cssClass: 'horror-btn-dismiss', resultText: "*Se da la vuelta.* \"Seguiré buscando... tiene que estar en algún lado.\"", onclick: act.ignore },
                    { id: 'glo_o3a', label: 'Primero el protocolo. Espera.', next: null, resultText: "*Guarda el papel.* \"Haz lo que debas, pero déjame pasar luego.\"", onclick: act.testUV, paranoia: 1, log: { text: 'Dato: Desapariciones en Sector 4. Se rumorea que es un nido.', icon: 'fa-map-location-dot' } },
                    { id: 'glo_o3e', label: 'Espera', next: 'glo_n4b' }
                ]
            },
            'glo_n3b': {
                id: 'glo_n3b',
                text: "\"Solo déjame pasar. No molestaré.\"",
                options: [
                    { id: 'glo_o3c', label: 'Veremos qué se puede hacer. Un momento.', next: null, resultText: "*Junta las manos.* \"Gracias... solo quiero encontrarlo.\"", onclick: act.testUV, paranoia: 1 },
                    { id: 'glo_o3f', label: 'Un momento', next: 'glo_n4b' }
                ]
            },
            'glo_n4b': {
                id: 'glo_n4b',
                text: "*Sujeto desorientado. Usa LINTERNA UV para buscar rastros de contacto.*",
                options: []
            }
        }
    },
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
                options: [
                    { id: 'gqt_o2a', label: 'Bien, procedo a la inspección.', next: null, resultText: "*Se mantiene firme.* \"Estoy listo. Haz tu trabajo.\"", onclick: act.testPulse },
                    { id: 'gqt_o2c', label: 'Adelante', next: 'gqt_n4b' }
                ]
            },
            'gqt_n2b': {
                id: 'gqt_n2b',
                text: "\"Cansancio. Hambre. Lo normal.\"",
                options: [
                    { id: 'gqt_o2b', label: 'Entendido. Iniciando escaneo.', next: null, resultText: "*Asiente.* \"Proceda con el escaneo.\"", onclick: act.testPulse },
                    { id: 'gqt_o2d', label: 'Proceda', next: 'gqt_n4b' }
                ]
            },
            'gqt_n4b': {
                id: 'gqt_n4b',
                text: "*Catatonia parcial. Verifica PUPILAS para detectar actividad cerebral anómala.*",
                options: []
            }
        }
    },
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
                options: [
                    { id: 'gsc_o2a', label: 'Relájate, voy a revisarte.', next: null, resultText: "*Sonríe temblando.* \"Gracias... me siento más seguro si revisas.\"", onclick: act.testPulse, paranoia: 1, log: { text: 'Lore: Otros refugios han caído. El aislamiento es nuestra única defensa.', icon: 'fa-house-crack' } },
                    { id: 'gsc_o2c', label: 'Tranquilo', next: 'gsc_n4b' }
                ]
            },
            'gsc_n2b': {
                id: 'gsc_n2b',
                text: "*Traga saliva.* \"Bueno... mejor que fuera seguro que es.\"",
                options: [
                    { id: 'gsc_o2b', label: 'No temas. Espera un segundo.', next: null, resultText: "*Se seca el sudor.* \"Vale... vale. Estoy listo.\"", onclick: act.testPupils, paranoia: 2, sanity: -1 },
                    { id: 'gsc_o2d', label: 'Espera', next: 'gsc_n4b' }
                ]
            },
            'gsc_n4b': {
                id: 'gsc_n4b',
                text: "*Terror agudo. Verifica PULSO para descartar taquicardia por infección.*",
                options: []
            }
        }
    },
    "gen_glitch": {
        id: 'gen_glitch',
        tags: ['confused', 'broken', 'generic'],
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
                options: [
                    { id: 'gg_o3a', label: 'Error 404: Acceso denegado.', next: null, resultText: "*Parpadea erráticamente.* \"Conexión rechazada... reintentando en otro servidor...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gg_o3b', label: 'Escanear \"hardware\" (Pupilas)', next: null, resultText: "*Adopta pose en T.* \"Iniciando diagnóstico de sistema...\"", onclick: act.testPupils, paranoia: 2, sanity: -2, log: { text: 'Anomalía: Percepción alterada. Ven la realidad como datos corruptos. ¿Efecto del gas?', icon: 'fa-bug' } },
                    { id: 'gg_o3e', label: 'Escaneando', next: 'gg_n4b' }
                ]
            },
            'gg_n3b': {
                id: 'gg_n3b',
                text: "\"No puedo reiniciar. Si me apago, quizás no vuelva a cargar.\"",
                options: [
                    { id: 'gg_o3c', label: 'Ese no es mi problema.', next: null, resultText: "*Se congela.* \"Apagando sistema...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gg_o3d', label: 'Déjame ver tus ojos.', next: null, resultText: "*Abre los ojos al máximo.* \"Escanea mis datos. Busca el error.\"", onclick: act.testPupils, paranoia: 1, sanity: -1 },
                    { id: 'gg_o3f', label: 'Mírame', next: 'gg_n4b' }
                ]
            },
            'gg_n4b': {
                id: 'gg_n4b',
                text: "*Corrupción digital. Usa LINTERNA UV para buscar píxeles muertos en la piel.*",
                options: []
            }
        }
    },
    "gen_prophet": {
        id: 'gen_prophet',
        tags: ['fanatic', 'generic'],
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
                    { id: 'gp_o3b', label: 'Voy a ver si esa \"luz\" es fiebre.', next: null, resultText: "*Levanta la barbilla.* \"Examina mi carne. Verás la verdad escrita en ella.\"", onclick: act.testThermo, paranoia: 1, sanity: -1, log: { text: 'Lore: Culto a la Niebla. Creen que el cloro es un \"bautismo\" que filtra a los débiles.', icon: 'fa-book-quran' } },
                    { id: 'gp_o3e', label: 'Veremos', next: 'gp_n4b' }
                ]
            },
            'gp_n3b': {
                id: 'gp_n3b',
                text: "\"No puedes detener la marea con una puerta de metal.\"",
                options: [
                    { id: 'gp_o3c', label: 'Puedo y lo haré. Largo.', next: null, resultText: "*Se aleja riendo.* \"¡La marea llega! ¡La marea llega para todos!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gp_o3d', label: 'Cállate y déjame escanearte.', next: null, resultText: "*Te mira con lástima.* \"Pobre alma ciega... haz tus pruebas inútiles.\"", onclick: act.testPupils, paranoia: 2, sanity: -1 },
                    { id: 'gp_o3f', label: 'Silencio', next: 'gp_n4b' }
                ]
            },
            'gp_n4b': {
                id: 'gp_n4b',
                text: "*Signos de inhalación leve. Delirio místico.*",
                options: []
            }
        }
    }
};
