import { STATS_CONFIG } from './Constants.js';
import { StatsPanelRenderer } from './ui/StatsPanelRenderer.js';

export class StatsManager {
    constructor() {
        this.renderer = new StatsPanelRenderer();
        this.cacheKey = 'stats_cache_v1';
        this.cache = this.loadCache();
        this.realtimeTTL = STATS_CONFIG.REALTIME_TTL;
        this.nightlyTTL = STATS_CONFIG.NIGHTLY_TTL;
        this.pollIntervalMs = STATS_CONFIG.POLL_INTERVAL;
        this.baseUrl = STATS_CONFIG.BASE_URL;
        this.useMock = STATS_CONFIG.USE_MOCK;
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
            this.renderer.updateUIRealtime(c.data);
            console.info('[Stats] Realtime from cache');
            return;
        }
        const data = await this.fetchJSON(`${this.baseUrl}/rt/counters`);
        this.cache.realtime = { ts: this.now(), data };
        this.saveCache();
        this.renderer.updateUIRealtime(data);
        console.info('[Stats] Realtime fetched', data);
    }

    async updateNightly(force = false) {
        const n = this.cache.nightly;
        if (!force && this.isFresh(n.ts, this.nightlyTTL)) {
            this.renderer.updateUINightly(n.data);
            this.updateNextRefreshLabel();
            console.info('[Stats] Nightly from cache');
            return;
        }
        const data = await this.fetchJSON(`${this.baseUrl}/nightly/metrics`);
        this.cache.nightly = { ts: this.now(), data };
        this.saveCache();
        this.renderer.updateUINightly(data);
        this.updateNextRefreshLabel();
        console.info('[Stats] Nightly fetched', data);
    }

    updateNextRefreshLabel() {
        const nextMidnight = this.computeNextMidnight();
        this.renderer.updateNextRefreshLabel(nextMidnight);
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
        this.renderer.bindRefreshAction(async () => {
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
        this.renderer.applyResponsiveBehavior();
    }
}
