import { DialogueActions as act } from '../../DialogueActions.js';

export const gen_scratch = {
    id: 'gen_scratch',
    tags: ['nervous', 'body_horror'],
    unique: false,
    root: 'gs_n1',
    nodes: {
        'gs_n1': {
            id: 'gs_n1',
            text: "*Se frota el antebrazo compulsivamente.* \"El agua de las duchas... pica hoy. ¿No lo sientes?\" *Su piel está enrojecida.*",
            options: [
                { id: 'gs_o1', label: 'Examinar brazo', next: 'gs_n2a' },
                { id: 'gs_o3', label: '¡Deja de rascarte!', next: 'gs_n2c' }
            ]
        },
        'gs_n2a': {
            id: 'gs_n2a',
            text: "*La piel parece irritada, quizás es sarna o algo peor.* \"A veces siento que se mueve... pero debe ser el frío, ¿verdad?\" *Evita mirar la herida.*",
            options: [
                { id: 'gs_o2a', label: 'Inspeccionar más de cerca', next: 'gs_n3a' },
                { id: 'gs_o2b', label: 'Retroceder asqueado', next: 'gs_n3b' }
            ]
        },
        'gs_n2b': {
            id: 'gs_n2b',
            text: "*Acepta la venda con manos temblorosas.* \"Gracias... aunque taparlo no hace que pare. Nada hace que pare.\"",
            options: [
                { id: 'gs_o2c', label: 'Preguntar desde cuándo', next: 'gs_n3b' },
                { id: 'gs_o2d', label: 'Observar', next: 'gs_n3a' }
            ]
        },
        'gs_n2c': {
            id: 'gs_n2c',
            text: "*Te mira con ira, los ojos desorbitados.* \"¡No es por gusto! ¡Ellos caminan bajo mi piel! ¿Quieres verlos?\"",
            options: [
                { id: 'gs_o2e', label: 'Calma, déjame ver', next: 'gs_n3a' },
                { id: 'gs_o2f', label: 'Estás delirando', next: 'gs_n3b' }
            ]
        },
        'gs_n3a': {
            id: 'gs_n3a',
            text: "*Al presionar, la piel cede de forma extraña, como si hubiera aire o líquido debajo.* \"¡Ay! ¡Cuidado! No lo despiertes...\"",
            options: [
                { id: 'gs_o3a', label: '¡Aléjate! Eso no es normal', next: null, resultText: "*Retrocede asustado.* \"¡No es nada, lo juro!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gs_o3d', label: 'Analizar movimiento subcutáneo', next: null, resultText: "*Tiembla mientras aplicas la luz.* \"Hazlo rápido... se agitan con la luz.\"", onclick: act.testUV, log: { text: 'Evidencia: Movimiento parasitario visible bajo la dermis al aplicar estrés.', icon: 'fa-bug' } }
            ]
        },
        'gs_n3b': {
            id: 'gs_n3b',
            text: "*Se rasca hasta que brota una gota de sangre oscura.* \"Es el metal... el óxido del aire nos está cambiando.\"",
            options: [
                { id: 'gs_o3b', label: 'No puedo arriesgarme. Vete.', next: null, resultText: "*Se aleja rascándose con furia.* \"El óxido... todo es óxido...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gs_o3c', label: 'Verificar temperatura de la sangre', next: null, resultText: "*Extiende el brazo sangrante.* \"Mira si quieres. La sangre no miente.\"", onclick: act.testThermo, log: { text: 'Dato: La sangre infectada suele estar fría al tacto inmediatamente después de brotar.', icon: 'fa-temperature-low' } }
            ]
        },
        'gs_n4b': {
            id: 'gs_n4b',
            text: "*Sujeto listo. Usa la LINTERNA UV para buscar parásitos subcutáneos.*",
            options: []
        }
    }
};

