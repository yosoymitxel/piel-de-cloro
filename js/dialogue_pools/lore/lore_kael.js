import { act } from '../../DialogueActions.js';

export const lore_kael = {
    id: 'lore_kael',
    unique: true,
    tags: ['stoic', 'lore', 'body_horror'],
    root: 'lk_n1',
    nodes: {
        'lk_n1': {
            id: 'lk_n1',
            text: "*Un rostro sobresale de la pared de metal, la piel fusionada con el acero. Un ojo es humano, el otro es una lente de cámara rota.* \"La arquitectura... me abraza. Ya no necesito caminar.\" *Cables entran por su cuello y desaparecen en el conducto.*",
            audio: 'lore_interlude_seen',
            options: [
                { id: 'lk_o1', label: '¿Cómo pasó esto?', next: 'lk_n2' },
                { id: 'lk_o2', label: 'Intentar liberarlo', next: 'lk_n3' },
                { id: 'lk_o3_mother', label: '¿Conoces a la Madre?', next: 'lk_n_mother_reaction', req: ['known_mother'] }
            ]
        },
        'lk_n2': {
            id: 'lk_n2',
            text: "*Sonríe, y chispas saltan de sus dientes.* \"Me apoyé demasiado tiempo. La casa sintió mi cansancio y me sostuvo. Fue... amable. Ahora soy soporte vital.\" *El panel parpadea al ritmo de su voz.*",
            options: [
                { id: 'lk_o2a', label: '¿Qué controlas?', next: 'lk_n4', sets: ['heard_lore'] },
                { id: 'lk_o2b', label: '¿Qué sientes?', next: 'lk_n5' },
                { id: 'lk_o2c', label: '¿Hay otros?', next: 'lk_n6' },
                { id: 'lk_o2d', label: 'El Plano Maestro', next: 'lk_n_blueprint' }
            ]
        },
        'lk_n_blueprint': {
            id: 'lk_n_blueprint',
            text: "\"El Plano Maestro... sí. No estaba en los archivos. Estaba grabado en el subsuelo. La estación no se construyó hacia arriba, sino hacia adentro. Como una raíz buscando agua.\"",
            options: [
                { id: 'lk_o_bp1', label: '¿Hacia adentro?', next: 'lk_n_sector0' },
                { id: 'lk_o_bp2', label: 'Volver', next: 'lk_n2' }
            ]
        },
        'lk_n_sector0': {
            id: 'lk_n_sector0',
            text: "\"Sector 0. El núcleo. No aparece en tus mapas, ¿verdad? Porque no es un lugar, es un momento. El momento en que la primera viga tocó... aquello.\"",
            options: [
                { id: 'lk_o_s0_1', label: '¿Qué tocó?', next: 'lk_n4_a', sets: ['rumour_sector_zero'] }
            ]
        },
        'lk_n_mother_reaction': {
            id: 'lk_n_mother_reaction',
            text: "*Todo el pasillo vibra. Las luces parpadean en rojo.* \"No digas su nombre. Ella no es arquitectura. Ella es el terremoto. Ella es la que deshace los nudos que yo ato.\"",
            options: [
                { id: 'lk_o_mr1', label: 'Calma', next: 'lk_n1' }
            ]
        },
        'lk_n3': {
            id: 'lk_n3',
            text: "*Grita cuando tocas la unión de carne y metal. Un fluido negro supura de la junta.* \"¡No! ¡Soy estructural! ¡Si me sacas, el pasillo colapsa! ¡Soy la viga maestra!\" *La pared tiembla violentamente.*",
            options: [
                { id: 'lk_o3a', label: 'Retroceder', next: 'lk_n2' }
            ]
        },
        'lk_n4': {
            id: 'lk_n4',
            text: "*Cierra los ojos y la luz del pasillo disminuye.* \"Controlo... el flujo. El aire que respiras pasa por mis pulmones primero. El miedo en los sensores... es mi miedo.\" *Se funde más en el metal.*",
            options: [
                { id: 'lk_o4a', label: 'Sobre el aire', next: 'lk_n4_a' },
                { id: 'lk_o4b', label: 'Sobre el miedo', next: 'lk_n4_b' }
            ]
        },
        'lk_n4_a': {
            id: 'lk_n4_a',
            text: "\"Sabe a óxido y a sueños viejos. A veces... sabe a ceniza. Algo se quema abajo. Muy abajo.\"",
            options: [
                { id: 'lk_o4a_1', label: 'Entendido', next: 'lk_n1' }
            ]
        },
        'lk_n4_b': {
            id: 'lk_n4_b',
            text: "\"El miedo alimenta los generadores. Es un voltaje delicioso. Cuando corréis... la estación se ilumina más.\"",
            options: [
                { id: 'lk_o4b_1', label: 'Perturbador', next: 'lk_n1' }
            ]
        },
        'lk_n5': {
            id: 'lk_n5',
            text: "\"Siento pasos. Lejanos. En el Sector 4. Siento el frío del espacio exterior presionando contra el casco. Y siento... un latido. Que no es mío. Viene de las tuberías.\"",
            options: [
                { id: 'lk_o5a', label: '¿Qué latido?', next: 'lk_n5_a', sets: ['known_heartbeat'] },
                { id: 'lk_o5b', label: 'Volver', next: 'lk_n2' }
            ]
        },
        'lk_n5_a': {
            id: 'lk_n5_a',
            text: "\"Lento. Pesado. Como un martillo envuelto en trapos. Bum... Bum... Dice que pronto despertará.\"",
            options: [
                { id: 'lk_o5a_1', label: 'Anotado', next: 'lk_n2' }
            ]
        },
        'lk_n6': {
            id: 'lk_n6',
            text: "\"Oh, sí. Las paredes están llenas. Escucha... ¿no los oyes susurrar en la ventilación? Somos el aislamiento térmico. Somos la piel de cloro.\"",
            options: [
                { id: 'lk_o6a', label: '¿Piel de Cloro?', next: 'lk_n6_a' },
                { id: 'lk_o6b', label: 'Basta', next: null }
            ]
        },
        'lk_n6_a': {
            id: 'lk_n6_a',
            text: "\"Nos blanquea. Nos limpia. Nos quita todo lo que sobra. Dolor, esperanza, nombre. Solo queda la función.\"",
            options: [
                { id: 'lk_o6a_1', label: 'Me voy', next: null }
            ]
        }
    }
};
