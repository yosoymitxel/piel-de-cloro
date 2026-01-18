import { act } from '../../DialogueActions.js';

export const gen_pools_11 = {
    "gen_gourmand": {
        id: 'gen_gourmand',
        tags: ['obsessive', 'nsfw', 'body_horror', 'aggressive', 'generic'],
        unique: false,
        root: 'ggo_n1',
        nodes: {
            'ggo_n1': {
                id: 'ggo_n1',
                text: "*Te olfatea el aire con los ojos cerrados, como un sommelier.* \"Hmm... un bouquet... limpio. Demasiado limpio. Falta... maduración.\"",
                options: [
                    { id: 'ggo_o1', label: '¿Maduración?', next: 'ggo_n2a' },
                    { id: 'ggo_o2', label: 'Aléjate, enfermo', next: 'ggo_n2b' }
                ]
            },
            'ggo_n2a': {
                id: 'ggo_n2a',
                text: "\"La carne fresca es insípida. La verdadera complejidad llega con la... colonización. El parásito ablanda el tejido, lo marina desde dentro. ¿Nunca has probado un hígado que ha... florecido?\"",
                options: [
                    { id: 'ggo_o2a', label: 'DIOS SANTO, ¿QUÉ?', next: 'ggo_n3a' }
                ]
            },
            'ggo_n2b': {
                id: 'ggo_n2b',
                text: "*Chasquea la lengua con decepción.* \"Paladares sin refinar. No sabéis apreciar la alta cocina de la nueva era. Os limitáis a las latas.\"",
                options: [
                    { id: 'ggo_o2b', label: 'Eres un caníbal', next: 'ggo_n3b' },
                    { id: 'ggo_o2r', label: '¿Dónde consigues... carne?', next: null, resultText: "*Señala arriba.* \"Los conductos de ventilación son una despensa excelente.\"", onclick: (g) => act.unlockRumor(g, 'Rumor: Cadáveres almacenados en conductos de ventilación.') }
                ]
            },
            'ggo_n3a': {
                id: 'ggo_n3a',
                text: "*Sonríe, mostrando unos dientes limados hasta ser puntiagudos.* \"Es dulce, con un toque amargo al final. Como fruta pasada. Si me dejas entrar, te prepararé un festín que nunca olvidarás. Con los que no lo logren, claro.\"",
                options: [
                    { id: 'ggo_o3b', label: 'Verificar pulso (Apetito)', next: null, resultText: "*Su pulso es bajo, pero rítmico, como el de un depredador esperando.* \"La paciencia es clave para un buen plato.\"", onclick: act.testPulse, paranoia: 4, sanity: -10, log: { text: 'PELIGRO: Canibalismo selectivo. Consume tejido infectado por preferencia gustativa. Conoce la biología del parásito.', icon: 'fa-util-spoon' } }
                ]
            },
            'ggo_n3b': {
                id: 'ggo_n3b',
                text: "\"Caníbal es una palabra tan... cruda. Yo soy un gastrónomo. Un pionero. Exploro las posibilidades que nos ofrece el cloro.\"",
                options: [
                    { id: 'ggo_o3d', label: 'Analizar pupilas (Hambre)', next: null, resultText: "*Sus pupilas no se dilatan por la luz, sino por el olor de tu sangre.* \"Hueles... delicioso.\"", onclick: act.testPupils, paranoia: 3, sanity: -6 }
                ]
            }
        }
    },
    "gen_oracle": {
        id: 'gen_oracle',
        tags: ['fanatic', 'nsfw', 'body_horror', 'mysterious', 'generic'],
        unique: false,
        root: 'gor_n1',
        nodes: {
            'gor_n1': {
                id: 'gor_n1',
                text: "*Un agujero mal cicatrizado en su frente supura un líquido claro. Susurra.* \"El cráneo es una jaula. Yo abrí una ventana. Ahora... puedo oír el estático.\"",
                options: [
                    { id: 'gor_o1', label: '¿Qué has hecho?', next: 'gor_n2a' },
                    { id: 'gor_o2', label: '¿Oír qué?', next: 'gor_n2b' }
                ]
            },
            'gor_n2a': {
                id: 'gor_n2a',
                text: "\"Liberé mi mente. Con un taladro y sal. El dolor afila la percepción. Ahora veo los colores del sonido y escucho el sabor del miedo.\"",
                options: [
                    { id: 'gor_o2a', label: 'Estás completamente loco', next: 'gor_n3b' },
                    { id: 'gor_o2l', label: '¿Con qué taladro?', next: null, resultText: "*Saca una herramienta manual cubierta de costras.* \"Gira despacio. Para saborearlo.\"", onclick: (g) => act.giveLoreItem(g, 'item_bone_drill', 'Taladro Manual con Restos') }
                ]
            },
            'gor_n2b': {
                id: 'gor_n2b',
                text: "\"La canción de la colmena. El zumbido del agua. Habla en patrones de óxido y calcio. Dice que... la puerta es una mentira.\"",
                options: [
                    { id: 'gor_o2b', label: '¿Qué puerta?', next: 'gor_n3a' }
                ]
            },
            'gor_n3a': {
                id: 'gor_n3a',
                text: "*Señala la puerta de tu puesto.* \"Esa. No detiene nada. Solo filtra la verdad. Déjame entrar y te enseñaré a escuchar. Solo necesitas un clavo y coraje.\"",
                options: [
                    { id: 'gor_o3b', label: 'Analizar herida (UV)', next: null, resultText: "*El líquido del agujero brilla con un verde pálido.* \"Es el eco. La voz de la colmena hecha líquido.\"", onclick: act.testUV, paranoia: 4, sanity: -12, log: { text: 'PELIGRO: Automutilación (trepanación) para "oír" la colmena. Expone tejido cerebral a la infección.', icon: 'fa-brain' } }
                ]
            },
            'gor_n3b': {
                id: 'gor_n3b',
                text: "\"La locura es solo un nombre para una cordura que no comprendes. Yo estoy más cuerdo que nunca. El cloro me lo susurró.\"",
                options: [
                    { id: 'gor_o3d', label: 'Verificar temperatura (Infección cerebral)', next: null, resultText: "*Su frente está helada, pero el interior del agujero parece... cálido.* \"El conocimiento quema.\"", onclick: act.testThermo, paranoia: 3, sanity: -8 }
                ]
            }
        }
    }
};