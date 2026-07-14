/* ==========================================
   SOUND MANAGER
========================================== */

const Sound = {

    enabled: true,

    init() {
        this.sounds = {
            tick:    { type: "tick" },
            fly:     { type: "fly" },
            crash:   { type: "crash" },
            bet:     { type: "tone", freq: 500, dur: 0.1, wave: "sine" },
            win:     { type: "tone", freq: 1200, dur: 0.15, wave: "sine" },
            lose:    { type: "tone", freq: 200, dur: 0.25, wave: "sawtooth" },
            botcash: { type: "tone", freq: 900, dur: 0.06, wave: "sine" }
        };
    },

    getCtx() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._ctx.state === "suspended") {
            this._ctx.resume();
        }
        return this._ctx;
    },

    play(name) {
        if (!this.enabled) return;
        const s = this.sounds[name];
        if (!s) return;

        try {
            const ctx = this.getCtx();
            const now = ctx.currentTime;

            if (s.type === "fly") {
                this.playJetTakeoff(ctx, now);
            } else if (s.type === "crash") {
                this.playCrash(ctx, now);
            } else if (s.type === "tick") {
                this.playTick(ctx, now);
            } else if (s.type === "tone") {
                this.playTone(ctx, now, s.freq, s.dur, s.wave);
            }
        } catch (e) {}
    },

    /* ====== JET TAKEOFF SOUND ====== */
    playJetTakeoff(ctx, now) {

        /* layer 1: low rumble oscillator rising */
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(60, now);
        osc1.frequency.linearRampToValueAtTime(220, now + 0.8);
        osc1.frequency.linearRampToValueAtTime(400, now + 1.6);
        osc1.frequency.exponentialRampToValueAtTime(180, now + 2.5);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gain1.gain.linearRampToValueAtTime(0.18, now + 1.0);
        gain1.gain.linearRampToValueAtTime(0.08, now + 2.0);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 2.8);

        /* layer 2: high whine rising */
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(300, now);
        osc2.frequency.linearRampToValueAtTime(1800, now + 1.2);
        osc2.frequency.linearRampToValueAtTime(2400, now + 1.8);
        osc2.frequency.exponentialRampToValueAtTime(600, now + 2.8);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.04, now + 0.4);
        gain2.gain.linearRampToValueAtTime(0.07, now + 1.2);
        gain2.gain.linearRampToValueAtTime(0.03, now + 2.0);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 2.8);

        /* layer 3: wind noise */
        const bufLen = ctx.sampleRate * 2.5;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(400, now);
        noiseFilter.frequency.linearRampToValueAtTime(2000, now + 1.0);
        noiseFilter.frequency.linearRampToValueAtTime(800, now + 2.5);
        noiseFilter.Q.value = 0.8;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.3);
        noiseGain.gain.linearRampToValueAtTime(0.12, now + 1.0);
        noiseGain.gain.linearRampToValueAtTime(0.04, now + 2.0);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 2.5);

        /* layer 4: sub bass thump */
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = "sine";
        osc3.frequency.setValueAtTime(40, now);
        osc3.frequency.linearRampToValueAtTime(80, now + 0.5);
        osc3.frequency.exponentialRampToValueAtTime(30, now + 2.0);
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(0.15, now + 0.2);
        gain3.gain.linearRampToValueAtTime(0.06, now + 1.5);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now);
        osc3.stop(now + 2.5);
    },

    /* ====== CRASH SOUND ====== */
    playCrash(ctx, now) {
        const bufLen = ctx.sampleRate * 0.6;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.5);
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.6);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start(now);
        src.stop(now + 0.6);
    },

    /* ====== TICK SOUND ====== */
    playTick(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
    },

    /* ====== TONE SOUND ====== */
    playTone(ctx, now, freq, dur, wave) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + dur);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + dur);
    },

    engine: null,

    startEngine(ctx) {
        if (this.engine) this.stopEngine();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        filter.Q.value = 2;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        this.engine = { osc, gain, filter };
    },

    updateEngine(mult) {
        if (!this.engine || !this.enabled) return;
        const ctx = this.getCtx();
        const t = ctx.currentTime;
        const freq = 80 + Math.min(mult * 15, 500);
        const filterFreq = 400 + Math.min(mult * 100, 3000);
        const vol = Math.min(0.02 + mult * 0.008, 0.08);

        this.engine.osc.frequency.linearRampToValueAtTime(freq, t + 0.1);
        this.engine.filter.frequency.linearRampToValueAtTime(filterFreq, t + 0.1);
        this.engine.gain.gain.linearRampToValueAtTime(vol, t + 0.1);
    },

    stopEngine() {
        if (!this.engine) return;
        try {
            const ctx = this.getCtx();
            this.engine.gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            const ref = this.engine;
            setTimeout(() => { try { ref.osc.stop(); } catch(e) {} }, 400);
        } catch(e) {}
        this.engine = null;
    },

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) this.stopEngine();
        return this.enabled;
    }
};
