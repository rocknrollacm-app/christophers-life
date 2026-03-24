// ============================================================
// CHRISTOPHER'S LIFE — Audio Module v3
// ============================================================
window.CL = window.CL || {};

CL.Audio = {
  ctx: null, noiseNode: null, gainNode: null, playing: false,

  init() {
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  },

  _makeNoise() {
    if (!this.ctx) return null;
    const buf = this.ctx.createScriptProcessor(4096, 1, 1);
    let last = 0;
    buf.onaudioprocess = e => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < 4096; i++) {
        const w = Math.random() * 2 - 1;
        out[i] = (last + 0.02 * w) / 1.02;
        last = out[i];
        out[i] *= 3.5;
      }
    };
    return buf;
  },

  start(vol) {
    if (this.playing) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = vol !== undefined ? vol : CL.Storage.getSetting('bnVol', 0.5);
    this.noiseNode = this._makeNoise();
    if (!this.noiseNode) return;
    this.noiseNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    this.playing = true;
    this._updateUI(true);
    CL.Storage.saveSetting('bnActive', true);
  },

  stop(fadeMs) {
    if (!this.playing) return;
    fadeMs = fadeMs !== undefined ? fadeMs : 0;
    if (fadeMs > 0 && this.gainNode) {
      const vol = this.gainNode.gain.value;
      const steps = 40;
      const step = fadeMs / steps;
      let s = 0;
      const iv = setInterval(() => {
        s++;
        if (this.gainNode) this.gainNode.gain.value = Math.max(0, vol * (1 - s/steps));
        if (s >= steps) { clearInterval(iv); this._disconnect(); }
      }, step);
    } else {
      this._disconnect();
    }
  },

  _disconnect() {
    try { if (this.noiseNode) { this.noiseNode.disconnect(); this.noiseNode = null; } } catch(e) {}
    try { if (this.gainNode) { this.gainNode.disconnect(); this.gainNode = null; } } catch(e) {}
    this.playing = false;
    this._updateUI(false);
    CL.Storage.saveSetting('bnActive', false);
  },

  setVolume(v) {
    if (this.gainNode) this.gainNode.gain.value = v;
    CL.Storage.saveSetting('bnVol', v);
  },

  _updateUI(on) {
    const btn = document.getElementById('bn-btn');
    const ind = document.getElementById('bn-indicator');
    if (btn) btn.textContent = on ? '⏹ Stop Brown Noise' : '▶ Start Brown Noise';
    if (ind) { ind.textContent = on ? '🔊 Active' : ''; ind.className = on ? 'text-teal text-xs' : ''; }
  }
};

// ============================================================
// CHRISTOPHER'S LIFE — Health Connect Module v3
// ============================================================
CL.HealthConnect = {
  available: false, connected: false,

  async init() {
    if (window.healthConnect) {
      this.available = true;
      try {
        const perms = await window.healthConnect.getGrantedPermissions();
        this.connected = perms && perms.length > 0;
      } catch {}
    }
  },

  async requestPermissions() {
    if (!window.healthConnect) { this.showSetupGuide(); return false; }
    try {
      const granted = await window.healthConnect.requestPermissions([
        { accessType:'read', recordType:'Steps' },
        { accessType:'read', recordType:'SleepSession' },
        { accessType:'read', recordType:'HeartRate' },
        { accessType:'read', recordType:'HeartRateVariabilitySdnn' },
      ]);
      this.connected = granted && granted.length > 0;
      return this.connected;
    } catch { return false; }
  },

  async syncToday() {
    if (!this.connected || !window.healthConnect) return {};
    const data = {};
    try {
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
      const tf = { type:'between', startTime: today.toISOString(), endTime: tomorrow.toISOString() };

      const steps = await window.healthConnect.readRecords('Steps', { timeRangeFilter: tf });
      data.steps = steps.reduce((s,r) => s+(r.count||0), 0);

      const yest = new Date(); yest.setDate(yest.getDate()-1); yest.setHours(18,0,0,0);
      const sleep = await window.healthConnect.readRecords('SleepSession', { timeRangeFilter: { type:'between', startTime:yest.toISOString(), endTime:new Date().toISOString() }});
      if (sleep && sleep.length > 0) {
        const latest = sleep[sleep.length-1];
        const hrs = (new Date(latest.endTime) - new Date(latest.startTime)) / 3600000;
        data.sleep = { hours: Math.round(hrs*10)/10 };
        if (latest.stages) {
          const stages = {};
          latest.stages.forEach(s => { stages[s.stage] = (stages[s.stage]||0) + (new Date(s.endTime)-new Date(s.startTime)); });
          data.sleep.stages = { deep: Math.round((stages[4]||0)/60000), rem: Math.round((stages[5]||0)/60000), light: Math.round((stages[2]||0)/60000), awake: Math.round((stages[1]||0)/60000) };
        }
      }

      const hrv = await window.healthConnect.readRecords('HeartRateVariabilitySdnn', { timeRangeFilter: tf });
      if (hrv && hrv.length > 0) data.hrv = Math.round(hrv.reduce((s,r) => s+r.heartRateVariabilityMillis, 0) / hrv.length);

      CL.Storage.saveHealthData(data);
    } catch(e) { console.warn('Health sync error:', e); }
    return data;
  },

  showSetupGuide() {
    CL.UI.showModal('Connect Galaxy Watch', `
      <div style="line-height:1.8">
        <div style="background:var(--surface-2);border-radius:10px;padding:14px;margin-bottom:10px">
          <div style="font-weight:700;color:var(--teal);margin-bottom:6px">Step 1 — Install Health Connect</div>
          <div class="text-sm text-dim">Settings → Apps → Health Connect (or download from Play Store)</div>
        </div>
        <div style="background:var(--surface-2);border-radius:10px;padding:14px;margin-bottom:10px">
          <div style="font-weight:700;color:var(--teal);margin-bottom:6px">Step 2 — Connect Samsung Health</div>
          <div class="text-sm text-dim">Samsung Health → Settings → Connected Services → Health Connect → Enable</div>
        </div>
        <div style="background:var(--surface-2);border-radius:10px;padding:14px;margin-bottom:16px">
          <div style="font-weight:700;color:var(--teal);margin-bottom:6px">Step 3 — Grant Permissions</div>
          <div class="text-sm text-dim">Tap below to allow steps, sleep, HRV, and heart rate sync.</div>
        </div>
        <button onclick="CL.HealthConnect.requestPermissions().then(ok => ok && CL.UI.closeModal())"
          class="btn btn-primary btn-full">Connect Health Data</button>
      </div>
    `);
  },

  statusHTML() {
    if (this.connected) return '<span class="text-teal text-sm">✓ Galaxy Watch connected</span>';
    return `<button onclick="CL.HealthConnect.showSetupGuide()" class="btn btn-secondary btn-sm">Connect Galaxy Watch</button>`;
  }
};

console.log('✅ CL Audio + HealthConnect v3 loaded');
