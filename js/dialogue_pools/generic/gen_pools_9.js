import { act } from '../../DialogueActions.js';

export const gen_pools_9 = {
    "gen_breeder": {
        id: 'gen_breeder',
        tags: ['body_horror', 'sick', 'nsfw', 'generic'],
        unique: false,
        root: 'gbre_n1',
        nodes: {
            'gbre_n1': {
                id: 'gbre_n1',
                text: "*Se acaricia el abdomen hinchado con ternura, aunque su piel está grisácea.* \"Shhh... ya casi llegamos. Tienen hambre, lo sé.\"",
                options: [
                    { id: 'gbre_o1', label: '¿Estás embarazada?', next: 'gbre_n2a' },
                    { id: 'gbre_o2', label: '¿Quiénes tienen hambre?', next: 'gbre_n2b' }
                ]
            },
            'gbre_n2a': {
                id: 'gbre_n2a',
                text: "*Sonríe, pero sus dientes están manchados de bilis.* \"No es uno solo. Son muchos. Una familia entera creciendo fuerte con mi carne.\"",
                options: [
                    { id: 'gbre_o2a', label: 'Eso son parásitos', next: 'gbre_n3a' }
                ]
            },
            'gbre_n2b': {
                id: 'gbre_n2b',
                text: "\"Mis pequeños. Se mueven tanto... a veces rasgan un poco por dentro, pero es amor de madre.\"",
                options: [
                    { id: 'gbre_o2b', label: 'Qué asco', next: 'gbre_n3b' },
                    { id: 'gbre_o2r', label: '¿Has visto a otros así?', next: null, resultText: "*Sonríe.* \"Hay un nido en la Morgue. Lo sentí latir al pasar.\"", onclick: (g) => act.unlockRumor(g, 'Rumor: Posible nido parasitario en la Morgue.') }
                ]
            },
            'gbre_n3a': {
                id: 'gbre_n3a',
                text: "*Se ofende visiblemente.* \"¡Son mis hijos! El viejo mundo está muerto. Ellos son la nueva vida. ¿Me dejarás entrar para que nazcan seguros?\"",
                options: [
                    { id: 'gbre_o3b', label: 'Escanear abdomen (UV)', next: null, resultText: "*Levanta la camisa. La piel se ondula violentamente.* \"Saludad al doctor...\"", onclick: act.testUV, paranoia: 4, sanity: -8, log: { text: 'Anomalía: Múltiples organismos detectados en cavidad abdominal. Huésped comprometido.', icon: 'fa-bugs' } }
                ]
            },
            'gbre_n3b': {
                id: 'gbre_n3b',
                text: "\"No entiendes la belleza de la simbiosis. Yo les doy calor, ellos me dan... propósito.\"",
                options: [
                    { id: 'gbre_o3d', label: 'Verificar temperatura (Incubación)', next: null, resultText: "*Su piel arde.* \"Es el calor del hogar.\"", onclick: act.testThermo, paranoia: 3, sanity: -5 }
                ]
            }
        }
    },
    "gen_butcher": {
        id: 'gen_butcher',
        tags: ['aggressive', 'obsessive', 'nsfw', 'generic'],
        unique: false,
        root: 'gbu_n1',
        nodes: {
            'gbu_n1': {
                id: 'gbu_n1',
                text: "*Te mira de arriba abajo, deteniéndose en tu cuello y hombros.* \"Buena estructura. Poca grasa. Carne magra de primera calidad.\"",
                options: [
                    { id: 'gbu_o1', label: '¿Disculpa?', next: 'gbu_n2a' },
                    { id: 'gbu_o2', label: 'Deja de mirarme así', next: 'gbu_n2b' }
                ]
            },
            'gbu_n2a': {
                id: 'gbu_n2a',
                text: "*Se lame los labios.* \"Es un cumplido profesional. Antes era carnicero. Sé reconocer un buen corte cuando lo veo. ¿Qué tal tus pulmones? ¿Rosados?\"",
                options: [
                    { id: 'gbu_o2a', label: 'Estás enfermo', next: 'gbu_n3a' }
                ]
            },
            'gbu_n2b': {
                id: 'gbu_n2b',
                text: "\"No te pongas tenso. La carne tensa se pone dura. El estrés arruina el sabor.\"",
                options: [
                    { id: 'gbu_o2b', label: '¿Sabor?', next: 'gbu_n3b' },
                    { id: 'gbu_o2l', label: '¿Qué herramienta usas?', next: null, resultText: "*Te muestra una hoja mellada.* \"Vieja escuela. El óxido añade hierro a la dieta.\"", onclick: (g) => act.giveLoreItem(g, 'item_rusted_cleaver', 'Cuchillo de Carnicero Oxidado') }
                ]
            },
            'gbu_n3a': {
                id: 'gbu_n3a',
                text: "*Saca un cuchillo oxidado y lo limpia con un trapo sucio.* \"Solo soy práctico. Aquí abajo, todo es carne. Tú, yo... comida en potencia.\"",
                options: [
                    { id: 'gbu_o3a', label: 'Guarda eso y lárgate.', next: null, resultText: "*Guarda el cuchillo.* \"Una pena. Se desperdiciará cuando mueras.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gbu_o3b', label: 'Verificar pulso (Excitación)', next: null, resultText: "*Su pulso se acelera al ver tu muñeca.* \"La vena radial... un corte limpio y...\"", onclick: act.testPulse, paranoia: 3, sanity: -7, log: { text: 'Peligro: Sujeto muestra excitación depredadora ante anatomía humana. Posible caníbal.', icon: 'fa-utensils' } },
                    { id: 'gbu_o3e', label: 'Cuidado', next: 'gbu_n4b' }
                ]
            },
            'gbu_n3b': {
                id: 'gbu_n3b',
                text: "\"El sabor de la supervivencia. Déjame entrar. Prometo no comerme a nadie... que esté vivo.\"",
                options: [
                    { id: 'gbu_o3c', label: 'No aceptamos caníbales.', next: null, resultText: "*Escupe.* \"Hipócritas. Ya aprenderéis cuando se acaben las latas.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gbu_o3d', label: 'Analizar pupilas', next: null, resultText: "*Te mira fijamente.* \"¿Ves el hunger?\"", onclick: act.testPupils, paranoia: 2, sanity: -4 },
                    { id: 'gbu_o3f', label: '...', next: 'gbu_n4b' }
                ]
            },
            'gbu_n4b': {
                id: 'gbu_n4b',
                text: "*Se detiene, sopesando tus palabras.* \"El cuidado es un ingrediente que falta en este mundo. Pero el hambre... el hambre es lo único que sobra.\"",
                options: []
            }
        }
    }
};