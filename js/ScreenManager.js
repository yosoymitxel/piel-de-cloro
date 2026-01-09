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

        // Logic 1: Settings button only on start screen
        this.elements.settingsBtn.toggleClass('hidden', screenName !== 'start');

        // Logic 2: Sidebar only on Game, Shelter, Morgue, Room, Generator
        const showSidebar = ['game', 'shelter', 'morgue', 'room', 'generator', 'log'].includes(screenName);
        this.elements.sidebar.toggleClass('hidden', !showSidebar);

        // Toggle finalize button visibility in Shelter
        if (screenName === 'shelter') {
            const shouldShow = state.isDayOver() && !state.isNight;
            this.elements.finalizeNoPurgeBtn.toggleClass('hidden', !shouldShow);
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
                <div class="bg-black/40 border ${borderColor} p-2 flex items-center gap-3 min-h-[60px] relative overflow-hidden group hover:bg-white/5 transition-colors">
                    <!-- Photo / Avatar Placeholder -->
                    <div class="w-10 h-10 flex-shrink-0 border border-white/10 rounded-sm overflow-hidden relative bg-gray-900">
                        <div class="absolute inset-0 opacity-70" style="${skinStyle}"></div>
                        <div class="absolute inset-0 flex items-end justify-center">
                             <i class="fa-solid fa-user text-black/60 text-3xl translate-y-1"></i>
                        </div>
                        <!-- Status Icon Overlay -->
                        <div class="absolute top-0 right-0 p-0.5 bg-black/50">
                            <i class="fa-solid ${icon} ${colorClass} text-[8px]"></i>
                        </div>
                    </div>
                    
                    <!-- Details -->
                    <div class="flex flex-col overflow-hidden w-full">
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-xs font-bold text-white truncate">${npc.name}</span>
                            <span class="font-mono text-[9px] ${colorClass} border border-current px-1 rounded-[2px]">${statusLabel}</span>
                        </div>
                        <span class="font-mono text-[10px] text-chlorine-light opacity-80 truncate">${npc.occupation || 'Sin registro'}</span>
                        <div class="flex gap-2 text-[9px] opacity-50 font-mono mt-0.5">
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

    renderFinalStats(state) {
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

        const notes = $('#final-stat-notes');
        notes.empty();
        const addNote = (txt) => notes.append(`<p>> ${txt}</p>`);

        if (leaked > 0) addNote(`ALERTA: Se han detectado ${leaked} brechas biológicas en el perímetro.`);
        else addNote("PROTOCOLO DE CONTENCIÓN: ÉXITO TOTAL. No hay rastros de infección.");

        if (deaths > 0) addNote(`Bajas civiles confirmadas: ${deaths}. Daños colaterales dentro de los márgenes.`);
        if (state.paranoia > 80) addNote("ADVERTENCIA: Niveles de estrés post-traumático críticos en el operador.");

        const outcome = $('#final-stat-outcome');
        if (leaked > 2 || state.playerInfected) {
            outcome.text("FALLIDO").addClass('text-alert').removeClass('text-chlorine');
        } else {
            outcome.text("COMPLETADO").addClass('text-chlorine').removeClass('text-alert');
        }

        this.showScreen('finalStats', state);
    }
}