export const gen_leak = {
    id: 'gen_leak',
    tags: ['fanatic', 'body_horror'],
    unique: false,
    root: 'gl_n1',
    nodes: {
        'gl_n1': {
            id: 'gl_n1',
            text: "*Se limpia los ojos constantemente con un pañuelo sucio.* \"Hay mucho humo en los túneles hoy. Me arden los ojos.\" *Sus ojos están muy llorosos.*",
            options: [
                { id: 'gl_o1', label: 'Examinar ojos', next: 'gl_n2a' },
                { id: 'gl_o2', label: 'Ofrecer agua', next: 'gl_n2b' }
            ]
        },
        'gl_n2a': {
            id: 'gl_n2a',
            text: "*El lagrimal segrega un fluido ligeramente más denso y oscuro de lo normal.* \"Es solo irritación... o quizás conjuntivitis. No es nada grave.\"",
            options: [
                { id: 'gl_o2a', label: 'Sospechar infección', next: 'gl_n3a' },
                { id: 'gl_o2b', label: 'Preguntar si ve bien', next: 'gl_n3b' }
            ]
        },
        'gl_n2b': {
            id: 'gl_n2b',
            text: "*Bebe con avidez, pero el agua se le escapa por la comisura, mezclada con saliva oscura.* \"Gracias... tenía la garganta seca como lija.\"",
            options: [
                { id: 'gl_o2c', label: 'Observar fluido', next: 'gl_n3a' }
            ]
        },
        'gl_n3a': {
            id: 'gl_n3a',
            text: "*Se frota la cara, extendiendo una mancha grisácea.* \"¿Por qué me miras así? ¿Tengo algo en la cara?\"",
            options: [
                { id: 'gl_o3a', label: 'Estás infectado. Largo.', next: null, resultText: "*Se va cubriéndose la cara.* \"Solo necesito colirio...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gl_o3b', label: 'Analizar secreción con UV', next: null, resultText: "*Se limpia la cara con la manga.* \"Espero que tengas algo para esto.\"", onclick: act.testUV, log: { text: 'Síntoma: Secreción ocular viscosa. Reacciona a la luz UV mostrando patrones sintéticos.', icon: 'fa-eye' } }
            ]
        },
        'gl_n3b': {
            id: 'gl_n3b',
            text: "*Parpadea lentamente.* \"Veo... manchas. Como aceite flotando en agua. ¿Tú no las ves?\"",
            options: [
                { id: 'gl_o3c', label: 'Estás alucinando. Fuera.', next: null, resultText: "*Se aleja tropezando.* \"Manchas... todo son manchas...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gl_o3d', label: 'Examinar reacción pupilar', next: null, resultText: "*Se acerca a la luz.* \"Dime que no ves las manchas tú también.\"", onclick: act.testPupils }
            ]
        },
        'gl_n4b': {
            id: 'gl_n4b',
            text: "*Secreción anómala. Usa el DILATADOR DE PUPILAS para verificar reacción.*",
            options: []
        }
    }
};

export const gen_whisper = {
    id: 'gen_whisper',
    tags: ['paranoid'],
    unique: false,
    root: 'gw_n1',
    nodes: {
        'gw_n1': {
            id: 'gw_n1',
            text: "*Inclina la cabeza hacia un lado, como escuchando algo lejano.* \"¿Oyes eso? Parece... agua corriendo. O gente susurrando.\"",
            options: [
                { id: 'gw_o1', label: 'Escuchar también', next: 'gw_n2a' },
                { id: 'gw_o2', label: '¿Qué dicen?', next: 'gw_n2b' }
            ]
        },
        'gw_n2a': {
            id: 'gw_n2a',
            text: "*Se pone tenso.* \"Están en las tuberías. Siempre empiezan bajito. Quizás es el eco del generador... o quizás no.\"",
            options: [
                { id: 'gw_o2a', label: 'Es el viento', next: 'gw_n3a' },
                { id: 'gw_o2b', label: 'Pedir silencio', next: 'gw_n3b' }
            ]
        },
        'gw_n2b': {
            id: 'gw_n2b',
            text: "*Cierra los ojos.* \"Nombres. Repiten nombres. Espero que no digan el mío... ni el tuyo.\"",
            options: [
                { id: 'gw_o2c', label: 'Inquietante...', next: 'gw_n4b' }
            ]
        },
        'gw_n3a': {
            id: 'gw_n3a',
            text: "*Sacude la cabeza.* \"Ojalá fuera el viento. El viento no tiene ritmo.\"",
            options: [
                { id: 'gw_o3a', label: 'Eres inestable. Vete.', next: null, resultText: "*Se va tapándose los oídos.* \"¡Callaos! ¡Dejadme en paz!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gw_o3b', label: 'Intenta calmarte, voy a hacer un chequeo', next: null, resultText: "*Asiente, tenso.* \"Hazlo antes de que vuelvan a empezar.\"", onclick: act.test }
            ]
        },
        'gw_n3b': {
            id: 'gw_n3b',
            text: "*Se queda quieto.* \"Shhh... si hacemos ruido, nos encontrarán.\"",
            options: [
                { id: 'gw_o3c', label: 'No quiero locos aquí. Fuera.', next: null, resultText: "*Se aleja de puntillas.* \"Shhh... nos oirán si corremos.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                { id: 'gw_o3d', label: 'Silencio. Déjame trabajar.', next: null, resultText: "*Se tapa la boca.* \"Seré una tumba. Revisa lo que quieras.\"", onclick: act.test, log: { text: 'Comportamiento: Escuchan voces en las tuberías. Afirman que el sistema de agua "habla" con nombres.', icon: 'fa-ear-listen' } }
            ]
        },
        'gw_n4b': {
            id: 'gw_n4b',
            text: "*Paranoia auditiva. Verifica PULSO y PUPILAS para descartar estrés extremo.*",
            options: []
        }
    }
};
