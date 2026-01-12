import { act } from '../../DialogueActions.js';

export const lore_hive = {
    id: 'lore_hive',
    unique: true,
    tags: ['creepy', 'lore'],
    root: 'lh_n1',
    nodes: {
        'lh_n1': {
            id: 'lh_n1',
            text: "*Un niño pequeño te mira, pero su voz suena como una multitud.* \"Tenemos hambre... todos nosotros. ¿Traes biomasa?\" *Su piel se mueve sola.*",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'lh_o1', label: '¿Quiénes son?', next: 'lh_n2' },
                { id: 'lh_o2', label: 'Amenazar', next: 'lh_n3' }
            ]
        },
        'lh_n2': {
            id: 'lh_n2',
            text: "*Abre la boca demasiado grande, mostrando oscuridad.* \"La colonia. Los que vivían en el filtro de agua. Ahora somos el niño.\" *Zumbido de insectos.*",
            options: [
                { id: 'lh_o2a', label: 'Preguntar propósito', next: 'lh_n4' }
            ]
        },
        'lh_n3': {
            id: 'lh_n3',
            text: "*Se ríe con mil voces.* \"No puedes matar lo que es legión. Solo dañarás el envase.\" *El niño sangra icor negro.*",
            options: [
                { id: 'lh_o3a', label: 'Huir', next: null }
            ]
        },
        'lh_n4': {
            id: 'lh_n4',
            text: "*Se dispersa en las sombras.* \"Purificar... consumiendo. Nos vemos en el tanque principal.\"",
            options: []
        }
    }
};
