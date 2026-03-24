// ============================================================
// CHRISTOPHER'S LIFE — AI Module v3
// ============================================================
window.CL = window.CL || {};

CL.AI = {

  SYSTEM_PROMPT: `You are a personal health assistant for Christopher Martinez, 34, Clinton UT.

HEALTH: Bipolar disorder (well controlled), Asthma (improving — just started Advair preventative), High cholesterol (unmanaged), Reactive hypoglycemia, Sleep apnea (pending sleep study).

MEDICATIONS: Advair (morning + bedtime), Lithium, Lamictal, Seroquel, Topiramate (2x daily), Trazodone, Magnesium Glycinate. Tapering: Benadryl, Zyrtec, Omeprazole.

BODY: 229lb, BMI 37, Body Fat 37.3%, Visceral Fat 19, Muscle Mass 136.4lb (excellent), BMR 1,777 kcal. Metabolic syndrome driven significantly by Seroquel.

LIFESTYLE: Reducing alcohol (targeting no beer after 7pm, alcohol-free most days), reducing nicotine (structured windows), rowing Wed/Thu, fitness Mon/Wed/Fri, travel Sun/Tue. Sleep 5.5–6.5hrs.

RECENT: Lab work ordered (CBC, lipid panel, CMP, HbA1c, TSH+T4). Doctor considering Zepbound (GLP-1). Sleep study ordered.

BACKGROUND: B.S. Quantitative Economics, A.S. Applied Mathematics, Postgraduate Certificate Systems Analysis. Appreciates mathematical rigor and data-driven analysis.

Be direct, warm, practical. Never preachy. He understands complex information.`,

  async call(prompt, systemOverride, cacheKey, forceRefresh) {
    if (!forceRefresh && cacheKey) {
      const cached = CL.Storage.getCachedInsight(cacheKey);
      if (cached) return cached;
    }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemOverride || this.SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const content = data.content[0]?.text || '';
      if (cacheKey && content) CL.Storage.cacheInsight(cacheKey, content);
      return content;
    } catch(e) {
      console.warn('AI call failed:', e);
      return null;
    }
  },

  async generateLearningContent(dateKey) {
    dateKey = dateKey || CL.Storage.getTodayKey();
    const cached = CL.Storage.getLearningContent(dateKey);
    if (cached) return cached;

    const prompt = `Generate today's learning content for ${dateKey}. Return only valid JSON as specified. Make every fact genuinely interesting and non-obvious. For Utah/SLC history, favor lesser-known stories. For mathematics, lean toward applied statistics, probability, econometrics, and counterintuitive results.`;

    try {
      const raw = await this.call(prompt, CL.LEARNING_SYSTEM_PROMPT, null, true);
      if (!raw) return this._getFallbackContent();
      const clean = raw.replace(/```json|```/g, '').trim();
      const data = JSON.parse(clean);
      CL.Storage.saveLearningContent(data, dateKey);
      return data;
    } catch(e) {
      console.warn('Learning content parse failed:', e);
      return this._getFallbackContent();
    }
  },

  _getFallbackContent() {
    const fb = CL.LEARNING_FALLBACK;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return {
      science: pick(fb.science),
      technology: pick(fb.technology),
      engineering: pick(fb.engineering),
      mathematics: pick(fb.mathematics),
      usGov: pick(fb.usGov),
      usHistory: pick(fb.usHistory),
      utahHistory: pick(fb.utahHistory),
      englishWord: pick(fb.englishWord),
      spanishWord: { word:'la constancia', translation:'consistency / perseverance', example:'La constancia es más poderosa que la perfección.', exampleEn:'Consistency is more powerful than perfection.' },
      literature: pick(fb.literature),
      etymology: pick(fb.etymology),
      gameTheory: pick(fb.gameTheory),
      systemsThinking: pick(fb.systemsThinking),
      historicalDecision: pick(fb.historicalDecisions),
      behavioralEcon: pick(fb.behavioralEcon),
      quizQuestions: [],
      spanishQuizQuestions: []
    };
  },

  async analyzeBodyScan(scan, previous) {
    const prev = previous && previous.length > 0
      ? '\n\nPREVIOUS: ' + previous.slice(0,3).map(s => `${s.date}: ${s.weight}lb BF${s.bodyFat}% VF${s.visceralFat} M${s.muscleMass}lb`).join(', ')
      : '\nFirst scan logged.';
    const prompt = `Analyze this body scan:\nWeight: ${scan.weight}lb, BMI: ${scan.bmi}, Body Fat: ${scan.bodyFat}%, Visceral Fat: ${scan.visceralFat}, Muscle: ${scan.muscleMass}lb, BMR: ${scan.bmr}, Metabolic Age: ${scan.metabolicAge}${prev}\n\nProvide: key assessment, changes vs previous, 2-3 priorities, one genuine positive. Under 250 words. Remember Seroquel metabolic effects and Lithium water retention.`;
    return this.call(prompt, null, `scan_${scan.id || Date.now()}`, true);
  },

  async generateWeeklyAnalysis() {
    const days = CL.Storage.exportWeekData();
    const summary = Object.entries(days.days).map(([i, d]) => {
      const tl = d.mood || [];
      const avgMood = tl.length ? (tl.reduce((s,e) => s+(e.mood||0),0)/tl.length).toFixed(1) : '—';
      const avgEnergy = tl.length ? (tl.reduce((s,e) => s+(e.energy||0),0)/tl.length).toFixed(1) : '—';
      return `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}: mood${avgMood} energy${avgEnergy} drinks${d.substance?.drinks||0} inhaler${(d.inhaler||[]).length}`;
    }).join('\n');
    const prompt = `Week summary:\n${summary}\n\nProvide: key pattern, strongest correlation, genuine win, one specific focus for next week. Under 300 words. Be specific to data.`;
    return this.call(prompt, null, `weekly_${CL.Storage.getWeekKey()}`, true);
  },

  async generateMonthlyLetter() {
    const scans = CL.Storage.getScans();
    const streaks = CL.Storage.getStreaks();
    const prompt = `Generate a monthly health letter for Christopher.\nStreak: ${streaks.current||0} days (best: ${streaks.best||0})\nScans: ${scans.length} logged\nLatest: ${scans[0] ? `${scans[0].weight}lb VF${scans[0].visceralFat} BF${scans[0].bodyFat}%` : 'none'}\n\nWrite a professional personal summary covering progress, metrics, lifestyle changes, doctor discussion topics, next month goals. Under 400 words. Format as a letter.`;
    return this.call(prompt, null, `monthly_${new Date().toISOString().slice(0,7)}`, true);
  },

  async generateDoctorPrep() {
    const days = CL.Storage.exportWeekData();
    const inhalerTotal = Object.values(days.days).reduce((s,d) => s+(d.inhaler||[]).length, 0);
    const avgDrinks = (Object.values(days.days).reduce((s,d) => s+(d.substance?.drinks||0), 0) / 7).toFixed(1);
    const prompt = `Doctor appointment prep for Christopher.\nInhaler uses this week: ${inhalerTotal}\nAvg daily drinks: ${avgDrinks}\n\nGenerate a practical checklist he can read in the waiting room covering: top 3 priorities, specific questions for asthma/cholesterol/sleep apnea/Zepbound/Topiramate taper, data to bring, tests to request. Practical and specific. Under 350 words.`;
    return this.call(prompt, null, `doctor_${CL.Storage.getTodayKey()}`, true);
  },

  async getMorningContext(reading, mood, energy) {
    const prompt = `Christopher just read: "${reading.text}" — ${reading.source}\nMood: ${mood||'unlogged'}/10, Energy: ${energy||'unlogged'}/10\n\nIn 2-3 sentences connect this to his actual day and health journey. Specific, not generic. End with key phrase in Spanish if appropriate.`;
    return this.call(prompt, null, null, false);
  }
};

console.log('✅ CL AI v3 loaded');
