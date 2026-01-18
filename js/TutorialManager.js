import { State } from './State.js';

export class TutorialManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.queue = [];
        this.maxItems = 3;
        this.container = null;
        this.pollingInterval = null;
        
        // Estado interno para tracking de cambios
        this.activeRules = new Set();
        
        // DEFINICIÓN CENTRALIZADA DE REGLAS
        // condition: Función que evalúa el estado actual
        // message: Texto a mostrar
        // type: 'warning' | 'danger' | 'success' | 'info'
        // navTarget: ID del botón de navegación a resaltar (opcional)
        // navLevel: Nivel de alerta del nav (2=Active, 3=Alert, 5=Critical)
        // logType: Tipo de log a generar (opcional, si se quiere persistencia)
        // resolveMsg: Función o string para mensaje de éxito al resolver
        this.rules = [
            // --- SEGURIDAD ---
            {
                id: 'sec_vacant',
                condition: (state) => {
                    if (state.isNight) return false; 
                    const hasSecurity = (state.assignments?.security?.occupants?.length > 0) || (state.sectorAssignments?.security?.length > 0);
                    return !hasSecurity;
                },
                message: "ALERTA: Puesto de seguridad VACANTE.",
                type: "danger",
                navTarget: "nav-room",
                navLevel: 3,
                logType: "warning",
                resolveMsg: (state) => {
                    // Intentar obtener el nombre del asignado
                    let name = "Personal";
                    if (state.sectorAssignments?.security?.length > 0) {
                         // Buscar el NPC en admittedNPCs por ID si es necesario, o si ya es objeto
                         const id = state.sectorAssignments.security[0];
                         const npc = state.admittedNPCs.find(n => n.id === id);
                         if (npc) name = npc.name;
                    } else if (state.assignments?.security?.occupants?.length > 0) {
                        const npc = state.assignments.security.occupants[0];
                        if (npc) name = npc.name;
                    }
                    return `Puesto de seguridad cubierto por: ${name}`;
                }
            },
            // --- GENERADOR ---
            {
                id: 'gen_off',
                condition: (state) => state.generator && !state.generator.isOn,
                message: "CRÍTICO: GENERADOR APAGADO. Reinicio manual requerido.",
                type: "danger",
                navTarget: "nav-generator",
                navLevel: 5,
                logType: "critical",
                resolveMsg: "Generador REINICIADO y operativo."
            },
            {
                id: 'gen_low_battery',
                condition: (state) => state.generator && state.generator.isOn && state.generator.power < 20,
                message: "ENERGÍA BAJA: Batería < 20%. Apaga sistemas o recarga.",
                type: "warning",
                navTarget: "nav-generator",
                navLevel: 3,
                resolveMsg: "Niveles de batería ESTABILIZADOS."
            },
            // --- SUMINISTROS ---
            {
                id: 'supplies_critical',
                condition: (state) => (state.supplies || 0) <= 3,
                message: "SUMINISTROS AGOTADOS: Hambruna inminente. Prioriza recolección.",
                type: "danger",
                navTarget: "map-node-suministros", 
                navLevel: 5,
                logType: "warning",
                resolveMsg: "Reservas de suministros AUMENTADAS."
            },
            // --- COMBUSTIBLE ---
            {
                id: 'fuel_low',
                condition: (state) => (state.fuel || 0) < 2,
                message: "COMBUSTIBLE ESCASO: Reservas críticas. Inicia expedición.",
                type: "warning",
                navTarget: "map-node-fuel",
                navLevel: 3,
                resolveMsg: "Reservas de combustible AUMENTADAS."
            },
            // --- PARANOIA (MEDITACIÓN) ---
            {
                id: 'paranoia_high',
                condition: (state) => (state.paranoia || 0) > 50,
                message: "PARANOIA ELEVADA: El operador es inestable. Se recomienda MEDITAR.",
                type: "warning",
                navTarget: "map-node-meditacion",
                navLevel: 3, 
                logType: "guide",
                resolveMsg: "Niveles de paranoia REDUCIDOS."
            },
            {
                id: 'paranoia_critical',
                condition: (state) => (state.paranoia || 0) > 80,
                message: "PSICOSIS INMINENTE: Alucinaciones activas. MEDITACIÓN OBLIGATORIA.",
                type: "danger",
                navTarget: "map-node-meditacion",
                navLevel: 5, 
                logType: "danger",
                resolveMsg: "Crisis de psicosis CONTROLADA."
            },
            // --- CORDURA ---
            {
                id: 'sanity_low',
                condition: (state) => (state.sanity || 100) < 30,
                message: "CORDURA CRÍTICA: Riesgo de suicidio o colapso.",
                type: "danger",
                navTarget: "map-node-meditacion",
                navLevel: 5,
                resolveMsg: "Estabilidad mental RECUPERADA."
            }
        ];
    }

    init() {
        console.log('[TutorialManager] Initializing with Centralized Rules System...');
        // Find the container we injected (or will inject)
        this.container = $('#tutorial-monitor-content');
        
        // Polling para garantizar actualizaciones en tiempo real (backup de eventos)
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        
        // Evitar polling en entorno de test para prevenir open handles
        const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
        if (!isTestEnv) {
            this.pollingInterval = setInterval(() => this.pollGameState(), 2000);
        }

        // Mensaje inicial
        this.addMessage("SISTEMA DE GUÍA: ACTIVO", "success");
        this.addMessage("REVISA EL REFUGIO PARA VER OCUPANTES", "warning");

        // Listen for global logs to show critical events
        if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
            document.addEventListener('log-added', (e) => {
                const entry = e.detail.entry;
                // Filter only important logs for the tutorial monitor
                if (['danger', 'critical', 'warning', 'alert'].includes(entry.type)) {
                    this.addMessage(entry.text, entry.type);
                }
            });
        }
    }

    pollGameState() {
        if (!State) return;

        this.rules.forEach(rule => {
            const isActive = rule.condition(State);
            const wasActive = this.activeRules.has(rule.id);

            if (isActive && !wasActive) {
                // ACTIVACIÓN DE REGLA
                this.activeRules.add(rule.id);
                
                // 1. Mostrar Mensaje en Monitor
                this.addMessage(rule.message, rule.type, rule.id);
                
                // 2. Actualizar Nav Status (Feedback Visual Centralizado)
                if (rule.navTarget && this.ui.setNavItemStatus) {
                    this.ui.setNavItemStatus(rule.navTarget, rule.navLevel);
                }

                // 3. Escribir en Log/Bitácora (Persistencia Centralizada)
                // Solo si tiene logType definido, para no spamear
                if (rule.logType) {
                    // Evitamos bucles infinitos si el log trigger es el mismo que escuchamos
                    // Usamos un flag o chequeamos el tipo
                    State.addLogEntry(rule.logType, `GUÍA: ${rule.message}`, { icon: 'fa-triangle-exclamation' });
                }

            } else if (!isActive && wasActive) {
                // DESACTIVACIÓN DE REGLA (Recuperación)
                this.activeRules.delete(rule.id);
                this.removeMessageByKey(rule.id);
                
                // Mostrar mensaje de resolución (verde)
                if (rule.resolveMsg) {
                    let resolveText = "";
                    if (typeof rule.resolveMsg === 'function') {
                        resolveText = rule.resolveMsg(State);
                    } else {
                        resolveText = rule.resolveMsg;
                    }
                    
                    if (resolveText) {
                        this.addMessage(resolveText, "success");
                    }
                }

                // Limpiar Nav Status
                if (rule.navTarget && this.ui.setNavItemStatus) {
                    this.ui.setNavItemStatus(rule.navTarget, null); // Reset
                }
            }
        });
    }

    // Keep event listeners for immediate feedback, but polling acts as safety net
    onAssignmentUpdate(detail) {
        // detail: { sector, npc, reason }
        console.log(`[TutorialManager] Assignment Update: ${detail.sector} -> ${detail.npc ? detail.npc.name : 'NULL'} (${detail.reason || 'manual'})`);
        
        // Force immediate poll to update rules/messages
        this.pollGameState();
    }

    removeMessage(text) {
        // Elimina un mensaje específico de la cola y re-renderiza
        const initialLen = this.queue.length;
        this.queue = this.queue.filter(item => item.text !== text);
        
        if (this.queue.length !== initialLen) {
            this.render();
        }
    }

    removeMessageByKey(key) {
        if (!key) return;
        const initialLen = this.queue.length;
        this.queue = this.queue.filter(item => item.key !== key);
        if (this.queue.length !== initialLen) {
            this.render();
        }
    }

    checkContextHints(detail) {
        // Pistas contextuales basadas en el estado del juego
        const state = detail.state || State; 
        
        // Ejemplo: Si es de noche y no hay guardia
        if (state.isNight && (!state.assignments || !state.assignments.security || state.assignments.security.occupants.length === 0)) {
            this.addMessage("ALERTA NOCTURNA: Sin guardia asignado en seguridad.", "danger", "sec_night_alert");
        }
    }

    addMessage(text, type = 'info', key = null) {
        console.log(`[TutorialManager] Adding message: "${text}" (${type}) [${key}]`);
        
        // Si el mensaje ya existe (por texto o clave), lo eliminamos primero
        if (key) {
            this.queue = this.queue.filter(item => item.key !== key);
        } else {
            this.queue = this.queue.filter(item => item.text !== text);
        }

        // Insertar al inicio (LIFO visual, el más nuevo arriba)
        this.queue.unshift({ text, type, timestamp: Date.now(), key });
        
        // Limitar tamaño de cola
        if (this.queue.length > this.maxItems) {
            this.queue.pop();
        }

        this.render();
    }

    render() {
        // Always try to find container if missing
        if (!this.container || !this.container.length) {
            this.container = $('#tutorial-monitor-content');
        }
        
        if (!this.container || !this.container.length) {
            // Fail silently but log once
            return; 
        }

        this.container.empty();

        this.queue.forEach(item => {
            const colorClass = this.getColorForType(item.type);
            // Si el texto es largo (> 25 caracteres), añadimos clase para marquee
            const isLong = item.text.length > 25;
            const scrollClass = isLong ? 'scrolling' : '';
            
            const el = $(`
                <div class="tutorial-msg font-mono mb-1 border-b border-white/10 pb-1 animate__animated animate__fadeIn ${scrollClass}">
                    <span class="${colorClass}">${item.text}</span>
                </div>
            `);
            this.container.append(el);
        });
    }

    getColorForType(type) {
        switch (type) {
            case 'danger': return 'text-red-500';
            case 'warning': return 'text-orange-400';
            case 'success': return 'text-green-400';
            default: return 'text-gray-400';
        }
    }
}
