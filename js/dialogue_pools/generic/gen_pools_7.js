import { act } from '../../DialogueActions.js';

export const gen_pools_7 = {
    "gen_thirst": {
        id: 'gen_thirst',
        tags: ['weak', 'generic'],
        unique: false,
        root: 'gth_n1',
        nodes: {
            'gth_n1': {
                id: 'gth_n1',
                text: "*Tiene los labios partidos y habla con dificultad. \"Necesito agua que no venga de una tubería rota. Hace dos días que no encuentro una fuente segura\".*",
                options: [
                    { id: 'gth_o1', label: 'Dar agua', next: 'gth_n2a' },
                    { id: 'gth_o2', label: '¿Por qué no bebiste?', next: 'gth_n2b' }
                ]
            },
            'gth_n2a': {
                id: 'gth_n2a',
                text: "*Bebe demasiado rápido y se obliga a detenerse. \"Perdón. No sé cuándo voy a poder beber otra vez\".*",
                options: [
                    { id: 'gth_o2a', label: 'Es suficiente', next: 'gth_n3a' },
                    { id: 'gth_o2r', label: '¿Has oído algo sobre el agua?', next: null, resultText: "*Tiembla.* \"Dicen que los filtros del Sector 4 están llenos de... cosas gelatinosas. Bloquean el paso.\"", onclick: (g) => act.unlockRumor(g, 'Rumor: Obstrucción biológica en filtros del Sector 4.') }
                ]
            },
            'gth_n2b': {
                id: 'gth_n2b',
                text: "*Se toca la garganta al tragar. \"El agua de los túneles sabía a metal. Preferí pasar sed. Fue una mala decisión\".*",
                options: [
                    { id: 'gth_o2b', label: 'Entiendo', next: 'gth_n3b' },
                    { id: 'gth_o2l', label: 'Toma esta cantimplora vacía', next: null, resultText: "*La mira con recelo.* \"Tiene marcas... de dientes. De alguien que no era humano.\"", onclick: (g) => act.giveLoreItem(g, 'item_gnawed_canteen', 'Cantimplora Roída') }
                ]
            },
            'gth_n3a': {
                id: 'gth_n3a',
                text: "*Se toca la garganta.* \"Aún pica. Como si tuviera polvo en el esófago. ¿Me dejas entrar al baño?\"",
                options: [
                    { id: 'gth_o3a', label: 'No. Vete a buscar agua fuera.', next: null, resultText: "*Se arrastra.* \"Agua... necesito agua...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gth_o3b', label: 'Espera. Voy a comprobar tu pulso; la deshidratación puede alterarlo.', next: null, resultText: "*Asiente débilmente.* \"Rápido... el corazón me golpea raro desde que dejé de sudar.\"", onclick: act.testPulse, paranoia: 1 },
                    { id: 'gth_o3e', label: 'Espera', next: 'gth_n4b' }
                ]
            },
            'gth_n3b': {
                id: 'gth_n3b',
                text: "\"Si entro, podré beber del grifo, ¿verdad? Dicen que aquí el agua es pura.\"",
                options: [
                    { id: 'gth_o3c', label: 'Solo para residentes sanos.', next: null, resultText: "*Llora sin lágrimas.* \"Por favor... solo un trago...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gth_o3d', label: 'Comprobemos si estás sano.', next: null, resultText: "*Se lame los labios.* \"Lo que digas. Pero dame agua luego.\"", onclick: act.testUV, paranoia: 1, sanity: -1, log: { text: 'Dato: La sed extrema puede ser deshidratación o el parásito consumiendo los fluidos corporales.', icon: 'fa-glass-water' } },
                    { id: 'gth_o3f', label: 'Comprobemos', next: 'gth_n4b' }
                ]
            },
            'gth_n4b': {
                id: 'gth_n4b',
                text: "*Deshidratación severa. Usa LINTERNA UV para verificar textura de la piel.*",
                options: []
            }
        }
    }
};
