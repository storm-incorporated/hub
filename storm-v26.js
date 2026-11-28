// === STORM v26: CALENDAR SEASONAL LOGO ENGINE, 60 FPS SNOW, IP WEATHER & NEWS PULSE ===
(function () {
  const H_STORE = 'storm_holiday_cfg_v26';

  /**
   * Real-calendar seasonal stage:
   * - Nov 20 .. Dec 14: 'snow' (Заснеженный)
   * - Dec 15 .. Jan 14: 'decorated' (Новогодне украшенный)
   * - Jan 15 .. Feb 29: 'snow' (Обычный зимний заснеженный)
   * - Mar 1  .. Mar 31: 'melting' (Снег тает)
   * - Apr 1  .. Nov 19: 'clear' (Чистый, растаявший)
   */
  function getCalendarStage() {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    if ((m === 12 && d >= 15) || (m === 1 && d <= 14)) return 'decorated';
    if ((m === 11 && d >= 20) || m === 12 || m === 1 || m === 2) return 'snow';
    if (m === 3) return 'melting';
    return 'clear';
  }

  const STAGE_LABELS = {
    snow: '❄️ Зима · Заснеженный',
    decorated: '🎄 Новый год · Украшен',
    blizzard: '🌨️ Вьюга + декор',
    melting: '💧 Март · Снег тает',
    clear: '✨ Чистый стиль'
  };

  let hCfg = { snow: true, decor: true, lights: null, stageMode: 'auto' };
  try {
    const saved = JSON.parse(localStorage.getItem(H_STORE) || 'null');
    if (saved && typeof saved === 'object') hCfg = { ...hCfg, ...saved };
  } catch {}

  function resolvedStage() {
    return hCfg.stageMode === 'auto' ? getCalendarStage() : hCfg.stageMode;
  }

  function saveHCfg() {
    try { localStorage.setItem(H_STORE, JSON.stringify(hCfg)); } catch {}
  }

  function applyHolidayUI() {
    const stg = resolvedStage();
    const isClear = stg === 'clear';
    const lightsOn = hCfg.lights === null ? (stg === 'decorated' || stg === 'blizzard') : !!hCfg.lights;
    const snowOn = !isClear && !!hCfg.snow;
    const decorOn = !isClear && !!hCfg.decor;

    document.body.classList.toggle('holiday-snow-on', snowOn);
    document.body.classList.toggle('holiday-decor-on', decorOn);
    document.body.classList.toggle('holiday-lights-on', !isClear && lightsOn);
    document.body.setAttribute('data-holiday-stage', stg);

    const badge = document.getElementById('holidayStageBadge');
    if (badge) badge.textContent = STAGE_LABELS[stg] || STAGE_LABELS.snow;

    const hint = document.getElementById('holidayCycleHint');
    if (hint) hint.textContent = hCfg.stageMode === 'auto' ? 'Авто по календарю' : 'Ручной режим';

    document.getElementById('hSnowToggle')?.classList.toggle('on', snowOn);
    document.getElementById('hDecorToggle')?.classList.toggle('on', decorOn);
    document.getElementById('hLightsToggle')?.classList.toggle('on', !isClear && lightsOn);

    const mBtn = document.getElementById('hMasterToggle');
    if (mBtn) {
      const anyOn = snowOn || decorOn || (!isClear && lightsOn);
      mBtn.classList.toggle('on', anyOn);
      mBtn.textContent = anyOn ? '❄️ Зимний стиль: Вкл' : '❄️ Зимний стиль: Выкл';
    }

    document.querySelectorAll('#holidayStageBtns .h-stg').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.hstage === hCfg.stageMode);
    });
  }

  // Toggle holiday drawer
  document.getElementById('holidayDrawerBtn')?.addEventListener('click', () => {
    const dr = document.getElementById('holidayDrawer');
    const btn = document.getElementById('holidayDrawerBtn');
    if (!dr) return;
    dr.hidden = !dr.hidden;
    if (btn) {
      btn.setAttribute('aria-expanded', String(!dr.hidden));
      btn.textContent = dr.hidden ? '🎄 Сезонный пульт ▾' : '🎄 Сезонный пульт ▴';
    }
  });

  document.getElementById('hMasterToggle')?.addEventListener('click', () => {
    const anyOn = document.body.classList.contains('holiday-snow-on')
      || document.body.classList.contains('holiday-decor-on')
      || document.body.classList.contains('holiday-lights-on');
    const target = !anyOn;
    hCfg.snow = target;
    hCfg.decor = target;
    hCfg.lights = target;
    if (target && resolvedStage() === 'clear') hCfg.stageMode = 'snow';
    saveHCfg();
    applyHolidayUI();
  });

  document.getElementById('hSnowToggle')?.addEventListener('click', () => {
    hCfg.snow = !hCfg.snow;
    if (hCfg.snow && resolvedStage() === 'clear') hCfg.stageMode = 'snow';
    saveHCfg(); applyHolidayUI();
  });

  document.getElementById('hDecorToggle')?.addEventListener('click', () => {
    hCfg.decor = !hCfg.decor;
    if (hCfg.decor && resolvedStage() === 'clear') hCfg.stageMode = 'snow';
    saveHCfg(); applyHolidayUI();
  });

  document.getElementById('hLightsToggle')?.addEventListener('click', () => {
    const cur = document.body.classList.contains('holiday-lights-on');
    hCfg.lights = !cur;
    if (hCfg.lights && resolvedStage() === 'clear') hCfg.stageMode = 'decorated';
    saveHCfg(); applyHolidayUI();
  });

  document.querySelectorAll('#holidayStageBtns .h-stg').forEach(btn => {
    btn.addEventListener('click', () => {
      hCfg.stageMode = btn.dataset.hstage || 'auto';
      if (hCfg.stageMode !== 'clear') {
        hCfg.decor = true;
        hCfg.snow = true;
        hCfg.lights = (hCfg.stageMode === 'decorated' || hCfg.stageMode === 'blizzard');
      }
      saveHCfg(); applyHolidayUI();
    });
  });

  // Showcase navigation
  document.querySelectorAll('[data-go-sec]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof setSection === 'function') setSection(btn.dataset.goSec);
    });
  });
  document.getElementById('scrollToNewsBtn')?.addEventListener('click', () => {
    document.getElementById('newsPulseSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  applyHolidayUI();

  // --- 60 FPS Lightweight GPU Snowfall (delta-time normalized, pauses on hidden tab) ---
  const snowCanvas = document.getElementById('holidaySnowCanvas');
  if (snowCanvas && snowCanvas.getContext) {
    const sctx = snowCanvas.getContext('2d', { alpha: true });
    let sw = 0, sh = 0;
    const COUNT = window.innerWidth < 720 ? 38 : 68;
    const flakes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      r: 1.1 + Math.random() * 2.4,
      vy: 28 + Math.random() * 52,
      vx: (Math.random() - 0.5) * 18,
      ph: Math.random() * Math.PI * 2
    }));

    function resizeSnow() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      sw = window.innerWidth;
      sh = window.innerHeight;
      snowCanvas.width = Math.round(sw * dpr);
      snowCanvas.height = Math.round(sh * dpr);
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeSnow();
    window.addEventListener('resize', resizeSnow, { passive: true });

    let lastTs = performance.now();
    let elapsed = 0;
    function animSnow(now) {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      if (!document.hidden && document.body.classList.contains('holiday-snow-on') && document.body.getAttribute('data-fx') !== 'off') {
        elapsed += dt;
        sctx.clearRect(0, 0, sw, sh);
        const stg = resolvedStage();
        const isBlizzard = stg === 'blizzard';
        const isMelting = stg === 'melting';
        const mul = isBlizzard ? 1.7 : (isMelting ? 0.55 : 1.0);
        const wind = isBlizzard ? 55 : 10;

        sctx.fillStyle = isMelting ? 'rgba(186,230,253,0.42)' : 'rgba(240,249,255,0.78)';
        sctx.beginPath();
        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];
          f.y += f.vy * mul * dt;
          f.x += (f.vx + Math.sin(elapsed * 1.4 + f.ph) * 16 + wind) * mul * dt;
          if (f.y > sh + 8) { f.y = -8; f.x = Math.random() * sw; }
          if (f.x > sw + 8) f.x = -8;
          if (f.x < -8) f.x = sw + 8;
          sctx.moveTo(f.x + f.r, f.y);
          sctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        }
        sctx.fill();
      }
      requestAnimationFrame(animSnow);
    }
    requestAnimationFrame(animSnow);
  }

  // --- Home IP Mini-Weather Widget ---
  const MINI_W_CACHE = 'storm_ip_mini_weather_v1';
  let ipDetectedCity = null;

  async function fetchJsonTimeout(url, ms = 4500) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
    try {
      const r = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
      return r.ok ? await r.json() : null;
    } catch { return null; } finally { if (t) clearTimeout(t); }
  }

  async function detectLocationByIp() {
    const d1 = await fetchJsonTimeout('https://ipwho.is/?lang=ru', 4000);
    if (d1 && d1.success !== false && Number.isFinite(Number(d1.latitude)) && Number.isFinite(Number(d1.longitude))) {
      return { name: d1.city || d1.region || 'Ваш город', country: d1.country || '', lat: Number(d1.latitude), lon: Number(d1.longitude) };
    }
    const d2 = await fetchJsonTimeout('https://get.geojs.io/v1/ip/geo.json', 4000);
    if (d2 && Number.isFinite(parseFloat(d2.latitude)) && Number.isFinite(parseFloat(d2.longitude))) {
      return { name: d2.city || d2.region || 'Ваш город', country: d2.country || '', lat: parseFloat(d2.latitude), lon: parseFloat(d2.longitude) };
    }
    if (typeof state !== 'undefined' && state.city && Number.isFinite(state.city.lat)) return { ...state.city };
    return { name: 'Москва', country: 'Россия', lat: 55.7558, lon: 37.6173 };
  }

  function renderMiniWeather(data) {
    if (!data) return;
    const icoEl = document.getElementById('hmwIcon');
    const tmpEl = document.getElementById('hmwTemp');
    const cndEl = document.getElementById('hmwCond');
    const locEl = document.getElementById('hmwLoc');
    if (icoEl) icoEl.textContent = data.ico || '🌡️';
    if (tmpEl) tmpEl.textContent = `${data.temp > 0 ? '+' : ''}${Math.round(data.temp)}°C`;
    if (cndEl) cndEl.textContent = data.cond || 'Погода';
    if (locEl) locEl.textContent = `📍 ${data.city}${data.feels != null ? ` · ощущ. ${Math.round(data.feels)}°` : ''}`;
  }

  async function initHomeMiniWeather() {
    try {
      const cached = JSON.parse(localStorage.getItem(MINI_W_CACHE) || 'null');
      if (cached && Date.now() - cached.ts < 20 * 60 * 1000 && cached.data) {
        ipDetectedCity = cached.cityObj || null;
        renderMiniWeather(cached.data);
        return;
      }
    } catch {}
    const loc = await detectLocationByIp();
    ipDetectedCity = loc;
    const wd = await fetchJsonTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`, 6000);
    if (wd && wd.current) {
      const wmoMap = (typeof WMO !== 'undefined') ? WMO : {};
      const [ico, cond] = wmoMap[wd.current.weather_code] || ['🌤️', 'Переменная облачность'];
      const payload = { ico, cond, temp: wd.current.temperature_2m, feels: wd.current.apparent_temperature, city: loc.name };
      renderMiniWeather(payload);
      try { localStorage.setItem(MINI_W_CACHE, JSON.stringify({ ts: Date.now(), data: payload, cityObj: loc })); } catch {}
    } else {
      const cndEl = document.getElementById('hmwCond');
      const locEl = document.getElementById('hmwLoc');
      if (cndEl) cndEl.textContent = 'Открыть прогноз';
      if (locEl) locEl.textContent = `📍 ${loc.name}`;
    }
  }

  document.getElementById('homeMiniWeather')?.addEventListener('click', () => {
    if (ipDetectedCity && typeof state !== 'undefined' && !localStorage.getItem('storm_weather_city_v1')) {
      state.city = { name: ipDetectedCity.name, country: ipDetectedCity.country || '', lat: ipDetectedCity.lat, lon: ipDetectedCity.lon };
    }
    if (typeof setSection === 'function') setSection('weather');
  });
  initHomeMiniWeather();

  // --- News Pulse ("Пульс Storm") + Smart Ranking Algorithm ---
  const NEWS_CACHE_KEY = 'storm_news_pulse_cache_v33';
  const NEWS_PREF_KEY = 'storm_news_prefs_v29';
  const NEWS_TG_KEY = 'storm_news_tg_channels_v33';

  const DEFAULT_TG_CHANNELS = [
    { user: 'rozetked',     cat: 'tech',     label: 'Rozetked' },
    { user: 'droiderru',    cat: 'tech',     label: 'Droider' },
    { user: 'exploitex',    cat: 'tech',     label: 'Эксплойт' },
    { user: 'kod_ru',       cat: 'tech',     label: 'Код Дурова' },
    { user: 'dtf_games',    cat: 'games',    label: 'DTF Игры' },
    { user: 'stopgamenews', cat: 'games',    label: 'StopGame' },
    { user: 'vgtimes',      cat: 'games',    label: 'VGTimes' },
    { user: 'pekarnya',     cat: 'games',    label: 'Пекарня' },
    { user: 'nplusone',     cat: 'positive', label: 'N+1' },
    { user: 'nakedspace',   cat: 'positive', label: 'Naked Science' }
  ];

  const RSS_FEEDS = [
    // Техно и IT (6 источников)
    { cat: 'tech',     url: 'https://habr.com/ru/rss/news/?fl=ru',      source: 'Habr' },
    { cat: 'tech',     url: 'https://3dnews.ru/news/rss/',              source: '3DNews' },
    { cat: 'tech',     url: 'https://www.ixbt.com/export/news.rss',     source: 'iXBT' },
    { cat: 'tech',     url: 'https://overclockers.ru/rss/all.rss',      source: 'Overclockers' },
    { cat: 'tech',     url: 'https://hi-news.ru/feed',                  source: 'Hi-News' },
    { cat: 'tech',     url: 'https://rozetked.me/turbo',                source: 'Rozetked' },
    // Игры и релизы (4 источника)
    { cat: 'games',    url: 'https://stopgame.ru/rss/rss_news.xml',     source: 'StopGame' },
    { cat: 'games',    url: 'https://www.igromania.ru/rss/news.xml',    source: 'Игромания' },
    { cat: 'games',    url: 'https://vgtimes.ru/rss/news.xml',          source: 'VGTimes' },
    { cat: 'games',    url: 'https://www.playground.ru/rss/news.xml',   source: 'PlayGround' },
    // Наука и позитив (3 источника)
    { cat: 'positive', url: 'https://nplus1.ru/rss',                    source: 'N+1 Наука' },
    { cat: 'positive', url: 'https://naked-science.ru/feed',            source: 'Naked Science' },
    { cat: 'positive', url: 'https://postnauka.org/feed',               source: 'ПостНаука' }
  ];

  const FALLBACK_NEWS = [
    { cat: 'tech', badge: 'ОФЛАЙН', badgeCls: 'nb-tech', ts: 0, title: 'Нет связи с техно-лентами и Telegram', desc: 'Нажми ↻ чтобы загрузить свежие материалы с Habr, 3DNews, iXBT и TG-каналов.', source: 'Локальный режим', url: 'https://habr.com/ru/news/', isTg: false },
    { cat: 'games', badge: 'ОФЛАЙН', badgeCls: 'nb-game', ts: 0, title: 'Нет связи с игровыми лентами и Telegram', desc: 'Нажми ↻ чтобы подтянуть свежие игровые новости со StopGame, VGTimes, Игромании и TG.', source: 'Локальный режим', url: 'https://stopgame.ru/news', isTg: false },
    { cat: 'positive', badge: 'ОФЛАЙН', badgeCls: 'nb-pos', ts: 0, title: 'Нет связи с научными лентами и Telegram', desc: 'Нажми ↻ чтобы загрузить свежие открытия с N+1, Naked Science и ПостНауки.', source: 'Локальный режим', url: 'https://nplus1.ru/', isTg: false }
  ];

  const SPAM_RE = /промокод|скидк|распродаж|erid|реклам|казино|ставк|кредит|микрозайм|подписывайся|розыгрыш|vpn бот/i;
  const BOOST_RE = /ии|ai|llm|нейросет|nvidia|rtx|amd|ryzen|intel|процессор|видеокарт|gta|cyberpunk|minecraft|fortnite|counter-strike|cs2|релиз|анонс|трейлер|космос|открыти|учёные|прорыв/i;
  const ANNOUNCE_RE = /анонс|выйдет|релиз|трейлер|тизер|представ|дата выхода|патч|обновлен/i;

  let tgChannels = [...DEFAULT_TG_CHANNELS];
  try {
    const savedTg = JSON.parse(localStorage.getItem(NEWS_TG_KEY) || 'null');
    if (Array.isArray(savedTg) && savedTg.length) tgChannels = savedTg;
  } catch {}

  let userPrefs = { cats: {}, clicks: 0 };
  try {
    const sp = JSON.parse(localStorage.getItem(NEWS_PREF_KEY) || 'null');
    if (sp && sp.cats) userPrefs = sp;
  } catch {}

  let newsItems = [];
  let activeCat = 'all';
  let sortMode = 'smart';
  let searchQ = '';

  function escHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function formatRelTime(ts) {
    if (!ts || !Number.isFinite(ts)) return 'Офлайн';
    const diffMin = Math.max(1, Math.round((Date.now() - ts) / 60000));
    if (diffMin < 60) return `${diffMin} мин назад`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `${diffH} ч назад`;
    const diffD = Math.round(diffH / 24);
    return diffD === 1 ? 'Вчера' : `${diffD} дн назад`;
  }

  function titleTokens(t) {
    return new Set(String(t || '').toLowerCase().replace(/[^a-zа-яё0-9\s]/gi, ' ').split(/\s+/).filter(w => w.length > 3));
  }

  function deduplicateNews(items) {
    const out = [];
    const seenSets = [];
    for (const it of items) {
      if (SPAM_RE.test(it.title) || SPAM_RE.test(it.desc)) continue;
      const tok = titleTokens(it.title);
      let dup = false;
      for (const prev of seenSets) {
        let inter = 0;
        tok.forEach(w => { if (prev.has(w)) inter++; });
        const union = tok.size + prev.size - inter;
        if (union > 0 && inter / union >= 0.58) { dup = true; break; }
      }
      if (!dup) { seenSets.push(tok); out.push(it); }
    }
    return out;
  }

  function scoreNewsItem(it) {
    if (!it.ts) return -100;
    const ageH = Math.max(0.15, (Date.now() - it.ts) / 3600e3);
    const freshness = 58 * Math.exp(-ageH / 20);
    const text = `${it.title} ${it.desc}`;
    let score = freshness;
    if (BOOST_RE.test(text)) score += 15;
    if (ANNOUNCE_RE.test(it.title)) score += 11;
    if (it.isTg) score += 4; // slight boost for fast TG updates
    if ((it.desc || '').length > 50) score += 4;
    const catAffinity = Math.min(10, (userPrefs.cats[it.cat] || 0) * 2);
    score += catAffinity;
    return Math.round(score);
  }

  // Keep columns diverse: max 2 items per single source in top slice
  function diversify(list, limit) {
    const res = [];
    const srcCount = {};
    for (const it of list) {
      const k = it.source || 'src';
      if ((srcCount[k] || 0) >= 2) continue;
      srcCount[k] = (srcCount[k] || 0) + 1;
      res.push(it);
      if (res.length >= limit) break;
    }
    if (res.length < limit) {
      for (const it of list) {
        if (!res.includes(it)) { res.push(it); if (res.length >= limit) break; }
      }
    }
    return res;
  }

  function makeCard(item) {
    const a = document.createElement('a');
    a.className = 'news-item';
    a.href = item.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    const isHot = (item._score || 0) >= 64;
    const tgPill = item.isTg ? '<span class="news-badge nb-tg">✈️ TG</span>' : '';
    a.innerHTML = `<div class="news-meta"><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><span class="news-badge ${item.badgeCls || 'nb-tech'}">${escHtml(item.badge)}</span>${tgPill}${isHot ? '<span class="news-score-tag">🔥 ТОП</span>' : ''}</div><span class="news-date">${escHtml(formatRelTime(item.ts))}</span></div><div class="news-item-title">${escHtml(item.title)}</div><div class="news-item-desc">${escHtml(item.desc)}</div><div class="news-item-foot"><span>${escHtml(item.source)}</span><span>Читать ↗</span></div>`;
    a.addEventListener('click', () => {
      userPrefs.cats[item.cat] = (userPrefs.cats[item.cat] || 0) + 1;
      userPrefs.clicks = (userPrefs.clicks || 0) + 1;
      try { localStorage.setItem(NEWS_PREF_KEY, JSON.stringify(userPrefs)); } catch {}
    });
    return a;
  }

  function renderTgChips() {
    const host = document.getElementById('newsTgChips');
    if (!host) return;
    host.replaceChildren();
    const catEmoji = { tech: '💻', games: '🎮', positive: '🌱' };
    tgChannels.forEach((ch, idx) => {
      const chip = document.createElement('span');
      chip.className = 'news-tg-chip';
      chip.innerHTML = `<span>${catEmoji[ch.cat] || '✈️'} @${escHtml(ch.user)}</span>`;
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.title = 'Убрать канал';
      rm.textContent = '×';
      rm.addEventListener('click', () => {
        tgChannels.splice(idx, 1);
        try { localStorage.setItem(NEWS_TG_KEY, JSON.stringify(tgChannels)); } catch {}
        renderTgChips();
        fetchLiveFeeds(true);
      });
      chip.append(rm);
      host.append(chip);
    });
  }

  function renderNewsPulse() {
    const grid = document.getElementById('newsPulseGrid');
    if (!grid) return;
    grid.replaceChildren();
    const q = searchQ.trim().toLowerCase();

    const baseList = newsItems.length ? newsItems : FALLBACK_NEWS;
    const scored = deduplicateNews(baseList).map(it => ({ ...it, _score: scoreNewsItem(it) }));
    const filtered = scored.filter(it => {
      if (activeCat === 'tg') {
        if (!it.isTg) return false;
      } else if (activeCat !== 'all' && it.cat !== activeCat) {
        return false;
      }
      if (sortMode === 'announce' && !ANNOUNCE_RE.test(it.title) && it.badge !== 'АНОНС') return false;
      if (q && !(it.title.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q) || it.source.toLowerCase().includes(q) || it.badge.toLowerCase().includes(q))) return false;
      return true;
    });

    filtered.sort((a, b) => sortMode === 'fresh' ? ((b.ts || 0) - (a.ts || 0)) : ((b._score || 0) - (a._score || 0)));

    if (activeCat === 'all' && !q && sortMode !== 'announce') {
      grid.classList.remove('single-grid');
      [
        { cat: 'tech',     head: '💻 Главные техноновости (RSS + TG)' },
        { cat: 'games',    head: '🎮 Игры, анонсы & релизы (RSS + TG)' },
        { cat: 'positive', head: '🌱 Позитив и наука (RSS + TG)' }
      ].forEach(c => {
        const box = document.createElement('div');
        box.className = 'news-col';
        const h = document.createElement('div');
        h.className = 'news-col-head';
        h.textContent = c.head;
        box.append(h);
        const colItems = diversify(filtered.filter(x => x.cat === c.cat), 5);
        if (colItems.length) {
          colItems.forEach(it => box.append(makeCard(it)));
        } else {
          const fb = FALLBACK_NEWS.find(x => x.cat === c.cat);
          if (fb) box.append(makeCard(fb));
        }
        grid.append(box);
      });
    } else {
      grid.classList.add('single-grid');
      if (!filtered.length) {
        const empty = document.createElement('div');
        empty.className = 'news-col';
        empty.style.gridColumn = '1 / -1';
        empty.textContent = activeCat === 'tg'
          ? 'Посты из Telegram ещё подгружаются или недоступны — нажми ↻ или добавь открытый @канал.'
          : 'По этому фильтру новостей пока нет — попробуй сменить фильтр или нажать ↻.';
        grid.append(empty);
        return;
      }
      diversify(filtered, 12).forEach(it => {
        const wrap = document.createElement('div');
        wrap.className = 'news-col';
        wrap.append(makeCard(it));
        grid.append(wrap);
      });
    }
  }

  async function fetchTextTimeout(url, ms = 5500) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) return null;
      return await r.text();
    } catch { return null; }
    finally { clearTimeout(t); }
  }

  async function fetchTelegramChannel(ch) {
    const out = [];
    const target = `https://t.me/s/${encodeURIComponent(ch.user)}`;
    let htmlStr = await fetchTextTimeout(`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`, 6000);
    if (!htmlStr || !htmlStr.includes('tgme_widget_message')) {
      htmlStr = await fetchTextTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`, 6000);
    }
    if (htmlStr && htmlStr.includes('tgme_widget_message')) {
      try {
        const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
        const msgs = Array.from(doc.querySelectorAll('.tgme_widget_message')).slice(-6).reverse();
        for (const m of msgs) {
          const textEl = m.querySelector('.tgme_widget_message_text');
          if (!textEl) continue;
          const raw = (textEl.textContent || '').replace(/\s+/g, ' ').trim();
          if (raw.length < 28) continue;
          const linkEl = m.querySelector('a.tgme_widget_message_date');
          const timeEl = m.querySelector('time[datetime]');
          const url = linkEl ? linkEl.getAttribute('href') : `https://t.me/${ch.user}`;
          const parsedTs = timeEl ? Date.parse(timeEl.getAttribute('datetime') || '') : Date.now();
          const ts = Number.isFinite(parsedTs) ? parsedTs : Date.now();
          // Split first sentence as title, rest as description
          const parts = raw.split(/(?<=[.!?])\s+/);
          let title = parts[0] || raw.slice(0, 90);
          if (title.length > 96) title = title.slice(0, 93) + '…';
          let desc = parts.slice(1).join(' ').trim();
          if (!desc) desc = raw.length > 145 ? raw.slice(0, 142) + '…' : raw;
          else if (desc.length > 150) desc = desc.slice(0, 147) + '…';
          const isAnn = ANNOUNCE_RE.test(title);
          const badge = ch.cat === 'positive' ? 'НАУКА' : (isAnn ? 'АНОНС' : (ch.cat === 'games' ? 'ИГРЫ' : 'ТЕХНО'));
          const badgeCls = ch.cat === 'positive' ? 'nb-pos' : (isAnn ? 'nb-announce' : (ch.cat === 'games' ? 'nb-game' : 'nb-tech'));
          out.push({
            cat: ch.cat, badge, badgeCls, ts, title, desc,
            source: `TG @${ch.user}`, url, isTg: true
          });
        }
      } catch {}
    }
    return out;
  }

  async function fetchLiveFeeds(force = false) {
    const statusEl = document.getElementById('newsLiveStatus');
    try {
      if (!force) {
        const cached = JSON.parse(localStorage.getItem(NEWS_CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.ts < 12 * 60 * 1000 && Array.isArray(cached.items) && cached.items.length) {
          newsItems = cached.items;
          renderNewsPulse();
          const tgCnt = newsItems.filter(x => x.isTg).length;
          if (statusEl) statusEl.textContent = tgCnt ? `● Live: ${newsItems.length} (TG: ${tgCnt})` : `● Live: ${newsItems.length}`;
          return;
        }
      }
      if (statusEl) statusEl.textContent = '⏳ RSS + Telegram…';
      const liveMerged = [];

      const rssTasks = RSS_FEEDS.map(async f => {
        const d = await fetchJsonTimeout('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(f.url), 6000);
        if (!d || !Array.isArray(d.items)) return;
        d.items.slice(0, 5).forEach(entry => {
          const title = String(entry.title || '').trim();
          const rawDesc = String(entry.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const desc = rawDesc.length > 145 ? rawDesc.slice(0, 142) + '…' : rawDesc;
          const isAnn = ANNOUNCE_RE.test(title);
          const badge = f.cat === 'positive' ? 'НАУКА' : (isAnn ? 'АНОНС' : (f.cat === 'games' ? 'ИГРЫ' : 'ТЕХНО'));
          const badgeCls = f.cat === 'positive' ? 'nb-pos' : (isAnn ? 'nb-announce' : (f.cat === 'games' ? 'nb-game' : 'nb-tech'));
          const parsedTs = entry.pubDate ? Date.parse(entry.pubDate.replace(' ', 'T') + 'Z') : Date.now();
          const ts = Number.isFinite(parsedTs) ? parsedTs : Date.now();
          if (title) liveMerged.push({ cat: f.cat, badge, badgeCls, ts, title, desc: desc || 'Подробности в источнике.', source: f.source, url: entry.link || '#', isTg: false });
        });
      });

      const tgTasks = tgChannels.map(async ch => {
        const posts = await fetchTelegramChannel(ch);
        posts.forEach(p => liveMerged.push(p));
      });

      await Promise.allSettled([...rssTasks, ...tgTasks]);

      if (liveMerged.length > 0) {
        newsItems = liveMerged;
        try { localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: newsItems })); } catch {}
        const tgCnt = newsItems.filter(x => x.isTg).length;
        if (statusEl) statusEl.textContent = tgCnt ? `● Live: ${newsItems.length} (TG: ${tgCnt})` : `● Live: ${newsItems.length}`;
      } else {
        newsItems = [...FALLBACK_NEWS];
        if (statusEl) statusEl.textContent = '● Офлайн';
      }
      renderNewsPulse();
    } catch {
      newsItems = [...FALLBACK_NEWS];
      if (statusEl) statusEl.textContent = '● Офлайн';
      renderNewsPulse();
    }
  }

  document.querySelectorAll('#newsTabs .news-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.ncat || 'all';
      document.querySelectorAll('#newsTabs .news-tab').forEach(b => b.classList.toggle('active', b === btn));
      renderNewsPulse();
    });
  });
  document.getElementById('newsSortSelect')?.addEventListener('change', e => {
    sortMode = e.target.value || 'smart';
    renderNewsPulse();
  });
  document.getElementById('newsSearchInput')?.addEventListener('input', e => { searchQ = e.target.value || ''; renderNewsPulse(); });
  document.getElementById('newsRefreshBtn')?.addEventListener('click', () => fetchLiveFeeds(true));
  document.getElementById('newsTgCfgBtn')?.addEventListener('click', () => {
    const dr = document.getElementById('newsTgDrawer');
    const btn = document.getElementById('newsTgCfgBtn');
    if (!dr) return;
    dr.hidden = !dr.hidden;
    if (btn) btn.setAttribute('aria-expanded', String(!dr.hidden));
  });
  document.getElementById('newsTgAddForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const uIn = document.getElementById('newsTgUserIn');
    const cIn = document.getElementById('newsTgCatIn');
    const raw = (uIn?.value || '').trim().replace(/^https?:\/\/t\.me\/(s\/)?/i, '').replace(/^@/, '').replace(/\/.*$/, '');
    if (!/^[a-zA-Z0-9_]{4,40}$/.test(raw)) return;
    if (!tgChannels.some(c => c.user.toLowerCase() === raw.toLowerCase())) {
      tgChannels.push({ user: raw, cat: cIn?.value || 'tech', label: raw });
      try { localStorage.setItem(NEWS_TG_KEY, JSON.stringify(tgChannels)); } catch {}
      renderTgChips();
      fetchLiveFeeds(true);
    }
    if (uIn) uIn.value = '';
  });


  // --- News Hide / Collapse Toggle (persisted in localStorage) ---
  const NEWS_HIDDEN_KEY = 'storm_news_hidden_v34';
  const newsSecEl = document.getElementById('newsPulseSection');
  const newsCollapseBtn = document.getElementById('newsCollapseBtn');

  function applyNewsCollapsed(isHidden) {
    if (!newsSecEl) return;
    newsSecEl.classList.toggle('news-collapsed', !!isHidden);
    if (newsCollapseBtn) {
      newsCollapseBtn.textContent = isHidden ? 'Показать новости ▾' : 'Скрыть ▴';
      newsCollapseBtn.setAttribute('aria-expanded', String(!isHidden));
    }
    try { localStorage.setItem(NEWS_HIDDEN_KEY, isHidden ? '1' : '0'); } catch {}
  }

  let newsInitiallyHidden = false;
  try { newsInitiallyHidden = localStorage.getItem(NEWS_HIDDEN_KEY) === '1'; } catch {}
  applyNewsCollapsed(newsInitiallyHidden);

  newsCollapseBtn?.addEventListener('click', () => {
    const next = !newsSecEl?.classList.contains('news-collapsed');
    applyNewsCollapsed(next);
  });

  // If user clicks "Читать новости" card while news is hidden, auto-expand it
  document.getElementById('scrollToNewsBtn')?.addEventListener('click', () => {
    if (newsSecEl?.classList.contains('news-collapsed')) {
      applyNewsCollapsed(false);
    }
  });

  renderTgChips();
  fetchLiveFeeds(false);

  // --- Discord Hub Integration (Widget + Webhook) ---
  const DC_CFG_KEY = 'storm_discord_cfg_v1';
  let dcCfg = { serverId: '', inviteUrl: '', webhookUrl: '' };
  try {
    const sc = JSON.parse(localStorage.getItem(DC_CFG_KEY) || 'null');
    if (sc && typeof sc === 'object') dcCfg = { ...dcCfg, ...sc };
  } catch {}

  function renderDiscordWidget() {
    const host = document.getElementById('dcWidgetHost');
    const joinA = document.getElementById('dcJoinLink');
    if (joinA) {
      if (dcCfg.inviteUrl) { joinA.href = dcCfg.inviteUrl; joinA.hidden = false; }
      else joinA.hidden = true;
    }
    if (!host) return;
    if (/^\d{16,22}$/.test(dcCfg.serverId)) {
      const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      host.innerHTML = `<iframe src="https://discord.com/widget?id=${dcCfg.serverId}&theme=${theme}" allowtransparency="true" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" title="Discord сервер"></iframe>`;
    } else {
      host.innerHTML = '<div class="w-note">Вставь <b>ID сервера</b> (Настройки сервера → Виджет → Включить виджет сервера → скопируй ID). Здесь появится живой список участников онлайн и кнопка входа.</div>';
    }
  }

  document.getElementById('discordOpenBtn')?.addEventListener('click', () => {
    const bd = document.getElementById('discordBackdrop');
    if (!bd) return;
    const sIn = document.getElementById('dcServerIdIn');
    const iIn = document.getElementById('dcInviteIn');
    const wIn = document.getElementById('dcWebhookIn');
    if (sIn) sIn.value = dcCfg.serverId || '';
    if (iIn) iIn.value = dcCfg.inviteUrl || '';
    if (wIn) wIn.value = dcCfg.webhookUrl || '';
    renderDiscordWidget();
    bd.hidden = false;
  });
  document.getElementById('discordCloseBtn')?.addEventListener('click', () => {
    const bd = document.getElementById('discordBackdrop');
    if (bd) bd.hidden = true;
  });
  document.getElementById('discordBackdrop')?.addEventListener('click', e => {
    if (e.target.id === 'discordBackdrop') e.target.hidden = true;
  });
  document.querySelectorAll('.dc-tabs .pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dc-tabs .pill').forEach(b => b.classList.toggle('active', b === btn));
      const tab = btn.dataset.dctab;
      document.getElementById('dcPanelWidget').hidden = (tab !== 'widget');
      document.getElementById('dcPanelWebhook').hidden = (tab !== 'webhook');
    });
  });
  document.getElementById('dcSaveBtn')?.addEventListener('click', () => {
    dcCfg.serverId = (document.getElementById('dcServerIdIn')?.value || '').trim();
    dcCfg.inviteUrl = (document.getElementById('dcInviteIn')?.value || '').trim();
    try { localStorage.setItem(DC_CFG_KEY, JSON.stringify(dcCfg)); } catch {}
    renderDiscordWidget();
  });
  document.getElementById('dcSendHookBtn')?.addEventListener('click', async () => {
    const url = (document.getElementById('dcWebhookIn')?.value || '').trim();
    const msg = (document.getElementById('dcMsgIn')?.value || '').trim();
    const st = document.getElementById('dcHookStatus');
    if (!/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\//.test(url)) {
      if (st) st.textContent = '❌ Нужна корректная ссылка Webhook';
      return;
    }
    if (!msg) { if (st) st.textContent = '❌ Введи текст сообщения'; return; }
    dcCfg.webhookUrl = url;
    try { localStorage.setItem(DC_CFG_KEY, JSON.stringify(dcCfg)); } catch {}
    if (st) st.textContent = '⏳ Отправка…';
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'Storm Hub', content: msg })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      document.getElementById('dcMsgIn').value = '';
      if (st) st.textContent = '✅ Отправлено в Discord!';
    } catch {
      if (st) st.textContent = '❌ Ошибка отправки (проверь Webhook URL)';
    }
  });

  // --- Automatic AI Weather Summary (when LM Studio is online) ---
  let aiWeatherReqSeq = 0;
  window.requestAiWeatherSummary = async function requestAiWeatherSummary(snap) {
    const statusEl = document.getElementById('wAiBriefStatus');
    const bodyEl = document.getElementById('wAiBriefBody');
    if (!statusEl || !bodyEl || !snap) return;

    const mySeq = ++aiWeatherReqSeq;
    const base = (
      (document.getElementById('aiEndpoint')?.value || '').trim()
      || (typeof getSavedEndpoint === 'function' ? getSavedEndpoint() : '')
      || 'https://expend-dazzling-purifier.ngrok-free.dev'
    ).replace(/\/+$/, '');

    statusEl.className = 'w-ai-llm-status loading';
    statusEl.textContent = '⏳ Проверка ИИ…';
    bodyEl.textContent = 'Проверяем подключение к твоей нейросети…';

    try {
      const headers = (typeof getAiHeaders === 'function') ? getAiHeaders() : { 'Content-Type': 'application/json' };
      const ctrl1 = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const t1 = ctrl1 ? setTimeout(() => ctrl1.abort(), 3500) : null;
      let modelId = (document.getElementById('aiModelSelect')?.value || '').trim();
      try {
        const mr = await aiSmartFetch(base, '/models', { headers, signal: ctrl1 ? ctrl1.signal : undefined });
        if (!mr.ok) throw new Error('HTTP ' + mr.status);
        const md = await mr.json();
        if (!modelId && Array.isArray(md.data) && md.data[0]?.id) modelId = md.data[0].id;
      } finally { if (t1) clearTimeout(t1); }

      if (mySeq !== aiWeatherReqSeq) return;
      statusEl.textContent = '🧠 ИИ пишет сводку…';

      const kpText = document.getElementById('geoKp')?.textContent || 'Kp н/д';
      const prompt = `Краткая сводка погоды на русском (3 пункта): ${snap.city}, сейчас ${Math.round(snap.temp)}°C (ощущ. ${Math.round(snap.feels)}°C), ${snap.condText}, ветер ${Number(snap.windMs || 0).toFixed(1)} м/с, влажность ${snap.hum}%, осадки ${snap.precipProb}%, геомагнитика ${kpText}. 1) Ощущение, 2) Что надеть, 3) Совет дня.`;
      const payload = {
        messages: [
          { role: 'system', content: 'Ты — погодный ассистент Storm Incorporated. Отвечай кратко и по делу на русском.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6, max_tokens: 260, stream: false
      };
      if (modelId) payload.model = modelId;

      const ctrl2 = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const t2 = ctrl2 ? setTimeout(() => ctrl2.abort(), 16000) : null;
      let answer = '';
      try {
        const cr = await aiSmartFetch(base, '/chat/completions', { method: 'POST', headers, body: JSON.stringify(payload), signal: ctrl2 ? ctrl2.signal : undefined });
        if (!cr.ok) throw new Error('HTTP ' + cr.status);
        const cd = await cr.json();
        answer = (cd.choices?.[0]?.message?.content || '').trim();
      } finally { if (t2) clearTimeout(t2); }

      if (mySeq !== aiWeatherReqSeq || !answer) throw new Error('Empty');
      statusEl.className = 'w-ai-llm-status online';
      statusEl.textContent = '🟢 ИИ онлайн';
      bodyEl.textContent = answer;
    } catch {
      if (mySeq !== aiWeatherReqSeq) return;
      statusEl.className = 'w-ai-llm-status';
      statusEl.textContent = '⚪ ИИ офлайн';
      bodyEl.textContent = 'Нейросеть сейчас выключена — когда включишь LM Studio / туннель, нажми «↻ Запросить ИИ» и здесь появится живая сводка. Ниже работает полная сводка по сайтам погоды.';
    }
  };

  document.getElementById('wAiBriefRetryBtn')?.addEventListener('click', () => {
    if (typeof lastWeatherSnapshot !== 'undefined' && lastWeatherSnapshot) window.requestAiWeatherSummary(lastWeatherSnapshot);
    else if (typeof loadAllWeather === 'function') loadAllWeather(true);
  });
})();

