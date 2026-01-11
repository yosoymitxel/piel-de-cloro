import { act } from './DialogueActions.js';
import { gen_scratch, gen_leak, gen_whisper } from './data/dialogues/gen_pools.js';
import { gen_mold, gen_teeth, gen_shadow } from './data/dialogues/gen_pools_2.js';
import { gen_prophet } from './data/dialogues/gen_pools_3.js';
import { gen_jester } from './data/dialogues/gen_pools_4.js';
import { gen_hungry } from './data/dialogues/gen_pools_5.js';
import { gen_fever } from './data/dialogues/gen_pools_6.js';

export const DialogueData = {
    personalities: [
        'nervous',
        'aggressive',
        'stoic',
        'confused',
        'fanatic',
        'broken',
        'body_horror',
        'paranoid',
        'obsessive',
        'manic',
        'sick'],
    // Pools of dialogues (each pool is an independent tree of nodes)
    pools: {
        gen_scratch,
        gen_leak,
        gen_whisper,
        gen_mold,
        gen_teeth,
        gen_shadow,
        gen_prophet,
        gen_jester,
        gen_hungry,
        gen_fever
    },
    loreSubjects: [
        {
            id: 'lore_start',
            root: 'ls_n1',
            nodes: {
                'ls_n1': {
                    id: 'ls_n1',
                    text: "¿Qué es este lugar? Nunca había visto tantas pantallas.",
                    options: [
                        { id: 'ls_o1', label: 'Un puesto de control', next: 'ls_n2' },
                        { id: 'ls_o2', label: 'Tu salvación', next: 'ls_n2' }
                    ]
                },
                'ls_n2': {
                    id: 'ls_n2',
                    text: "Espero que tengas razón. El aire afuera es irrespirable. Se siente... pesado.",
                    options: []
                }
            }
        }
    ]
};
