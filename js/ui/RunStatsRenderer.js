/**
 * RunStatsRenderer handles rendering the current game run statistics.
 */
export class RunStatsRenderer {
    constructor() {
        this.dom = {
            dialogues: $('#stat-run-dialogues'),
            verifications: $('#stat-run-verifications'),
            admitted: $('#stat-run-admitted'),
            ignored: $('#stat-run-ignored'),
            clorosVistos: $('#stat-run-cloros-vistos'),
            clorosFuera: $('#stat-run-cloros-fuera'),
            clorosPurgados: $('#stat-run-cloros-purgados'),
            civilesMuertos: $('#stat-run-civiles-muertos'),
            civilesPurgados: $('#stat-run-civiles-purgados'),
            lastNight: $('#stat-run-last-night')
        };
    }

    /**
     * Updates the run statistics UI with current game state.
     */
    update(state) {
        const admitted = state.admittedNPCs.length;
        const ignored = state.ignoredNPCs.length;
        const purgedInfected = state.purgedNPCs.filter(n => n.isInfected).length;
        const purgedCivil = state.purgedNPCs.filter(n => !n.isInfected).length;
        const civilesMuertos = state.purgedNPCs.filter(n => n.death && n.death.reason === 'asesinado' && !n.isInfected).length;
        const clorosFuera = state.ignoredNPCs.filter(n => n.infected).length;
        const validados = state.admittedNPCs.filter(n => n.dayAfter && n.dayAfter.validated).length;
        const showSensitive = !!(state.lastNight && state.lastNight.occurred);

        this.dom.dialogues.text(state.dialoguesCount);
        this.dom.verifications.text(`${state.verificationsCount} (${validados} validados)`);
        this.dom.admitted.text(admitted);
        this.dom.ignored.text(ignored);
        this.dom.clorosVistos.text(showSensitive ? state.infectedSeenCount : '—');
        this.dom.clorosFuera.text(showSensitive ? clorosFuera : '—');
        this.dom.clorosPurgados.text(showSensitive ? purgedInfected : '—');
        this.dom.civilesMuertos.text(civilesMuertos);
        this.dom.civilesPurgados.text(showSensitive ? purgedCivil : '—');
        this.dom.lastNight.text(showSensitive ? (state.lastNight.message || '—') : '—');
    }
}
