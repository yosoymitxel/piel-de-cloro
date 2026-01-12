import { act } from '../../DialogueActions.js';

export const lore_kael = {
    id: 'lore_kael',
    unique: true,
    tags: ['stoic', 'lore', 'body_horror'],
    root: 'lk_n1',
    nodes: {
        'lk_n1': {
            id: 'lk_n1',
            text: "*Un rostro sobresale de la pared de metal, la piel fusionada con el acero.* \"La arquitectura... me abraza. Ya no necesito caminar.\" *Cables entran por su cuello.*",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'lk_o1', label: '¿Cómo pasó esto?', next: 'lk_n2' },
                { id: 'lk_o2', label: 'Intentar liberarlo', next: 'lk_n3' }
            ]
        },
        'lk_n2': {
            id: 'lk_n2',
            text: "*Sonríe, y chispas saltan de sus dientes.* \"Me apoyé demasiado tiempo. La casa sintió mi cansancio y me sostuvo. Ahora soy soporte vital.\" *El panel parpadea al ritmo de su voz.*",
            options: [
                { id: 'lk_o2a', label: 'Preguntar qué controla', next: 'lk_n4', sets: ['heard_lore'] },
                { id: 'lk_o2b', label: 'Dejarlo ahí', next: null }
            ]
        },
        'lk_n3': {
            id: 'lk_n3',
            text: "*Grita cuando tocas la unión de carne y metal.* \"¡No! ¡Soy estructural! ¡Si me sacas, el pasillo colapsa!\" *La pared tiembla.*",
            options: [
                { id: 'lk_o3a', label: 'Retroceder', next: 'lk_n2' }
            ]
        },
        'lk_n4': {
            id: 'lk_n4',
            text: "*Cierra los ojos y la luz del pasillo se apaga.* \"Controlo... el miedo. Y el oxígeno. No me olvides.\" *Se funde más en el metal.*",
            options: []
        }
    }
};
