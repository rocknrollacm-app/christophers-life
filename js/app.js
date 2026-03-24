// ============================================================
// CHRISTOPHER'S LIFE — App v3
// ============================================================
window.CL = window.CL || {};

// ============================================================
// UI UTILITIES
// ============================================================
CL.UI = {
  showModal(title, content) {
    const o = document.getElementById('modal-overlay');
    const t = document.getElementById('modal-title');
    const c = document.getElementById('modal-content');
    if (!o) return;
    if (t) t.textContent = title;
    if (c) c.innerHTML = content;
    o.classList.add('open');
  },
  closeModal() {
    const o = document.getElementById('modal-overlay');
    if (o) o.classList.remove('open');
  },
  showToast(msg, dur) {
    let el = document.getElementById('cl-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cl-toast';
      el.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--surface-3);border:1px solid var(--border-2);color:var(--text);padding:10px 18px;border-radius:999px;font-size:13px;font-weight:500;z-index:500;transition:opacity 0.3s;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.4);pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0'; }, dur || 2500);
  }
};

// ============================================================
// APP CORE
// ============================================================
CL.App = {
  page: 'insights',
  day: new Date().getDay(),
  editMode: false,
  editDraft: null,

  init() {
    this.render();
    this.showSplash();
    this.navigate('insights');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then(() => console.log('✅ SW registered'))
        .catch(e => console.warn('SW failed:', e));
    }

    try { CL.Audio.init(); } catch(e) {}
    try { CL.Audio.Spotify && CL.Audio.Spotify.init(); } catch(e) {}
    try { CL.HealthConnect.init(); } catch(e) {}

    document.addEventListener('click', () => {
      try { CL.Notifications.init(); } catch(e) {}
    }, { once: true });

    setInterval(() => { try { CL.HealthConnect.syncToday(); } catch(e) {} }, 300000);
    setInterval(() => { try { CL.Notifications.checkWindows(); } catch(e) {} }, 60000);

    console.log("✅ Christopher's Life v3 initialized");
  },

  showSplash() {
    const el = document.getElementById('splash');
    if (!el) return;
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.5s ease';
      setTimeout(() => { try { el.remove(); } catch(e) {} }, 500);
    }, 1800);
  },

  navigate(page) {
    this.page = page;
    this.editMode = false;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    const navEl = document.querySelector('[data-page="' + page + '"]');
    if (pageEl) pageEl.classList.add('active');
    if (navEl) navEl.classList.add('active');
    this.renderPage(page);
    window.scrollTo(0, 0);
  },

  renderPage(page) {
    try {
      switch(page) {
        case 'insights':  this.renderInsights();  break;
        case 'checklist': this.renderChecklist(); break;
        case 'nutrition': this.renderNutrition(); break;
        case 'fitness':   this.renderFitness();   break;
        case 'tracking':  this.renderTracking();  break;
        case 'learning':  this.renderLearning();  break;
        case 'settings':  this.renderSettings();  break;
      }
    } catch(e) {
      console.error('Render error on', page, e);
      const el = document.getElementById('page-' + page);
      if (el) el.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--danger)">⚠️ Render error: ${e.message}<br><br><button onclick="CL.App.renderPage('${page}')" class="btn btn-secondary mt-16">Retry</button></div>`;
    }
  },

  render() {
    document.getElementById('app').innerHTML = `
      <div id="splash" style="position:fixed;inset:0;background:#0c1419;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000">
        ${this.iconSVG(80)}
        <div style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:700;color:#2dd4bf;letter-spacing:1px;margin-bottom:6px">Christopher's Life</div>
        <div style="font-size:12px;color:#64748b;letter-spacing:3px;text-transform:uppercase;font-family:monospace">loading your day</div>
      </div>

      <div id="nic-banner" style="display:none;position:sticky;top:0;z-index:60;background:rgba(13,148,136,.12);border-bottom:1px solid rgba(45,212,191,.2);padding:10px 16px;backdrop-filter:blur(10px)"></div>

      <div id="page-insights"  class="page"></div>
      <div id="page-checklist" class="page"></div>
      <div id="page-nutrition" class="page"></div>
      <div id="page-fitness"   class="page"></div>
      <div id="page-tracking"  class="page"></div>
      <div id="page-learning"  class="page"></div>
      <div id="page-settings"  class="page"></div>

      <nav class="bottom-nav">
        ${[
          ['insights','✦','Insights'],
          ['checklist','✓','Today'],
          ['nutrition','🍽️','Nutrition'],
          ['fitness','💪','Fitness'],
          ['tracking','📊','Track'],
          ['learning','📚','Learn'],
          ['settings','⚙','Settings']
        ].map(([p,ic,lb]) => `
          <button class="nav-item" data-page="${p}" onclick="CL.App.navigate('${p}')">
            <span class="nav-icon">${ic}</span>
            <span>${lb}</span>
          </button>`).join('')}
      </nav>

      <div id="modal-overlay" class="modal-overlay" onclick="if(event.target===this)CL.UI.closeModal()">
        <div class="modal">
          <div class="modal-handle"></div>
          <div class="modal-title" id="modal-title"></div>
          <div id="modal-content"></div>
        </div>
      </div>
    `;
    document.addEventListener('keydown', e => { if(e.key==='Escape') CL.UI.closeModal(); });
  },

  iconSVG(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" style="margin-bottom:24px">
      <rect width="512" height="512" rx="115" fill="#0c1419"/>
      <rect x="18" y="109" width="294" height="294" fill="none" stroke="#2dd4bf" stroke-width="9" opacity="0.92"/>
      <rect x="312" y="109" width="182" height="182" fill="none" stroke="#2dd4bf" stroke-width="7.5" opacity="0.78"/>
      <rect x="382" y="291" width="112" height="112" fill="none" stroke="#2dd4bf" stroke-width="6" opacity="0.64"/>
      <rect x="312" y="333" width="70" height="70" fill="none" stroke="#2dd4bf" stroke-width="5" opacity="0.52"/>
      <rect x="312" y="291" width="42" height="42" fill="none" stroke="#2dd4bf" stroke-width="4" opacity="0.42"/>
      <rect x="354" y="291" width="28" height="28" fill="none" stroke="#2dd4bf" stroke-width="3" opacity="0.32"/>
      <rect x="354" y="319" width="14" height="14" fill="none" stroke="#2dd4bf" stroke-width="2.5" opacity="0.22"/>
      <rect x="368" y="319" width="14" height="14" fill="none" stroke="#2dd4bf" stroke-width="2.5" opacity="0.14"/>
      <text x="165" y="278" text-anchor="middle" dominant-baseline="middle"
        font-family="'Playfair Display','Georgia','Times New Roman',serif"
        font-size="200" font-weight="400" fill="#2dd4bf" opacity="0.88">C</text>
    </svg>`;
  },

  // ============================================================
  // CHECKLIST PAGE
  // ============================================================
  renderChecklist() {
    const page = document.getElementById('page-checklist');
    if (!page) return;
    const day = this.day;
    const today = new Date().getDay();
    const checked = CL.Storage.getChecked(day);
    const progress = this.getDayProgress(day);
    const sections = this.getDaySectionsForDay(day);
    const primaryColor = this.getDayPrimaryColor(day);

    page.innerHTML = `
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="app-wordmark">Christopher's Life</div>
            <div class="header-title">${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day]}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            ${this.progressRingSVG(progress.pct, primaryColor)}
            <button onclick="CL.App.toggleEditMode()" class="btn btn-secondary btn-sm" style="${this.editMode ? 'background:var(--teal);color:#0c1419' : ''}">
              ${this.editMode ? '✕ Cancel' : '✎ Edit'}
            </button>
          </div>
        </div>

        <!-- Day type badges + section selector -->
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;margin-bottom:6px">
          ${CL.Storage.getDaySections(day).map(id => {
            const opt = CL.DAY_TYPE_OPTIONS.find(o => o.key === id);
            if (!opt) return '';
            return `<span style="display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:999px;border:1px solid ${opt.color};color:${opt.color}">${opt.emoji} ${opt.label}</span>`;
          }).join('')}
          <button onclick="CL.App.editDaySections(${day})" style="background:none;border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:10px;color:var(--text-3);cursor:pointer">+ sections</button>
        </div>

        <!-- Day selector -->
        <div class="day-selector">
          ${['S','M','T','W','T','F','S'].map((d,i) => {
            const p = this.getDayProgress(i);
            return `<button class="day-btn${i===day?' selected':''}${i===today?' today':''}" onclick="CL.App.selectDay(${i})">
              <span style="font-size:11px">${d}</span>
              <span style="font-size:9px;opacity:.6;font-family:var(--font-mono)">${p.done}/${p.total}</span>
            </button>`;
          }).join('')}
        </div>

        <!-- Progress bar -->
        <div style="margin-top:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="text-xs text-dim">${progress.done} of ${progress.total} tasks</span>
            <span class="text-xs text-dim">${progress.total - progress.done} remaining</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width:${progress.pct}%;background:${primaryColor}"></div>
          </div>
        </div>

        ${this.editMode ? `<div style="background:rgba(45,212,191,.1);border:1px solid rgba(45,212,191,.3);border-radius:8px;padding:8px 12px;margin-top:10px;font-size:12px;color:var(--teal)">
          ✎ Edit Mode — tap ✕ on tasks to delete, drag to reorder, tap section to move tasks. <button onclick="CL.App.saveEditMode()" class="btn btn-primary btn-sm" style="margin-left:8px">Save Changes</button>
        </div>` : ''}
      </div>

      <!-- Sections -->
      ${this.renderAllSections(day, checked)}

      <!-- Brown Noise -->
      <div style="padding:0 16px;margin-bottom:8px">
        <div class="card">
          <div style="display:flex;align-items:center;gap:12px">
            <button id="bn-btn" onclick="CL.App.toggleNoise()" class="btn btn-secondary btn-sm">▶ Start Brown Noise</button>
            <input type="range" min="0" max="1" step="0.05" value="${CL.Storage.getSetting('bnVol',.5)}"
              oninput="CL.Audio.setVolume(parseFloat(this.value))"
              style="flex:1;accent-color:var(--teal)">
            <span id="bn-indicator"></span>
          </div>
        </div>
      </div>

      <!-- Reset -->
      <div style="padding:0 16px;margin-bottom:16px">
        <button onclick="CL.App.confirmReset(${day})" class="btn btn-danger btn-sm" style="width:100%;font-size:12px">Reset Today's Tasks</button>
      </div>
    `;
  },

  renderAllSections(day, checked) {
    const always = ['morning', 'afternoon'];
    const daySpecific = CL.Storage.getDaySections(day);
    const alwaysAfter = ['evening', 'night', 'bonus'];
    const order = [...always, ...daySpecific, ...alwaysAfter];
    // Custom tasks
    const customTasks = CL.Storage.getCustomTasks();

    let html = order.map(id => {
      const sec = CL.SECTIONS[id];
      if (!sec) return '';
      return this.renderSection(sec, day, checked);
    }).join('');

    // Custom section
    if (customTasks.length > 0) {
      html += this.renderCustomSection(day, checked, customTasks);
    }

    // Add custom task button always visible
    html += `<div style="padding:0 16px;margin-bottom:8px">
      <button onclick="CL.App.addCustomTask()" class="btn btn-secondary btn-sm" style="font-size:11px">+ Add custom task</button>
    </div>`;

    return html;
  },

  renderSection(sec, day, checked) {
    const tasks = sec.tasks || [];
    const isBonus = sec.id === 'bonus';
    const bonusDone = isBonus ? tasks.filter(t => checked[t.id]).length : 0;
    const sectionDone = tasks.filter(t => checked[t.id]).length;

    return `
      <div class="section-header" id="sec-${sec.id}">
        <span class="section-title">${sec.icon} ${sec.label}</span>
        ${isBonus ? `<span style="font-size:10px;color:var(--teal);margin-left:6px">${bonusDone}/3 count toward total</span>` : ''}
        <div class="section-line"></div>
        <span style="font-size:10px;color:var(--text-3);white-space:nowrap">${sectionDone}/${tasks.length}</span>
        ${this.editMode ? `<button onclick="CL.App.addTaskToSection('${sec.id}')" style="background:none;border:none;color:var(--teal);font-size:12px;cursor:pointer;margin-left:6px;white-space:nowrap">+ Add</button>` : ''}
      </div>
      <div class="px-16" id="tasks-${sec.id}">
        ${tasks.map(t => this.renderTask(t, day, checked, sec.id)).join('')}
      </div>`;
  },

  renderTask(task, day, checked, sectionId) {
    const done = !!checked[task.id];
    const hasAction = !!task.action;

    if (this.editMode) {
      return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px" data-id="${task.id}" data-section="${sectionId}">
        <div class="task-item${done?' checked':''}" style="flex:1;cursor:default">
          <span class="task-icon">${task.icon||'📌'}</span>
          <div class="task-content"><div class="task-label">${task.label}</div></div>
        </div>
        <button onclick="CL.App.moveTask('${task.id}','${sectionId}')" style="background:none;border:1px solid var(--border);border-radius:6px;padding:5px 8px;color:var(--text-3);font-size:11px;cursor:pointer;flex-shrink:0" title="Move to section">↕</button>
        <button onclick="CL.App.deleteTaskConfirm('${task.id}','${sectionId}')" style="background:none;border:1px solid var(--border);border-radius:6px;padding:5px 8px;color:var(--danger);font-size:11px;cursor:pointer;flex-shrink:0">✕</button>
      </div>`;
    }

    return `<button class="task-item${done?' checked':''}" onclick="CL.App.handleTaskTap('${task.id}', ${day}, '${task.action||''}')">
      <span class="task-icon">${task.icon||'📌'}</span>
      <div class="task-content">
        <div class="task-label">${task.label}</div>
      </div>
      ${hasAction ? `<span style="font-size:10px;color:var(--teal);flex-shrink:0">→</span>` : ''}
      <div class="task-checkbox">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="#0c1419" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </button>`;
  },

  renderCustomSection(day, checked, tasks) {
    return `
      <div class="section-header">
        <span class="section-title">📌 Custom</span>
        <div class="section-line"></div>
        ${this.editMode ? '' : ''}
      </div>
      <div class="px-16">
        ${tasks.map(t => {
          const done = !!checked[t.id];
          if (this.editMode) {
            return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <div class="task-item${done?' checked':''}" style="flex:1;cursor:default">
                <span class="task-icon">${t.icon||'📌'}</span>
                <div class="task-content"><div class="task-label">${t.label}</div></div>
              </div>
              <button onclick="CL.App.editCustomTask('${t.id}')" style="background:none;border:1px solid var(--border);border-radius:6px;padding:5px 8px;color:var(--text-3);font-size:11px;cursor:pointer">✎</button>
              <button onclick="CL.Storage.deleteCustomTask('${t.id}');CL.App.renderChecklist()" style="background:none;border:1px solid var(--border);border-radius:6px;padding:5px 8px;color:var(--danger);font-size:11px;cursor:pointer">✕</button>
            </div>`;
          }
          return `<button class="task-item${done?' checked':''}" onclick="CL.App.toggleTask('${t.id}', ${day})">
            <span class="task-icon">${t.icon||'📌'}</span>
            <div class="task-content"><div class="task-label">${t.label}</div></div>
            <div class="task-checkbox"><svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#0c1419" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          </button>`;
        }).join('')}
      </div>`;
  },

  handleTaskTap(taskId, day, action) {
    if (action === 'trackMood') { this.logMoodEntry(); return; }
    if (action === 'trackSleep') { this.navigate('tracking'); return; }
    if (action === 'openInsights') { this.navigate('insights'); return; }
    if (action === 'openNutrition') { this.navigate('nutrition'); return; }
    if (action === 'openFitness') { this.navigate('fitness'); return; }
    if (action === 'openLearning') { this.navigate('learning'); return; }
    if (action === 'planTomorrow') { this.openPlanDay((new Date().getDay()+1)%7, true); return; }
    if (action === 'trackMeal') { this.navigate('nutrition'); return; }
    this.toggleTask(taskId, day);
  },

  toggleTask(taskId, day) {
    const checked = CL.Storage.getChecked(day);
    const newVal = !checked[taskId];
    CL.Storage.setChecked(day, taskId, newVal);
    if (newVal) CL.UI.showToast('✓');
    CL.Storage.updateStreaks(day);
    this.renderChecklist();
  },

  getDayProgress(dayIndex) {
    const sections = this.getDaySectionsForDay(dayIndex);
    const checked = CL.Storage.getChecked(dayIndex);
    let total = 0, done = 0;

    sections.forEach(sec => {
      if (sec.id === 'bonus') {
        // Only 3 bonus tasks count
        total += 3;
        const bonusDone = Math.min(3, (sec.tasks||[]).filter(t => checked[t.id]).length);
        done += bonusDone;
      } else {
        const tasks = sec.tasks || [];
        total += tasks.length;
        done += tasks.filter(t => checked[t.id]).length;
      }
    });

    // Custom tasks
    const custom = CL.Storage.getCustomTasks();
    total += custom.length;
    done += custom.filter(t => checked[t.id]).length;

    return { done, total, pct: total > 0 ? Math.round(done/total*100) : 0 };
  },

  getDaySectionsForDay(dayIndex) {
    const always = ['morning', 'afternoon'];
    const daySpecific = CL.Storage.getDaySections(dayIndex);
    const alwaysAfter = ['evening', 'night', 'bonus'];
    return [...always, ...daySpecific, ...alwaysAfter]
      .map(id => CL.SECTIONS[id])
      .filter(Boolean);
  },

  getDayPrimaryColor(dayIndex) {
    const sections = CL.Storage.getDaySections(dayIndex);
    if (sections.length === 0) return '#8b5cf6';
    const opt = CL.DAY_TYPE_OPTIONS.find(o => o.key === sections[0]);
    return opt ? opt.color : '#8b5cf6';
  },

  selectDay(i) { this.day = i; this.renderChecklist(); },

  progressRingSVG(pct, color) {
    const r = 20, circ = 2 * Math.PI * r;
    return `<div style="position:relative;width:52px;height:52px;flex-shrink:0">
      <svg width="52" height="52" viewBox="0 0 52 52" style="transform:rotate(-90deg)">
        <circle cx="26" cy="26" r="${r}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="4"/>
        <circle cx="26" cy="26" r="${r}" fill="none" stroke="${color}" stroke-width="4"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-pct/100)}" stroke-linecap="round"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:var(--font-mono);color:${color}">${pct}%</div>
    </div>`;
  },

  // ---- Edit Mode ----
  toggleEditMode() {
    this.editMode = !this.editMode;
    this.renderChecklist();
  },

  saveEditMode() {
    this.editMode = false;
    CL.UI.showToast('✓ Changes saved');
    this.renderChecklist();
  },

  addTaskToSection(sectionId) {
    CL.UI.showModal('Add Task to ' + (CL.SECTIONS[sectionId]?.label || sectionId), `
      <div style="margin-bottom:12px">
        <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:4px">Task name</label>
        <input type="text" id="nt-label" placeholder="Describe the task...">
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:8px">Icon</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          ${['📌','💊','🚭','💧','📖','🧘','🚶','🥤','📝','🌿','❤️','⭐','🎯','🔔','✅'].map(e =>
            `<button onclick="document.getElementById('nt-icon').value='${e}';this.style.outline='2px solid var(--teal)';document.querySelectorAll('.ip-btn').forEach(b=>b.style.outline='none');this.style.outline='2px solid var(--teal)'"
              class="ip-btn" style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:7px;font-size:17px;cursor:pointer">${e}</button>`
          ).join('')}
        </div>
        <input type="text" id="nt-icon" value="📌" style="width:70px;text-align:center;font-size:18px">
      </div>
      <button onclick="CL.App.saveNewTask('${sectionId}')" class="btn btn-primary btn-full">Add Task</button>
    `);
  },

  saveNewTask(sectionId) {
    const label = document.getElementById('nt-label')?.value?.trim();
    const icon = document.getElementById('nt-icon')?.value?.trim() || '📌';
    if (!label) { CL.UI.showToast('Enter a task name'); return; }
    // Add to the section's task list in localStorage
    const customSectionTasks = CL.Storage._get('cl_section_tasks', {});
    if (!customSectionTasks[sectionId]) customSectionTasks[sectionId] = [];
    const newTask = { id: sectionId + '_' + Date.now(), label, icon };
    customSectionTasks[sectionId].push(newTask);
    CL.Storage._set('cl_section_tasks', customSectionTasks);
    // Also add to the section in memory for this session
    if (CL.SECTIONS[sectionId]) {
      CL.SECTIONS[sectionId].tasks.push(newTask);
    }
    CL.UI.closeModal();
    CL.UI.showToast('✓ Task added');
    this.renderChecklist();
  },

  moveTask(taskId, fromSectionId) {
    const secs = Object.values(CL.SECTIONS).map(s => `
      <button onclick="CL.App._doMoveTask('${taskId}','${fromSectionId}','${s.id}')"
        style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;
               background:${'${fromSectionId}' === s.id ? 'var(--teal-glow)' : 'var(--surface-2)'};
               border:1px solid var(--border);border-radius:10px;margin-bottom:6px;cursor:pointer;font-family:var(--font-body)">
        <span style="font-size:18px">${s.icon}</span>
        <span style="font-size:14px;font-weight:600">${s.label}</span>
        ${'${fromSectionId}' === s.id ? '<span style="margin-left:auto;font-size:11px;color:var(--teal)">current</span>' : ''}
      </button>`).join('');

    CL.UI.showModal('Move Task To...', secs.replace(/\$\{fromSectionId\}/g, fromSectionId));
  },

  _doMoveTask(taskId, fromId, toId) {
    if (fromId === toId) { CL.UI.closeModal(); return; }
    // Find task
    const fromSec = CL.SECTIONS[fromId];
    if (!fromSec) { CL.UI.closeModal(); return; }
    const taskIdx = fromSec.tasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) { CL.UI.closeModal(); return; }
    const [task] = fromSec.tasks.splice(taskIdx, 1);
    // Remap ID to new section
    task.id = toId + '_moved_' + Date.now();
    const toSec = CL.SECTIONS[toId];
    if (toSec) toSec.tasks.push(task);
    CL.UI.closeModal();
    CL.UI.showToast('✓ Task moved to ' + (toSec?.label || toId));
    this.renderChecklist();
  },

  deleteTaskConfirm(taskId, sectionId) {
    const sec = CL.SECTIONS[sectionId];
    const task = sec?.tasks?.find(t => t.id === taskId);
    if (!task) return;
    CL.UI.showModal('Delete Task?', `
      <p class="text-sm text-dim mb-16">"${task.label}" will be removed from ${sec.label}.</p>
      <div class="flex gap-8">
        <button onclick="CL.UI.closeModal()" class="btn btn-secondary" style="flex:1">Cancel</button>
        <button onclick="CL.App._confirmDeleteTask('${taskId}','${sectionId}')" class="btn btn-danger" style="flex:1">Delete</button>
      </div>`);
  },

  _confirmDeleteTask(taskId, sectionId) {
    const sec = CL.SECTIONS[sectionId];
    if (sec) sec.tasks = sec.tasks.filter(t => t.id !== taskId);
    CL.UI.closeModal();
    CL.UI.showToast('Task deleted');
    this.renderChecklist();
  },

  addCustomTask() {
    CL.UI.showModal('Add Custom Task', `
      <div style="margin-bottom:12px">
        <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:4px">Task name</label>
        <input type="text" id="ct-label" placeholder="e.g. Take vitamins">
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:8px">Icon</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          ${['📌','💊','🚭','💧','📖','🧘','🚶','🥤','📝','🌿','❤️','⭐','🎯','🔔','✅'].map(e =>
            `<button onclick="document.getElementById('ct-icon').value='${e}'"
              style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:7px;font-size:17px;cursor:pointer">${e}</button>`
          ).join('')}
        </div>
        <input type="text" id="ct-icon" value="📌" style="width:70px;text-align:center;font-size:18px">
      </div>
      <button onclick="CL.App._saveCustomTask()" class="btn btn-primary btn-full">Add Task</button>
    `);
  },

  editCustomTask(id) {
    const t = CL.Storage.getCustomTasks().find(x => x.id === id);
    if (!t) return;
    CL.UI.showModal('Edit Task', `
      <div style="margin-bottom:12px">
        <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:4px">Task name</label>
        <input type="text" id="ct-label" value="${t.label}">
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:4px">Icon</label>
        <input type="text" id="ct-icon" value="${t.icon||'📌'}" style="width:70px;text-align:center;font-size:18px">
      </div>
      <button onclick="CL.App._saveCustomTask('${id}')" class="btn btn-primary btn-full">Save</button>
    `);
  },

  _saveCustomTask(id) {
    const label = document.getElementById('ct-label')?.value?.trim();
    const icon = document.getElementById('ct-icon')?.value?.trim() || '📌';
    if (!label) { CL.UI.showToast('Enter a task name'); return; }
    CL.Storage.saveCustomTask({ id: id||null, label, icon });
    CL.UI.closeModal();
    CL.UI.showToast(id ? '✓ Task updated' : '✓ Task added');
    this.renderChecklist();
  },

  editDaySections(dayIndex) {
    CL.App._editSections = [...CL.Storage.getDaySections(dayIndex)];
    CL.App._editSectionsDay = dayIndex;
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayIndex];

    CL.UI.showModal('Sections — ' + dayName, `
      <p class="text-sm text-dim mb-12">Select which day-type sections to include. Morning, Afternoon, Evening, Night, and Bonus are always shown.</p>
      <div id="sec-opts">
        ${CL.DAY_TYPE_OPTIONS.map(opt => {
          const on = CL.App._editSections.includes(opt.key);
          return `<button onclick="CL.App._toggleSectionOpt('${opt.key}', this)"
            data-key="${opt.key}"
            style="display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px;
                   background:${on ? opt.color+'22' : 'var(--surface-2)'};
                   color:${on ? opt.color : 'var(--text)'};
                   border:1.5px solid ${on ? opt.color : 'var(--border)'};
                   border-radius:10px;margin-bottom:8px;cursor:pointer;font-family:var(--font-body);text-align:left">
            <span style="font-size:18px">${opt.emoji}</span>
            <span style="font-weight:600;font-size:14px;flex:1">${opt.label}</span>
            ${on ? '<span style="font-size:16px">✓</span>' : ''}
          </button>`;
        }).join('')}
      </div>
      <button onclick="CL.App._saveSections()" class="btn btn-primary btn-full mt-8">Save</button>
      <button onclick="CL.App._resetSections(${dayIndex})" class="btn btn-secondary btn-full mt-8" style="font-size:12px">↩ Reset to default</button>
    `);
  },

  _toggleSectionOpt(key, btn) {
    const arr = CL.App._editSections;
    const i = arr.indexOf(key);
    if (i > -1) arr.splice(i, 1); else arr.push(key);
    const opt = CL.DAY_TYPE_OPTIONS.find(o => o.key === key);
    const on = arr.includes(key);
    btn.style.background = on ? opt.color+'22' : 'var(--surface-2)';
    btn.style.color = on ? opt.color : 'var(--text)';
    btn.style.borderColor = on ? opt.color : 'var(--border)';
    btn.querySelector('span:last-child').textContent = on ? '✓' : '';
  },

  _saveSections() {
    CL.Storage.saveDaySections(CL.App._editSectionsDay, CL.App._editSections);
    CL.UI.closeModal();
    CL.UI.showToast('✓ Sections updated');
    this.renderChecklist();
  },

  _resetSections(dayIndex) {
    const defaults = CL.DEFAULT_DAY_SECTIONS;
    const overrides = CL.Storage._get('cl_day_sections', {});
    delete overrides[dayIndex];
    CL.Storage._set('cl_day_sections', overrides);
    CL.UI.closeModal();
    CL.UI.showToast('↩ Reset to default');
    this.renderChecklist();
  },

  toggleNoise() {
    if (CL.Audio.playing) CL.Audio.stop(0);
    else CL.Audio.start();
  },

  confirmReset(day) {
    CL.UI.showModal('Reset?', `
      <p class="text-sm text-dim mb-16">Clear all checked tasks for ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day]}?</p>
      <div style="display:flex;gap:8px">
        <button onclick="CL.UI.closeModal()" class="btn btn-secondary" style="flex:1">Cancel</button>
        <button onclick="CL.Storage.resetDay(${day});CL.UI.closeModal();CL.App.renderChecklist();CL.UI.showToast('Day reset')" class="btn btn-danger" style="flex:1">Reset</button>
      </div>`);
  },

  // ============================================================
  // PLANNING MODAL (Today & Tomorrow)
  // ============================================================
  openPlanDay(dayIndex, isTomorrow) {
    const dayName = isTomorrow ? 'Tomorrow' : 'Today';
    const fullDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayIndex];
    const sched = CL.Storage.getSchedule();
    const sections = CL.Storage.getDaySections(dayIndex);
    const hasExercise = sections.includes('cardio') || sections.includes('fitness');

    CL.App._planSections = [...sections];
    CL.App._planDayIndex = dayIndex;

    const mealKeys = [
      { key:'wake',           label:'Wake time' },
      { key:'breakfast',      label:'Breakfast' },
      { key:'morningSnack',   label:'Morning snack' },
      { key:'lunch',          label:'Lunch' },
      { key:'afternoonSnack', label:'Afternoon snack' },
      { key:'dinner',         label:'Dinner' },
      { key:'bedtime',        label:'Target bedtime' },
    ];
    if (hasExercise) mealKeys.splice(5, 0, { key:'exercise', label:'Exercise session' });

    CL.UI.showModal(`Plan ${dayName} — ${fullDay}`, `
      <p class="text-sm text-dim mb-12">Set anchor times — nicotine windows, kitchen close, and medication times will update automatically.</p>

      <!-- Day sections -->
      <div style="margin-bottom:16px">
        <div class="text-sm mb-8">Day sections</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap" id="plan-sec-btns">
          ${CL.DAY_TYPE_OPTIONS.map(opt => {
            const on = sections.includes(opt.key);
            return `<button onclick="CL.App._togglePlanSection('${opt.key}', this)"
              data-key="${opt.key}"
              style="padding:6px 12px;border-radius:999px;border:1.5px solid ${on?opt.color:'var(--border)'};
                     background:${on?opt.color+'22':'var(--surface-2)'};color:${on?opt.color:'var(--text-2)'};
                     font-size:12px;font-weight:600;cursor:pointer">
              ${opt.emoji} ${opt.label}
            </button>`;
          }).join('')}
        </div>
      </div>

      <!-- Anchor times -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        ${mealKeys.map(m => `
          <div>
            <label style="font-size:11px;color:var(--text-3);display:block;margin-bottom:3px">${m.label}</label>
            <input type="time" id="plan-${m.key}"
              value="${sched[m.key]?.time || sched[m.key] || ''}"
              oninput="CL.App._updatePlanCascade()"
              style="font-family:var(--font-mono);font-size:14px;font-weight:700;width:100%;padding:8px">
          </div>`).join('')}
      </div>

      <!-- Derived times preview -->
      <div id="plan-cascade" style="background:var(--surface-2);border-radius:10px;padding:12px;margin-bottom:16px;font-size:11px;line-height:2;color:var(--text-3)">
        Auto-calculated times will appear here as you set anchor times.
      </div>

      <button onclick="CL.App._savePlanDay()" class="btn btn-primary btn-full">Save Plan</button>
    `);

    setTimeout(() => CL.App._updatePlanCascade(), 100);
  },

  _togglePlanSection(key, btn) {
    const arr = CL.App._planSections;
    const i = arr.indexOf(key);
    if (i > -1) arr.splice(i, 1); else arr.push(key);
    const opt = CL.DAY_TYPE_OPTIONS.find(o => o.key === key);
    const on = arr.includes(key);
    btn.style.borderColor = on ? opt.color : 'var(--border)';
    btn.style.background = on ? opt.color+'22' : 'var(--surface-2)';
    btn.style.color = on ? opt.color : 'var(--text-2)';
  },

  _updatePlanCascade() {
    const get = id => document.getElementById('plan-' + id)?.value || '';
    const wake = get('wake'), breakfast = get('breakfast'), morningSnack = get('morningSnack');
    const lunch = get('lunch'), afternoonSnack = get('afternoonSnack');
    const exercise = get('exercise'), dinner = get('dinner'), bedtime = get('bedtime');
    const sched = CL.Storage.getSchedule();
    const pre = sched.nicotinePreMeal || 15, post = sched.nicotinePostMeal || 30;
    const preEx = sched.nicotinePreExercise || 30, postEx = sched.nicotinePostExercise || 15;
    const morningWin = sched.morningNicotineWindow || 60;

    const rows = [];
    if (wake) {
      rows.push(`🚭 Morning nicotine-free window: ${wake} → ${CL.Notifications.addMins(wake, morningWin)}`);
    }
    [['breakfast',breakfast],['morning snack',morningSnack],['lunch',lunch],['afternoon snack',afternoonSnack],['dinner',dinner]].forEach(([name,t]) => {
      if (!t) return;
      rows.push(`🚭 No nicotine: ${CL.Notifications.subtractMins(t,pre)} → ${CL.Notifications.addMins(t,post)} (around ${name})`);
    });
    if (exercise) {
      rows.push(`🚭 Exercise window: ${CL.Notifications.subtractMins(exercise,preEx)} → ${CL.Notifications.addMins(exercise,30+postEx)}`);
    }
    if (dinner) {
      rows.push(`🔒 Kitchen closes: ${CL.Notifications.addMins(dinner, sched.kitchenCloseOffset||60)}`);
    }
    rows.push(`🚭 Evening nicotine cutoff: 7:00 PM`);
    rows.push(`🍺 No beer after: 7:00 PM`);
    if (bedtime) {
      rows.push(`💊 Magnesium / meds: ${CL.Notifications.subtractMins(bedtime, sched.magnesiumOffset||60)}`);
    }

    const el = document.getElementById('plan-cascade');
    if (el) el.innerHTML = rows.length ? rows.map(r => `<div>${r}</div>`).join('') : 'Set anchor times above to see derived schedule.';
  },

  _savePlanDay() {
    const get = id => document.getElementById('plan-' + id)?.value || null;
    const keys = ['wake','breakfast','morningSnack','lunch','afternoonSnack','dinner','exercise','bedtime'];
    const updates = {};
    keys.forEach(k => {
      const v = get(k);
      if (v) updates[k] = { time: v, label: CL.DEFAULT_SCHEDULE[k]?.label || k };
    });
    if (Object.keys(updates).length > 0) CL.Storage.saveSchedule(updates);
    if (CL.App._planSections) CL.Storage.saveDaySections(CL.App._planDayIndex, CL.App._planSections);
    CL.Notifications.schedule();
    CL.UI.closeModal();
    CL.UI.showToast('✓ Plan saved — schedule and notifications updated');
    this.renderChecklist();
  },

  // ============================================================
  // MOOD LOG
  // ============================================================
  logMoodEntry() {
    CL.App._moodVal = null; CL.App._energyVal = null;
    CL.UI.showModal('Log Mood & Energy', `
      <div style="margin-bottom:16px">
        <div class="text-sm mb-8">Mood (1–10)</div>
        <div style="display:flex;gap:3px;flex-wrap:wrap">
          ${CL.MOOD_SCALE.map(s => `<button onclick="CL.App._pickScale('mood',${s.value},this,'#${s.value>=7?'34d399':s.value>=4?'2dd4bf':'f87171'}')"
            style="flex:1;min-width:26px;padding:8px 3px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text-2);font-size:12px;font-weight:600;font-family:var(--font-mono);cursor:pointer"
            title="${s.label}">${s.value}</button>`).join('')}
        </div>
        <div id="mood-desc" class="text-xs text-dim mt-4">Tap to select</div>
      </div>
      <div style="margin-bottom:16px">
        <div class="text-sm mb-8">Energy (1–10)</div>
        <div style="display:flex;gap:3px;flex-wrap:wrap">
          ${CL.ENERGY_SCALE.map(s => `<button onclick="CL.App._pickScale('energy',${s.value},this,'#${s.value>=7?'34d399':s.value>=4?'2dd4bf':'f87171'}')"
            style="flex:1;min-width:26px;padding:8px 3px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text-2);font-size:12px;font-weight:600;font-family:var(--font-mono);cursor:pointer"
            title="${s.label}">${s.value}</button>`).join('')}
        </div>
        <div id="energy-desc" class="text-xs text-dim mt-4">Tap to select</div>
      </div>
      <div style="margin-bottom:16px">
        <input type="text" id="mood-note" placeholder="Optional note (e.g. after coffee, post-workout...)">
      </div>
      <button onclick="CL.App._saveMoodEntry()" class="btn btn-primary btn-full">Save</button>
    `);
  },

  _pickScale(type, val, btn, color) {
    CL.App['_' + type + 'Val'] = val;
    btn.closest('div').querySelectorAll('button').forEach(b => { b.style.background='var(--surface-2)'; b.style.color='var(--text-2)'; b.style.borderColor='var(--border)'; });
    btn.style.background = color + '33'; btn.style.color = color; btn.style.borderColor = color;
    const scale = type === 'mood' ? CL.MOOD_SCALE : CL.ENERGY_SCALE;
    const item = scale.find(s => s.value === val);
    const desc = document.getElementById(type + '-desc');
    if (desc && item) desc.innerHTML = `<strong>${item.label}</strong> — ${item.desc}`;
  },

  _saveMoodEntry() {
    if (!CL.App._moodVal && !CL.App._energyVal) { CL.UI.showToast('Select mood or energy'); return; }
    const note = document.getElementById('mood-note')?.value?.trim() || '';
    CL.Storage.addMoodEntry({ mood: CL.App._moodVal, energy: CL.App._energyVal, note });
    CL.UI.closeModal();
    CL.UI.showToast('✓ Logged');
  },


  // ============================================================
  // INSIGHTS PAGE
  // ============================================================
  renderInsights() {
    const page = document.getElementById('page-insights');
    if (!page) return;
    const todayLog = CL.Storage.getDailyLog();
    const reading = CL.Storage.getNextReading(todayLog.mood);
    const affirmation = CL.Storage.getTodayAffirmation();
    const streaks = CL.Storage.getStreaks();
    const scans = CL.Storage.getScans();
    const primary = reading.isSpanishOriginal ? reading.textEs : reading.text;
    const secondary = reading.isSpanishOriginal ? reading.text : reading.textEs;
    const source = reading.isSpanishOriginal ? reading.sourceEs : reading.source;

    page.innerHTML = `
      <div class="page-header">
        <div class="header-top">
          <div>
            <div class="app-wordmark">Christopher's Life</div>
            <div class="header-title">Insights</div>
          </div>
        </div>
      </div>

      <!-- Streaks -->
      <div style="padding:12px 16px 0">
        <div class="card">
          <div style="display:flex;gap:8px">
            <div class="streak-badge">🔥 <div><div class="streak-number">${streaks.current||0}</div><div class="text-xs text-dim">day streak</div></div></div>
            <div class="streak-badge">🏆 <div><div class="streak-number">${streaks.best||0}</div><div class="text-xs text-dim">best ever</div></div></div>
          </div>
        </div>
      </div>

      <!-- Morning Reading -->
      <div class="section-header"><span class="section-title">Morning Reading</span><div class="section-line"></div></div>
      <div class="px-16">
        <div class="reading-card">
          <div class="reading-text-es">"${primary}"</div>
          <div class="reading-text-en">"${secondary}"</div>
          <div class="reading-source">${source}</div>
        </div>
        <div id="reading-ctx" style="display:none" class="ai-insight">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span class="ai-badge">AI Context</span></div>
          <div class="ai-content" id="reading-ctx-text"></div>
        </div>
        <button class="btn btn-secondary btn-sm mt-8" onclick="CL.App.getMorningContext('${reading.id}')">✦ Context for today</button>
      </div>

      <!-- Plan buttons -->
      <div class="section-header"><span class="section-title">Word of the Day</span><div class="section-line"></div></div>
      <div class="px-16">
        <div class="vocab-card" id="vocab-card">
          <div class="text-xs text-dim">Open Learning tab for today's word</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn btn-secondary" style="flex:1;font-size:12px" onclick="CL.App.openPlanDay(${new Date().getDay()}, false)">📅 Plan Today</button>
          <button class="btn btn-secondary" style="flex:1;font-size:12px" onclick="CL.App.openPlanDay(${(new Date().getDay()+1)%7}, true)">🌅 Plan Tomorrow</button>
        </div>
      </div>

      <!-- Weekly Analysis -->
      <div class="section-header"><span class="section-title">Weekly Analysis</span><div class="section-line"></div></div>
      <div class="px-16">
        <div class="ai-insight" id="weekly-insight">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span class="ai-badge">AI Weekly</span>
            <button class="btn btn-secondary btn-sm" onclick="CL.App.loadWeekly(true)">Refresh</button>
          </div>
          <div class="ai-loading"><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><span>Loading...</span></div>
        </div>
      </div>

      ${scans.length > 0 ? `
      <div class="section-header"><span class="section-title">Body Scan Insights</span><div class="section-line"></div></div>
      <div class="px-16">
        <div class="ai-insight" id="scan-insight">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span class="ai-badge">AI Scan</span>
            <span class="text-xs text-dim">${scans[0].date}</span>
          </div>
          <div class="ai-loading"><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><span>Analyzing...</span></div>
        </div>
      </div>` : ''}

      <!-- Monthly letter -->
      <div class="section-header"><span class="section-title">Monthly Letter</span><div class="section-line"></div></div>
      <div class="px-16 mb-4">
        <div class="card">
          <div class="text-sm text-dim mb-8">Personal monthly summary to share with your doctor.</div>
          <button class="btn btn-secondary btn-full" onclick="CL.App.genMonthlyLetter()">📝 Generate Monthly Letter</button>
        </div>
      </div>

      <!-- Affirmation -->
      <div class="section-header"><span class="section-title">Evening Affirmation</span><div class="section-line"></div></div>
      <div class="px-16 mb-16">
        <div class="affirmation-card">
          <div class="affirmation-es">${affirmation.text}</div>
          <div class="affirmation-en">${affirmation.translation}</div>
        </div>
      </div>
    `;

    this.loadWeekly(false);
    if (scans.length > 0) this.loadScanInsight(scans[0], scans.slice(1,4));
  },

  async getMorningContext(readingId) {
    const reading = CL.READINGS.find(r => r.id === readingId);
    if (!reading) return;
    const ctx = document.getElementById('reading-ctx');
    const txt = document.getElementById('reading-ctx-text');
    if (!ctx || !txt) return;
    ctx.style.display = 'block';
    txt.innerHTML = '<div class="ai-loading"><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><span>Getting context...</span></div>';
    const log = CL.Storage.getDailyLog();
    const insight = await CL.AI.getMorningContext(reading, log.mood, log.energy);
    txt.textContent = insight || 'Unable to generate. Check connection.';
  },

  async loadWeekly(force) {
    const el = document.getElementById('weekly-insight');
    if (!el) return;
    const insight = await CL.AI.generateWeeklyAnalysis();
    const loader = el.querySelector('.ai-loading');
    if (loader) {
      const div = document.createElement('div');
      div.className = 'ai-content';
      div.textContent = insight || 'Unable to generate. Check connection.';
      loader.replaceWith(div);
    }
  },

  async loadScanInsight(scan, prev) {
    const el = document.getElementById('scan-insight');
    if (!el) return;
    const insight = await CL.AI.analyzeBodyScan(scan, prev);
    const loader = el.querySelector('.ai-loading');
    if (loader) {
      const div = document.createElement('div');
      div.className = 'ai-content';
      div.textContent = insight || 'Unable to analyze. Check connection.';
      loader.replaceWith(div);
    }
  },

  async genMonthlyLetter() {
    CL.UI.showModal('Generating...', '<div class="ai-loading"><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><span>Writing monthly letter...</span></div>');
    const content = await CL.AI.generateMonthlyLetter();
    document.getElementById('modal-content').innerHTML = `<div class="ai-content" style="white-space:pre-wrap;font-size:13px;line-height:1.7">${content||'Unable to generate.'}</div><button onclick="CL.UI.closeModal()" class="btn btn-secondary btn-full mt-16">Close</button>`;
  },

  async genDoctorPrep() {
    CL.UI.showModal('Generating...', '<div class="ai-loading"><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><span>Preparing appointment summary...</span></div>');
    const content = await CL.AI.generateDoctorPrep();
    document.getElementById('modal-content').innerHTML = `<div class="ai-content" style="white-space:pre-wrap;font-size:13px;line-height:1.7">${content||'Unable to generate.'}</div><button onclick="CL.UI.closeModal()" class="btn btn-secondary btn-full mt-16">Close</button>`;
  },


  // ============================================================
  // NUTRITION PAGE
  // ============================================================
  renderNutrition() {
    const page = document.getElementById('page-nutrition');
    if (!page) return;
    const targets = CL.Storage.getMacroTargets();
    const macroLog = CL.Storage.getMacroLog();
    const totals = CL.Storage.getMacroTotals();
    const water = CL.Storage.getWaterLog();
    const mc = { calories:'#f59e0b', protein:'#34d399', carbs:'#60a5fa', fat:'#f87171', fiber:'#a78bfa' };

    const meals = [
      { key:'breakfast',     label:'Breakfast',       labelEs:'Desayuno' },
      { key:'morningSnack',  label:'Morning Snack',   labelEs:'Merienda' },
      { key:'lunch',         label:'Lunch ★',         labelEs:'Almuerzo ★' },
      { key:'afternoonSnack',label:'Afternoon Snack', labelEs:'Merienda tarde' },
    ];

    page.innerHTML = `
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div class="app-wordmark">Christopher's Life</div><div class="header-title">Nutrition</div></div>
          <button onclick="CL.App.editMacroTargets()" class="btn btn-secondary btn-sm">Edit targets</button>
        </div>
      </div>

      <!-- Water -->
      <div class="px-16 mt-12">
        <div class="card">
          <div class="card-header"><span class="card-title">💧 Water</span><span class="text-xs text-dim">${targets.waterOz||20}oz · goal ${targets.waterBottles||8}</span></div>
          <div style="display:flex;align-items:center;gap:16px">
            <button onclick="CL.App.adjWater(-1)" class="btn btn-secondary" style="font-size:22px;padding:8px 16px">−</button>
            <div style="flex:1;text-align:center">
              <div style="font-size:38px;font-weight:700;font-family:var(--font-mono);color:#60a5fa">${water.bottles||0}</div>
              <div class="text-xs text-dim">${Math.round((water.bottles||0)*(targets.waterOz||20))} oz · ${((water.bottles||0)*(targets.waterOz||20)*29.5735/1000).toFixed(1)}L</div>
              <div class="progress-bar-wrap mt-4"><div class="progress-bar-fill" style="width:${Math.min(100,Math.round((water.bottles||0)/(targets.waterBottles||8)*100))}%;background:#60a5fa"></div></div>
            </div>
            <button onclick="CL.App.adjWater(1)" class="btn btn-secondary" style="font-size:22px;padding:8px 16px">+</button>
          </div>
        </div>
      </div>

      <!-- Totals -->
      <div class="px-16 mt-8">
        <div class="card">
          <div class="card-header"><span class="card-title">Daily Totals (excl. dinner)</span><span class="text-xs text-dim">${new Date().toLocaleDateString()}</span></div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">
            ${[
              {k:'calories',l:'Cal',  u:'kcal'},
              {k:'protein', l:'Pro',  u:'g'},
              {k:'carbs',   l:'Carb', u:'g'},
              {k:'fat',     l:'Fat',  u:'g'},
              {k:'fiber',   l:'Fiber',u:'g'}
            ].map(m => `<div class="macro-cell">
              <div class="macro-value" style="color:${mc[m.k]};font-size:14px">${totals[m.k]||0}</div>
              <div class="text-xs text-dim">${m.u}</div>
              <div class="macro-label">${m.l}</div>
              <div class="macro-bar-wrap"><div class="macro-bar-fill" style="width:${Math.min(100,Math.round((totals[m.k]||0)/(targets[m.k]||1)*100))}%;background:${mc[m.k]}"></div></div>
              <div class="text-xs text-dim mt-4">${(targets[m.k]||0)-(totals[m.k]||0)>0?(targets[m.k]||0)-(totals[m.k]||0)+' left':'✓'}</div>
            </div>`).join('')}
          </div>
          <div class="text-xs text-dim mt-8">Fiber counted within carb total · kcal auto-calc: P×4 + C×4 + F×9</div>
        </div>
      </div>

      <!-- Meals -->
      ${meals.map(meal => {
        const entry = macroLog.meals[meal.key];
        return `
          <div class="section-header"><span class="section-title">${meal.label} · ${meal.labelEs}</span><div class="section-line"></div></div>
          <div class="px-16">
            <div class="card">
              ${entry ? `
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:8px">
                  ${[
                    {l:'Cal',v:entry.calories,c:mc.calories},
                    {l:'Pro',v:entry.protein,c:mc.protein},
                    {l:'Carb',v:entry.carbs,c:mc.carbs},
                    {l:'Fat',v:entry.fat,c:mc.fat},
                    {l:'Fiber',v:entry.fiber||0,c:mc.fiber}
                  ].map(m=>`<div class="macro-cell"><div class="macro-value" style="color:${m.c};font-size:13px">${m.v||0}</div><div class="macro-label">${m.l}</div></div>`).join('')}
                </div>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-secondary btn-sm" style="flex:1" onclick="CL.App.openMacroEntry('${meal.key}','${meal.label}')">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="CL.Storage.saveMacroEntry('${meal.key}',null);CL.App.renderNutrition()">✕</button>
                </div>
              ` : `<button class="btn btn-secondary btn-full" onclick="CL.App.openMacroEntry('${meal.key}','${meal.label}')">+ Log ${meal.label}</button>`}
            </div>
          </div>`;
      }).join('')}

      <!-- Dinner notes -->
      <div class="section-header"><span class="section-title">Dinner · Cena</span><div class="section-line"></div><span style="font-size:9px;color:var(--text-3);margin-left:8px">not tracked</span></div>
      <div class="px-16 mb-16">
        <div class="card">
          <textarea rows="2" placeholder="What did you have for dinner?" style="resize:none;font-size:13px"
            onchange="CL.Storage.saveMacroEntry('dinner',{notes:this.value})"
          >${macroLog.meals.dinner?.notes||''}</textarea>
        </div>
      </div>
    `;
  },

  adjWater(d) {
    const w = CL.Storage.getWaterLog();
    w.bottles = Math.max(0, (w.bottles||0) + d);
    CL.Storage.saveWaterLog(w);
    this.renderNutrition();
  },

  editMacroTargets() {
    const t = CL.Storage.getMacroTargets();
    CL.UI.showModal('Edit Daily Targets', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        ${[
          {k:'calories',l:'Calories (kcal)'},{k:'protein',l:'Protein (g)'},{k:'carbs',l:'Carbs (g)'},
          {k:'fat',l:'Fat (g)'},{k:'fiber',l:'Fiber (g)'},{k:'waterBottles',l:'Water (bottles/day)'},{k:'waterOz',l:'Bottle size (oz)'}
        ].map(f=>`<div>
          <label style="font-size:11px;color:var(--text-3);display:block;margin-bottom:3px">${f.l}</label>
          <input type="number" id="mt-${f.k}" value="${t[f.k]||''}" style="text-align:center;font-size:16px;font-weight:700;font-family:var(--font-mono)">
        </div>`).join('')}
      </div>
      <button onclick="CL.App._saveMacroTargets()" class="btn btn-primary btn-full">Save</button>
    `);
  },

  _saveMacroTargets() {
    const keys = ['calories','protein','carbs','fat','fiber','waterBottles','waterOz'];
    const t = CL.Storage.getMacroTargets();
    keys.forEach(k => { const el = document.getElementById('mt-'+k); if (el&&el.value) t[k] = parseFloat(el.value); });
    CL.Storage.saveMacroTargets(t);
    CL.UI.closeModal(); CL.UI.showToast('✓ Targets saved'); this.renderNutrition();
  },

  openMacroEntry(mealKey, mealLabel) {
    const e = CL.Storage.getMacroLog().meals[mealKey] || {};
    CL.UI.showModal('Log ' + mealLabel, `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px">
        ${['protein','carbs','fat','fiber'].map(m=>`<div>
          <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:4px;text-transform:capitalize">${m} (g)</label>
          <input type="number" id="mac-${m}" value="${e[m]||''}" placeholder="0" oninput="CL.App.autoKcal()" style="text-align:center;font-size:18px;font-weight:700;font-family:var(--font-mono)">
        </div>`).join('')}
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:4px">Calories (kcal) — auto-calculated</label>
        <input type="number" id="mac-calories" value="${e.calories||''}" placeholder="auto" style="text-align:center;font-size:20px;font-weight:700;font-family:var(--font-mono);color:var(--warning)">
        <div class="text-xs text-dim mt-4">P×4 + C×4 + F×9 · fiber not added to kcal</div>
      </div>
      <button onclick="CL.App._saveMacroEntry('${mealKey}')" class="btn btn-primary btn-full">Save</button>
    `);
    setTimeout(() => this.autoKcal(), 50);
  },

  autoKcal() {
    const p = parseFloat(document.getElementById('mac-protein')?.value)||0;
    const c = parseFloat(document.getElementById('mac-carbs')?.value)||0;
    const f = parseFloat(document.getElementById('mac-fat')?.value)||0;
    if (p||c||f) { const el = document.getElementById('mac-calories'); if (el) el.value = Math.round(p*4+c*4+f*9); }
  },

  _saveMacroEntry(mealKey) {
    const data = {
      calories: parseFloat(document.getElementById('mac-calories')?.value)||0,
      protein:  parseFloat(document.getElementById('mac-protein')?.value)||0,
      carbs:    parseFloat(document.getElementById('mac-carbs')?.value)||0,
      fat:      parseFloat(document.getElementById('mac-fat')?.value)||0,
      fiber:    parseFloat(document.getElementById('mac-fiber')?.value)||0,
    };
    CL.Storage.saveMacroEntry(mealKey, data);
    CL.UI.closeModal(); CL.UI.showToast('✓ Macros saved'); this.renderNutrition();
  },


  // ============================================================
  // TRACKING PAGE
  // ============================================================
  renderTracking() {
    const page = document.getElementById('page-tracking');
    if (!page) return;
    const todayLog = CL.Storage.getDailyLog();
    const timeline = CL.Storage.getMoodTimeline();
    const substance = CL.Storage.getSubstanceLog();
    const inhalerLog = CL.Storage.getInhalerLog();
    const healthData = CL.Storage.getHealthData();
    const taperData = CL.Storage.getTaperData();

    page.innerHTML = `
      <div class="page-header">
        <div><div class="app-wordmark">Christopher's Life</div><div class="header-title">Tracking</div></div>
      </div>

      <!-- Mood Timeline -->
      <div class="section-header">
        <span class="section-title">Mood & Energy</span><div class="section-line"></div>
        <button onclick="CL.App.logMoodEntry()" style="background:none;border:none;color:var(--teal);font-size:12px;cursor:pointer;margin-left:8px;white-space:nowrap">+ Log now</button>
      </div>
      <div class="px-16">
        <div class="card">
          ${timeline.length === 0 ? `
            <div class="text-sm text-dim mb-8">No entries yet. Log multiple times throughout the day.</div>
            <button onclick="CL.App.logMoodEntry()" class="btn btn-secondary btn-full">+ Log mood & energy</button>
          ` : `
            ${timeline.slice().reverse().map(e => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
                <div style="font-size:11px;color:var(--text-3);font-family:var(--font-mono);white-space:nowrap;min-width:42px">
                  ${new Date(e.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                </div>
                <div style="flex:1">
                  <div style="display:flex;gap:8px;align-items:center">
                    <span style="font-size:11px;color:var(--text-3)">Mood</span>
                    <span style="font-size:16px;font-weight:700;font-family:var(--font-mono);color:${(e.mood||0)>=7?'var(--success)':(e.mood||0)>=4?'var(--teal)':'var(--danger)'}">${e.mood||'—'}</span>
                    <span style="font-size:11px;color:var(--text-3);margin-left:4px">Energy</span>
                    <span style="font-size:16px;font-weight:700;font-family:var(--font-mono);color:${(e.energy||0)>=7?'var(--success)':(e.energy||0)>=4?'var(--teal)':'var(--danger)'}">${e.energy||'—'}</span>
                  </div>
                  ${e.note?`<div style="font-size:11px;color:var(--text-3);margin-top:1px">${e.note}</div>`:''}
                </div>
                <button onclick="CL.Storage.deleteMoodEntry(${e.id});CL.App.renderTracking()"
                  style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:13px;padding:4px">✕</button>
              </div>`).join('')}
            <button onclick="CL.App.logMoodEntry()" class="btn btn-secondary btn-full mt-8" style="font-size:12px">+ Log another entry</button>
          `}
        </div>
      </div>

      <!-- Sleep -->
      <div class="section-header"><span class="section-title">Sleep</span><div class="section-line"></div></div>
      <div class="px-16">
        <div class="card">
          <div style="margin-bottom:12px">
            <div class="text-sm mb-8">Sleep quality</div>
            <div style="display:flex;gap:4px">
              ${CL.SLEEP_SCALE.map(s => `<button onclick="CL.App._setSleep(${s.value})"
                style="flex:1;padding:8px 4px;background:${todayLog.sleepQuality===s.value?'var(--teal)':'var(--surface-2)'};border:1px solid ${todayLog.sleepQuality===s.value?'var(--teal)':'var(--border)'};border-radius:6px;color:${todayLog.sleepQuality===s.value?'#0c1419':'var(--text-2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font-mono)"
                title="${s.label}">${s.value}</button>`).join('')}
            </div>
            <div class="text-xs text-dim mt-4">${todayLog.sleepQuality ? CL.SLEEP_SCALE.find(s=>s.value===todayLog.sleepQuality)?.label+' — '+CL.SLEEP_SCALE.find(s=>s.value===todayLog.sleepQuality)?.desc : 'Tap to log'}</div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span class="text-sm">Hours last night</span>
            <input type="number" min="0" max="12" step="0.5" value="${todayLog.sleepHours||''}" placeholder="hrs"
              style="width:72px;text-align:center;font-family:var(--font-mono);font-size:16px;font-weight:700"
              onchange="CL.Storage.saveDailyLog({sleepHours:parseFloat(this.value)})">
          </div>
        </div>
      </div>

      <!-- Galaxy Watch -->
      <div class="section-header"><span class="section-title">Galaxy Watch</span><div class="section-line"></div></div>
      <div class="px-16">
        <div class="card">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
            ${[
              {id:'hc-steps',l:'Steps',v:healthData.steps?healthData.steps.toLocaleString():'—',icon:'👣'},
              {id:'hc-sleep',l:'Sleep',v:healthData.sleep?healthData.sleep.hours+'h':'—',icon:'😴'},
              {id:'hc-hrv',  l:'HRV',  v:healthData.hrv?healthData.hrv+'ms':'—',icon:'💓'},
              {id:'hc-hr',   l:'HR',   v:healthData.restingHR?healthData.restingHR+' bpm':'—',icon:'❤️'}
            ].map(m=>`<div class="macro-cell">
              <div style="font-size:18px">${m.icon}</div>
              <div class="macro-value text-teal" id="${m.id}" style="font-size:13px">${m.v}</div>
              <div class="macro-label">${m.l}</div>
            </div>`).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn btn-secondary btn-sm" style="flex:1" onclick="CL.HealthConnect.syncToday().then(()=>CL.App.renderTracking())">↻ Sync</button>
            <div style="flex:1">${CL.HealthConnect.statusHTML()}</div>
          </div>
        </div>
      </div>

      <!-- Substance -->
      <div class="section-header"><span class="section-title">Alcohol & Vaping</span><div class="section-line"></div></div>
      <div class="px-16">
        <div class="card">
          ${[
            {label:'Drinks today',id:'drinks',val:substance.drinks||0,color:'var(--warning)',onInc:"CL.App.adjDrinks(1)",onDec:"CL.App.adjDrinks(-1)"},
            {label:'Nicotine vape hits',id:'vaph',val:substance.vapeHits||0,color:(substance.vapeHits||0)>30?'var(--danger)':(substance.vapeHits||0)>15?'var(--warning)':'var(--teal)',sub:'Every individual hit',onInc:"CL.App.adjVapeHits(1)",onDec:"CL.App.adjVapeHits(-1)"},
            {label:'Zero-nic sessions',id:'vapez',val:(substance.vaping||[]).length,color:'var(--success)',onInc:"CL.App.adjVapeZero(1)",onDec:"CL.App.adjVapeZero(-1)"},
          ].map((s,i) => `
            ${i>0?'<div class="divider"></div>':''}
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div><div class="text-sm">${s.label}</div>${s.sub?`<div class="text-xs text-dim">${s.sub}</div>`:''}</div>
              <div style="display:flex;align-items:center;gap:8px">
                <button onclick="${s.onDec}" class="btn btn-secondary btn-sm">−</button>
                <span id="${s.id}" style="font-size:22px;font-weight:700;font-family:var(--font-mono);color:${s.color};min-width:32px;text-align:center">${s.val}</span>
                <button onclick="${s.onInc}" class="btn btn-secondary btn-sm">+</button>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Inhaler -->
      <div class="section-header"><span class="section-title">Rescue Inhaler</span><div class="section-line"></div></div>
      <div class="px-16">
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <div>
              <div class="text-sm">Uses today: <strong style="color:${inhalerLog.length>=2?'var(--danger)':'var(--text)'}">${inhalerLog.length}</strong></div>
              <div class="text-xs text-dim">Log every use — helps doctor assess control</div>
            </div>
            <button onclick="CL.App.logInhaler()" class="btn btn-secondary btn-sm">+ Log</button>
          </div>
          ${inhalerLog.length>0?`<div class="divider"></div>${inhalerLog.map(u=>`<div class="stat-row"><span class="text-sm text-dim">${new Date(u.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span><span class="text-xs text-dim">${u.note||'no note'}</span></div>`).join('')}`:''}
        </div>
      </div>

      <!-- Body Scan -->
      <div class="section-header"><span class="section-title">Body Scan</span><div class="section-line"></div></div>
      <div class="px-16">
        <div class="card">
          <button class="btn btn-secondary btn-full" onclick="CL.App.openManualScan()">+ Enter scan data</button>
        </div>
      </div>
      ${this.renderScanHistory()}

      <!-- OTC Taper -->
      <div class="section-header"><span class="section-title">OTC Taper Progress</span><div class="section-line"></div></div>
      <div class="px-16 mb-16">
        ${Object.entries(CL.TAPER).map(([k,med]) => this.renderTaperCard(k, med, taperData[k]||{})).join('')}
      </div>
    `;
  },

  _setSleep(val) {
    CL.Storage.saveDailyLog({ sleepQuality: val });
    this.renderTracking();
  },

  adjDrinks(d) {
    const s = CL.Storage.getSubstanceLog(); s.drinks = Math.max(0,(s.drinks||0)+d); CL.Storage.saveSubstanceLog(s);
    const el = document.getElementById('drinks'); if (el) el.textContent = s.drinks;
  },
  adjVapeHits(d) {
    const s = CL.Storage.getSubstanceLog(); s.vapeHits = Math.max(0,(s.vapeHits||0)+d); CL.Storage.saveSubstanceLog(s);
    const el = document.getElementById('vaph');
    if (el) { el.textContent = s.vapeHits; el.style.color = s.vapeHits>30?'var(--danger)':s.vapeHits>15?'var(--warning)':'var(--teal)'; }
  },
  adjVapeZero(d) {
    const s = CL.Storage.getSubstanceLog(); const arr = s.vaping||[];
    if (d>0) arr.push({time:new Date().toISOString()}); else if (arr.length>0) arr.pop();
    s.vaping = arr; CL.Storage.saveSubstanceLog(s);
    const el = document.getElementById('vapez'); if (el) el.textContent = arr.length;
  },

  logInhaler() {
    CL.UI.showModal('Log Inhaler Use', `
      <p class="text-sm text-dim mb-12">Record a rescue inhaler use with optional context.</p>
      <input type="text" id="inh-note" placeholder="Trigger or context (optional)" style="margin-bottom:12px">
      <button onclick="CL.Storage.logInhalerUse(document.getElementById('inh-note').value);CL.UI.closeModal();CL.App.renderTracking();CL.UI.showToast('Inhaler use logged')" class="btn btn-primary btn-full">Log Use</button>
    `);
  },

  openManualScan() {
    CL.UI.showModal('Log Body Scan', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        ${[{k:'weight',l:'Weight (lb)'},{k:'bmi',l:'BMI'},{k:'bodyFat',l:'Body Fat %'},{k:'visceralFat',l:'Visceral Fat'},{k:'muscleMass',l:'Muscle Mass (lb)'},{k:'fatFreeWeight',l:'Fat-Free Weight (lb)'},{k:'bodyWater',l:'Body Water %'},{k:'skeletalMuscle',l:'Skeletal Muscle %'},{k:'boneMass',l:'Bone Mass (lb)'},{k:'protein',l:'Protein %'},{k:'bmr',l:'BMR (kcal)'},{k:'metabolicAge',l:'Metabolic Age'}].map(f=>`
          <div>
            <label style="font-size:11px;color:var(--text-3);display:block;margin-bottom:3px">${f.l}</label>
            <input type="number" id="sc-${f.k}" step="0.1" style="font-size:15px;font-weight:700;font-family:var(--font-mono);text-align:center">
          </div>`).join('')}
      </div>
      <button onclick="CL.App._saveScan()" class="btn btn-primary btn-full">Save & Analyze</button>
    `);
  },

  _saveScan() {
    const fields = ['weight','bmi','bodyFat','visceralFat','muscleMass','fatFreeWeight','bodyWater','skeletalMuscle','boneMass','protein','bmr','metabolicAge'];
    const data = {};
    fields.forEach(f => { const v = parseFloat(document.getElementById('sc-'+f)?.value); if (!isNaN(v)) data[f] = v; });
    if (!data.weight) { CL.UI.showToast('Enter at least weight'); return; }
    CL.Storage.saveScan(data);
    CL.UI.closeModal(); CL.UI.showToast('✓ Scan saved'); this.renderTracking(); this.renderInsights();
  },

  renderScanHistory() {
    const scans = CL.Storage.getScans().slice(0,5);
    if (!scans.length) return '';
    return `<div class="section-header"><span class="section-title">Scan History</span><div class="section-line"></div></div>
      <div class="px-16">
        ${scans.map(s=>`<div class="card mb-8">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span class="text-xs text-dim font-mono">${s.date}</span>
            <button onclick="CL.Storage.deleteScan(${s.id});CL.App.renderTracking()" style="background:none;border:none;cursor:pointer;color:var(--danger);font-size:12px">✕</button>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${s.weight?`<span style="font-size:10px;padding:2px 8px;border-radius:999px;border:1px solid var(--warning);color:var(--warning)">${s.weight}lb</span>`:''}
            ${s.bodyFat?`<span style="font-size:10px;padding:2px 8px;border-radius:999px;border:1px solid var(--text-3);color:var(--text-3)">BF ${s.bodyFat}%</span>`:''}
            ${s.visceralFat?`<span style="font-size:10px;padding:2px 8px;border-radius:999px;border:1px solid ${s.visceralFat<13?'var(--success)':s.visceralFat<17?'var(--warning)':'var(--danger)'};color:${s.visceralFat<13?'var(--success)':s.visceralFat<17?'var(--warning)':'var(--danger)'}">VF ${s.visceralFat}</span>`:''}
            ${s.muscleMass?`<span style="font-size:10px;padding:2px 8px;border-radius:999px;border:1px solid var(--teal);color:var(--teal)">M ${s.muscleMass}lb</span>`:''}
          </div>
        </div>`).join('')}
      </div>`;
  },

  renderTaperCard(key, med, saved) {
    const current = saved.currentPhase || 0;
    const done = current >= med.phases.length;
    return `<div class="card mb-8">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-weight:700">${med.icon} ${med.name}</span>
        <div style="display:flex;gap:6px">
          <button onclick="CL.App.confirmResetTaper('${key}')" class="btn btn-secondary btn-sm" style="font-size:11px;opacity:.6">↩ Reset</button>
          <button onclick="CL.App.advanceTaper('${key}',${current},${med.phases.length})" class="btn ${done?'btn-secondary':'btn-primary'} btn-sm">${done?'✓ Done':'Advance →'}</button>
        </div>
      </div>
      ${med.note?`<div class="text-xs text-dim mb-8">${med.note}</div>`:''}
      ${med.phases.map((p,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">
        <div style="width:10px;height:10px;border-radius:50%;flex-shrink:0;background:${i<current?'var(--success)':i===current?'var(--teal)':'var(--surface-3)'}${i===current?';box-shadow:0 0 8px var(--teal)':''}"></div>
        <div style="flex:1"><div class="text-sm${i===current?' text-teal':i<current?' text-dim':''}">${p.instruction}</div></div>
        ${i===current?'<span class="text-xs text-teal" style="white-space:nowrap">← current</span>':''}
        ${i<current?'<span class="text-xs text-success">✓</span>':''}
      </div>`).join('')}
    </div>`;
  },

  advanceTaper(key, current, total) {
    if (current >= total) return;
    const data = CL.Storage.getTaperData();
    data[key] = { currentPhase: current+1 };
    CL.Storage.saveTaperData(data);
    CL.UI.showToast('✓ ' + CL.TAPER[key].name + ' → phase ' + (current+2));
    this.renderTracking();
  },

  confirmResetTaper(key) {
    CL.UI.showModal('Reset ' + CL.TAPER[key].name + '?', `
      <p class="text-sm text-dim mb-16">Reset progress back to Phase 1? Use this if you advanced by mistake.</p>
      <div style="display:flex;gap:8px">
        <button onclick="CL.UI.closeModal()" class="btn btn-secondary" style="flex:1">Cancel</button>
        <button onclick="CL.App._doResetTaper('${key}')" class="btn btn-danger" style="flex:1">Reset</button>
      </div>`);
  },

  _doResetTaper(key) {
    const data = CL.Storage.getTaperData();
    data[key] = { currentPhase: 0 };
    CL.Storage.saveTaperData(data);
    CL.UI.closeModal(); CL.UI.showToast('↩ ' + CL.TAPER[key].name + ' reset'); this.renderTracking();
  },


  // ============================================================
  // FITNESS PAGE
  // ============================================================
  renderFitness() {
    const page = document.getElementById('page-fitness');
    if (!page) return;
    const workouts = CL.Storage.getWorkouts();
    const logs = CL.Storage.getWorkoutLogs().slice(0,5);

    page.innerHTML = `
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div class="app-wordmark">Christopher's Life</div><div class="header-title">Fitness</div></div>
          <button onclick="CL.App.openWorkoutBuilder()" class="btn btn-primary btn-sm">+ New Workout</button>
        </div>
      </div>

      <div class="section-header"><span class="section-title">My Workouts</span><div class="section-line"></div></div>
      <div class="px-16">
        ${workouts.length === 0 ? `
          <div class="empty-state"><div class="empty-state-icon">💪</div><div class="empty-state-text">No workouts yet.<br>Tap + New Workout to build your first one.</div></div>
        ` : workouts.map(w => `
          <div class="card mb-8">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <div>
                <div style="font-weight:700;font-size:15px">${w.name}</div>
                <div class="text-xs text-dim">${(w.exercises||[]).length} exercise${(w.exercises||[]).length!==1?'s':''}</div>
              </div>
              <div style="display:flex;gap:6px">
                <button onclick="CL.App.startWorkoutSession('${w.id}')" class="btn btn-primary btn-sm">▶ Start</button>
                <button onclick="CL.App.openWorkoutBuilder('${w.id}')" class="btn btn-secondary btn-sm">✎</button>
                <button onclick="CL.App.deleteWorkout('${w.id}')" class="btn btn-danger btn-sm">✕</button>
              </div>
            </div>
            ${(w.exercises||[]).map(ex=>`<div class="stat-row"><span class="text-sm">${ex.name}</span><span class="text-xs text-dim font-mono">${ex.sets}×${ex.reps}</span></div>`).join('')}
          </div>`).join('')}
      </div>

      ${logs.length>0?`
        <div class="section-header"><span class="section-title">Recent Sessions</span><div class="section-line"></div></div>
        <div class="px-16 mb-16">
          ${logs.map(log => {
            const w = workouts.find(x=>x.id===log.workoutId);
            return `<div class="card mb-8">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <span style="font-weight:600">${w?w.name:'Workout'}</span>
                <span class="text-xs text-dim font-mono">${log.date}${log.duration?' · '+log.duration+'min':''}</span>
              </div>
              ${log.notes?`<div class="text-sm text-dim mb-4">${log.notes}</div>`:''}
              ${(log.exercises||[]).map(ex=>`<div class="stat-row">
                <span class="text-sm">${ex.name}</span>
                <span class="text-xs text-dim">${(ex.sets||[]).map((s,i)=>`${i+1}: ${s.weight||'BW'}×${s.reps}`).join(' · ')}</span>
              </div>`).join('')}
            </div>`;
          }).join('')}
        </div>` : ''}
    `;
  },

  openWorkoutBuilder(existingId) {
    const existing = existingId ? CL.Storage.getWorkouts().find(w=>w.id===existingId) : null;
    const exs = existing ? existing.exercises : [{name:'',sets:3,reps:10}];
    CL.App._builderId = existingId || null;
    CL.App._builderExCount = exs.length;

    CL.UI.showModal((existing?'Edit':'New')+' Workout', `
      <div style="margin-bottom:12px">
        <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:4px">Workout name</label>
        <input type="text" id="wo-name" value="${existing?existing.name:''}" placeholder="e.g. Push Day, Full Body A...">
      </div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <label style="font-size:12px;color:var(--text-3)">Exercises <span style="font-size:10px;opacity:.5">(name · sets · reps)</span></label>
          <button onclick="CL.App._addExRow()" class="btn btn-secondary btn-sm" style="font-size:11px">+ Add</button>
        </div>
        <div id="ex-rows">
          ${exs.map((ex,i)=>CL.App._exRowHTML(i, ex.name, ex.sets, ex.reps)).join('')}
        </div>
      </div>
      <button onclick="CL.App._saveWorkout()" class="btn btn-primary btn-full">${existing?'Save Changes':'Create Workout'}</button>
    `);
  },

  _exRowHTML(i, name, sets, reps) {
    return `<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px" id="ex-row-${i}">
      <input type="text" placeholder="Exercise name" value="${name||''}" id="ex-name-${i}" style="flex:1;font-size:13px">
      <input type="number" min="1" max="20" value="${sets||3}" id="ex-sets-${i}" style="width:48px;text-align:center;font-family:var(--font-mono);font-weight:700" title="Sets">
      <span style="font-size:11px;color:var(--text-3)">×</span>
      <input type="number" min="1" max="200" value="${reps||10}" id="ex-reps-${i}" style="width:48px;text-align:center;font-family:var(--font-mono);font-weight:700" title="Reps">
      <button onclick="document.getElementById('ex-row-${i}').remove()" style="background:none;border:none;color:var(--danger);font-size:16px;cursor:pointer;padding:2px 4px">✕</button>
    </div>`;
  },

  _addExRow() {
    const i = CL.App._builderExCount++;
    const container = document.getElementById('ex-rows');
    if (!container) return;
    container.insertAdjacentHTML('beforeend', CL.App._exRowHTML(i,'',3,10));
  },

  _saveWorkout() {
    const name = document.getElementById('wo-name')?.value?.trim();
    if (!name) { CL.UI.showToast('Enter a workout name'); return; }
    const exercises = [];
    for (let i=0; i<50; i++) {
      const n = document.getElementById('ex-name-'+i)?.value?.trim();
      if (!n) continue;
      const sets = parseInt(document.getElementById('ex-sets-'+i)?.value)||3;
      const reps = parseInt(document.getElementById('ex-reps-'+i)?.value)||10;
      exercises.push({ name:n, sets, reps });
    }
    if (!exercises.length) { CL.UI.showToast('Add at least one exercise'); return; }
    CL.Storage.saveWorkout({ id: CL.App._builderId, name, exercises });
    CL.UI.closeModal(); CL.UI.showToast(CL.App._builderId ? '✓ Updated' : '✓ Workout created'); this.renderFitness();
  },

  deleteWorkout(id) {
    const w = CL.Storage.getWorkouts().find(x=>x.id===id);
    if (!w) return;
    CL.UI.showModal('Delete '+w.name+'?', `
      <p class="text-sm text-dim mb-16">This will permanently delete this workout.</p>
      <div style="display:flex;gap:8px">
        <button onclick="CL.UI.closeModal()" class="btn btn-secondary" style="flex:1">Cancel</button>
        <button onclick="CL.Storage.deleteWorkout('${id}');CL.UI.closeModal();CL.App.renderFitness();CL.UI.showToast('Deleted')" class="btn btn-danger" style="flex:1">Delete</button>
      </div>`);
  },

  startWorkoutSession(id) {
    const w = CL.Storage.getWorkouts().find(x=>x.id===id);
    if (!w) return;
    CL.App._session = { workoutId:id, start: Date.now(), exercises: w.exercises.map(ex=>({name:ex.name,sets:Array.from({length:ex.sets},()=>({reps:ex.reps,weight:''}))}) )};

    const render = () => {
      const s = CL.App._session;
      return `<div style="margin-bottom:12px">
        <div style="font-weight:700;font-size:18px;margin-bottom:2px">${w.name}</div>
        <div class="text-xs text-dim" id="wo-timer">0:00 elapsed</div>
      </div>
      ${s.exercises.map((ex,ei)=>`
        <div style="margin-bottom:12px;background:var(--surface-2);border-radius:10px;padding:12px">
          <div style="font-weight:600;margin-bottom:8px">${ex.name}</div>
          ${ex.sets.map((set,si)=>`
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span class="text-xs text-dim" style="min-width:38px">Set ${si+1}</span>
              <input type="text" placeholder="lbs/BW" value="${set.weight}"
                style="width:70px;text-align:center;font-family:var(--font-mono);font-size:14px"
                onchange="CL.App._session.exercises[${ei}].sets[${si}].weight=this.value">
              <span class="text-xs text-dim">×</span>
              <input type="number" value="${set.reps}"
                style="width:50px;text-align:center;font-family:var(--font-mono);font-size:14px;font-weight:700"
                onchange="CL.App._session.exercises[${ei}].sets[${si}].reps=this.value">
              <span class="text-xs text-dim">reps</span>
            </div>`).join('')}
        </div>`).join('')}
      <input type="text" id="wo-notes" placeholder="Session notes (optional)" style="margin-bottom:12px;font-size:13px">
      <button onclick="CL.App._completeSession('${id}')" class="btn btn-primary btn-full">✓ Complete Workout</button>
      <button onclick="clearInterval(CL.App._sessionTimer);CL.UI.closeModal()" class="btn btn-secondary btn-full mt-8" style="font-size:12px">Cancel</button>`;
    };

    CL.UI.showModal('🏋️ '+w.name, render());
    CL.App._sessionTimer = setInterval(() => {
      const el = document.getElementById('wo-timer');
      if (!el) { clearInterval(CL.App._sessionTimer); return; }
      const s = Math.floor((Date.now()-CL.App._session.start)/1000);
      el.textContent = Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+' elapsed';
    }, 1000);
  },

  _completeSession(workoutId) {
    clearInterval(CL.App._sessionTimer);
    const s = CL.App._session;
    const notes = document.getElementById('wo-notes')?.value?.trim()||'';
    const duration = Math.round((Date.now()-s.start)/60000);
    CL.Storage.logWorkoutComplete(workoutId, { exercises:s.exercises, notes, duration });
    CL.UI.closeModal(); CL.UI.showToast('✓ '+duration+' min session logged'); this.renderFitness();
  },


  // ============================================================
  // LEARNING PAGE
  // ============================================================
  renderLearning() {
    const page = document.getElementById('page-learning');
    if (!page) return;
    const dateKey = CL.Storage.getTodayKey();
    const quiz = CL.Storage.getQuizResults();

    page.innerHTML = `
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div class="app-wordmark">Christopher's Life</div><div class="header-title">Learning</div></div>
          <div style="text-align:right">
            <div class="text-xs text-dim">Quiz today</div>
            <div style="font-size:18px;font-weight:700;font-family:var(--font-mono);color:var(--teal)">${quiz.score}/${quiz.total}</div>
          </div>
        </div>
      </div>

      <div id="learn-content" style="padding:0 0 16px">
        <div style="padding:40px 20px;text-align:center">
          <div class="ai-loading" style="justify-content:center">
            <div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div>
            <span>Loading today's content...</span>
          </div>
        </div>
      </div>
    `;

    CL.AI.generateLearningContent(dateKey).then(data => {
      if (!data) return;
      const container = document.getElementById('learn-content');
      if (!container) return;
      container.innerHTML = this.renderLearningContent(data, quiz);
    });
  },

  renderLearningContent(data, quiz) {
    const sections = [
      { id:'stem', label:'STEM', icon:'🔬', items:[
        { key:'science',     label:'Science',     icon:'🧬' },
        { key:'technology',  label:'Technology',  icon:'💻' },
        { key:'engineering', label:'Engineering', icon:'⚙️' },
        { key:'mathematics', label:'Mathematics', icon:'📐' },
      ]},
      { id:'civics', label:'Civics', icon:'🏛️', items:[
        { key:'usGov',     label:'U.S. Government', icon:'🇺🇸' },
        { key:'usHistory', label:'U.S. History',    icon:'📜' },
        { key:'utahHistory',label:'Utah & SLC',     icon:'🏔️' },
      ]},
      { id:'language', label:'Language', icon:'🗣️', items:[
        { key:'englishWord', label:'English Word of the Day', icon:'📝', isWord:true },
        { key:'spanishWord', label:'Spanish Word of the Day', icon:'🇪🇸', isSpanish:true },
        { key:'literature',  label:'Literature',             icon:'📚' },
        { key:'etymology',   label:'Etymology',              icon:'🔤', isEtym:true },
      ]},
      { id:'systems', label:'Systems & Society', icon:'🧠', items:[
        { key:'gameTheory',       label:'Game Theory',           icon:'♟️' },
        { key:'systemsThinking',  label:'Systems Thinking',      icon:'🔄' },
        { key:'historicalDecision',label:'Historical Decision',  icon:'⚖️' },
        { key:'behavioralEcon',   label:'Behavioral Economics',  icon:'📊' },
      ]},
    ];

    let html = '';

    sections.forEach(sec => {
      html += `<div class="section-header"><span class="section-title">${sec.icon} ${sec.label}</span><div class="section-line"></div></div>`;

      sec.items.forEach(item => {
        const d = data[item.key];
        if (!d) return;

        html += `<div class="px-16">
          <div class="card mb-8">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <span style="font-size:18px">${item.icon}</span>
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-3)">${item.label}</span>
            </div>`;

        if (item.isWord) {
          html += `<div style="font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;color:var(--teal);margin-bottom:4px">${d.word||''}</div>
            <div class="text-sm text-dim mb-8">${d.definition||''}</div>
            <div class="text-sm" style="font-style:italic">${d.usage||''}</div>`;
        } else if (item.isSpanish) {
          html += `<div style="font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;color:var(--teal);margin-bottom:4px">${d.word||''}</div>
            <div class="text-sm text-dim mb-8">${d.translation||''}</div>
            <div class="text-sm" style="font-style:italic">${d.example||''}</div>
            <div class="text-xs text-dim mt-4">${d.exampleEn||''}</div>`;
        } else if (item.isEtym) {
          html += `<div style="font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:700;color:var(--teal);margin-bottom:4px">${d.word||''}</div>
            <div class="text-sm text-dim mb-6">Origin: ${d.origin||''}</div>
            <div class="text-sm">${d.explanation||''}</div>`;
        } else {
          html += `<div class="text-sm" style="line-height:1.7">${d.fact||''}</div>
            ${d.source?`<div class="text-xs text-dim mt-6;font-family:var(--font-mono)">${d.source}</div>`:''}`;
        }

        html += '</div></div>';
      });
    });

    // Quiz section
    const questions = [...(data.quizQuestions||[]), ...(data.spanishQuizQuestions||[])];
    if (questions.length > 0) {
      html += `<div class="section-header"><span class="section-title">🧠 Quiz</span><div class="section-line"></div><span class="text-xs text-teal" style="margin-left:8px">${quiz.score}/${quiz.total} today</span></div>
        <div class="px-16 mb-16">
          <div class="card">
            ${questions.map((q, qi) => {
              const answered = quiz.answers && quiz.answers[qi] !== undefined;
              const correct = answered && quiz.answers[qi] === q.answer;
              return `<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)">
                <div class="text-sm" style="font-weight:600;margin-bottom:10px">${qi+1}. ${q.q}</div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  ${(q.options||[]).map((opt,oi) => {
                    let bg = 'var(--surface-2)', border = 'var(--border)', color = 'var(--text)';
                    if (answered) {
                      if (oi === q.answer) { bg='rgba(52,211,153,.15)'; border='var(--success)'; color='var(--success)'; }
                      else if (oi === quiz.answers[qi]) { bg='rgba(248,113,113,.1)'; border='var(--danger)'; color='var(--danger)'; }
                    }
                    return `<button ${answered?'disabled':''} onclick="CL.App._answerQuiz(${qi},${oi},${q.answer},'${(q.explanation||'').replace(/'/g,"\\'")}')"
                      style="padding:8px 12px;background:${bg};border:1px solid ${border};border-radius:8px;color:${color};font-size:13px;text-align:left;cursor:${answered?'default':'pointer'};font-family:var(--font-body)">${opt}</button>`;
                  }).join('')}
                </div>
                ${answered?`<div class="text-xs mt-6" style="color:${correct?'var(--success)':'var(--danger)'}">
                  ${correct?'✓ Correct!':'✕ Incorrect.'} ${q.explanation||''}
                </div>`:''}
              </div>`;
            }).join('')}
          </div>
        </div>`;
    }

    return html;
  },

  _answerQuiz(qi, selected, correct, explanation) {
    const quiz = CL.Storage.getQuizResults();
    if (!quiz.answers) quiz.answers = {};
    if (quiz.answers[qi] !== undefined) return; // already answered
    quiz.answers[qi] = selected;
    if (selected === correct) quiz.score = (quiz.score||0) + 1;
    quiz.total = Math.max(quiz.total||0, qi+1);
    CL.Storage.saveQuizResults(quiz);
    this.renderLearning();
  },


  // ============================================================
  // SETTINGS PAGE
  // ============================================================
  renderSettings() {
    const page = document.getElementById('page-settings');
    if (!page) return;
    const sched = CL.Storage.getSchedule();
    const showEs = CL.Storage.getSetting('showSpanish', true);
    const bilingualNotifs = CL.Storage.getSetting('bilingualNotifs', true);

    page.innerHTML = `
      <div class="page-header">
        <div><div class="app-wordmark">Christopher's Life</div><div class="header-title">Settings</div></div>
      </div>

      <!-- Language -->
      <div class="settings-group mt-16">
        <div class="settings-group-title">🇪🇸 Spanish / Español</div>
        <div>
          ${this.settingsToggle('Show Spanish translations', 'Throughout the app', showEs,
            "CL.Storage.saveSetting('showSpanish',this.checked);CL.App.renderPage(CL.App.page)")}
          ${this.settingsToggle('Bilingual notifications', 'English + Spanish', bilingualNotifs,
            "CL.Storage.saveSetting('bilingualNotifs',this.checked)")}
        </div>
      </div>

      <!-- Schedule -->
      <div class="settings-group">
        <div class="settings-group-title">⏰ Default Schedule</div>
        <div>
          ${[
            {k:'wake',           l:'Wake time'},
            {k:'breakfast',      l:'Breakfast'},
            {k:'morningSnack',   l:'Morning snack'},
            {k:'lunch',          l:'Lunch'},
            {k:'afternoonSnack', l:'Afternoon snack'},
            {k:'exercise',       l:'Exercise session'},
            {k:'dinner',         l:'Dinner'},
            {k:'bedtime',        l:'Target bedtime'},
          ].map(item => `
            <div class="settings-row">
              <div class="settings-label">${item.l}</div>
              <input type="time" value="${sched[item.k]?.time || sched[item.k] || ''}"
                style="font-family:var(--font-mono);font-size:14px;padding:6px 8px;background:var(--surface-2);border:1px solid var(--border-2);border-radius:6px;color:var(--text)"
                onchange="CL.Storage.saveSchedule({'${item.k}':{time:this.value,label:'${item.l}'}});CL.Notifications.schedule();CL.UI.showToast('✓ Updated')">
            </div>`).join('')}
        </div>
      </div>

      <!-- Nicotine offsets -->
      <div class="settings-group">
        <div class="settings-group-title">🚭 Nicotine Window Offsets</div>
        <div>
          ${[
            {k:'nicotinePreMeal',       l:'Before meals (min)',        def:15},
            {k:'nicotinePostMeal',      l:'After meals (min)',         def:30},
            {k:'nicotinePreExercise',   l:'Before exercise (min)',     def:30},
            {k:'nicotinePostExercise',  l:'After exercise (min)',      def:15},
            {k:'morningNicotineWindow', l:'Morning window (min after wake)', def:60},
            {k:'kitchenCloseOffset',    l:'Kitchen closes (min after dinner)', def:60},
            {k:'magnesiumOffset',       l:'Magnesium reminder (min before bedtime)', def:60},
          ].map(item => `
            <div class="settings-row">
              <div class="settings-label">${item.l}</div>
              <input type="number" min="0" max="120"
                value="${sched[item.k] !== undefined ? sched[item.k] : item.def}"
                style="width:64px;text-align:center;font-family:var(--font-mono);font-size:15px;font-weight:700;background:var(--surface-2);border:1px solid var(--border-2);border-radius:6px;color:var(--text);padding:6px"
                onchange="CL.Storage.saveSchedule({'${item.k}':parseInt(this.value)});CL.Notifications.schedule();CL.UI.showToast('✓ Updated')">
            </div>`).join('')}
        </div>
      </div>

      <!-- Audio -->
      <div class="settings-group">
        <div class="settings-group-title">🎵 Audio</div>
        <div>
          <div class="settings-row">
            <div><div class="settings-label">Brown noise → music gap</div><div class="settings-sublabel">Minutes of silence between</div></div>
            <input type="number" min="0" max="30" value="${CL.Storage.getSetting('bnGap',5)}"
              style="width:64px;text-align:center;font-family:var(--font-mono);font-size:15px;font-weight:700;background:var(--surface-2);border:1px solid var(--border-2);border-radius:6px;color:var(--text);padding:6px"
              onchange="CL.Storage.saveSetting('bnGap',parseInt(this.value))">
          </div>
          <div class="settings-row">
            <div><div class="settings-label">Spotify Client ID</div><div class="settings-sublabel">From developer.spotify.com</div></div>
            <input type="text" placeholder="paste here" value="${CL.Storage.getSetting('spotifyClientId','')}"
              style="width:130px;font-size:11px;background:var(--surface-2);border:1px solid var(--border-2);border-radius:6px;color:var(--text);padding:6px"
              onchange="CL.Storage.saveSetting('spotifyClientId',this.value.trim());CL.UI.showToast('✓ Saved')">
          </div>
        </div>
      </div>

      <!-- Galaxy Watch -->
      <div class="settings-group">
        <div class="settings-group-title">⌚ Galaxy Watch</div>
        <div class="settings-row">
          <div><div class="settings-label">Health Connect</div><div class="settings-sublabel">Steps, sleep, HRV, heart rate</div></div>
          <div>${CL.HealthConnect.statusHTML()}</div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="settings-group">
        <div class="settings-group-title">🔔 Notifications</div>
        <div>
          <div class="settings-row">
            <div><div class="settings-label">Permission</div><div class="settings-sublabel">${CL.Notifications.permission === 'granted' ? '✓ Granted' : 'Not granted — tap to enable'}</div></div>
            <button onclick="CL.Notifications.requestPermission().then(()=>CL.App.renderSettings())" class="btn btn-secondary btn-sm">
              ${CL.Notifications.permission === 'granted' ? '✓ On' : 'Enable'}
            </button>
          </div>
          <div class="settings-row">
            <div class="settings-label">Reschedule all notifications</div>
            <button onclick="CL.Notifications.schedule();CL.UI.showToast('✓ Rescheduled')" class="btn btn-secondary btn-sm">Reschedule</button>
          </div>
        </div>
      </div>

      <!-- Quick Reference -->
      <div class="settings-group">
        <div class="settings-group-title">📋 Quick Reference</div>
        <div>
          ${CL.REFERENCE_CARDS.map(card => `
            <div class="settings-row" onclick="CL.App.showRefCard('${card.id}')" style="cursor:pointer">
              <div class="settings-label">${card.icon} ${card.title}</div>
              <span style="color:var(--text-3)">›</span>
            </div>`).join('')}
          <div class="settings-row" onclick="CL.App.genDoctorPrep()" style="cursor:pointer">
            <div class="settings-label">🤖 Generate Appointment Prep</div>
            <span style="color:var(--text-3)">›</span>
          </div>
        </div>
      </div>

      <!-- Data -->
      <div class="settings-group">
        <div class="settings-group-title">🗄️ Data</div>
        <div>
          <div class="settings-row" onclick="CL.App.exportData()" style="cursor:pointer">
            <div class="settings-label">Export week data (JSON)</div>
            <span style="color:var(--text-3)">›</span>
          </div>
          <div class="settings-row" onclick="CL.App.confirmClearData()" style="cursor:pointer">
            <div class="settings-label" style="color:var(--danger)">Clear all data</div>
            <span style="color:var(--danger)">›</span>
          </div>
        </div>
      </div>

      <!-- About -->
      <div style="padding:24px 16px 48px;text-align:center">
        ${this.iconSVG(48)}
        <div style="font-family:'Playfair Display',Georgia,serif;font-size:16px;color:var(--teal);margin-top:10px">Christopher's Life</div>
        <div class="text-xs text-dim mt-4">v3.0 · Dark slate + teal · GitHub Pages PWA</div>
      </div>
    `;
  },

  settingsToggle(label, sublabel, value, onchange) {
    return `<div class="settings-row">
      <div><div class="settings-label">${label}</div><div class="settings-sublabel">${sublabel}</div></div>
      <label class="toggle">
        <input type="checkbox" ${value?'checked':''} onchange="${onchange}">
        <span class="toggle-slider"></span>
      </label>
    </div>`;
  },

  showRefCard(id) {
    const card = CL.REFERENCE_CARDS.find(c => c.id === id);
    if (!card) return;
    CL.UI.showModal(card.icon + ' ' + card.title, `
      ${card.content.map(section => `
        <div style="margin-bottom:16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--teal-dim);margin-bottom:6px">${section.label}</div>
          ${section.items.map(item => `<div style="font-size:13px;padding:5px 0;border-bottom:1px solid var(--border);color:var(--text-2)">${item}</div>`).join('')}
        </div>`).join('')}
      <button onclick="CL.UI.closeModal()" class="btn btn-secondary btn-full mt-8">Close</button>
    `);
  },

  exportData() {
    const data = CL.Storage.exportWeekData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cl-week-' + data.week + '.json'; a.click();
    URL.revokeObjectURL(url);
    CL.UI.showToast('✓ Data exported');
  },

  confirmClearData() {
    CL.UI.showModal('Clear All Data?', `
      <p style="color:var(--danger);margin-bottom:16px">Permanently deletes all tracked data, scans, logs, and settings. Cannot be undone.</p>
      <div style="display:flex;gap:8px">
        <button onclick="CL.UI.closeModal()" class="btn btn-secondary" style="flex:1">Cancel</button>
        <button onclick="CL.Storage.clearAll();CL.UI.closeModal();CL.App.navigate('insights');CL.UI.showToast('Data cleared')"
          class="btn btn-danger" style="flex:1">Clear Everything</button>
      </div>`);
  },

}; // END CL.App

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  try { CL.App.init(); }
  catch(e) {
    console.error('Boot failed:', e);
    document.getElementById('app').innerHTML = `
      <div style="padding:60px 24px;text-align:center;color:#e2eaf0;font-family:system-ui;background:#0c1419;min-height:100vh">
        <div style="font-size:36px;margin-bottom:16px">⚠️</div>
        <div style="font-size:18px;font-weight:700;color:#2dd4bf;margin-bottom:8px">Something went wrong</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:24px">${e.message}</div>
        <button onclick="localStorage.clear();location.reload()"
          style="background:#2dd4bf;color:#0c1419;border:none;border-radius:10px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer">
          Clear data &amp; reload
        </button>
      </div>`;
  }
});

console.log('✅ CL App v3 fully loaded');
