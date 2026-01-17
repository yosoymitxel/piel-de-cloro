import { act } from './DialogueActions.js';
import { gen_pools_1 } from './dialogue_pools/generic/gen_pools_1.js';
import { gen_pools_2 } from './dialogue_pools/generic/gen_pools_2.js';
import { gen_pools_3 } from './dialogue_pools/generic/gen_pools_3.js';
import { gen_pools_4 } from './dialogue_pools/generic/gen_pools_4.js';
import { gen_pools_5 } from './dialogue_pools/generic/gen_pools_5.js';
import { gen_pools_6 } from './dialogue_pools/generic/gen_pools_6.js';
import { gen_pools_7 } from './dialogue_pools/generic/gen_pools_7.js';
import { gen_pools_8 } from './dialogue_pools/generic/gen_pools_8.js';
import { gen_pools_9 } from './dialogue_pools/generic/gen_pools_9.js';
import { gen_pools_10 } from './dialogue_pools/generic/gen_pools_10.js';
import { gen_pools_11 } from './dialogue_pools/generic/gen_pools_11.js';
import { gen_pools_12 } from './dialogue_pools/generic/gen_pools_12.js';
import { lore_kael } from './dialogue_pools/lore/lore_kael.js';
import { lore_hive } from './dialogue_pools/lore/lore_hive.js';
import { lore_archivist } from './dialogue_pools/lore/lore_archivist.js';
import { lore_patient_zero } from './dialogue_pools/lore/lore_patient_zero.js';

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
        'sick',
        'nsfw'],
    // Pools of dialogues (consolidated from modular files)
    pools: {
        ...gen_pools_1,
        ...gen_pools_2,
        ...gen_pools_3,
        ...gen_pools_4,
        ...gen_pools_5,
        ...gen_pools_6,
        ...gen_pools_7,
        ...gen_pools_8,
        ...gen_pools_9,
        ...gen_pools_10,
        ...gen_pools_11,
        ...gen_pools_12
    },
    // Lore subjects (consolidated from modular files)
    loreSubjects: [
        lore_kael,
        lore_hive,
        lore_archivist,
        lore_patient_zero
    ]
};