/* ===== v38: ледяной объёмный заголовок по эскизу ===== */
(function () {
  const svg = document.querySelector('.storm-frost-svg');
  if (!svg) return;
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap';
  document.head.append(font);

  const rnd = n => { const x = Math.sin(n * 91.7) * 4375.5; return x - Math.floor(x); };
  const words = (cls, extra = '') =>
    `<g class="${cls}" ${extra}><text x="460" y="146" textLength="470" lengthAdjust="spacingAndGlyphs" class="ice-w ice-w1">Storm</text>` +
    `<text x="460" y="262" textLength="640" lengthAdjust="spacingAndGlyphs" class="ice-w ice-w2">Incorporated</text></g>`;

  // еловые ветки
  let pine = '';
  for (let b = 0; b < 46; b++) {
    const x = 110 + b * 15.5 + rnd(b) * 14, y = 158 + Math.sin(b * .55) * 26 + rnd(b + 7) * 18, a = (rnd(b + 3) - .5) * 70 + (x < 460 ? 180 : 0);
    let n = '';
    for (let k = 0; k < 9; k++) n += `M${k * 6} 0l12 ${-13 + k}M${k * 6} 0l12 ${13 - k}`;
    pine += `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0H58${n}" stroke="${b % 3 ? '#1f6b4a' : '#2f8a5c'}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  }
  const colors = ['red', 'gold', 'green', 'blue'];
  const balls = [[150, 168, 22], [212, 205, 15], [236, 92, 15], [686, 94, 17], [722, 196, 15], [776, 150, 23], [118, 232, 14], [808, 232, 16], [128, 108, 12], [796, 84, 12]]
    .map(([x, y, r], i) => `<g class="ice-ball"><path d="M${x} ${y - r - 14}V${y - r}" stroke="#dbeafe" stroke-width="1.5"/><rect x="${x - 6}" y="${y - r - 5}" width="12" height="8" rx="2" fill="#e9c46a"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#ib-${colors[i % 4]})"/><ellipse cx="${x - r * .35}" cy="${y - r * .38}" rx="${r * .24}" ry="${r * .16}" fill="#fff" opacity=".75"/></g>`).join('');
  let lights = '';
  for (let i = 0; i < 38; i++) {
    const x = 118 + i * 18.5, y = 190 + Math.sin(i * .8) * 34 + (i % 2) * 12;
    lights += `<g class="ice-light" style="animation-delay:${(i % 5) * .32}s;color:${['#ff6b6b', '#ffd166', '#4ade80', '#60a5fa', '#f0abfc'][i % 5]}"><circle cx="${x}" cy="${y}" r="9" fill="currentColor" opacity=".28"/><circle cx="${x}" cy="${y}" r="3.8" fill="currentColor"/></g>`;
  }
  const icicle = (x, y, len, w) => `<path d="M${x - w} ${y}Q${x - w * .3} ${y + len * .45} ${x} ${y + len}Q${x + w * .35} ${y + len * .4} ${x + w} ${y}Z"/>`;
  let ice = '';
  [[246, 46], [262, 22], [338, 30], [425, 52], [512, 26], [660, 38]].forEach(([x, l]) => ice += icicle(x, 142, l, 5));
  [[152, 40], [170, 20], [226, 58], [292, 28], [346, 44], [398, 68], [452, 24], [514, 50], [568, 34], [622, 62], [676, 26], [724, 46], [762, 22]].forEach(([x, l]) => ice += icicle(x, 262, l, 5.5));
  const drops = [210, 322, 438, 560, 690].map((x, i) => `<path class="ice-drop" style="animation-delay:${i * .45}s" d="M${x} 268q9 13 0 18q-9 -5 0 -18z"/>`).join('');
  let flakes = '';
  for (let i = 0; i < 90; i++) flakes += `<circle cx="${60 + rnd(i) * 800}" cy="${30 + rnd(i + 40) * 300}" r="${1 + rnd(i + 80) * 3.2}"/>`;
  const stop = a => a.map((c, i) => `<stop offset="${i / (a.length - 1)}" stop-color="${c}"/>`).join('');
  const ball = (id, a) => `<radialGradient id="ib-${id}" cx=".35" cy=".3" r=".8">${stop(a)}</radialGradient>`;
  // снег: берём верхний край каждой буквы (буква минус она же, сдвинутая вниз) и делаем его пухлым
  const snow = (id, shift, grow) => `<filter id="${id}" x="-5%" y="-20%" width="110%" height="140%" color-interpolation-filters="sRGB">
    <feOffset in="SourceAlpha" dy="${shift}" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="top"/>
    <feMorphology in="top" operator="dilate" radius="${grow}" result="fat"/>
    <feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="fat" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation=".9" result="soft"/>
    <feFlood flood-color="#fff"/><feComposite in2="soft" operator="in" result="white"/>
    <feDropShadow in="white" dx="0" dy="3" stdDeviation="1.6" flood-color="#2563a8" flood-opacity=".75"/></filter>`;

  svg.setAttribute('viewBox', '60 40 800 300');
  svg.innerHTML = `<defs>
    <linearGradient id="ice-fill" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="270">${stop(['#e0f6ff', '#7cc8f5', '#2f86d6', '#bfe9ff', '#4aa8ea', '#1c5fae'])}</linearGradient>
    ${ball('red', ['#ff9a9a', '#d61f3c', '#6d0b1d'])}${ball('gold', ['#fff3b0', '#e9a81b', '#7a4d05'])}${ball('green', ['#b7f7c4', '#1f9d55', '#07431f'])}${ball('blue', ['#bfe3ff', '#2563eb', '#0b1f6b'])}
    ${snow('ice-snow-a', 9, 2.4)}${snow('ice-snow-b', 5, 1.5)}
  </defs>
  <g class="ice-pine">${pine}</g>
  ${words('ice-depth', 'transform="translate(0 8)"')}
  <g class="ice-hang" fill="url(#ice-fill)" stroke="#e0f2fe" stroke-width="1">${ice}</g>
  ${words('ice-face')}
  ${words('ice-cap ice-cap-a', 'filter="url(#ice-snow-a)"')}
  ${words('ice-cap ice-cap-b', 'filter="url(#ice-snow-b)"')}
  <g class="ice-lights">${lights}</g>
  <g class="ice-balls">${balls}</g>
  <g class="ice-flakes" fill="#fff">${flakes}</g>
  <g class="ice-drops" fill="#bae6fd">${drops}</g>`;

  // ползунки в сезонном пульте
  const box = document.getElementById('holidayPanelBox'), note = box && box.querySelector('.holiday-cal-note');
  if (!box) return;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('storm_ice_v1') || '{}') || {}; } catch {}
  const wrap = document.createElement('div');
  wrap.className = 'ice-sliders';
  [['snow', '❄️ Снег на буквах', '--ice-snow'], ['hang', '🧊 Сосульки', '--ice-hang'], ['light', '✨ Яркость гирлянд', '--ice-light']].forEach(([key, title, css]) => {
    const label = document.createElement('label'), input = document.createElement('input');
    input.type = 'range'; input.min = 0; input.max = 100; input.value = Number.isFinite(+saved[key]) ? +saved[key] : 100;
    const apply = () => document.documentElement.style.setProperty(css, input.value / 100);
    input.oninput = () => { apply(); saved[key] = +input.value; try { localStorage.setItem('storm_ice_v1', JSON.stringify(saved)); } catch {} };
    apply();
    label.append(title, input); wrap.append(label);
  });
  box.insertBefore(wrap, note);
})();
