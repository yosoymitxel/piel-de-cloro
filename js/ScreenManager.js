import { LoreData } from './LoreData.js';

export class ScreenManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.screens = uiManager.screens;
        this.elements = uiManager.elements;
    }

    showScreen(screenName, state) {
        Object.values(this.screens).forEach(s => s.addClass('hidden'));
        if (this.screens[screenName]) {
            this.screens[screenName].removeClass('hidden');
        }

        // Asegurarse de ocultar overlays de fin de turno al cambiar de pantalla
        $('#preclose-overlay').addClass('hidden').removeClass('flex');

        if (screenName === 'start') {
            this.updateEndingsRecord(state);
        }

        // Logic 1: Settings button only on start screen
        this.elements.settingsBtn.toggleClass('hidden', screenName !== 'start');

        // Logic 2: Sidebar only on Game, Shelter, Morgue, Room, Generator
        const showSidebar = ['game', 'shelter', 'morgue', 'room', 'generator', 'log'].includes(screenName);
        this.elements.sidebar.toggleClass('hidden', !showSidebar);

        // Toggle finalize button visibility in Shelter
        if (screenName === 'shelter') {
            // Mostrar si el día terminó (fase de transición) O si es de noche (gestión de refugio)
            const isTransition = state.isDayOver() && !state.isNight;
            const isNightManagement = state.isNight;
            const shouldShow = isTransition || isNightManagement;
            
            this.elements.finalizeNoPurgeBtn.toggleClass('hidden', !shouldShow);
            
            // Ajustar texto según el contexto
            if (isNightManagement) {
                this.elements.finalizeNoPurgeBtn.text('VOLVER AL PROTOCOLO NOCTURNO');
            } else {
                this.elements.finalizeNoPurgeBtn.text('FINALIZAR TURNO SIN PURGAR');
            }
        } else {
            this.elements.finalizeNoPurgeBtn.addClass('hidden');
        }

        // Clear global feedback on screen change
        this.ui.hideFeedback();

        // Update active state in sidebar
        this.updateSidebarActive(screenName);

        // Toggle visibility of morgue stats nav button
        $('#nav-morgue-stats').removeClass('hidden');

        if (screenName === 'morgue' && state) {
            this.renderMorgue(state);
        }

        if (screenName === 'night' && state) {
            const count = state.admittedNPCs.length;
            const max = state.config.maxShelterCapacity;
            const isFull = count >= max;
            
            const btnEscape = $('#btn-night-escape');
            if (isFull) {
                btnEscape.removeClass('opacity-30 grayscale pointer-events-none');
            } else {
                btnEscape.addClass('opacity-30 grayscale pointer-events-none');
            }
        }
    }

    updateSidebarActive(screenName) {
        $('#sidebar-left .nav-btn').removeClass('active text-black bg-chlorine opacity-100').addClass('text-chlorine-light opacity-60');

        const activeClass = 'active text-black bg-chlorine opacity-100';
        const inactiveClass = 'text-chlorine-light opacity-60';

        const navMap = {
            game: '#nav-guard',
            shelter: '#nav-shelter',
            morgue: '#nav-morgue',
            room: '#nav-room',
            generator: '#nav-generator'
        };

        const activeNav = navMap[screenName];
        if (activeNav) {
            $(activeNav).addClass(activeClass).removeClass(inactiveClass);
        }
    }

    renderMorgue(state) {
        const createCard = (npc, type) => {
            let borderColor = 'border-chlorine-dim';
            let icon = 'fa-user';
            let colorClass = 'text-gray-400';
            let statusLabel = 'DESCONOCIDO';

            if (type === 'purged') {
                borderColor = 'border-alert/50';
                icon = 'fa-skull';
                colorClass = 'text-alert';
                statusLabel = 'ELIMINADO';
            } else if (type === 'ignored') {
                borderColor = 'border-yellow-500/50';
                icon = 'fa-person-running';
                colorClass = 'text-yellow-500';
                statusLabel = 'FUGITIVO';
            } else if (type === 'departed') {
                borderColor = 'border-blue-400/50';
                icon = 'fa-moon';
                colorClass = 'text-blue-400';
                statusLabel = 'DESERCIÓN';
            }

            // Simulación de "foto" usando el color de piel del NPC
            const skinStyle = npc.visualFeatures && npc.visualFeatures.skinColor
                ? `background-color: ${npc.visualFeatures.skinColor};`
                : 'background-color: #555;';

            return `
                <div class="bg-black/40 border ${borderColor} p-2 flex items-center gap-3 min-h-[60px] relative overflow-hidden group hover:bg-white/5 hover:text-white transition-colors">
                    <!-- Photo / Avatar Placeholder -->
                    <div class="w-10 h-10 flex-shrink-0 border border-white/10 rounded-sm overflow-hidden relative bg-gray-900">
                        <div class="absolute inset-0 opacity-70" style="${skinStyle}"></div>
                        <div class="absolute inset-0 flex items-end justify-center">
                             <i class="fa-solid fa-user text-black/60 text-3xl translate-y-1"></i>
                        </div>
                        <!-- Status Icon Overlay -->
                        <div class="absolute top-0 right-0 p-0.5 bg-black/50">
                            <i class="fa-solid ${icon} ${colorClass} text-xs"></i>
                        </div>
                    </div>
                    
                    <!-- Details -->
                    <div class="flex flex-col overflow-hidden w-full">
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-xs font-bold text-white truncate">${npc.name}</span>
                            <span class="font-mono text-xs ${colorClass} border border-current px-1 rounded-[2px]">${statusLabel}</span>
                        </div>
                        <span class="font-mono text-xs text-chlorine-light opacity-80 truncate">${npc.occupation || 'Sin registro'}</span>
                        <div class="flex gap-2 text-xs opacity-50 font-mono mt-0.5">
                            <span><i class="fa-solid fa-fingerprint"></i> ${npc.personality ? npc.personality.toUpperCase() : '???'}</span>
                        </div>
                    </div>
                </div>
            `;
        };

        const purgedContainer = $('#morgue-list-purged').empty();
        const ignoredContainer = $('#morgue-list-ignored').empty();
        const departedContainer = $('#morgue-list-departed').empty();

        if (state.purgedNPCs) state.purgedNPCs.forEach(npc => purgedContainer.append(createCard(npc, 'purged')));
        if (state.ignoredNPCs) state.ignoredNPCs.forEach(npc => ignoredContainer.append(createCard(npc, 'ignored')));
        if (state.departedNPCs) state.departedNPCs.forEach(npc => departedContainer.append(createCard(npc, 'departed')));
    }

    updateEndingsRecord(state) {
        const totalEndings = Object.keys(LoreData).filter(key => key.startsWith('final_')).length;
        const unlocked = state.unlockedEndings.length;
        
        $('#endings-count').text(`${unlocked}/${totalEndings}`);
        
        const dotsContainer = $('#endings-dots');
        dotsContainer.empty();
        
        // Crear puntos para cada final posible
        Object.keys(LoreData).filter(key => key.startsWith('final_')).forEach(key => {
            const isUnlocked = state.unlockedEndings.includes(key);
            const dot = $('<div>', {
                class: `w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-white shadow-[0_0_5px_#fff]' : 'bg-white/10'}`,
                title: isUnlocked ? LoreData[key].title : '???'
            });
            dotsContainer.append(dot);
        });
    }

    renderFinalStats(state, endingId) {
        const totalProcesados = state.admittedNPCs.length + state.ignoredNPCs.length + state.purgedNPCs.length + state.departedNPCs.length;
        const admitted = state.admittedNPCs.length;
        const purged = state.purgedNPCs.length;
        const infectedDetected = state.infectedSeenCount;

        const leaked = state.admittedNPCs.filter(n => n.isInfected).length +
            state.departedNPCs.filter(n => n.isInfected).length;

        const deaths = state.purgedNPCs.filter(n => !n.isInfected).length;

        $('#final-stat-total').text(totalProcesados);
        $('#final-stat-admitted').text(admitted);
        $('#final-stat-purged').text(purged);
        $('#final-stat-infected').text(infectedDetected);
        $('#final-stat-leaked').text(leaked);
        $('#final-stat-deaths').text(deaths);

        // Mostrar título del final
        const endingTitle = LoreData[endingId]?.title || 'ARCHIVO DESCONOCIDO';
        $('#final-stat-ending-title').text(endingTitle);

        const notes = $('#final-stat-notes');
        notes.empty();
        const addNote = (txt) => notes.append(`<p>> ${txt}</p>`);

        if (leaked > 0) addNote(`ALERTA: Se han detectado ${leaked} brechas biológicas en el perímetro.`);
        else if (endingId === 'final_clean') addNote("PROTOCOLO DE CONTENCIÓN: ÉXITO TOTAL. No hay rastros de infección.");

        if (deaths > 0) addNote(`Bajas civiles confirmadas: ${deaths}. Daños colaterales dentro de los márgenes.`);
        if (state.paranoia > 80) addNote("ADVERTENCIA: Niveles de estrés post-traumático críticos en el operador.");

        const outcome = $('#final-stat-outcome');
        outcome.removeClass('text-chlorine text-alert text-warning text-save');

        // Determinar el estado basado en el final
        if (endingId === 'final_clean') {
            outcome.text("ÉXITO OPERATIVO").addClass('text-save');
        } else if (endingId === 'final_corrupted' || endingId === 'final_player_infected_escape') {
            outcome.text("COMPROMETIDO").addClass('text-warning');
        } else if (endingId && (endingId.includes('death') || endingId.includes('off') || endingId.includes('abandonment'))) {
            outcome.text("OPERATIVO ELIMINADO").addClass('text-alert');
        } else {
            outcome.text("MISIÓN FALLIDA").addClass('text-alert');
        }

        this.showScreen('finalStats', state);
    }
}
