import { act } from '../../../js/DialogueActions.js';

export const gen_pools_10 = {
    "gen_host": {
        id: 'gen_host',
        tags: ['manic', 'nsfw', 'body_horror'],
        unique: false,
        root: 'gho_n1',
        nodes: {
            'gho_n1': {
                id: 'gho_n1',
                text: "*Se estremece con un gemido ahogado, mordiéndose el labio inferior hasta sangrar.* \"Ah... se mueven. Se mueven tan profundo...\"",
                options: [
                    { id: 'gho_o1', label: '¿Qué se mueve?', next: 'gho_n2a' },
                    { id: 'gho_o2', label: 'Estás enfermo', next: 'gho_n2b' }
                ]
            },
            'gho_n2a': {
                id: 'gho_n2a',
                text: "*Arquea la espalda contra el cristal.* \"Ellos. Mis amantes internos. Nadan en mi bilis. Es... exquisito.\"",
                options: [
                    { id: 'gho_o2a', label: 'Qué asco', next: 'gho_n3a' }
                ]
            },
            'gho_n2b': {
                id: 'gho_n2b',
                text: "\"¿Enfermo? No... estoy lleno. Lleno de vida. Me hacen sentir... usado. Útil.\"",
                options: [
                    { id: 'gho_o2b', label: 'Necesitas ayuda', next: 'gho_n3b' }
                ]
            },
            'gho_n3a': {
                id: 'gho_n3a',
                text: "*Se toca el vientre con las dos manos, apretando.* \"No lo entiendes. El dolor y el placer son lo mismo cuando te comen desde dentro. ¿Quieres ver cómo ondulan?\"",
                options: [
                    { id: 'gho_o3a', label: 'Ni se te ocurra. Fuera.', next: null, resultText: "*Gime de decepción.* \"Me los guardaré para mí... solo para mí...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gho_o3b', label: 'Escanear abdomen (UV)', next: null, resultText: "*Jadea mientras la luz lo toca.* \"¡Sí! ¡Míralos! ¡Míralos retorcerse!\"", onclick: act.testUV, log: { text: 'Anomalía: Sujeto muestra excitación sexual ante la actividad parasitaria interna. Infección avanzada.', icon: 'fa-heart-crack' } },
                ]
            },
            'gho_n3b': {
                id: 'gho_n3b',
                text: "\"Ayúdame a entrar. Necesitan calor. Si hace frío, dejan de moverse... y me gusta cuando se mueven.\"",
                options: [
                    { id: 'gho_o3c', label: 'Eres un peligro. Largo.', next: null, resultText: "*Se lame el sudor.* \"Buscaré otro nido...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gho_o3d', label: 'Verificar pulso (Excitación)', next: null, resultText: "*Su pulso está disparado.* \"¿Sientes cómo corre mi sangre? Es para ellos.\"", onclick: act.testPulse },
                ]
            }
        }
    },
    "gen_flesh": {
        id: 'gen_flesh',
        tags: ['obsessive', 'nsfw', 'body_horror'],
        unique: false,
        root: 'gfl_n1',
        nodes: {
            'gfl_n1': {
                id: 'gfl_n1',
                text: "*Tiene las manos metidas dentro de sus propios pantalones, rascando algo húmedo.* \"La piel sobra. La piel es un envoltorio barato. Hay que abrirlo.\"",
                options: [
                    { id: 'gfl_o1', label: 'Saca las manos de ahí', next: 'gfl_n2a' },
                    { id: 'gfl_o2', label: '¿Qué haces?', next: 'gfl_n2b' }
                ]
            },
            'gfl_n2a': {
                id: 'gfl_n2a',
                text: "*Saca las manos cubiertas de una sustancia viscosa y rojiza. Se las lleva a la nariz.* \"Huele a hierro. A intimidad. ¿Quieres probar?\"",
                options: [
                    { id: 'gfl_o2a', label: 'Aléjate', next: 'gfl_n3a' }
                ]
            },
            'gfl_n2b': {
                id: 'gfl_n2b',
                text: "\"Me preparo. Para la unión. La carne debe estar tierna, expuesta. Sin barreras.\"",
                options: [
                    { id: 'gfl_o2b', label: 'Estás demente', next: 'gfl_n3b' }
                ]
            },
            'gfl_n3a': {
                id: 'gfl_n3a',
                text: "*Se lame un dedo.* \"Salado. Rico. Si me dejas entrar, te enseñaré a pelarte. Es... liberador.\"",
                options: [
                    { id: 'gfl_o3a', label: 'Qué asco. Vete.', next: null, resultText: "*Se ríe roncamente.* \"Te pudrirás dentro de tu envoltorio...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gfl_o3b', label: 'Analizar sustancia (UV)', next: null, resultText: "*Te muestra las manos manchadas.* \"Es mi esencia. Pura.\"", onclick: act.testUV, log: { text: 'Peligro: Automutilación genital o abdominal. Fluido infeccioso expuesto.', icon: 'fa-droplet' } },
                ]
            },
            'gfl_n3b': {
                id: 'gfl_n3b',
                text: "\"La cordura es para los que tienen miedo a ver sus propios órganos. Yo me he visto. Soy hermoso por dentro.\"",
                options: [
                    { id: 'gfl_o3c', label: 'No entrarás así. Fuera.', next: null, resultText: "*Sigue rascándose.* \"Más profundo... tengo que llegar más profundo...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gfl_o3d', label: 'Verificar temperatura', next: null, resultText: "*Tiembla de placer/dolor.* \"Caliente... muy caliente...\"", onclick: act.testThermo },
                ]
            }
        }
    }
};