// ============================================================
// CHRISTOPHER'S LIFE — Notifications v3
// ============================================================
window.CL = window.CL || {};

CL.Notifications = {
  permission: 'default',
  timers: [],
  windowInterval: null,

  async init() {
    if ('Notification' in window && Notification.permission === 'default') {
      this.permission = await Notification.requestPermission();
    } else if ('Notification' in window) {
      this.permission = Notification.permission;
    }
    this.schedule();
    this.startWindowMonitor();
  },

  async requestPermission() {
    if (!('Notification' in window)) return false;
    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  },

  schedule() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    const sched = CL.Storage.getSchedule();
    const dayIndex = new Date().getDay();
    const sections = CL.Storage.getDaySections(dayIndex);
    const hasExercise = sections.includes('cardio') || sections.includes('fitness');

    const notifs = [
      { key:'wake', title:'⏰ Buenos días', body:'No phone yet. Start breathing.' },
      { key:'breakfast', title:'🥚 Breakfast', body:'Eat now — reactive hypoglycemia rule.' },
      { key:'morningSnack', title:'🥜 Morning snack', body:'Don\'t skip — 4-hour rule.' },
      { key:'lunch', title:'🍗 Lunch', body:'Biggest meal of the day.' },
      { key:'afternoonSnack', title:'🍵 Afternoon snack', body:'Fuel for the evening.' },
      { key:'dinner', title:'🥦 Dinner', body:'Lean protein + veg.' },
      { key:'bedtime', title:'😴 Target bedtime', body:'Wind down — protect your sleep.' },
    ];

    if (hasExercise) {
      notifs.push({ key:'exercise', title:'💪 Exercise time', body:'Session starts — nicotine window active.' });
    }

    notifs.forEach(n => {
      const time = sched[n.key]?.time || sched[n.key];
      if (!time) return;
      const ms = this.msUntil(time);
      if (ms > 0 && ms < 86400000) {
        this.timers.push(setTimeout(() => this.send(n.title, n.body, n.key), ms));
      }
    });

    // Nicotine windows from schedule
    const pre = sched.nicotinePreMeal || 15;
    const post = sched.nicotinePostMeal || 30;
    const meals = [sched.breakfast?.time, sched.morningSnack?.time, sched.lunch?.time, sched.afternoonSnack?.time, sched.dinner?.time].filter(Boolean);
    meals.forEach(mt => {
      const preTime = this.subtractMins(mt, pre);
      const postTime = this.addMins(mt, post);
      const preMs = this.msUntil(preTime);
      const postMs = this.msUntil(postTime);
      if (preMs > 0 && preMs < 86400000) this.timers.push(setTimeout(() => this.send('🚭 Nicotine window', `Zero-nic vape only — ${pre} min before meal`, 'nic-pre'), preMs));
      if (postMs > 0 && postMs < 86400000) this.timers.push(setTimeout(() => this.send('✓ Nicotine window closed', 'Window complete', 'nic-post'), postMs));
    });

    if (hasExercise && sched.exercise?.time) {
      const exPre = this.subtractMins(sched.exercise.time, sched.nicotinePreExercise || 30);
      const exPost = this.addMins(sched.exercise.time, 30 + (sched.nicotinePostExercise || 15));
      const preMs = this.msUntil(exPre), postMs = this.msUntil(exPost);
      if (preMs > 0 && preMs < 86400000) this.timers.push(setTimeout(() => this.send('🚭 Pre-exercise window', 'Zero-nic vape — 30 min before session', 'nic-ex-pre'), preMs));
      if (postMs > 0 && postMs < 86400000) this.timers.push(setTimeout(() => this.send('✓ Exercise window closed', 'Post-exercise window complete', 'nic-ex-post'), postMs));
    }

    // Evening cutoffs
    const evMs = this.msUntil('19:00');
    if (evMs > 0 && evMs < 86400000) {
      this.timers.push(setTimeout(() => this.send('🚭 Evening window', 'Zero-nic vape only from now until sleep', 'nic-evening'), evMs));
      this.timers.push(setTimeout(() => this.send('🍺 No beer', 'Alcohol cutoff — protect sleep quality', 'no-beer'), evMs));
    }
  },

  send(title, body, tag) {
    if (this.permission !== 'granted') return;
    try {
      new Notification(title, {
        body, tag: tag || 'cl',
        icon: './assets/icons/icon-192.png',
        badge: './assets/icons/icon-192.png'
      });
    } catch(e) {}
  },

  startWindowMonitor() {
    if (this.windowInterval) clearInterval(this.windowInterval);
    this.checkWindows();
    this.windowInterval = setInterval(() => this.checkWindows(), 60000);
  },

  checkWindows() {
    const now = this.currentTime();
    const sched = CL.Storage.getSchedule();
    const windows = [];

    // Morning window
    const wakeTime = sched.wake?.time || '05:45';
    const morningEnd = this.addMins(wakeTime, sched.morningNicotineWindow || 60);
    if (this.inRange(now, wakeTime, morningEnd)) {
      windows.push({ id:'morning', label:'Morning window', endTime: morningEnd });
    }

    // Evening window
    if (this.inRange(now, '19:00', sched.bedtime?.time || '22:45')) {
      windows.push({ id:'evening', label:'Evening window', endTime: sched.bedtime?.time || '22:45' });
    }

    // Meal windows
    const pre = sched.nicotinePreMeal || 15, post = sched.nicotinePostMeal || 30;
    [sched.breakfast?.time, sched.morningSnack?.time, sched.lunch?.time, sched.afternoonSnack?.time, sched.dinner?.time].filter(Boolean).forEach((mt, i) => {
      const s = this.subtractMins(mt, pre), e = this.addMins(mt, post);
      if (this.inRange(now, s, e)) {
        const names = ['breakfast','morning snack','lunch','afternoon snack','dinner'];
        windows.push({ id:'meal_'+i, label:'Around ' + names[i], endTime: e });
      }
    });

    // Exercise window
    const dayIndex = new Date().getDay();
    const sections = CL.Storage.getDaySections(dayIndex);
    if ((sections.includes('cardio') || sections.includes('fitness')) && sched.exercise?.time) {
      const s = this.subtractMins(sched.exercise.time, sched.nicotinePreExercise||30);
      const e = this.addMins(sched.exercise.time, 30 + (sched.nicotinePostExercise||15));
      if (this.inRange(now, s, e)) windows.push({ id:'exercise', label:'Exercise window', endTime: e });
    }

    this.updateBanner(windows);
  },

  updateBanner(windows) {
    const banner = document.getElementById('nic-banner');
    if (!banner) return;
    if (windows.length === 0) { banner.style.display = 'none'; return; }
    banner.style.display = 'block';
    const w = windows[0];
    const mins = this.minsUntil(w.endTime);
    banner.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">🚭</span>
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--teal)">${w.label}</div>
            <div style="font-size:10px;color:var(--text-3)">Zero nicotine vape only</div>
          </div>
        </div>
        <div style="text-align:right;min-width:52px">
          <div style="font-size:13px;font-weight:700;color:var(--teal);font-family:var(--font-mono)">${mins > 0 ? mins + 'm' : 'ending'}</div>
          ${windows.length > 1 ? `<div style="font-size:9px;color:var(--text-3)">+${windows.length-1} more</div>` : ''}
        </div>
      </div>`;
  },

  // Time utilities
  currentTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  },
  addMins(t, m) {
    if (!t) return '00:00';
    const [h,mn] = t.split(':').map(Number);
    const tot = h*60 + mn + m;
    return `${String(Math.floor(tot/60)%24).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`;
  },
  subtractMins(t, m) {
    if (!t) return '00:00';
    const [h,mn] = t.split(':').map(Number);
    let tot = h*60 + mn - m;
    if (tot < 0) tot += 1440;
    return `${String(Math.floor(tot/60)).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`;
  },
  msUntil(t) {
    if (!t) return -1;
    const [h,m] = t.split(':').map(Number);
    const now = new Date(), target = new Date(now);
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate()+1);
    return target - now;
  },
  minsUntil(t) { return Math.max(0, Math.round(this.msUntil(t)/60000)); },
  inRange(cur, start, end) {
    if (!cur||!start||!end) return false;
    if (end < start) return cur >= start || cur <= end;
    return cur >= start && cur <= end;
  }
};

console.log('✅ CL Notifications v3 loaded');
