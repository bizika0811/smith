(function () {
  const STORAGE_KEY = "wordsprout-demo-state-v1";
  const STEP_FLOW = [
    { id: "look", label: "看", hint: "先认识单词和场景" },
    { id: "listen", label: "听", hint: "听一遍标准发音" },
    { id: "speak", label: "说", hint: "跟读并完成口语尝试" },
    { id: "spell", label: "写", hint: "输入完整拼写" },
    { id: "use", label: "用", hint: "放进句子里理解" }
  ];

  const TEXTBOOKS = [
    {
      id: "pep-primary",
      name: "人教版 PEP",
      tagline: "三年级上册同步单元",
      grades: [
        {
          id: "g3",
          label: "三年级",
          semesters: [
            {
              id: "g3-s1",
              label: "上学期",
              units: [
                {
                  id: "unit-1",
                  title: "Unit 1 Hello",
                  statusLabel: "适合首次演示",
                  intro: "从打招呼开始，先建立低负担的学习节奏。",
                  words: [
                    {
                      id: "hello",
                      text: "hello",
                      phonetic: "/he'loʊ/",
                      meaning: "你好",
                      prompt: "见面时说 hello。",
                      imageHint: "挥手打招呼的小朋友",
                      usageQuestion: "老师走进教室，最自然的开场白是？",
                      usageOptions: ["hello", "book", "seven", "blue"],
                      usageAnswer: "hello"
                    },
                    {
                      id: "goodbye",
                      text: "goodbye",
                      phonetic: "/ˌɡʊdˈbaɪ/",
                      meaning: "再见",
                      prompt: "放学时和同学说 goodbye。",
                      imageHint: "校门口挥手说再见",
                      usageQuestion: "放学回家前你会说？",
                      usageOptions: ["goodbye", "apple", "desk", "milk"],
                      usageAnswer: "goodbye"
                    },
                    {
                      id: "teacher",
                      text: "teacher",
                      phonetic: "/ˈtiːtʃər/",
                      meaning: "老师",
                      prompt: "给你上课的人是 teacher。",
                      imageHint: "拿着书本的英语老师",
                      usageQuestion: "Which word means 老师?",
                      usageOptions: ["teacher", "window", "rabbit", "juice"],
                      usageAnswer: "teacher"
                    }
                  ]
                },
                {
                  id: "unit-2",
                  title: "Unit 2 Numbers",
                  statusLabel: "适合复习演示",
                  intro: "通过数字词建立听说写一体化练习。",
                  words: [
                    {
                      id: "one",
                      text: "one",
                      phonetic: "/wʌn/",
                      meaning: "一",
                      prompt: "桌上有 one apple。",
                      imageHint: "桌上放着一个苹果",
                      usageQuestion: "How many apples are there? one.",
                      usageOptions: ["one", "green", "jump", "teacher"],
                      usageAnswer: "one"
                    },
                    {
                      id: "two",
                      text: "two",
                      phonetic: "/tuː/",
                      meaning: "二",
                      prompt: "two pencils 放在文具盒旁边。",
                      imageHint: "两支铅笔并排摆放",
                      usageQuestion: "I have ____ pencils.",
                      usageOptions: ["two", "milk", "chair", "read"],
                      usageAnswer: "two"
                    },
                    {
                      id: "three",
                      text: "three",
                      phonetic: "/θriː/",
                      meaning: "三",
                      prompt: "three books 放在书桌上。",
                      imageHint: "三本彩色绘本",
                      usageQuestion: "There are ____ books on the desk.",
                      usageOptions: ["three", "teacher", "blue", "run"],
                      usageAnswer: "three"
                    }
                  ]
                },
                {
                  id: "unit-3",
                  title: "Unit 3 Colors",
                  statusLabel: "可作为扩展单元",
                  intro: "颜色词适合图片联想和语境选择。",
                  words: [
                    {
                      id: "red",
                      text: "red",
                      phonetic: "/red/",
                      meaning: "红色",
                      prompt: "red apple 是红苹果。",
                      imageHint: "一颗鲜红的苹果",
                      usageQuestion: "What color is the apple?",
                      usageOptions: ["red", "three", "book", "hello"],
                      usageAnswer: "red"
                    },
                    {
                      id: "blue",
                      text: "blue",
                      phonetic: "/bluː/",
                      meaning: "蓝色",
                      prompt: "blue sky 是蓝天。",
                      imageHint: "晴天里的蓝色天空",
                      usageQuestion: "The sky is ___.",
                      usageOptions: ["blue", "one", "teacher", "milk"],
                      usageAnswer: "blue"
                    },
                    {
                      id: "yellow",
                      text: "yellow",
                      phonetic: "/ˈjel.oʊ/",
                      meaning: "黄色",
                      prompt: "yellow banana 是黄香蕉。",
                      imageHint: "熟透的黄色香蕉",
                      usageQuestion: "The banana is ___.",
                      usageOptions: ["yellow", "goodbye", "desk", "run"],
                      usageAnswer: "yellow"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  let state = loadState();
  let currentSession = null;
  let toastTimer = null;

  function defaultPlan() {
    return {
      newWordLimit: 2,
      reviewLimit: 3,
      timeLimitMinutes: 20,
      allowedStartHour: 7,
      allowedEndHour: 21,
      lockAfterDone: true
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return normalizeState(parsed);
      }
    } catch (error) {
      console.warn("Failed to load state", error);
    }
    return normalizeState({});
  }

  function normalizeState(input) {
    const firstUnit = getAllUnits()[0];
    return {
      selectedEditionId: input.selectedEditionId || TEXTBOOKS[0].id,
      selectedGradeId: input.selectedGradeId || TEXTBOOKS[0].grades[0].id,
      selectedSemesterId: input.selectedSemesterId || TEXTBOOKS[0].grades[0].semesters[0].id,
      selectedUnitId: input.selectedUnitId || firstUnit.id,
      dailyPlan: { ...defaultPlan(), ...(input.dailyPlan || {}) },
      wordProgress: input.wordProgress || {},
      dailyRecords: input.dailyRecords || {}
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getAllUnits() {
    return TEXTBOOKS.flatMap((edition) =>
      edition.grades.flatMap((grade) =>
        grade.semesters.flatMap((semester) => semester.units)
      )
    );
  }

  function getAllWords() {
    return getAllUnits().flatMap((unit) => unit.words.map((word) => ({ ...word, unitId: unit.id, unitTitle: unit.title })));
  }

  function getUnitById(unitId) {
    return getAllUnits().find((unit) => unit.id === unitId);
  }

  function getWordById(wordId) {
    return getAllWords().find((word) => word.id === wordId);
  }

  function getCurrentEdition() {
    return TEXTBOOKS.find((edition) => edition.id === state.selectedEditionId) || TEXTBOOKS[0];
  }

  function getCurrentGrade() {
    return getCurrentEdition().grades.find((grade) => grade.id === state.selectedGradeId) || getCurrentEdition().grades[0];
  }

  function getCurrentSemester() {
    return getCurrentGrade().semesters.find((semester) => semester.id === state.selectedSemesterId) || getCurrentGrade().semesters[0];
  }

  function getSelectedUnit() {
    return getUnitById(state.selectedUnitId) || getCurrentSemester().units[0];
  }

  function dayKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function todayKey() {
    return dayKey(new Date());
  }

  function ensureTodayRecord() {
    const key = todayKey();
    if (!state.dailyRecords[key]) {
      state.dailyRecords[key] = {
        learnedWordIds: [],
        reviewedWordIds: [],
        correctAnswers: 0,
        totalAnswers: 0,
        minutesSpent: 0,
        finished: false
      };
    }
    return state.dailyRecords[key];
  }

  function getTodayRecord() {
    return ensureTodayRecord();
  }

  function isAllowedNow() {
    const hour = new Date().getHours();
    return hour >= state.dailyPlan.allowedStartHour && hour < state.dailyPlan.allowedEndHour;
  }

  function formatHour(hour) {
    return `${String(hour).padStart(2, "0")}:00`;
  }

  function recordAttempt(isCorrect) {
    const today = getTodayRecord();
    today.totalAnswers += 1;
    if (isCorrect) {
      today.correctAnswers += 1;
    }
    saveState();
  }

  function addMinutes(value) {
    const today = getTodayRecord();
    today.minutesSpent += value;
    saveState();
  }

  function accuracyPercent(record) {
    if (!record.totalAnswers) {
      return 0;
    }
    return Math.round((record.correctAnswers / record.totalAnswers) * 100);
  }

  function computeTasks() {
    const unit = getSelectedUnit();
    const today = getTodayRecord();
    const now = Date.now();
    const newRemaining = Math.max(0, state.dailyPlan.newWordLimit - today.learnedWordIds.length);
    const reviewRemaining = Math.max(0, state.dailyPlan.reviewLimit - today.reviewedWordIds.length);
    const newWords = unit.words
      .filter((word) => !(state.wordProgress[word.id] && state.wordProgress[word.id].learned))
      .slice(0, newRemaining);

    const dueReviews = getAllWords()
      .filter((word) => {
        const progress = state.wordProgress[word.id];
        if (!progress || !progress.learned || !progress.nextReviewAt) {
          return false;
        }
        if (today.reviewedWordIds.includes(word.id)) {
          return false;
        }
        return new Date(progress.nextReviewAt).getTime() <= now;
      })
      .sort((a, b) => new Date(state.wordProgress[a.id].nextReviewAt) - new Date(state.wordProgress[b.id].nextReviewAt))
      .slice(0, reviewRemaining);

    const reachedTimeCap = today.minutesSpent >= state.dailyPlan.timeLimitMinutes;
    const allDone = today.finished ||
      (today.learnedWordIds.length > 0 || today.reviewedWordIds.length > 0) &&
      (newWords.length === 0 && dueReviews.length === 0 || reachedTimeCap);

    return {
      unit,
      today,
      newWords,
      dueReviews,
      newRemaining,
      reviewRemaining,
      reachedTimeCap,
      allDone
    };
  }

  function markDayFinished() {
    const today = getTodayRecord();
    today.finished = true;
    saveState();
  }

  function updateWordProgressAfterLearning(wordId, weakPenalty) {
    const now = new Date();
    state.wordProgress[wordId] = {
      learned: true,
      repetition: 0,
      intervalDays: 0,
      nextReviewAt: now.toISOString(),
      masteryLevel: Math.max(35, 58 - weakPenalty * 6),
      weakCount: weakPenalty,
      lastScore: "new",
      lastPracticedAt: now.toISOString()
    };

    const today = getTodayRecord();
    if (!today.learnedWordIds.includes(wordId)) {
      today.learnedWordIds.push(wordId);
    }
    addMinutes(4);
    saveState();
  }

  function applyReviewGrade(wordId, grade) {
    const progress = state.wordProgress[wordId];
    if (!progress) {
      return;
    }

    const now = new Date();
    const today = getTodayRecord();
    if (!today.reviewedWordIds.includes(wordId)) {
      today.reviewedWordIds.push(wordId);
    }

    if (grade === "remember") {
      progress.repetition += 1;
      progress.intervalDays = progress.repetition <= 1 ? 1 : Math.min(14, Math.max(2, progress.intervalDays * 2));
      progress.masteryLevel = Math.min(100, progress.masteryLevel + 12);
      progress.weakCount = Math.max(0, progress.weakCount - 1);
      progress.lastScore = "记住了";
      progress.nextReviewAt = new Date(now.getTime() + progress.intervalDays * 24 * 60 * 60 * 1000).toISOString();
      recordAttempt(true);
    } else if (grade === "fuzzy") {
      progress.repetition = Math.max(1, progress.repetition);
      progress.intervalDays = 1;
      progress.masteryLevel = Math.min(100, progress.masteryLevel + 4);
      progress.weakCount += 1;
      progress.lastScore = "有点模糊";
      progress.nextReviewAt = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
      recordAttempt(false);
    } else {
      progress.repetition = 0;
      progress.intervalDays = 0;
      progress.masteryLevel = Math.max(20, progress.masteryLevel - 10);
      progress.weakCount += 2;
      progress.lastScore = "忘了";
      progress.nextReviewAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
      recordAttempt(false);
    }

    progress.lastPracticedAt = now.toISOString();
    addMinutes(2);
    saveState();
  }

  function getWeakWords(limit) {
    return getAllWords()
      .filter((word) => state.wordProgress[word.id])
      .sort((a, b) => {
        const weakDiff = (state.wordProgress[b.id].weakCount || 0) - (state.wordProgress[a.id].weakCount || 0);
        if (weakDiff !== 0) {
          return weakDiff;
        }
        return state.wordProgress[a.id].masteryLevel - state.wordProgress[b.id].masteryLevel;
      })
      .slice(0, limit);
  }

  function lastSevenDayRecords() {
    const results = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = dayKey(date);
      results.push({
        key,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        record: state.dailyRecords[key] || {
          learnedWordIds: [],
          reviewedWordIds: [],
          correctAnswers: 0,
          totalAnswers: 0,
          minutesSpent: 0,
          finished: false
        }
      });
    }
    return results;
  }

  function weekSummary() {
    return lastSevenDayRecords().reduce(
      (acc, item) => {
        acc.learned += item.record.learnedWordIds.length;
        acc.reviewed += item.record.reviewedWordIds.length;
        acc.minutes += item.record.minutesSpent;
        acc.correct += item.record.correctAnswers;
        acc.total += item.record.totalAnswers;
        return acc;
      },
      { learned: 0, reviewed: 0, minutes: 0, correct: 0, total: 0 }
    );
  }

  function currentRoute() {
    const raw = window.location.hash.replace(/^#/, "") || "/";
    return raw;
  }

  function routeName() {
    const route = currentRoute();
    if (route.startsWith("/learn/session")) {
      return "session";
    }
    if (route.startsWith("/review")) {
      return "review";
    }
    if (route.startsWith("/learn/select")) {
      return "select";
    }
    if (route.startsWith("/learn/today")) {
      return "today";
    }
    if (route.startsWith("/done")) {
      return "done";
    }
    if (route.startsWith("/parent")) {
      return "parent";
    }
    return "home";
  }

  function go(route) {
    window.location.hash = route;
  }

  function showToast(message) {
    const target = document.getElementById("toast-line");
    if (!target) {
      return;
    }
    target.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      target.textContent = "";
    }, 2600);
  }

  function buildHeader(route) {
    const links = [
      { id: "home", label: "首页", route: "/" },
      { id: "select", label: "教材选择", route: "/learn/select" },
      { id: "today", label: "今日任务", route: "/learn/today" },
      { id: "parent", label: "家长页", route: "/parent" }
    ];

    return `
      <div class="topbar">
        <div class="brand">
          <div class="brand-mark" aria-hidden="true"></div>
          <div class="brand-copy">
            <h1>WordSprout</h1>
            <p>教材同步 + 科学记忆 + 学完即走</p>
          </div>
        </div>
        <div class="top-actions">
          ${links.map((item) => `
            <button class="nav-btn ${route === item.id ? "active" : ""}" data-route="${item.route}">
              ${item.label}
            </button>
          `).join("")}
          <button class="nav-btn" data-action="reset-demo">重置演示</button>
        </div>
      </div>
      <div id="toast-line" class="muted" style="min-height:22px; margin: 0 0 14px 2px;"></div>
    `;
  }

  function renderHome() {
    const tasks = computeTasks();
    const today = tasks.today;
    return `
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">MVP Demo Flow</div>
          <h2>让小学生按教材学单词，不被无关内容打断。</h2>
          <p>
            这个页面原型根据 WordSprout-docs 直接落地，包含首页、教材入口、今日任务、五步学习流、复习页、完成页和家长查看页。
            所有数据先用本地 mock 和浏览器存储驱动，适合课程展示和下一步正式开发。
          </p>
          <div class="hero-actions">
            <button class="cta" data-route="/learn/select">开始学习</button>
            <button class="ghost-btn" data-route="/parent">家长查看</button>
          </div>
        </div>
        <div class="hero-side">
          <div class="hero-tiles">
            <div class="hero-tile">
              <strong>${tasks.newWords.length}</strong>
              <span>今日新词待学</span>
            </div>
            <div class="hero-tile">
              <strong>${tasks.dueReviews.length}</strong>
              <span>今日复习待做</span>
            </div>
            <div class="hero-tile">
              <strong>${today.learnedWordIds.length}</strong>
              <span>今天已学</span>
            </div>
            <div class="hero-tile">
              <strong>${accuracyPercent(today)}%</strong>
              <span>今天正确率</span>
            </div>
          </div>
          <div class="notice">
            <strong>今日规则</strong>
            <div class="muted">
              新词上限 ${state.dailyPlan.newWordLimit} 个，复习上限 ${state.dailyPlan.reviewLimit} 个，
              建议时段 ${formatHour(state.dailyPlan.allowedStartHour)} - ${formatHour(state.dailyPlan.allowedEndHour)}。
            </div>
          </div>
        </div>
      </section>

      <div class="section-head">
        <div>
          <h2>演示链路</h2>
          <p>按照文档里的核心路径组织，让课程展示更直接。</p>
        </div>
      </div>

      <section class="route-grid">
        <article class="card">
          <span class="badge">入口</span>
          <h3>首页</h3>
          <p class="muted">一句定位说明，配合两个主入口：开始学习与家长查看。</p>
        </article>
        <article class="card">
          <span class="badge">Step 3</span>
          <h3>教材选择</h3>
          <p class="muted">同步教材版本、年级、学期和单元状态，让学生不会掉进泛词书里。</p>
        </article>
        <article class="card">
          <span class="badge">Step 4</span>
          <h3>今日任务 + 学习页</h3>
          <p class="muted">先看今天要学什么，再按 看/听/说/写/用 走完完整链路。</p>
        </article>
      </section>

      <section class="grid-3" style="margin-top:16px;">
        <article class="timeline-card">
          <h3>学习流程</h3>
          <div class="timeline">
            ${STEP_FLOW.map((step, index) => `
              <div class="timeline-step">
                <div class="step-index">${index + 1}</div>
                <div>
                  <strong>${step.label}</strong>
                  <div class="muted">${step.hint}</div>
                </div>
                <span class="badge">${step.id}</span>
              </div>
            `).join("")}
          </div>
        </article>
        <article class="card">
          <h3>当前演示单元</h3>
          <p><strong>${tasks.unit.title}</strong></p>
          <p class="muted">${tasks.unit.intro}</p>
          <div class="inline-list">
            <span class="badge">${tasks.unit.words.length} 个样例词</span>
            <span class="badge warning">${tasks.unit.statusLabel}</span>
          </div>
        </article>
        <article class="card">
          <h3>为什么适合课程展示</h3>
          <ul class="parent-list">
            <li>页面已可点击操作，不只是设计稿。</li>
            <li>学习记录会进入本地状态，家长页能看到变化。</li>
            <li>任务上限和学习时段会影响实际入口行为。</li>
          </ul>
        </article>
      </section>
    `;
  }

  function renderSelect() {
    const semester = getCurrentSemester();
    const unit = getSelectedUnit();
    return `
      <div class="section-head">
        <div>
          <h2>教材选择</h2>
          <p>先选择教材，再决定今天进入哪个单元。</p>
        </div>
        <span class="badge">/learn/select</span>
      </div>

      <section class="card" style="margin-bottom:16px;">
        <div class="select-stack">
          <div class="field">
            <label>教材版本</label>
            <select data-setting="edition">
              ${TEXTBOOKS.map((edition) => `
                <option value="${edition.id}" ${edition.id === state.selectedEditionId ? "selected" : ""}>${edition.name}</option>
              `).join("")}
            </select>
          </div>
          <div class="field">
            <label>年级</label>
            <select data-setting="grade">
              ${getCurrentEdition().grades.map((grade) => `
                <option value="${grade.id}" ${grade.id === state.selectedGradeId ? "selected" : ""}>${grade.label}</option>
              `).join("")}
            </select>
          </div>
          <div class="field">
            <label>学期</label>
            <select data-setting="semester">
              ${getCurrentGrade().semesters.map((item) => `
                <option value="${item.id}" ${item.id === state.selectedSemesterId ? "selected" : ""}>${item.label}</option>
              `).join("")}
            </select>
          </div>
          <div class="field">
            <label>当前入口</label>
            <div class="notice" style="margin:0;">
              <strong>${unit.title}</strong>
              <div class="muted">${unit.statusLabel}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="unit-grid">
        ${semester.units.map((item) => {
          const learnedCount = item.words.filter((word) => state.wordProgress[word.id] && state.wordProgress[word.id].learned).length;
          const status = learnedCount === 0 ? "未开始" : learnedCount === item.words.length ? "已完成" : "学习中";
          return `
            <article class="unit-card ${item.id === unit.id ? "active" : ""}">
              <div class="unit-meta">
                <span class="badge">${status}</span>
                <span class="badge warning">${item.words.length} 个词</span>
              </div>
              <h3>${item.title}</h3>
              <p class="muted">${item.intro}</p>
              <p class="muted">已掌握 ${learnedCount}/${item.words.length}</p>
              <div class="step-actions">
                <button class="mini-btn" data-action="select-unit" data-unit="${item.id}">用这个单元</button>
                <button class="pill-btn sun" data-route="/learn/today" data-unit="${item.id}">看今日任务</button>
              </div>
            </article>
          `;
        }).join("")}
      </section>
    `;
  }

  function renderToday() {
    const tasks = computeTasks();
    const blocked = !isAllowedNow();
    const finished = tasks.allDone && state.dailyPlan.lockAfterDone;
    return `
      <div class="section-head">
        <div>
          <h2>今日任务</h2>
          <p>建议先复习，再开始新词。</p>
        </div>
        <span class="badge">/learn/today</span>
      </div>

      ${blocked ? `
        <div class="notice">
          <strong>当前不在允许学习时段</strong>
          <div class="muted">请在 ${formatHour(state.dailyPlan.allowedStartHour)} - ${formatHour(state.dailyPlan.allowedEndHour)} 之间开始新的学习会话。</div>
        </div>
      ` : ""}

      ${finished ? `
        <div class="notice">
          <strong>今天已经完成，建议现在收尾退出。</strong>
          <div class="muted">WordSprout 避免无限追加任务。你可以查看完成页或家长页。</div>
        </div>
      ` : ""}

      <section class="task-grid">
        <article class="task-card">
          <span class="badge">当前单元</span>
          <h3>${tasks.unit.title}</h3>
          <p class="muted">${tasks.unit.intro}</p>
          <div class="task-meta">
            <span class="badge warning">${tasks.unit.statusLabel}</span>
            <span class="badge">${tasks.unit.words.length} 个词</span>
          </div>
        </article>
        <article class="task-card">
          <span class="badge">新词任务</span>
          <strong>${tasks.newWords.length}</strong>
          <p class="muted">今日还可学习 ${tasks.newRemaining} 个新词，本单元尚未掌握的词会优先进入队列。</p>
        </article>
        <article class="task-card">
          <span class="badge">复习任务</span>
          <strong>${tasks.dueReviews.length}</strong>
          <p class="muted">到期词会按建议时间优先出现，今日最多复习 ${state.dailyPlan.reviewLimit} 个。</p>
        </article>
      </section>

      <section class="grid-2" style="margin-top:16px;">
        <article class="card">
          <h3>今日进度</h3>
          <ul class="summary-list">
            <li>已学新词：${tasks.today.learnedWordIds.length} 个</li>
            <li>已做复习：${tasks.today.reviewedWordIds.length} 个</li>
            <li>当前正确率：${accuracyPercent(tasks.today)}%</li>
            <li>估算学习时长：${tasks.today.minutesSpent} 分钟</li>
          </ul>
        </article>
        <article class="card">
          <h3>操作入口</h3>
          <div class="step-actions">
            <button class="cta" data-action="start-review" ${blocked || tasks.dueReviews.length === 0 || finished ? "disabled" : ""}>先做复习</button>
            <button class="ghost-btn" data-action="start-learning" ${blocked || tasks.newWords.length === 0 || finished ? "disabled" : ""}>开始学新词</button>
          </div>
          <div class="step-actions" style="margin-top:12px;">
            <button class="mini-btn" data-route="/done">看完成页</button>
            <button class="mini-btn" data-route="/parent">去家长页</button>
          </div>
        </article>
      </section>
    `;
  }

  function currentWordProgressText(word) {
    const progress = state.wordProgress[word.id];
    if (!progress) {
      return "第一次见面";
    }
    return `掌握度 ${progress.masteryLevel}% · 下次复习 ${new Date(progress.nextReviewAt).toLocaleString("zh-CN")}`;
  }

  function renderSession() {
    if (!currentSession || currentSession.mode !== "learn") {
      go("/learn/today");
      return "";
    }

    const word = currentSession.queue[currentSession.wordIndex];
    const step = STEP_FLOW[currentSession.stepIndex];
    const completedSteps = STEP_FLOW.reduce((count, item, index) => count + (index < currentSession.stepIndex ? 1 : 0), 0);

    const stepContent = renderStepContent(word, step);
    return `
      <div class="section-head">
        <div>
          <h2>五步学习流</h2>
          <p>${getSelectedUnit().title} · 第 ${currentSession.wordIndex + 1} / ${currentSession.queue.length} 个单词</p>
        </div>
        <span class="badge">/learn/session/:unitId</span>
      </div>
      <section class="session-shell">
        <article class="word-card">
          <div class="word-title">
            <div>
              <h2>${word.text}</h2>
              <div class="phonetic">${word.phonetic} · ${word.meaning}</div>
            </div>
            <span class="badge">${currentWordProgressText(word)}</span>
          </div>
          <div class="image-chip">场景提示 · ${word.imageHint}</div>
          <div class="prompt-box">
            <strong>场景锚点</strong>
            <div class="muted">${word.prompt}</div>
          </div>
          <div class="prompt-box">
            <strong>当前步骤</strong>
            <div class="muted">${step.label} · ${step.hint}</div>
          </div>
        </article>
        <article class="step-card">
          <div class="badge warning">已完成 ${completedSteps}/5</div>
          <h3>${step.label}</h3>
          ${stepContent}
        </article>
      </section>

      <section class="timeline-card" style="margin-top:16px;">
        <h3>步骤进度</h3>
        <div class="timeline">
          ${STEP_FLOW.map((item, index) => `
            <div class="timeline-step">
              <div class="step-index ${index < currentSession.stepIndex ? "done" : index === currentSession.stepIndex ? "current" : ""}">
                ${index + 1}
              </div>
              <div>
                <strong>${item.label}</strong>
                <div class="muted">${item.hint}</div>
              </div>
              <span class="badge">${index < currentSession.stepIndex ? "已完成" : index === currentSession.stepIndex ? "进行中" : "未开始"}</span>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderStepContent(word, step) {
    if (step.id === "look") {
      return `
        <p class="muted">先看单词、音标和中文，把词和画面连在一起，再进入下一步。</p>
        <div class="step-actions single">
          <button class="cta" data-action="advance-step">我看懂了，下一步</button>
        </div>
      `;
    }

    if (step.id === "listen") {
      return `
        <p class="muted">这里先用浏览器朗读降级模拟发音播放。正式版可替换为真实音频资源。</p>
        <div class="step-actions">
          <button class="ghost-btn" data-action="play-audio">播放发音</button>
          <button class="cta" data-action="complete-listen" ${currentSession.listenDone ? "" : "disabled"}>我听清楚了</button>
        </div>
        ${currentSession.listenDone ? '<div class="feedback success">已完成听音步骤。</div>' : ""}
      `;
    }

    if (step.id === "speak") {
      return `
        <p class="muted">如果麦克风权限不可用，允许走“我已跟读”降级路径，并记录为演示版尝试。</p>
        <div class="prompt-box">
          请大声跟读：<strong>${word.text}</strong>
        </div>
        <div class="step-actions">
          <button class="ghost-btn" data-action="try-mic">检查麦克风</button>
          <button class="cta" data-action="complete-speak">我已跟读</button>
        </div>
        ${currentSession.speakFeedback ? `<div class="feedback">${currentSession.speakFeedback}</div>` : ""}
      `;
    }

    if (step.id === "spell") {
      return `
        <p class="muted">输入完整单词，直到拼写正确才能进入下一步。</p>
        <form id="spell-form">
          <div class="field">
            <label>请输入单词拼写</label>
            <input type="text" id="spell-input" value="${currentSession.spellValue}" autocomplete="off" spellcheck="false">
          </div>
          <div class="step-actions">
            <button class="ghost-btn" type="submit">提交拼写</button>
            <button class="cta" type="button" data-action="advance-step" ${currentSession.spellPassed ? "" : "disabled"}>进入“用”步骤</button>
          </div>
        </form>
        ${currentSession.spellFeedback ? `<div class="feedback ${currentSession.spellPassed ? "success" : "error"}">${currentSession.spellFeedback}</div>` : ""}
      `;
    }

    return `
      <p class="muted">${word.usageQuestion}</p>
      <div class="choice-grid">
        ${word.usageOptions.map((option) => `
          <button class="choice-btn ${currentSession.selectedUsage === option ? "active" : ""}" data-action="pick-usage" data-option="${option}">
            ${option}
          </button>
        `).join("")}
      </div>
      <div class="step-actions">
        <button class="ghost-btn" data-action="check-usage" ${currentSession.selectedUsage ? "" : "disabled"}>提交选择</button>
        <button class="cta" data-action="finish-word" ${currentSession.usagePassed ? "" : "disabled"}>完成这个单词</button>
      </div>
      ${currentSession.usageFeedback ? `<div class="feedback ${currentSession.usagePassed ? "success" : "error"}">${currentSession.usageFeedback}</div>` : ""}
    `;
  }

  function renderReview() {
    const tasks = computeTasks();
    if (!currentSession || currentSession.mode !== "review") {
      if (tasks.dueReviews.length === 0) {
        return `
          <div class="section-head">
            <div>
              <h2>复习页</h2>
              <p>当前没有到期复习任务。</p>
            </div>
            <span class="badge">/review</span>
          </div>
          <div class="empty">先学几个新词，系统就会生成可演示的复习任务。</div>
        `;
      }
      go("/learn/today");
      return "";
    }

    const word = currentSession.queue[currentSession.wordIndex];
    const progress = state.wordProgress[word.id];
    return `
      <div class="section-head">
        <div>
          <h2>复习任务</h2>
          <p>第 ${currentSession.wordIndex + 1} / ${currentSession.queue.length} 个到期单词</p>
        </div>
        <span class="badge">/review</span>
      </div>

      <section class="review-shell">
        <article class="word-card">
          <div class="word-title">
            <div>
              <h2>${word.text}</h2>
              <div class="phonetic">${word.phonetic} · ${word.meaning}</div>
            </div>
            <span class="badge warning">掌握度 ${progress.masteryLevel}%</span>
          </div>
          <div class="prompt-box">
            <strong>回忆提示</strong>
            <div class="muted">${word.prompt}</div>
          </div>
          <div class="prompt-box">
            <strong>上次结果</strong>
            <div class="muted">${progress.lastScore || "新词初始化"} · 下次复习时间 ${new Date(progress.nextReviewAt).toLocaleString("zh-CN")}</div>
          </div>
        </article>
        <article class="step-card">
          <h3>这次感觉怎么样？</h3>
          <p class="muted">第一版用三档评分模拟简化版 SM-2 调度。</p>
          <div class="review-actions">
            <button class="score-btn leaf" data-action="grade-review" data-grade="remember">记住了</button>
            <button class="score-btn sun" data-action="grade-review" data-grade="fuzzy">有点模糊</button>
            <button class="score-btn berry" data-action="grade-review" data-grade="forgot">忘了</button>
          </div>
        </article>
      </section>
    `;
  }

  function renderDone() {
    const today = getTodayRecord();
    const weakWords = getWeakWords(3);
    return `
      <div class="section-head">
        <div>
          <h2>今天完成啦</h2>
          <p>达到上限后不再无限追加任务，这是 WordSprout 的核心边界。</p>
        </div>
        <span class="badge">/done</span>
      </div>

      <section class="metrics">
        <article class="metric-card">
          <span class="badge">新学单词</span>
          <strong>${today.learnedWordIds.length}</strong>
          <div class="muted">达到就收尾，不继续刷屏。</div>
        </article>
        <article class="metric-card">
          <span class="badge">复习单词</span>
          <strong>${today.reviewedWordIds.length}</strong>
          <div class="muted">复习数量受每日上限控制。</div>
        </article>
        <article class="metric-card">
          <span class="badge">正确率</span>
          <strong>${accuracyPercent(today)}%</strong>
          <div class="muted">来自拼写、语境题和复习评分。</div>
        </article>
      </section>

      <section class="grid-2" style="margin-top:16px;">
        <article class="card">
          <h3>成长反馈</h3>
          <p class="muted">
            ${accuracyPercent(today) >= 85 ? "今天的表现很稳，说明你不只是看懂，还能主动回忆出来。" :
              accuracyPercent(today) >= 60 ? "今天已经走完整条学习链路，明天继续复习会更牢。" :
              "今天先把流程跑通了，接下来多做几次复习，记忆会更稳。"}
          </p>
          <div class="step-actions">
            <button class="cta" data-route="/">返回首页</button>
            <button class="ghost-btn" data-route="/parent">查看家长页</button>
          </div>
        </article>
        <article class="card">
          <h3>薄弱词提醒</h3>
          ${weakWords.length ? `
            <ul class="weak-list">
              ${weakWords.map((word) => `
                <li class="weak-word">
                  <span>${word.text} · ${word.meaning}</span>
                  <span class="badge alert">薄弱 ${state.wordProgress[word.id].weakCount}</span>
                </li>
              `).join("")}
            </ul>
          ` : '<div class="empty">今天还没有形成薄弱词数据。</div>'}
        </article>
      </section>
    `;
  }

  function renderParent() {
    const today = getTodayRecord();
    const week = weekSummary();
    const weakWords = getWeakWords(5);
    return `
      <div class="section-head">
        <div>
          <h2>家长页</h2>
          <p>先给出轻量、可解释的学习摘要，再允许修改每日规则。</p>
        </div>
        <span class="badge">/parent</span>
      </div>

      <section class="parent-layout">
        <div class="parent-card">
          <h3>学习摘要</h3>
          <div class="grid-2">
            <div class="metric-card">
              <span class="badge">今日完成</span>
              <strong>${today.learnedWordIds.length + today.reviewedWordIds.length}</strong>
              <div class="muted">新词 ${today.learnedWordIds.length} · 复习 ${today.reviewedWordIds.length}</div>
            </div>
            <div class="metric-card">
              <span class="badge">本周时长</span>
              <strong>${week.minutes} 分钟</strong>
              <div class="muted">适合做基础陪伴，不像后台报表那样重。</div>
            </div>
          </div>
          <ul class="summary-list" style="margin-top:14px;">
            <li>今日正确率：${accuracyPercent(today)}%</li>
            <li>本周新词：${week.learned} 个</li>
            <li>本周复习：${week.reviewed} 个</li>
            <li>本周综合正确率：${week.total ? Math.round((week.correct / week.total) * 100) : 0}%</li>
          </ul>
        </div>

        <form class="parent-card" id="plan-form">
          <h3>每日规则设置</h3>
          <div class="plan-grid">
            <div class="field">
              <label>新词上限</label>
              <input type="number" name="newWordLimit" min="1" max="10" value="${state.dailyPlan.newWordLimit}">
            </div>
            <div class="field">
              <label>复习上限</label>
              <input type="number" name="reviewLimit" min="1" max="10" value="${state.dailyPlan.reviewLimit}">
            </div>
            <div class="field">
              <label>每日时长上限（分钟）</label>
              <input type="number" name="timeLimitMinutes" min="5" max="60" value="${state.dailyPlan.timeLimitMinutes}">
            </div>
            <div class="field">
              <label>允许开始时间</label>
              <input type="number" name="allowedStartHour" min="0" max="23" value="${state.dailyPlan.allowedStartHour}">
            </div>
            <div class="field">
              <label>允许结束时间</label>
              <input type="number" name="allowedEndHour" min="1" max="24" value="${state.dailyPlan.allowedEndHour}">
            </div>
            <div class="field">
              <label>学完锁定</label>
              <select name="lockAfterDone">
                <option value="true" ${state.dailyPlan.lockAfterDone ? "selected" : ""}>开启</option>
                <option value="false" ${!state.dailyPlan.lockAfterDone ? "selected" : ""}>关闭</option>
              </select>
            </div>
          </div>
          <div class="step-actions" style="margin-top:12px;">
            <button class="cta" type="submit">保存规则</button>
            <button class="ghost-btn" type="button" data-route="/learn/today">回今日任务</button>
          </div>
        </form>
      </section>

      <section class="weak-grid" style="margin-top:16px;">
        <article class="parent-card">
          <h3>薄弱词</h3>
          ${weakWords.length ? `
            <ul class="weak-list">
              ${weakWords.map((word) => `
                <li class="weak-word">
                  <span>${word.text} · ${word.meaning}</span>
                  <span class="badge alert">掌握 ${state.wordProgress[word.id].masteryLevel}%</span>
                </li>
              `).join("")}
            </ul>
          ` : '<div class="empty">还没有薄弱词。先完成一轮学习或复习后这里会出现数据。</div>'}
        </article>
        <article class="parent-card">
          <h3>最近 7 天</h3>
          <ul class="parent-list">
            ${lastSevenDayRecords().map((item) => `
              <li>${item.label} · 新词 ${item.record.learnedWordIds.length} · 复习 ${item.record.reviewedWordIds.length} · 时长 ${item.record.minutesSpent} 分钟</li>
            `).join("")}
          </ul>
        </article>
        <article class="parent-card">
          <h3>当前统计口径</h3>
          <ul class="parent-list">
            <li>全部数据保存在浏览器本地，用于课程原型演示。</li>
            <li>时长为流程估算值，不是精确计时埋点。</li>
            <li>口语步骤当前是降级实现，正式版应接音频和录音能力。</li>
          </ul>
        </article>
      </section>
    `;
  }

  function renderApp() {
    const route = routeName();
    const app = document.getElementById("app");
    let body = "";

    if (route === "home") {
      body = renderHome();
    } else if (route === "select") {
      body = renderSelect();
    } else if (route === "today") {
      body = renderToday();
    } else if (route === "session") {
      body = renderSession();
    } else if (route === "review") {
      body = renderReview();
    } else if (route === "done") {
      body = renderDone();
    } else {
      body = renderParent();
    }

    app.innerHTML = `<main class="shell">${buildHeader(route)}${body}</main>`;
  }

  function startLearningSession() {
    const tasks = computeTasks();
    if (!isAllowedNow()) {
      showToast("当前不在允许学习时段。");
      return;
    }
    if (tasks.newWords.length === 0) {
      showToast("当前没有可学习的新词。");
      return;
    }
    currentSession = {
      mode: "learn",
      queue: tasks.newWords,
      wordIndex: 0,
      stepIndex: 0,
      spellValue: "",
      spellPassed: false,
      spellFeedback: "",
      selectedUsage: "",
      usagePassed: false,
      usageFeedback: "",
      listenDone: false,
      speakFeedback: "",
      weakPenalty: 0
    };
    go("/learn/session/" + getSelectedUnit().id);
  }

  function startReviewSession() {
    const tasks = computeTasks();
    if (!isAllowedNow()) {
      showToast("当前不在允许学习时段。");
      return;
    }
    if (tasks.dueReviews.length === 0) {
      showToast("当前没有到期复习任务。");
      return;
    }
    currentSession = {
      mode: "review",
      queue: tasks.dueReviews,
      wordIndex: 0
    };
    go("/review");
  }

  function resetStepDrafts() {
    currentSession.spellValue = "";
    currentSession.spellPassed = false;
    currentSession.spellFeedback = "";
    currentSession.selectedUsage = "";
    currentSession.usagePassed = false;
    currentSession.usageFeedback = "";
    currentSession.listenDone = false;
    currentSession.speakFeedback = "";
    currentSession.weakPenalty = 0;
  }

  function advanceStep() {
    currentSession.stepIndex += 1;
    renderApp();
  }

  function finishCurrentWord() {
    const word = currentSession.queue[currentSession.wordIndex];
    updateWordProgressAfterLearning(word.id, currentSession.weakPenalty);
    currentSession.wordIndex += 1;

    if (currentSession.wordIndex >= currentSession.queue.length) {
      currentSession = null;
      const tasks = computeTasks();
      if (tasks.dueReviews.length > 0 && tasks.today.reviewedWordIds.length < state.dailyPlan.reviewLimit) {
        startReviewSession();
      } else {
        if (tasks.allDone || state.dailyPlan.lockAfterDone) {
          markDayFinished();
          go("/done");
        } else {
          go("/learn/today");
        }
      }
      return;
    }

    currentSession.stepIndex = 0;
    resetStepDrafts();
    renderApp();
  }

  function handleReviewGrade(grade) {
    const word = currentSession.queue[currentSession.wordIndex];
    applyReviewGrade(word.id, grade);
    currentSession.wordIndex += 1;
    if (currentSession.wordIndex >= currentSession.queue.length) {
      currentSession = null;
      const tasks = computeTasks();
      if (tasks.newWords.length > 0 && !tasks.reachedTimeCap && !tasks.today.finished) {
        go("/learn/today");
      } else {
        markDayFinished();
        go("/done");
      }
      return;
    }
    renderApp();
  }

  function handleRouteButton(button) {
    if (button.dataset.unit) {
      state.selectedUnitId = button.dataset.unit;
      saveState();
    }
    go(button.dataset.route);
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target) {
      return;
    }

    if (target.dataset.route) {
      handleRouteButton(target);
      return;
    }

    const action = target.dataset.action;
    if (!action) {
      return;
    }

    if (action === "reset-demo") {
      localStorage.removeItem(STORAGE_KEY);
      state = normalizeState({});
      currentSession = null;
      saveState();
      renderApp();
      showToast("演示数据已重置。");
      return;
    }

    if (action === "select-unit") {
      state.selectedUnitId = target.dataset.unit;
      saveState();
      renderApp();
      showToast("已切换单元。");
      return;
    }

    if (action === "start-learning") {
      startLearningSession();
      return;
    }

    if (action === "start-review") {
      startReviewSession();
      return;
    }

    if (action === "advance-step") {
      advanceStep();
      return;
    }

    if (action === "play-audio") {
      const word = currentSession.queue[currentSession.wordIndex];
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(word.text);
        utterance.lang = "en-US";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
      currentSession.listenDone = true;
      renderApp();
      return;
    }

    if (action === "complete-listen") {
      advanceStep();
      return;
    }

    if (action === "try-mic") {
      currentSession.speakFeedback = "演示版未接真实录音，已按降级路径处理。正式版可接浏览器录音和打分服务。";
      renderApp();
      return;
    }

    if (action === "complete-speak") {
      currentSession.speakFeedback = "已记录一次跟读尝试。";
      currentSession.weakPenalty += 0;
      advanceStep();
      return;
    }

    if (action === "pick-usage") {
      currentSession.selectedUsage = target.dataset.option;
      renderApp();
      return;
    }

    if (action === "check-usage") {
      const word = currentSession.queue[currentSession.wordIndex];
      const correct = currentSession.selectedUsage === word.usageAnswer;
      recordAttempt(correct);
      if (correct) {
        currentSession.usagePassed = true;
        currentSession.usageFeedback = "选对了，可以完成这个单词。";
      } else {
        currentSession.usagePassed = false;
        currentSession.usageFeedback = "还不对，再看看场景提示。";
        currentSession.weakPenalty += 1;
      }
      renderApp();
      return;
    }

    if (action === "finish-word") {
      finishCurrentWord();
      return;
    }

    if (action === "grade-review") {
      handleReviewGrade(target.dataset.grade);
    }
  }

  function handleChange(event) {
    const target = event.target;
    if (target.matches("select[data-setting='edition']")) {
      state.selectedEditionId = target.value;
      state.selectedGradeId = getCurrentEdition().grades[0].id;
      state.selectedSemesterId = getCurrentEdition().grades[0].semesters[0].id;
      state.selectedUnitId = getCurrentEdition().grades[0].semesters[0].units[0].id;
      saveState();
      renderApp();
      return;
    }

    if (target.matches("select[data-setting='grade']")) {
      state.selectedGradeId = target.value;
      state.selectedSemesterId = getCurrentGrade().semesters[0].id;
      state.selectedUnitId = getCurrentGrade().semesters[0].units[0].id;
      saveState();
      renderApp();
      return;
    }

    if (target.matches("select[data-setting='semester']")) {
      state.selectedSemesterId = target.value;
      state.selectedUnitId = getCurrentSemester().units[0].id;
      saveState();
      renderApp();
      return;
    }

    if (target.id === "spell-input" && currentSession) {
      currentSession.spellValue = target.value;
    }
  }

  function handleSubmit(event) {
    if (event.target.id === "spell-form") {
      event.preventDefault();
      const word = currentSession.queue[currentSession.wordIndex];
      const normalized = currentSession.spellValue.trim().toLowerCase();
      const correct = normalized === word.text.toLowerCase();
      recordAttempt(correct);
      if (correct) {
        currentSession.spellPassed = true;
        currentSession.spellFeedback = "拼写正确，继续进入“用”步骤。";
      } else {
        currentSession.spellPassed = false;
        currentSession.spellFeedback = `还差一点，提示：这个词共有 ${word.text.length} 个字母。`;
        currentSession.weakPenalty += 1;
      }
      renderApp();
      return;
    }

    if (event.target.id === "plan-form") {
      event.preventDefault();
      const form = new FormData(event.target);
      const nextPlan = {
        newWordLimit: clampNumber(form.get("newWordLimit"), 1, 10),
        reviewLimit: clampNumber(form.get("reviewLimit"), 1, 10),
        timeLimitMinutes: clampNumber(form.get("timeLimitMinutes"), 5, 60),
        allowedStartHour: clampNumber(form.get("allowedStartHour"), 0, 23),
        allowedEndHour: clampNumber(form.get("allowedEndHour"), 1, 24),
        lockAfterDone: form.get("lockAfterDone") === "true"
      };

      if (nextPlan.allowedEndHour <= nextPlan.allowedStartHour) {
        showToast("结束时间必须大于开始时间。");
        return;
      }

      state.dailyPlan = nextPlan;
      saveState();
      renderApp();
      showToast("每日规则已保存，并会影响今日任务。");
    }
  }

  function clampNumber(value, min, max) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return min;
    }
    return Math.min(max, Math.max(min, Math.round(numeric)));
  }

  window.addEventListener("hashchange", renderApp);
  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleChange);
  document.addEventListener("submit", handleSubmit);

  if (!window.location.hash) {
    window.location.hash = "/";
  }

  saveState();
  renderApp();
})();
