export class StatsPanelRenderer {
    constructor() {
        this.dom = {
            rtUsers: $('#stat-rt-users'),
            rtTransactions: $('#stat-rt-transactions'),
            rtEvents: $('#stat-rt-events'),
            rtAlerts: $('#stat-rt-alerts'),
            nightConsolidated: $('#stat-night-consolidated'),
            nightAverage: $('#stat-night-average'),
            nightTrend: $('#stat-night-trend'),
            nightNextRefresh: $('#stat-night-next-refresh'),
            refreshBtn: $('#btn-stats-refresh'),
            panel: $('#stats-panel')
        };
    }

    formatNumber(n) {
        return new Intl.NumberFormat('es-ES').format(n);
    }

    updateUIRealtime(data) {
        this.dom.rtUsers.text(this.formatNumber(data.users ?? 0));
        this.dom.rtTransactions.text(this.formatNumber(data.transactions ?? 0));
        this.dom.rtEvents.text(this.formatNumber(data.events ?? 0));
        this.dom.rtAlerts.text(this.formatNumber(data.alerts ?? 0));
    }

    updateUINightly(data) {
        const consolidated = data.consolidated ?? 0;
        const average = data.average ?? 0;
        const trendPct = data.trendPct ?? 0;
        this.dom.nightConsolidated.text(this.formatNumber(consolidated));
        this.dom.nightAverage.text(this.formatNumber(average));
        const sign = trendPct > 0 ? '+' : '';
        this.dom.nightTrend
            .text(`${sign}${trendPct}%`)
            .removeClass('trend-up trend-down')
            .addClass(trendPct >= 0 ? 'trend-up' : 'trend-down');
    }

    updateNextRefreshLabel(nextMidnight) {
        const fmt = nextMidnight.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' });
        this.dom.nightNextRefresh.text(fmt);
    }

    applyResponsiveBehavior() {
        const panel = this.dom.panel;
        const update = () => {
            const small = window.matchMedia('(max-width: 768px)').matches;
            panel.toggleClass('w-full', small);
            panel.toggleClass('border-l', !small);
            panel.toggleClass('border-t', small);
        };
        update();
        $(window).on('resize', update);
    }

    bindRefreshAction(handler) {
        this.dom.refreshBtn.off('click').on('click', handler);
    }
}
