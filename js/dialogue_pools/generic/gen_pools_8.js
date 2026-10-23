import { act } from '../../DialogueActions.js';

export const gen_pools_8 = {
    "gen_collector": {
        id: 'gen_collector',
        tags: ['obsessive', 'body_horror', 'nsfw', 'generic'],
        unique: false,
        root: 'gco_n1',
        nodes: {
            'gco_n1': {
                id: 'gco_n1',
                text: "*Mientras hablas, mira tus dientes más de lo necesario. \"Perdona. Me fijo en las dentaduras. Es un hábito difícil de explicar\".*",
                options: [
                    { id: 'gco_o1', label: 'Gracias, supongo', next: 'gco_n2a' },
                    { id: 'gco_o2', label: '¿Qué miras?', next: 'gco_n2b' }
                ]
            },
            'gco_n2a': {
                id: 'gco_n2a',
                text: "*Intenta sonreír y deja a la vista varios huecos. \"No te estoy amenazando. Me faltan piezas y empecé a guardar las que encontraba\".*",
                options: [
                    { id: 'gco_o2a', label: '¿Piezas de qué?', next: 'gco_n3a' },
                    { id: 'gco_o2b', label: 'Aléjate de mí', next: 'gco_n3b' }
                ]
            },
            'gco_n2b': {
                id: 'gco_n2b',
                text: "*Aparta la vista de tu boca. \"Las llamo colección porque suena mejor que decir de dónde salieron. No todas tienen una historia que quiera contar\".*",
                options: [
                    { id: 'gco_o2c', label: '¿Colección?', next: 'gco_n3a' },
                    { id: 'gco_o2l', label: '¿Tienes algo útil?', next: null, resultText: "*Saca un diente de oro.* \"Este no me encaja. Tómalo.\"", onclick: (g) => act.giveLoreItem(g, 'item_gold_tooth', 'Diente de Oro') }
                ]
            },
            'gco_n3a': {
                id: 'gco_n3a',
                text: "*Saca una pequeña bolsa de cuero. Huele a hierro y a podredumbre. La abre y te muestra un puñado de dientes y uñas amarillentas.* \"Calcio. Quitina. Las partes duras. Lo que queda cuando todo lo demás se pudre.\"",
                options: [
                    { id: 'gco_o3b', label: 'Verificar origen de las piezas (UV)', next: null, resultText: "*Te acerca la bolsa.* \"Mira, mira. Algunas todavía tienen... restos de su dueño anterior.\"", onclick: act.testUV, paranoia: 3, sanity: -5, log: { text: 'Anomalía: Colecciona apéndices queratinosos de otros sujetos. Las piezas muestran rastros de violencia.', icon: 'fa-tooth' } },
                    { id: 'gco_o3c', label: 'Deja te hago un test manual', next: 'gco_n3b' }
                ]
            },
            'gco_n3b': {
                id: 'gco_n3b',
                text: "*Levanta las manos.* \"Tranquilo, tranquilo. No las tomo por la fuerza. Solo... las recojo. Cuando ya no las necesitan.\"",
                options: [
                    { id: 'gco_o3d', label: 'Verificar pulso (agitación)', next: null, resultText: "*Su pulso es extrañamente calmado.* \"Solo soy un coleccionista. No un monstruo.\"", onclick: act.testPulse, paranoia: 2, sanity: -3 }
                ]
            }
        }
    },
    "gen_artist": {
        id: 'gen_artist',
        tags: ['manic', 'body_horror', 'nsfw', 'generic'],
        unique: false,
        root: 'gar_n1',
        nodes: {
            'gar_n1': {
                id: 'gar_n1',
                text: "*Tiene las yemas de los dedos manchadas de un pigmento oscuro y rojizo. Sonríe.* \"¡Ah, un lienzo nuevo! Tu piel tiene una palidez excelente. Un buen fondo.\"",
                options: [
                    { id: 'gar_o1', label: '¿Lienzo?', next: 'gar_n2a' },
                    { id: 'gar_o2', label: '¿Qué es esa mancha?', next: 'gar_n2b' }
                ]
            },
            'gar_n2a': {
                id: 'gar_n2a',
                text: "\"Todos somos lienzos esperando la pincelada correcta. El mundo exterior nos pinta con polvo y miedo. Yo prefiero... colores más vivos.\"",
                options: [
                    { id: 'gar_o2a', label: 'Estás delirando', next: 'gar_n3b' },
                    { id: 'gar_o2r', label: '¿Dónde consigues los colores?', next: null, resultText: "*Baja la voz.* \"El 'Rojo Víscera' más puro brota de una fuente en el Sector Médico. Nunca se seca.\"", onclick: (g) => act.unlockRumor(g, 'Rumor: Fuente inagotable de sangre en el Sector Médico.') }
                ]
            },
            'gar_n2b': {
                id: 'gar_n2b',
                text: "*Se mira los dedos con orgullo.* \"Es mi material. Lo llamo 'Rojo Víscera'. Tiene una textura maravillosa cuando se seca. ¿Quieres ver mis obras?\"",
                options: [
                    { id: 'gar_o2b', label: 'No, gracias', next: 'gar_n3b' },
                    { id: 'gar_o2c', label: 'Muéstrame', next: 'gar_n3a' }
                ]
            },
            'gar_n3a': {
                id: 'gar_n3a',
                text: "*Desenrolla un trozo de piel curtida, en el que ha dibujado un paisaje retorcido usando fluidos de varios colores: rojo oscuro, bilis amarillenta, negro icor.* \"Es el Sector 3 al amanecer. Usé a un guardia para el cielo.\"",
                options: [
                    { id: 'gar_o3b', label: 'Analizar los pigmentos (UV)', next: null, resultText: "*Extiende la piel con orgullo.* \"Observa la fluorescencia del miedo. Es mi ingrediente secreto.\"", onclick: act.testUV, paranoia: 4, sanity: -10, log: { text: 'PELIGRO: Sujeto crea "arte" usando fluidos biológicos y trozos de cadáveres. Extremadamente peligroso.', icon: 'fa-palette' } }
                ]
            },
            'gar_n3b': {
                id: 'gar_n3b',
                text: "\"Solo déjame entrar. Prometo no usar a nadie de aquí para mis obras... a menos que me lo pidan. O se mueran. El material no debe desperdiciarse.\"",
                options: [
                    { id: 'gar_o3d', label: 'Verificar temperatura (Fiebre creativa)', next: null, resultText: "*Su piel está fría, pero sus ojos arden.* \"La inspiración me mantiene caliente.\"", onclick: act.testThermo, paranoia: 3, sanity: -6 }
                ]
            }
        }
    }
};