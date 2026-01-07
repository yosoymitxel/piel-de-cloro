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
        const showSidebar = ['game', 'shelter', 'morgue', 'room', 'generator'].includes(screenName);
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

        // Clear attention marking for the screen the player just opened
        const navIdMap = { game: 'nav-guard', shelter: 'nav-shelter', morgue: 'nav-morgue', room: 'nav-room', generator: 'nav-generator' };
        if (this.ui && this.ui.setNavItemStatus && navIdMap[screenName]) {
            this.ui.setNavItemStatus(navIdMap[screenName], null);
        }

        // Toggle visibility of morgue stats nav button
        $('#nav-morgue-stats').removeClass('hidden');
    }

    updateSidebarActive(screenName) {
        $('.group').removeClass('active text-black bg-chlorine opacity-100').addClass('text-chlorine-light opacity-60');

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
