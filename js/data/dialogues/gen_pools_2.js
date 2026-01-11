import { DialogueActions as act } from '../../DialogueActions.js';

export const gen_mold = {
    id: 'gen_mold',
    tags: ['sick', 'body_horror'],
    unique: false,
    root: 'gm_n1',
    nodes: {
        'gm_n1': {
            id: 'gm_n1',
            text: "*Huele intensamente a humedad y tierra mojada.* \"Perdón por el olor... mi refugio anterior tenía goteras. Todo se pudrió.\"",
            options: [
                { id: 'gm_o1', label: 'Examinar ropa', next: 'gm_n2a' },
                { id: 'gm_o2', label: 'Mantener distancia', next: 'gm_n2b' }
            ]
        },
        'gm_n2a': {
            id: 'gm_n2a',
            text: "*La ropa está manchada de moho, pero su piel también tiene un tono verdoso en el cuello.* \"Es difícil lavarse sin agua limpia...\"",
            options: [
                { id: 'gm_o2a', label: '¿Eso es piel o moho?', next: 'gm_n3a' },
                { id: 'gm_o2b', label: 'Parece contagioso', next: 'gm_n3b' }
            ]
        },
        'gm_n2b': {
            id: 'gm_n2b',
            text: "*Tose, y suena húmedo.* \"Solo necesito un lugar seco. Unos días al calor y estaré bien.\"",
            options: [{ id: 'gm_o2c', label: 'Dudar', next: 'gm_n3b' }]
        },
        'gm_n3a': {
            id: 'gm_n3a',
            text: "*Se toca el cuello.* \"Es... una erupción. Pica un poco. Nada que un poco de alcohol no cure.\"",
            options: [
                { id: 'gm_o3a', label: 'Eso es hongo. Aléjate.', next: null, resultText: "*Se va cabizbajo.* \"Nadie quiere lo que está roto...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gm_o3b', label: 'Analizar esporas en piel', next: null, resultText: "*Baja las manos.* \"Ten cuidado, no quiero contagiarte si es malo.\"", onclick: act.testUV, log: { text: 'Evidencia: El moho no es superficial; las hifas penetran la dermis buscando el torrente sanguíneo.', icon: 'fa-bacterium' } }
            ]
        },
        'gm_n3b': {
            id: 'gm_n3b',
            text: "*Te mira suplicante.* \"No me dejes fuera. La humedad me está comiendo vivo.\"",
            options: [
                { id: 'gm_o3c', label: 'Lo siento, es muy arriesgado.', next: null, resultText: "*Se aleja tosiendo esporas.* \"La humedad siempre gana...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gm_o3d', label: 'Verificar temperatura corporal', next: null, resultText: "*Se pega al cristal.* \"Gracias... el aire aquí parece más seco.\"", onclick: act.testThermo }
            ]
        },
        'gm_n4b': {
            id: 'gm_n4b',
            text: "*Presencia de esporas fúngicas en dermis. Riesgo de propagación.*",
            options: [
                { id: 'gm_o4b2', label: 'Rechazar', next: null, cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gm_o4b1', label: 'Admitir (Riesgo Biológico)', next: null, sets: ['admitted_infected'], cssClass: 'text-alert border-alert', onclick: act.admit }
            ]
        }
    }
};

export const gen_teeth = {
    id: 'gen_teeth',
    tags: ['nervous', 'pain'],
    unique: false,
    root: 'gt_n1',
    nodes: {
        'gt_n1': {
            id: 'gt_n1',
            text: "*Se lleva la mano a la mandíbula con gesto de dolor.* \"Me duele... creo que tengo una infección en la muela. ¿Tenéis antibióticos?\"",
            options: [
                { id: 'gt_o1', label: 'Mostrar boca', next: 'gt_n2a' },
                { id: 'gt_o2', label: 'No somos hospital', next: 'gt_n2b' }
            ]
        },
        'gt_n2a': {
            id: 'gt_n2a',
            text: "*Abre la boca. Sus encías están negras y retraídas.* \"Se mueven... siento que los dientes me bailan.\"",
            options: [
                { id: 'gt_o2a', label: 'Eso no es caries', next: 'gt_n3a' },
                { id: 'gt_o2b', label: 'Retroceder', next: 'gt_n3b' }
            ]
        },
        'gt_n2b': {
            id: 'gt_n2b',
            text: "*Escupe un poco de sangre.* \"Por favor... solo algo para el dolor. No puedo comer, no puedo dormir.\"",
            options: [{ id: 'gt_o2c', label: 'Proceder', next: 'gt_n4b' }]
        },
        'gt_n3a': {
            id: 'gt_n3a',
            text: "*Se toca un diente y este cae en su mano sin esfuerzo.* \"Oh no... otro más. Se me están cayendo solos.\"",
            options: [
                { id: 'gt_o3a', label: '¡Qué asco! Vete.', next: null, resultText: "*Se va llorando.* \"Mis dientes... mis bonitos dientes...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gt_o3b', label: 'Examinar encías (Necrosis)', next: null, resultText: "*Guarda el diente en el bolsillo.* \"Dime que puedes arreglarme.\"", onclick: act.testUV, log: { text: 'Síntoma: Caída de dientes sin dolor ni sangrado. Las encías rechazan el hueso, indicando necrosis estructural.', icon: 'fa-tooth' } }
            ]
        },
        'gt_n3b': {
            id: 'gt_n3b',
            text: "*Te mira con desesperación.* \"¿Crees que es por el agua? He bebido de los charcos... no tenía opción.\"",
            options: [
                { id: 'gt_o3c', label: 'Bebiste agua contaminada. Largo.', next: null, resultText: "*Escupe sangre al suelo.* \"Maldita agua... maldito lugar...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gt_o3d', label: 'Medir fiebre por infección', next: null, resultText: "*Abre la boca con dificultad.* \"Mira rápido, duele abrirla.\"", onclick: act.testThermo }
            ]
        },
        'gt_n4b': {
            id: 'gt_n4b',
            text: "*Necrosis gingival. Revisa TEMPERATURA y PULSO para descartar fallo sistémico.*",
            options: []
        }
    }
};

export const gen_shadow = {
    id: 'gen_shadow',
    tags: ['paranoid', 'dark'],
    unique: false,
    root: 'gsh_n1',
    nodes: {
        'gsh_n1': {
            id: 'gsh_n1',
            text: "*Mira constantemente a sus espaldas.* \"La luz aquí parpadea mucho, ¿verdad? Crea... formas raras.\"",
            options: [
                { id: 'gsh_o1', label: 'Es el generador', next: 'gsh_n2a' },
                { id: 'gsh_o2', label: '¿Qué formas?', next: 'gsh_n2b' }
            ]
        },
        'gsh_n2a': {
            id: 'gsh_n2a',
            text: "*Asiente, poco convencido.* \"Sí... seguro. Pero a veces parece que la oscuridad se queda quieta cuando la luz vuelve.\"",
            options: [
                { id: 'gsh_o2a', label: 'Estás cansado', next: 'gsh_n3a' },
                { id: 'gsh_o2b', label: 'Ignorar', next: 'gsh_n3b' }
            ]
        },
        'gsh_n2b': {
            id: 'gsh_n2b',
            text: "*Baja la voz.* \"Cosas que te siguen. Sombras que son demasiado largas para ser tuyas.\"",
            options: [{ id: 'gsh_o2c', label: 'Psicosis', next: 'gsh_n4b' }]
        },
        'gsh_n3a': {
            id: 'gsh_n3a',
            text: "*Se frota los ojos.* \"Quizás. Llevo tres días caminando a oscuras. La mente juega trucos.\"",
            options: [
                { id: 'gsh_o3a', label: 'Estás paranoico. Largo.', next: null, resultText: "*Se aleja mirando atrás.* \"¡No estoy loco! ¡Me sigue!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gsh_o3b', label: 'Analizar respuesta pupilar', next: null, resultText: "*Se queda quieto.* \"¿Ves algo en mis ojos? ¿Ves la sombra?\"", onclick: act.testPupils, log: { text: 'Nota: Midriasis extrema sin causa lumínica. El sujeto experimenta terror persistente.', icon: 'fa-ghost' } }
            ]
        },
        'gsh_n3b': {
            id: 'gsh_n3b',
            text: "*Tiembla.* \"No me dejes fuera. Aquí hay luz. Fuera solo hay... ellas.\"",
            options: [
                { id: 'gsh_o3c', label: 'Fuera.', next: null, resultText: "*Grita mientras se lo lleva la oscuridad.* \"¡No! ¡Ya me ha tocado!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gsh_o3d', label: 'Medir pulso (Pánico)', next: null, resultText: "*Te agarra del brazo.* \"¡Rápido! ¡Siente cómo late!\"", onclick: act.testPulse }
            ]
        },
        'gsh_n4b': {
            id: 'gsh_n4b',
            text: "*Pánico agudo. Verifica PULSO para confirmar estabilidad.*",
            options: []
        }
    }
};
