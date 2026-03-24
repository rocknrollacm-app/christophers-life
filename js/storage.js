// ============================================================
// CHRISTOPHER'S LIFE — Storage v3
// ============================================================
window.CL = window.CL || {};

CL.Storage = {

  getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  getWeekKey() {
    const d = new Date();
    const s = new Date(d); s.setDate(d.getDate() - d.getDay());
    return `${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}-${String(s.getDate()).padStart(2,'0')}`;
  },

  _get(key, def) {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : def; }
    catch { return def; }
  },

  _set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch { return false; }
  },

  // ---- SETTINGS ----
  getSetting(key, def) { const s = this._get('cl_settings', {}); return s[key] !== undefined ? s[key] : def; },
  saveSetting(key, val) { const s = this._get('cl_settings', {}); s[key] = val; this._set('cl_settings', s); },

  // ---- SCHEDULE ----
  getSchedule() {
    const saved = this._get('cl_schedule', {});
    return Object.assign({}, CL.DEFAULT_SCHEDULE, saved);
  },
  saveSchedule(data) {
    const current = this._get('cl_schedule', {});
    this._set('cl_schedule', Object.assign(current, data));
  },
  // Per-day schedule overrides
  getDaySchedule(dayIndex) {
    const overrides = this._get('cl_day_schedules', {});
    return overrides[dayIndex] || null;
  },
  saveDaySchedule(dayIndex, data) {
    const overrides = this._get('cl_day_schedules', {});
    overrides[dayIndex] = Object.assign(overrides[dayIndex] || {}, data);
    this._set('cl_day_schedules', overrides);
  },

  // ---- DAY SECTIONS ----
  getDaySections(dayIndex) {
    const overrides = this._get('cl_day_sections', {});
    return overrides[dayIndex] || CL.DEFAULT_DAY_SECTIONS[dayIndex] || [];
  },
  saveDaySections(dayIndex, sections) {
    const overrides = this._get('cl_day_sections', {});
    overrides[dayIndex] = sections;
    this._set('cl_day_sections', overrides);
  },

  // ---- CHECKLIST ----
  getChecked(dayIndex) {
    return this._get(`cl_checked_${this.getWeekKey()}_${dayIndex}`, {});
  },
  setChecked(dayIndex, taskId, val) {
    const data = this.getChecked(dayIndex);
    if (val) data[taskId] = true; else delete data[taskId];
    this._set(`cl_checked_${this.getWeekKey()}_${dayIndex}`, data);
  },
  resetDay(dayIndex) {
    localStorage.removeItem(`cl_checked_${this.getWeekKey()}_${dayIndex}`);
  },

  // ---- CUSTOM TASKS ----
  getCustomTasks() { return this._get('cl_custom_tasks', []); },
  saveCustomTask(task) {
    const tasks = this.getCustomTasks();
    if (task.id) {
      const i = tasks.findIndex(t => t.id === task.id);
      if (i > -1) tasks[i] = task; else tasks.push(task);
    } else {
      task.id = 'custom_' + Date.now();
      tasks.push(task);
    }
    this._set('cl_custom_tasks', tasks);
    return task;
  },
  deleteCustomTask(id) { this._set('cl_custom_tasks', this.getCustomTasks().filter(t => t.id !== id)); },
  getCustomSection() { return this._get('cl_custom_section', { id:'custom', label:'Custom', icon:'📌', tasks:[] }); },

  // ---- DAILY LOG ----
  getDailyLog(dateKey) { return this._get(`cl_log_${dateKey || this.getTodayKey()}`, {}); },
  saveDailyLog(data, dateKey) {
    dateKey = dateKey || this.getTodayKey();
    this._set(`cl_log_${dateKey}`, Object.assign(this.getDailyLog(dateKey), data));
  },

  // ---- MOOD TIMELINE ----
  getMoodTimeline(dateKey) { return this._get(`cl_mood_${dateKey || this.getTodayKey()}`, []); },
  addMoodEntry(entry) {
    const tl = this.getMoodTimeline();
    entry.id = Date.now();
    entry.time = new Date().toISOString();
    tl.push(entry);
    this._set(`cl_mood_${this.getTodayKey()}`, tl);
    return tl;
  },
  deleteMoodEntry(id) {
    const tl = this.getMoodTimeline().filter(e => e.id !== id);
    this._set(`cl_mood_${this.getTodayKey()}`, tl);
  },

  // ---- MACROS ----
  getMacroTargets() { return this._get('cl_macro_targets', CL.DEFAULT_MACRO_TARGETS); },
  saveMacroTargets(t) { this._set('cl_macro_targets', t); },
  getMacroLog(dateKey) { return this._get(`cl_macros_${dateKey || this.getTodayKey()}`, { meals:{} }); },
  saveMacroEntry(meal, data, dateKey) {
    dateKey = dateKey || this.getTodayKey();
    const log = this.getMacroLog(dateKey);
    if (data === null) delete log.meals[meal]; else log.meals[meal] = data;
    this._set(`cl_macros_${dateKey}`, log);
  },
  getMacroTotals(dateKey) {
    const log = this.getMacroLog(dateKey);
    const t = { calories:0, protein:0, carbs:0, fat:0, fiber:0 };
    ['breakfast','morningSnack','lunch','afternoonSnack'].forEach(m => {
      if (log.meals[m]) {
        t.calories += Number(log.meals[m].calories)||0;
        t.protein  += Number(log.meals[m].protein)||0;
        t.carbs    += Number(log.meals[m].carbs)||0;
        t.fat      += Number(log.meals[m].fat)||0;
        t.fiber    += Number(log.meals[m].fiber)||0;
      }
    });
    return t;
  },

  // ---- WATER ----
  getWaterLog(dateKey) { return this._get(`cl_water_${dateKey || this.getTodayKey()}`, { bottles:0 }); },
  saveWaterLog(data, dateKey) { this._set(`cl_water_${dateKey || this.getTodayKey()}`, data); },

  // ---- SUBSTANCE ----
  getSubstanceLog(dateKey) { return this._get(`cl_sub_${dateKey || this.getTodayKey()}`, { drinks:0, vapeHits:0, vaping:[] }); },
  saveSubstanceLog(data, dateKey) { this._set(`cl_sub_${dateKey || this.getTodayKey()}`, data); },

  // ---- INHALER ----
  getInhalerLog(dateKey) { return this._get(`cl_inhaler_${dateKey || this.getTodayKey()}`, []); },
  logInhalerUse(note) {
    const log = this.getInhalerLog();
    log.push({ time: new Date().toISOString(), note: note || '' });
    this._set(`cl_inhaler_${this.getTodayKey()}`, log);
    return log;
  },

  // ---- BODY SCANS ----
  getScans() { return this._get('cl_scans', []); },
  saveScan(scan) {
    const scans = this.getScans();
    scan.id = Date.now();
    scan.date = this.getTodayKey();
    scans.unshift(scan);
    this._set('cl_scans', scans);
    return scan;
  },
  deleteScan(id) { this._set('cl_scans', this.getScans().filter(s => s.id !== id)); },

  // ---- TAPER ----
  getTaperData() { return this._get('cl_taper', {}); },
  saveTaperData(data) { this._set('cl_taper', data); },

  // ---- WORKOUTS ----
  getWorkouts() { return this._get('cl_workouts', []); },
  saveWorkout(w) {
    const list = this.getWorkouts();
    if (w.id) {
      const i = list.findIndex(x => x.id === w.id);
      if (i > -1) list[i] = w; else { w.created = Date.now(); list.unshift(w); }
    } else { w.id = 'wo_' + Date.now(); w.created = Date.now(); list.unshift(w); }
    this._set('cl_workouts', list);
    return w;
  },
  deleteWorkout(id) { this._set('cl_workouts', this.getWorkouts().filter(w => w.id !== id)); },
  getWorkoutLogs() { return this._get('cl_wo_logs', []); },
  logWorkoutComplete(workoutId, log) {
    const logs = this.getWorkoutLogs();
    log.id = Date.now(); log.workoutId = workoutId;
    log.date = this.getTodayKey(); log.completedAt = new Date().toISOString();
    logs.unshift(log);
    if (logs.length > 200) logs.pop();
    this._set('cl_wo_logs', logs);
    return log;
  },

  // ---- STREAKS ----
  getStreaks() { return this._get('cl_streaks', {}); },
  saveStreaks(data) { this._set('cl_streaks', data); },
  updateStreaks(dayIndex) {
    const todayKey = this.getTodayKey();
    const streaks = this.getStreaks();
    const sections = this.getAllSectionsForDay(dayIndex);
    const requiredTasks = [];
    sections.forEach(sec => {
      if (sec.id === 'bonus') return;
      (sec.tasks||[]).forEach(t => requiredTasks.push(t));
    });
    const bonusSec = CL.SECTIONS.bonus;
    const checked = this.getChecked(dayIndex);
    const bonusDone = (bonusSec.tasks||[]).filter(t => checked[t.id]).length;
    const requiredDone = requiredTasks.every(t => checked[t.id]);
    const allDone = requiredDone && bonusDone >= 3;

    if (allDone) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
      const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
      if (streaks.lastDate !== todayKey) {
        streaks.current = streaks.lastDate === yKey ? (streaks.current||0) + 1 : 1;
        streaks.best = Math.max(streaks.best||0, streaks.current);
        streaks.lastDate = todayKey;
        this.saveStreaks(streaks);
      }
    }
  },

  // Helper used by streaks
  getAllSectionsForDay(dayIndex) {
    const always = ['morning','afternoon','evening','night','bonus'];
    const daySections = this.getDaySections(dayIndex);
    const sections = [];
    always.forEach(id => { if (CL.SECTIONS[id]) sections.push(CL.SECTIONS[id]); });
    daySections.forEach(id => { if (CL.SECTIONS[id]) sections.push(CL.SECTIONS[id]); });
    const custom = this.getCustomTasks();
    if (custom.length > 0) sections.push({ id:'custom', label:'Custom', tasks: custom });
    return sections;
  },

  // ---- AI CACHE ----
  getCachedInsight(key) {
    const c = this._get(`cl_ai_${key}`, null);
    if (!c) return null;
    if (Date.now() - c.ts > 7 * 86400000) { localStorage.removeItem(`cl_ai_${key}`); return null; }
    return c.content;
  },
  cacheInsight(key, content) { this._set(`cl_ai_${key}`, { content, ts: Date.now() }); },

  // ---- LEARNING ----
  getLearningContent(dateKey) { return this._get(`cl_learn_${dateKey || this.getTodayKey()}`, null); },
  saveLearningContent(data, dateKey) { this._set(`cl_learn_${dateKey || this.getTodayKey()}`, data); },
  getQuizResults(dateKey) { return this._get(`cl_quiz_${dateKey || this.getTodayKey()}`, { score:0, total:0, answers:[] }); },
  saveQuizResults(data, dateKey) { this._set(`cl_quiz_${dateKey || this.getTodayKey()}`, data); },

  // ---- READINGS ----
  getReadingHistory() { return this._get('cl_readings', {}); },
  markReadingShown(id) {
    const h = this.getReadingHistory();
    h[id] = (h[id]||0) + 1;
    this._set('cl_readings', h);
  },
  getNextReading(mood) {
    const history = this.getReadingHistory();
    let pool = [...CL.READINGS];
    if (mood && mood <= 4) pool = pool.filter(r => ['acceptance','resilience','gratitude','change'].includes(r.theme)) || pool;
    else if (mood && mood >= 8) pool = pool.filter(r => ['action','intention','possibility','obstacles'].includes(r.theme)) || pool;
    const unshown = pool.filter(r => !history[r.id]);
    const reading = unshown.length > 0
      ? unshown[Math.floor(Math.random() * unshown.length)]
      : [...pool].sort((a,b) => (history[a.id]||0) - (history[b.id]||0))[0];
    this.markReadingShown(reading.id);
    return reading;
  },

  // ---- DAILY AFFIRMATION / VOCAB ----
  getDayOfYear() { return Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000); },
  getTodayAffirmation() { return CL.AFFIRMATIONS[this.getDayOfYear() % CL.AFFIRMATIONS.length]; },

  // ---- SPOTIFY ----
  getSpotifyTokens() { return this._get('cl_spotify', {}); },
  saveSpotifyTokens(data) { this._set('cl_spotify', data); },

  // ---- HEALTH DATA (Galaxy Watch) ----
  getHealthData(dateKey) { return this._get(`cl_health_${dateKey || this.getTodayKey()}`, {}); },
  saveHealthData(data, dateKey) {
    this._set(`cl_health_${dateKey || this.getTodayKey()}`, Object.assign(this.getHealthData(dateKey), data));
  },

  // ---- EXPORT ----
  exportWeekData() {
    const days = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - d.getDay() + i);
      const dk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      days[i] = { log: this.getDailyLog(dk), mood: this.getMoodTimeline(dk), substance: this.getSubstanceLog(dk), inhaler: this.getInhalerLog(dk), macros: this.getMacroLog(dk), health: this.getHealthData(dk) };
    }
    return { week: this.getWeekKey(), exported: new Date().toISOString(), days };
  },

  clearAll() { Object.keys(localStorage).filter(k => k.startsWith('cl_')).forEach(k => localStorage.removeItem(k)); }
};

console.log('✅ CL Storage v3 loaded');
