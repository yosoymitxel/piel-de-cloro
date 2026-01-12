import { act } from '../../DialogueActions.js';

export const gen_pools_8 = {
    "gen_collector": {
        id: 'gen_collector',
        tags: ['obsessive', 'body_horror', 'nsfw'],
        unique: false,
        root: 'gco_n1',
        nodes: {
            'gco_n1': {
                id: 'gco_n1',
                text: "*Te mira fijamente la boca mientras hablas.* \"Tienes... una dentadura excelente. Fuerte. Bien cuidada.\"",
                options: [
                    { id: 'gco_o1', label: 'Gracias, supongo', next: 'gco_n2a' },
                    { id: 'gco_o2', label: '¿Qué miras?', next: 'gco_n2b' }
                ]
            },
            'gco_n2a': {
                id: 'gco_n2a',
                text: "*Sonríe, mostrando varios huecos en su propia boca.* \"Es un cumplido sincero. Valoro las buenas piezas. ¿No te sobra ninguna? A veces se aflojan.\"",
                options: [
                    { id: 'gco_o2a', label: '¿Piezas de qué?', next: 'gco_n3a' },
                    { id: 'gco_o2b', label: 'Aléjate de mí', next: 'gco_n3b' }
                ]
            },
            'gco_n2b': {
                id: 'gco_n2b',
                text: "*Señala su propia boca con un dedo sucio.* \"Perdona. Mal hábito. Es que me faltan algunas y siempre estoy buscando repuestos. Para mi colección.\"",
                options: [
                    { id: 'gco_o2c', label: '¿Colección?', next: 'gco_n3a' }
                ]
            },
            'gco_n3a': {
                id: 'gco_n3a',
                text: "*Saca una pequeña bolsa de cuero. Huele a hierro y a podredumbre. La abre y te muestra un puñado de dientes y uñas amarillentas.* \"Calcio. Quitina. Las partes duras. Lo que queda cuando todo lo demás se pudre.\"",
                options: [
                    { id: 'gco_o3a', label: 'Estás enfermo. Largo.', next: null, resultText: "*Guarda su bolsa con cuidado.* \"No aprecias el arte. Ya encontrarás tus propias piezas... cuando se te caigan.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gco_o3b', label: 'Verificar origen de las piezas (UV)', next: null, resultText: "*Te acerca la bolsa.* \"Mira, mira. Algunas todavía tienen... restos de su dueño anterior.\"", onclick: act.testUV, log: { text: 'Anomalía: Colecciona apéndices queratinosos de otros sujetos. Las piezas muestran rastros de violencia.', icon: 'fa-tooth' } },
                ]
            },
            'gco_n3b': {
                id: 'gco_n3b',
                text: "*Levanta las manos.* \"Tranquilo, tranquilo. No las tomo por la fuerza. Solo... las recojo. Cuando ya no las necesitan.\"",
                options: [
                    { id: 'gco_o3c', label: 'No te me acerques. Fuera.', next: null, resultText: "*Retrocede lentamente.* \"Una pena. Tenías un canino precioso.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gco_o3d', label: 'Verificar pulso (agitación)', next: null, resultText: "*Su pulso es extrañamente calmado.* \"Solo soy un coleccionista. No un monstruo.\"", onclick: act.testPulse },
                ]
            }
        }
    },
    "gen_artist": {
        id: 'gen_artist',
        tags: ['manic', 'body_horror', 'nsfw'],
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
                    { id: 'gar_o2a', label: 'Estás delirando', next: 'gar_n3b' }
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
                    { id: 'gar_o3a', label: 'DIOS MÍO. ¡FUERA DE AQUÍ!', next: null, resultText: "*Enrolla su 'lienzo'.* \"Los críticos son todos iguales. Incapaces de ver la belleza en el sufrimiento.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gar_o3b', label: 'Analizar los pigmentos (UV)', next: null, resultText: "*Extiende la piel con orgullo.* \"Observa la fluorescencia del miedo. Es mi ingrediente secreto.\"", onclick: act.testUV, log: { text: 'PELIGRO: Sujeto crea "arte" usando fluidos biológicos y trozos de cadáveres. Extremadamente peligroso.', icon: 'fa-palette' } },
                ]
            },
            'gar_n3b': {
                id: 'gar_n3b',
                text: "\"Solo déjame entrar. Prometo no usar a nadie de aquí para mis obras... a menos que me lo pidan. O se mueran. El material no debe desperdiciarse.\"",
                options: [
                    { id: 'gar_o3c', label: 'Eres un monstruo. Vete.', next: null, resultText: "*Hace una reverencia.* \"El arte incomprendido es el destino del genio.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gar_o3d', label: 'Verificar temperatura (Fiebre creativa)', next: null, resultText: "*Su piel está fría, pero sus ojos arden.* \"La inspiración me mantiene caliente.\"", onclick: act.testThermo },
                ]
            }
        }
    }
};