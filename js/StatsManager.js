export class StatsManager {
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
        this.cacheKey = 'stats_cache_v1';
        this.cache = this.loadCache();
        this.realtimeTTL = 5000;
        this.nightlyTTL = 24 * 60 * 60 * 1000;
        this.pollIntervalMs = 5000;
        this.baseUrl = '/api';
        this.useMock = true;
        this.pollTimer = null;
        this.nightTimer = null;
    }

    loadCache() {
        try {
            const raw = localStorage.getItem(this.cacheKey);
            return raw ? JSON.parse(raw) : { realtime: {}, nightly: {} };
        } catch {
            return { realtime: {}, nightly: {} };
        }
    }
    saveCache() {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
        } catch { }
    }

    now() { return Date.now(); }
    isFresh(ts, ttl) { return ts && (this.now() - ts) < ttl; }

    async fetchJSON(url) {
        if (this.useMock) {
            return this.mockResponse(url);
        }
        try {
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            return this.mockResponse(url);
        }
    }

    mockResponse(url) {
        // Simple deterministic mock based on URL hash
        const seed = Array.from(url).reduce((a, c) => a + c.charCodeAt(0), 0);
        const rand = (min, max, s = seed) => {
            const x = Math.sin(s++) * 10000;
            return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
        };
        if (url.includes('/rt')) {
            return {
                users: rand(50, 150),
                transactions: rand(1000, 5000),
                events: rand(200, 800),
                alerts: rand(0, 20)
            };
        }
        if (url.includes('/nightly')) {
            const consolidated = rand(20000, 30000);
            const average = rand(18000, 26000);
            const trendPct = Math.round(((consolidated - average) / Math.max(1, average)) * 100);
            return {
                consolidated,
                average,
                trendPct
            };
        }
        return {};
    }

    formatNumber(n) {
        return new Intl.NumberFormat('es-ES').format(n);
    }

    async updateRealtime(force = false) {
        const c = this.cache.realtime;
        if (!force && this.isFresh(c.ts, this.realtimeTTL)) {
            this.updateUIRealtime(c.data);
            console.info('[Stats] Realtime from cache');
            return;
        }
        const data = await this.fetchJSON(`${this.baseUrl}/rt/counters`);
        this.cache.realtime = { ts: this.now(), data };
        this.saveCache();
        this.updateUIRealtime(data);
        console.info('[Stats] Realtime fetched', data);
    }

    updateUIRealtime(data) {
        this.dom.rtUsers.text(this.formatNumber(data.users ?? 0));
        this.dom.rtTransactions.text(this.formatNumber(data.transactions ?? 0));
        this.dom.rtEvents.text(this.formatNumber(data.events ?? 0));
        this.dom.rtAlerts.text(this.formatNumber(data.alerts ?? 0));
    }

    updateRunStats(state) {
        const admitted = state.admittedNPCs.length;
        const ignored = state.ignoredNPCs.length;
        const purgedInfected = state.purgedNPCs.filter(n => n.isInfected).length;
        const purgedCivil = state.purgedNPCs.filter(n => !n.isInfected).length;
        const civilesMuertos = state.purgedNPCs.filter(n => n.death && n.death.reason === 'asesinado' && !n.isInfected).length;
        const clorosFuera = state.ignoredNPCs.filter(n => n.infected).length;
        const validados = state.admittedNPCs.filter(n => n.dayAfter && n.dayAfter.validated).length;
        const showSensitive = !!(state.lastNight && state.lastNight.occurred);

        $('#stat-run-dialogues').text(state.dialoguesCount);
        $('#stat-run-verifications').text(`${state.verificationsCount} (${validados} validados)`);
        $('#stat-run-admitted').text(admitted);
        $('#stat-run-ignored').text(ignored);
        $('#stat-run-cloros-vistos').text(showSensitive ? state.infectedSeenCount : '—');
        $('#stat-run-cloros-fuera').text(showSensitive ? clorosFuera : '—');
        $('#stat-run-cloros-purgados').text(showSensitive ? purgedInfected : '—');
        $('#stat-run-civiles-muertos').text(civilesMuertos);
        $('#stat-run-civiles-purgados').text(showSensitive ? purgedCivil : '—');
        $('#stat-run-last-night').text(showSensitive ? (state.lastNight.message || '—') : '—');
    }

    async updateNightly(force = false) {
        const n = this.cache.nightly;
        if (!force && this.isFresh(n.ts, this.nightlyTTL)) {
            this.updateUINightly(n.data);
            this.updateNextRefreshLabel();
            console.info('[Stats] Nightly from cache');
            return;
        }
        const data = await this.fetchJSON(`${this.baseUrl}/nightly/metrics`);
        this.cache.nightly = { ts: this.now(), data };
        this.saveCache();
        this.updateUINightly(data);
        this.updateNextRefreshLabel();
        console.info('[Stats] Nightly fetched', data);
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

    updateNextRefreshLabel() {
        const nextMidnight = this.computeNextMidnight();
        const fmt = nextMidnight.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' });
        this.dom.nightNextRefresh.text(fmt);
    }

    computeNextMidnight() {
        const d = new Date();
        d.setHours(24, 0, 0, 0);
        return d;
    }

    scheduleNightly() {
        if (this.nightTimer) clearTimeout(this.nightTimer);
        const ms = this.computeNextMidnight().getTime() - this.now();
        this.nightTimer = setTimeout(async () => {
            await this.updateNightly(true);
            this.scheduleNightly();
        }, Math.max(1000, ms));
        this.updateNextRefreshLabel();
        console.info('[Stats] Nightly scheduled in ms:', Math.max(1000, ms));
    }

    startPollingRealtime() {
        if (this.pollTimer) clearInterval(this.pollTimer);
        this.pollTimer = setInterval(() => this.updateRealtime(false), this.pollIntervalMs);
    }

    bindActions() {
        this.dom.refreshBtn.off('click').on('click', async () => {
            await this.updateRealtime(true);
            await this.updateNightly(true);
            console.info('[Stats] Manual refresh triggered');
        });
    }

    async start() {
        this.bindActions();
        await this.updateRealtime(true);
        await this.updateNightly(false);
        this.startPollingRealtime();
        this.scheduleNightly();
        this.applyResponsiveBehavior();
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
}
