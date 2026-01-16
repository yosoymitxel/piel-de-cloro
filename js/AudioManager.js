export class AudioManager {
    constructor() {
        this.master = 1.0;
        this.channels = {
            ambient: this.createChannel({ loop: true, volume: 0.3 }),
            lore: this.createChannel({ loop: true, volume: 0.25 }),
            sfx: this.createChannel({ loop: false, volume: 0.6 })
        };
        this.sfxPool = []; // Pool for overlapping SFX
        this.maxPoolSize = 10;
        this.unlocked = false;
        this.fadeTimers = {};
        this.logs = [];
        this.enableConsole = false;
        this.desiredPlay = { ambient: false, lore: false, sfx: false };
        this.ctx = null;
        this.manifest = {};
        this.preloadedAssets = {}; // Cache for preloaded audio blobs or objects
        this.levels = { ambient: 0.3, lore: 0.25, sfx: 0.6 };
        this.mutedChannels = { ambient: false, lore: false, sfx: false };
        this.sfxLockUntil = 0;
        this.sfxPriority = 0;
        this.attachDiagnostics();
    }

    _clampVolume(v) {
        if (typeof v !== 'number' || !Number.isFinite(v)) return 0;
        return Math.max(0, Math.min(1, v));
    }

    _safeSetVolume(audio, v) {
        if (!audio) return;
        try {
            audio.volume = this._clampVolume(v);
        } catch (e) {
            // Silently fail to prevent crash
        }
    }

    createChannel({ loop = false, volume = 1.0 } = {}) {
        const audio = new Audio();
        audio.loop = loop;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        audio.volume = 0;
        return audio;
    }

    /**
     * Preloads all audio assets from the manifest.
     * Returns a promise that resolves when all are loaded or fail.
     */
    async preloadAll(onProgress) {
        const entries = Object.entries(this.manifest);
        const total = entries.length;
        let loaded = 0;

        if (total === 0) {
            if (onProgress) onProgress(1);
            return;
        }

        this.log('starting preload', { total });

        const promises = entries.map(async ([key, url]) => {
            try {
                // If already preloaded (or attempted), skip
                if (this.preloadedAssets[key]) {
                    loaded++;
                    if (onProgress) onProgress(loaded / total);
                    return;
                }

                const audio = new Audio();
                audio.src = url;
                audio.preload = 'auto';

                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
                    audio.oncanplaythrough = () => {
                        clearTimeout(timeout);
                        resolve();
                    };
                    audio.onerror = () => {
                        clearTimeout(timeout);
                        reject(new Error('load error'));
                    };
                    audio.load();
                });

                this.preloadedAssets[key] = url; // Mark as loaded
            } catch (e) {
                this.log(`failed to preload ${key}`, { error: e.message });
            } finally {
                loaded++;
                if (onProgress) onProgress(loaded / total);
            }
        });

        await Promise.all(promises);
        this.log('preload finished', { loaded, total });
    }
    attachDiagnostics() {
        Object.entries(this.channels).forEach(([name, audio]) => {
            const log = (evt, extra = {}) => this.log(`[${name}] ${evt}`, extra);
            audio.addEventListener('loadstart', () => log('loadstart'));
            audio.addEventListener('canplay', () => log('canplay'));
            audio.addEventListener('canplaythrough', () => log('canplaythrough'));
            audio.addEventListener('play', () => log('play'));
            audio.addEventListener('pause', () => log('pause'));
            audio.addEventListener('ended', () => log('ended'));
            audio.addEventListener('stalled', () => log('stalled'));
            audio.addEventListener('suspend', () => log('suspend'));
            audio.addEventListener('waiting', () => log('waiting'));
            audio.addEventListener('error', () => {
                const err = audio.error;
                log('error', { code: err?.code, message: err?.message });
            });
            const resumeIfDesired = () => {
                if (this.desiredPlay[name] && audio.paused) {
                    audio.play().then(() => this.log(`[${name}] auto-resume ok`)).catch(e => this.log(`[${name}] auto-resume failed`, { error: e?.message }));
                }
            };
            audio.addEventListener('pause', resumeIfDesired);
            audio.addEventListener('suspend', resumeIfDesired);
            audio.addEventListener('waiting', resumeIfDesired);
        });
    }
    async validateManifest() {
        const keys = Object.keys(this.manifest).length ? Object.keys(this.manifest) : [];
        const list = keys.length ? keys : [
            'ambient_main_loop', 'ambient_night_loop', 'ambient_tense_loop',
            'lore_intro_track', 'lore_interlude_radio', 'lore_interlude_seen', 'lore_interlude_heard',
            'lore_final_clean', 'lore_final_corrupted', 'lore_night_civil_death', 'lore_night_player_death', 'lore_night_tranquil',
            'ui_button_click', 'ui_modal_open', 'ui_modal_close', 'ui_dialogue_type', 'stats_panel_open',
            'tool_thermometer_beep', 'tool_uv_toggle', 'tool_pulse_beep', 'tool_pupils_lens',
            'alarm_activate', 'alarm_deactivate', 'intrusion_detected',
            'door_secure', 'door_unsecure', 'window_secure', 'window_unsecure', 'pipes_whisper',
            'purge_confirm', 'purge_blood_flash', 'night_transition', 'sleep_begin', 'escape_attempt',
            'dayafter_test_apply', 'validation_gate_open', 'preclose_overlay_open',
            'glitch_burst', 'vhs_flicker', 'morgue_reveal_infected'
        ];
        const results = [];
        for (const key of list) {
            const url = this.getUrl(key);
            try {
                const res = await fetch(url, { method: 'HEAD' });
                results.push(`${key}: ${res.ok ? 'OK' : 'NO ENCONTRADO'} (${url})`);
            } catch {
                results.push(`${key}: ERROR (${url})`);
            }
        }
        return results.join('\n');
    }
    log(msg, data = null) {
        const stamp = new Date().toISOString();
        const line = data ? `${stamp} ${msg} ${JSON.stringify(data)}` : `${stamp} ${msg}`;
        this.logs.push(line);
        if (this.enableConsole) console.info('[Audio]', line);
        if (this.logs.length > 200) this.logs.splice(0, this.logs.length - 200);
    }
    getLogs() { return [...this.logs]; }
    getLogString() {
        if (this.logs.length === 0) return 'Sin eventos de audio registrados.';
        return this.logs.slice(-30).join('\n');
    }
    clearLogs() { this.logs = []; }
    async loadManifest(url = 'assets/audio/audio_manifest.json') {
        try {
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.manifest = data || {};
            this.log('manifest loaded', { entries: Object.keys(this.manifest).length });
        } catch (e) {
            this.log('manifest load failed', { error: e?.message });
            this.manifest = {};
        }
    }
    getUrl(key) {
        return this.manifest[key] || `assets/audio/${key}.mp3`;
    }
    stopChannel(name, fadeOut = 300) {
        const ch = this.channels[name];
        if (!ch) return;
        const key = name;
        const done = () => { ch.pause(); this.log(`[${name}] paused`); };
        if (!ch.paused && (ch.volume ?? 0) > 0) {
            this.fade(ch, 0, fadeOut, key, done);
        } else {
            done();
        }
        this.desiredPlay[name] = false;
    }
    stopAmbient(ms = 300) { this.stopChannel('ambient', ms); }
    stopLore(ms = 300) { this.stopChannel('lore', ms); }
    ensureAmbientPlaying() {
        const ch = this.channels.ambient;
        if (!ch) return;
        if (ch.paused && ch.src) {
            ch.play().then(() => this.log('[ambient] resume ok')).catch(e => this.log('[ambient] resume failed', { error: e?.message }));
        }
    }
    setChannelLevel(name, v) {
        if (!this.levels[name]) this.levels[name] = 0.3;
        this.levels[name] = this._clampVolume(v);
        if (this.channels[name]) {
            const effectiveVolume = this.mutedChannels[name] ? 0 : this.levels[name] * this.master;
            this._safeSetVolume(this.channels[name], effectiveVolume);
        }
    }
    muteChannel(name, isMuted) {
        if (this.mutedChannels[name] === undefined) return;
        this.mutedChannels[name] = isMuted;
        this.setChannelLevel(name, this.levels[name]);
    }
    unlock() {
        if (this.unlocked) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => { });
            Object.values(this.channels).forEach(a => { a.muted = false; });
            this.unlocked = true;
        } catch {
            this.unlocked = true;
        }
    }
    setMasterVolume(v) {
        this.master = this._clampVolume(v);
        // Refresh all channels to respect master volume and mute states
        this.setChannelLevel('ambient', this.levels.ambient);
        this.setChannelLevel('lore', this.levels.lore);
        this.setChannelLevel('sfx', this.levels.sfx);
    }
    playAmbient(src, { loop = true, volume = 0.3, fadeIn = 0 } = {}) {
        if (this.desiredPlay.lore) this.stopLore(Math.max(200, fadeIn));
        this.desiredPlay.ambient = true;
        const ch = this.channels.ambient;
        ch.loop = loop;
        if (ch.src !== src) ch.src = src;

        const targetVol = this._clampVolume(volume);
        this.levels.ambient = targetVol;

        // Always calculate effective volume respecting master and mute
        const effectiveVolume = this.mutedChannels.ambient ? 0 : targetVol * this.master;

        if (fadeIn > 0) {
            this._safeSetVolume(ch, 0);
            ch.play().then(() => this.log('[ambient] play ok')).catch(e => this.log('[ambient] play failed', { error: e?.message }));
            this.fade(ch, effectiveVolume, fadeIn, 'ambient');
        } else {
            this._safeSetVolume(ch, effectiveVolume);
            ch.play().then(() => this.log('[ambient] play ok')).catch(e => this.log('[ambient] play failed', { error: e?.message }));
        }
    }
    playAmbientByKey(key, opts = {}) {
        return this.playAmbient(this.getUrl(key), opts);
    }
    duckAmbient(target = 0.15, ms = 400) {
        const effectiveTarget = this.mutedChannels.ambient ? 0 : Math.max(0, Math.min(1, target)) * this.master;
        this.fade(this.channels.ambient, effectiveTarget, ms, 'ambient');
    }
    unduckAmbient(ms = 400, restore = null) {
        if (restore === null) restore = this.levels.ambient;
        this.ensureAmbientPlaying();
        const effectiveRestore = this.mutedChannels.ambient ? 0 : Math.max(0, Math.min(1, restore)) * this.master;
        this.fade(this.channels.ambient, effectiveRestore, ms, 'ambient');
    }
    playLore(src, { loop = true, volume = 0.25, crossfade = 600, duckAmbient = true, duckTarget = 0.05 } = {}) {
        if (duckAmbient) {
            this.duckAmbient(duckTarget, crossfade);
        } else {
            this.stopAmbient(Math.max(200, crossfade));
        }

        this.desiredPlay.lore = true;
        const ch = this.channels.lore;
        ch.loop = loop;
        if (ch.src !== src) ch.src = src;

        const targetVol = this._clampVolume(volume);
        this.levels.lore = targetVol;

        // Always calculate effective volume respecting master and mute
        const effectiveVolume = this.mutedChannels.lore ? 0 : targetVol * this.master;

        this._safeSetVolume(ch, 0);
        ch.play().then(() => this.log('[lore] play ok')).catch(e => this.log('[lore] play failed', { error: e?.message }));
        this.fade(ch, effectiveVolume, crossfade, 'lore');
    }
    playLoreByKey(key, opts = {}) {
        return this.playLore(this.getUrl(key), opts);
    }
    stopLore({ fadeOut = 400, unduckAmbient = true } = {}) {
        const ch = this.channels.lore;
        // Cancelar cualquier fade anterior en este canal usando el objeto fadeTimers correcto
        if (this.fadeTimers['lore']) {
            this.fadeTimers['lore'].cancel = true;
            this.fadeTimers['lore'] = null;
        }
        
        this.fade(ch, 0, fadeOut, 'lore', () => {
            ch.pause();
            this.log('[lore] paused');
            if (unduckAmbient) {
                this.unduckAmbient(fadeOut, this.levels.ambient);
            }
        });
        this.desiredPlay.lore = false;
    }
    stopAllSFX(includeLooping = false) {
        this.sfxPool.forEach(ch => {
            if (includeLooping || !ch.loop) {
                ch.pause();
                ch.currentTime = 0;
            }
        });
        this.log('all sfx stopped', { includeLooping });
    }
    playSFX(src, { volume = 0.6, rate = 1.0, priority = 0, lockMs = 100, loop = false, overlap = false } = {}) {
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());

        // Priority system: if a sound is locked and the new one has lower priority, skip
        if (now < this.sfxLockUntil && priority < this.sfxPriority) {
            return null;
        }

        if (this.mutedChannels.sfx) return null;

        // CUTOFF LOGIC: Si este es un SFX estándar (no en bucle) Y no se permite solapamiento,
        // detenemos todos los demás SFX que se estén reproduciendo para evitar solapamientos.
        if (!loop && !overlap) {
            this.stopAllSFX(true); // Detener TODO, incluidos bucles cortos como el typewriter
        }

        this.sfxPriority = priority;
        this.sfxLockUntil = now + lockMs;

        // Try to find an available audio object in the pool
        let ch = this.sfxPool.find(a => a.paused);

        if (!ch && this.sfxPool.length < this.maxPoolSize) {
            ch = new Audio();
            ch.crossOrigin = 'anonymous';
            this.sfxPool.push(ch);
        }

        // If pool is full and all are playing, use the oldest non-looping one
        if (!ch) {
            ch = this.sfxPool.find(a => !a.loop) || this.sfxPool[0];
            ch.pause();
            ch.currentTime = 0;
        }

        ch.src = src;
        ch.loop = loop;
        ch.playbackRate = rate;
        this._safeSetVolume(ch, this._clampVolume(volume) * this.master);
        ch.currentTime = 0;

        // Play with error handling
        const playPromise = ch.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                // Ignore AbortError which happens when sound is cut off immediately
                if (e.name !== 'AbortError') {
                    this.log('[sfx] play failed', { error: e.message, src });
                }
            });
        }

        return ch;
    }
    playSFXByKey(key, opts = {}) {
        return this.playSFX(this.getUrl(key), opts);
    }
    playEvent(name, opts = {}) {
        const map = {
            purge: 'purge_confirm',
            glitch: 'glitch_burst',
            vhs: 'vhs_flicker',
            intrusion: 'intrusion_detected',
            alarm_on: 'alarm_activate',
            alarm_off: 'alarm_deactivate'
        };
        const key = map[name] || name;
        return this.playSFXByKey(key, opts);
    }

    /**
     * Detiene todos los efectos de sonido en el pool.
     * @param {boolean} includeLooping - Si es true, también detiene los sonidos en bucle (como typewriter).
     */
    stopAllSFX(includeLooping = false) {
        this.sfxPool.forEach(ch => {
            if (includeLooping || !ch.loop) {
                ch.pause();
                ch.currentTime = 0;
            }
        });
    }

    fade(audio, target, ms, key, onDone) {
        if (!audio) return;
        target = this._clampVolume(target);

        // Validación robusta de ms para evitar división por NaN/0
        if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) {
            ms = 300;
        }

        const start = audio.volume || 0;
        const delta = target - start;
        const token = { cancel: false, id: null };
        if (this.fadeTimers[key] && this.fadeTimers[key].id != null) {
            this.fadeTimers[key].cancel = true;
        }
        this.fadeTimers[key] = token;
        const startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const step = (now) => {
            if (token.cancel) return;
            const t = Math.max(0, Math.min(1, (now - startTime) / Math.max(1, ms)));
            this._safeSetVolume(audio, start + delta * t);
            if (t >= 1) {
                this._safeSetVolume(audio, target);
                this.fadeTimers[key] = null;
                if (onDone) onDone();
                return;
            }
            token.id = requestAnimationFrame(step);
        };
        token.id = requestAnimationFrame(step);
    }
}
