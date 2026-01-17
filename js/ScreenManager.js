import { LoreData } from './LoreData.js';

export class ScreenManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.screens = uiManager.screens;
        this.elements = uiManager.elements;
    }

    showScreen(screenName, state) {
        // Cancel purge animation if active
        if (this.ui && this.ui.cancelPurgeAnimation) {
            this.ui.cancelPurgeAnimation();
        }

        // Efecto de apagado/encendido de tubo CRT - Solo si cambia la pantalla
        // User Request: Apply TV effect only to main-area so nav remains visible
        const animationTarget = $('#main-area');
        const monitor = animationTarget;
        const isDifferentScreen = this.lastScreen !== screenName;
        const currentScreenId = this.lastScreen;

        // Determine if we need to perform logic update
        const changeLogic = () => {
            Object.values(this.screens).forEach(s => s.addClass('hidden'));
            if (this.screens[screenName]) {
                this.screens[screenName].removeClass('hidden');
            }

            if (isDifferentScreen) {
                animationTarget.addClass('tube-power-on');
                // Remove class after animation completes to avoid interference
                setTimeout(() => {
                    animationTarget.removeClass('tube-power-on');
                }, 550);
            }

            // Asegurarse de ocultar overlays de fin de turno al cambiar de pantalla
            $('#preclose-overlay').addClass('hidden').removeClass('flex');

            if (screenName === 'start') {
                this.updateEndingsRecord(state);
            }

            // Logic 1: Settings button only on start screen
            this.elements.settingsBtn.toggleClass('hidden', screenName !== 'start');

            // Logic 2: Sidebar only on Game, Shelter, Morgue, Room, Generator, Database, Log, Map, Meditation, Supplies
            const showSidebar = ['game', 'shelter', 'morgue', 'room', 'generator', 'database', 'log', 'map', 'meditation', 'supplies-hub', 'fuel-room'].includes(screenName);
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
            this.updateSidebarActive(screenName, state);

            // Toggle visibility of morgue stats nav button
            $('#nav-morgue-stats').removeClass('hidden');

            if (screenName === 'morgue' && state) {
                this.ui.renderMorgueGrid(
                    state.purgedNPCs || [],
                    state.ignoredNPCs || [],
                    state.departedNPCs || [],
                    (npc) => this.ui.modalManager.openModal(npc, false, null, state)
                );
            }

            if (screenName === 'log' && state) {
                this.ui.renderLog(state);
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

            this.lastScreen = screenName;
        };

        if (isDifferentScreen) {
            monitor.removeClass('tube-power-on');
            // Pequeño delay para simular el cambio de canal
            setTimeout(changeLogic, 150);
        } else {
            changeLogic();
        }
    }

    updateSidebarActive(screenName, state) {
        $('#sidebar-left .nav-btn').removeClass('active');

        const navMap = {
            game: '#nav-guard',
            shelter: '#nav-shelter',
            morgue: '#nav-morgue',
            room: '#nav-room',
            generator: '#nav-generator',
            database: '#nav-database',
            map: '#nav-map',
            log: '#btn-open-log',
            meditation: '#map-node-meditacion', // Highlight in map node or sidebar pin
            'supplies-hub': '#map-node-suministros',
            'fuel-room': '#map-node-fuel'
        };
        const activeNav = navMap[screenName];
        if (activeNav) $(activeNav).addClass('active');
    }

    updateEndingsRecord(state) {
        if (!state) return;

        const allEndingsKeys = Object.keys(LoreData).filter(key => key.startsWith('final_'));
        const totalEndings = allEndingsKeys.length;

        // Usar un Set para asegurar que solo contamos finales únicos y que existen en LoreData
        const uniqueUnlocked = new Set((state.unlockedEndings || []).filter(key => allEndingsKeys.includes(key)));
        const unlockedCount = uniqueUnlocked.size;

        $('#endings-count').text(`${unlockedCount}/${totalEndings}`);

        const dotsContainer = $('#endings-dots');
        if (dotsContainer.length) {
            dotsContainer.empty();
            allEndingsKeys.forEach(key => {
                const isUnlocked = uniqueUnlocked.has(key);
                const dot = $('<div>', {
                    class: `w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-white shadow-[0_0_5px_#fff]' : 'bg-white/10'}`,
                    title: isUnlocked ? LoreData[key].title : '???'
                });
                dotsContainer.append(dot);
            });
        }
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
    }
}
