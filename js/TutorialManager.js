import { State } from './State.js';

export class TutorialManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.queue = [];
        this.maxItems = 3;
        this.container = null;
        this.lastState = {
            securityAssigned: false,
            generatorOn: true,
            supplies: 100
        };
        this.pollingInterval = null;
    }

    init() {
        console.log('[TutorialManager] Initializing with Polling System...');
        // Find the container we injected (or will inject)
        this.container = $('#tutorial-monitor-content');
        
        // Polling para garantizar actualizaciones en tiempo real (backup de eventos)
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        this.pollingInterval = setInterval(() => this.pollGameState(), 2000);

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

        // 1. Check Security Assignment
        let hasSecurity = false;
        if (State.assignments && State.assignments.security) {
            hasSecurity = State.assignments.security.occupants.length > 0;
        } else if (State.sectorAssignments && State.sectorAssignments.security) {
            hasSecurity = State.sectorAssignments.security.length > 0;
        }

        // Detect change from Assigned -> Unassigned (Death/Removal)
        if (this.lastState.securityAssigned && !hasSecurity) {
            this.addMessage("ALERTA: Puesto de seguridad VACANTE.", "danger", "sec_vacant");
        } else if (!this.lastState.securityAssigned && hasSecurity) {
            this.removeMessageByKey("sec_vacant");
            this.addMessage("SEGURIDAD: Operativo asignado.", "success", "sec_assigned");
        }
        // Update state
        this.lastState.securityAssigned = hasSecurity;

        // 2. Check Generator Status
        const genOn = State.generator ? State.generator.isOn : true;
        if (this.lastState.generatorOn && !genOn) {
            this.addMessage("CRÍTICO: GENERADOR APAGADO. Reinicio manual requerido.", "danger", "gen_off");
        } else if (!this.lastState.generatorOn && genOn) {
            this.removeMessageByKey("gen_off");
            this.addMessage("SISTEMA: Generador RESTAURADO.", "success", "gen_on");
        }
        this.lastState.generatorOn = genOn;

        // 3. Check Supplies Critical Drop
        const currentSupplies = State.supplies || 0;
        if (currentSupplies <= 3 && this.lastState.supplies > 3) {
            this.addMessage("SUMINISTROS AGOTADOS: Hambruna inminente.", "danger", "supplies_low");
        } else if (currentSupplies > 3 && this.lastState.supplies <= 3) {
            this.removeMessageByKey("supplies_low");
            this.addMessage("SUMINISTROS: Nivel aceptable.", "success", "supplies_ok");
        }
        this.lastState.supplies = currentSupplies;
    }

    // Keep event listeners for immediate feedback, but polling acts as safety net
    onAssignmentUpdate(detail) {
        // detail: { sector, npc, reason }
        console.log(`[TutorialManager] Assignment Update: ${detail.sector} -> ${detail.npc ? detail.npc.name : 'NULL'} (${detail.reason || 'manual'})`);
        
        if (detail.sector === 'security') {
            if (detail.npc) {
                this.removeMessageByKey("sec_vacant");
                this.addMessage(`SEGURIDAD ACTUALIZADA: ${detail.npc.name}`, "success", "sec_assigned");
                this.lastState.securityAssigned = true; // Sync polling state
            } else {
                // Si se desasigna (muerte o manual)
                if (detail.reason === 'death') {
                    this.addMessage("ALERTA: Puesto de seguridad VACANTE por baja.", "danger", "sec_vacant");
                } else {
                    this.addMessage("AVISO: Puesto de seguridad sin asignar.", "warning", "sec_vacant");
                }
                this.lastState.securityAssigned = false; // Sync polling state
            }
        }
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
            case 'danger': return 'text-alert';
            case 'warning': return 'text-orange-400';
            case 'success': return 'text-green-400';
            default: return 'text-gray-400';
        }
    }

    // Logic hooks
    checkParanoia(value) {
        if (value >= 80) this.addMessage("PARANOIA CRÍTICA: Alucinaciones probables.", "danger");
        else if (value >= 60) this.addMessage("Nivel de Paranoia elevado. Revisa tus decisiones.", "warning");
    }

    checkSanity(value) {
        if (value <= 20) this.addMessage("CORDURA BAJA: Riesgo de colapso inminente.", "danger");
        else if (value <= 40) this.addMessage("ADVERTENCIA: Tu cordura está descendiendo.", "warning");
        else if (value < 50) this.addMessage("Tu mente se debilita. Busca la sala de Meditación.", "warning");
    }

    checkSupplies(value) {
        if (value <= 3) this.addMessage("SUMINISTROS AGOTADOS: Hambruna inminente.", "danger");
    }
}
