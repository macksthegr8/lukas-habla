/* Lukas Habla — app logic. No build step, no network: everything runs on the iPad. */
(() => {
  "use strict";

  const D = window.LH_DATA;
  const $ = (s) => document.querySelector(s);
  const KEY = { settings: "lh.settings", edits: "lh.edits", log: "lh.log" };

  // ---------- storage ----------
  const load = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const DEFAULTS = { order: "es-en", rate: 0.85, voiceEs: "", voiceEn: "", guard: 400, showEn: true, chime: true };
  let settings = { ...DEFAULTS, ...load(KEY.settings, {}) };
  let edits = load(KEY.edits, {});
  let log = load(KEY.log, {});

  // Photos live in IndexedDB (bigger than localStorage allows).
  const photos = new Map(); // id -> dataURL
  const db = (() => {
    let p;
    const open = () => p ??= new Promise((res, rej) => {
      const r = indexedDB.open("lukas-habla", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("photos");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const tx = async (mode, fn) => {
      const d = await open();
      return new Promise((res, rej) => {
        const t = d.transaction("photos", mode); const s = t.objectStore("photos");
        const out = fn(s); t.oncomplete = () => res(out?.result); t.onerror = () => rej(t.error);
      });
    };
    return {
      put: (id, v) => tx("readwrite", (s) => s.put(v, id)),
      del: (id) => tx("readwrite", (s) => s.delete(id)),
      clear: () => tx("readwrite", (s) => s.clear()),
      all: async () => {
        const d = await open();
        return new Promise((res) => {
          const out = {}; const c = d.transaction("photos").objectStore("photos").openCursor();
          c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); };
          c.onerror = () => res(out);
        });
      },
    };
  })();

  // ---------- items ----------
  const allItems = new Map();
  D.urgentBar.forEach((it) => it && allItems.set(it.id, it));
  Object.values(D.boards).forEach((b) => b.items.forEach((it) => it && allItems.set(it.id, it)));

  const item = (base) => (base ? { ...base, ...(edits[base.id] || {}) } : null);
  const sayEs = (it) => it.sayEs || it.es;
  const sayEn = (it) => it.sayEn || it.en;

  // ---------- speech ----------
  const synth = window.speechSynthesis;
  let voices = [];
  const refreshVoices = () => { voices = synth ? synth.getVoices() : []; fillVoiceSelects(); };

  const pickVoice = (lang) => {
    const want = lang === "es" ? settings.voiceEs : settings.voiceEn;
    if (want) { const v = voices.find((v) => v.voiceURI === want); if (v) return v; }
    const prefs = lang === "es"
      ? [/es[-_]MX/i, /es[-_]US/i, /es[-_]419/i, /^es/i]
      : [/en[-_]US/i, /en[-_]/i, /^en/i];
    const nice = /(Paulina|Juan|Mónica|Samantha|Ava|Allison|Google|Natural|Enhanced|Premium)/i;
    for (const re of prefs) {
      const list = voices.filter((v) => re.test(v.lang));
      if (list.length) return list.find((v) => nice.test(v.name)) || list[0];
    }
    return null;
  };

  const utter = (text, lang) => {
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(lang);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === "es" ? "es-MX" : "en-US";
    u.rate = settings.rate; u.pitch = 1.05;
    return u;
  };

  // Speaks Spanish then English (or whatever order is set). Both are
  // queued right away, which iOS Safari handles more reliably than chaining.
  const speak = (es, en) => {
    if (!synth) return;
    synth.cancel();
    const parts = settings.order === "es" ? [[es, "es"]]
      : settings.order === "en" ? [[en, "en"]]
      : settings.order === "en-es" ? [[en, "en"], [es, "es"]]
      : [[es, "es"], [en, "en"]];
    setTimeout(() => {
      parts.forEach(([t, l], i) => {
        if (!t) return;
        // skip the second half when both languages are the same word ("Pizza / Pizza")
        if (i > 0 && t.toLowerCase() === parts[0][0].toLowerCase()) return;
        synth.speak(utter(t, l));
      });
    }, 40);
  };

  // gentle two-note chime for urgent buttons, made in code (no audio files)
  let actx;
  const chime = () => {
    if (!settings.chime) return 0;
    try {
      actx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime;
      [[880, 0], [1320, 0.16]].forEach(([f, d]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + d);
        g.gain.exponentialRampToValueAtTime(0.35, t + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.45);
        o.connect(g).connect(actx.destination); o.start(t + d); o.stop(t + d + 0.5);
      });
      return 380;
    } catch { return 0; }
  };

  // ---------- body pictures ----------
  const BODY = {
    head:  '<circle cx="30" cy="12" r="9"/>',
    neck:  '<rect x="26.5" y="20" width="7" height="6" rx="2"/>',
    tummy: '<rect x="19" y="37" width="22" height="14" rx="5"/>',
    back:  '<rect x="18" y="25" width="24" height="26" rx="7"/>',
    arms:  '<rect x="8" y="27" width="8" height="21" rx="4"/><rect x="44" y="27" width="8" height="21" rx="4"/>',
    hands: '<circle cx="12" cy="52" r="4.5"/><circle cx="48" cy="52" r="4.5"/>',
    legs:  '<rect x="20" y="51" width="9" height="20" rx="4"/><rect x="31" y="51" width="9" height="20" rx="4"/>',
    feet:  '<ellipse cx="23.5" cy="75" rx="6" ry="3.5"/><ellipse cx="36.5" cy="75" rx="6" ry="3.5"/>',
  };
  const bodySvg = (part) => {
    const base = ["head", "neck", "back", "arms", "hands", "legs", "feet"].map((p) => BODY[p]).join("");
    const extra = part === "back" ? '<path d="M24 31 L36 31 M24 38 L36 38 M24 45 L36 45" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>' : "";
    return `<svg viewBox="0 0 60 80" aria-hidden="true">
      <g fill="#FFD9B8" stroke="#8A5A44" stroke-width="1.6">${base}</g>
      <g fill="#F2424B" stroke="#B3122B" stroke-width="1.6" class="hurt">${BODY[part] || ""}</g>${extra}
      <g fill="#23324A"><circle cx="26.5" cy="11" r="1.3"/><circle cx="33.5" cy="11" r="1.3"/></g>
      <path d="M26 15.5 Q30 13.5 34 15.5" fill="none" stroke="#23324A" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`;
  };

  const picHTML = (it) => {
    const ph = photos.get(it.id);
    if (ph) return `<img src="${ph}" alt="">`;
    if (it.icon?.startsWith("svg:")) return bodySvg(it.icon.slice(4));
    return `<span class="emoji">${esc(it.icon || "⬜")}</span>`;
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const buttonHTML = (it) => `
    ${it.link ? '<span class="tab"></span><span class="arrow">➜</span>' : ""}
    <span class="pic">${picHTML(it)}</span>
    <span class="es">${esc(it.es)}</span>
    <span class="en">${esc(it.en)}</span>`;

  const makeButton = (base, slot) => {
    const b = document.createElement("button");
    b.type = "button";
    const it = item(base);
    if (!it) { b.className = "btn empty"; b.dataset.slot = slot; return b; }
    b.className = `btn k-${it.kind}${it.link ? " folder" : ""}${it.hidden ? " empty is-hidden" : ""}`;
    b.dataset.id = it.id;
    b.innerHTML = buttonHTML(it);
    b.setAttribute("aria-label", `${it.es}, ${it.en}`);
    return b;
  };

  // ---------- rendering ----------
  let board = "home";
  let chips = [];
  let editing = false;

  const renderUrgent = () => {
    const u = $("#urgent"); u.innerHTML = "";
    D.urgentBar.forEach((it, i) => u.appendChild(makeButton(it, i)));
  };

  const renderBoard = (animate) => {
    const g = $("#grid"); const b = D.boards[board];
    g.innerHTML = "";
    for (let i = 0; i < 18; i++) g.appendChild(makeButton(b.items[i] || null, i));
    $("#boardEs").textContent = b.es; $("#boardEn").textContent = b.en;
    $("#homeBtn").classList.toggle("at-home", board === "home");
    $("#homeBtn .home-ico").textContent = board === "home" ? "🏠" : "⬅️";
    if (animate) { g.classList.remove("enter"); void g.offsetWidth; g.classList.add("enter"); }
  };

  const renderChips = () => {
    const c = $("#chips"); c.innerHTML = "";
    chips.forEach((it) => {
      const el = document.createElement("div");
      el.className = "chip"; el.style.setProperty("--c", `var(--${it.kind})`);
      el.innerHTML = `${picHTML(it)}<span>${esc(it.es)}</span>`;
      c.appendChild(el);
    });
  };

  const renderAll = () => {
    document.body.classList.toggle("hide-en", !settings.showEn);
    document.body.classList.toggle("editing", editing);
    renderUrgent(); renderBoard(false); renderChips();
  };

  // ---------- tapping ----------
  let lastTap = 0;
  const onTap = (btn) => {
    const id = btn.dataset.id;
    if (editing) { openEditor(id ? allItems.get(id) : null); return; }
    if (!id) return;
    const now = Date.now();
    if (now - lastTap < settings.guard) return; // ignore accidental double taps
    lastTap = now;

    const it = item(allItems.get(id));
    btn.classList.remove("speaking"); void btn.offsetWidth; btn.classList.add("speaking");

    let delay = 0;
    if (it.urgent) {
      delay = chime();
      document.body.classList.remove("flash"); void document.body.offsetWidth; document.body.classList.add("flash");
    }
    setTimeout(() => speak(sayEs(it), sayEn(it)), delay);

    // folders just open a page, so they stay out of the sentence ("Quiero agua", not "Quiero tomar agua")
    if (!it.link) { chips.push(it); if (chips.length > 5) chips.shift(); renderChips(); }
    record(id);

    if (it.link && D.boards[it.link]) { board = it.link; setTimeout(() => renderBoard(true), 180); }
  };

  const bindTaps = (root) => {
    // pointerdown feels instant for little fingers; we act on pointerup inside the button
    root.addEventListener("pointerdown", (e) => {
      const b = e.target.closest(".btn"); if (b) b.classList.add("pressed");
    });
    root.addEventListener("pointerup", (e) => {
      const b = e.target.closest(".btn");
      root.querySelectorAll(".pressed").forEach((x) => x.classList.remove("pressed"));
      if (b) onTap(b);
    });
    root.addEventListener("pointercancel", () => root.querySelectorAll(".pressed").forEach((x) => x.classList.remove("pressed")));
    root.addEventListener("contextmenu", (e) => e.preventDefault());
  };
  bindTaps($("#urgent")); bindTaps($("#grid"));

  $("#homeBtn").addEventListener("click", () => {
    if (editing || board === "home") return;
    board = "home"; renderBoard(true);
  });
  $("#playBtn").addEventListener("click", () => {
    if (!chips.length) return;
    // "Quiero Agua" -> "Quiero agua"; names and "I" keep their capitals
    const join = (get) => chips.map((it, i) => {
      const t = get(it).replace(/[¡!¿?.]/g, "");
      return i === 0 || it.kind === "people" || /^I\b/.test(t) || /[A-Z]/.test(t.slice(1)) ? t : t.charAt(0).toLowerCase() + t.slice(1);
    }).join(" ");
    speak(join(sayEs), join(sayEn));
  });
  $("#clearBtn").addEventListener("click", () => { chips = []; renderChips(); });

  // ---------- usage log ----------
  const today = () => new Date().toISOString().slice(0, 10);
  const record = (id) => {
    const d = today(); (log[d] ??= {})[id] = (log[d][id] || 0) + 1;
    const keep = Object.keys(log).sort().slice(-120); // ~4 months
    log = Object.fromEntries(keep.map((k) => [k, log[k]]));
    save(KEY.log, log);
  };

  const renderStats = () => {
    const days = Object.keys(log).sort();
    const last7 = days.filter((d) => (Date.now() - new Date(d).getTime()) / 864e5 < 7);
    const sum = (ds) => { const t = {}; ds.forEach((d) => Object.entries(log[d]).forEach(([k, v]) => (t[k] = (t[k] || 0) + v))); return t; };
    const week = sum(last7);
    const todayTotal = Object.values(log[today()] || {}).reduce((a, b) => a + b, 0);
    const weekTotal = Object.values(week).reduce((a, b) => a + b, 0);
    const top = Object.entries(week).sort((a, b) => b[1] - a[1]).slice(0, 15);
    const max = top[0]?.[1] || 1;
    $("#stats").innerHTML = `
      <div class="summary">
        <div><b>${todayTotal}</b>toques hoy<br><span class="muted">taps today</span></div>
        <div><b>${weekTotal}</b>esta semana<br><span class="muted">this week</span></div>
        <div><b>${Object.keys(week).length}</b>palabras distintas<br><span class="muted">different words</span></div>
      </div>
      ${top.length ? top.map(([id, n]) => {
        const it = item(allItems.get(id)); if (!it) return "";
        const ic = it.icon?.startsWith("svg:") ? "🤕" : esc(it.icon);
        return `<div class="row"><span>${ic}</span><span>${esc(it.es)} <span class="muted">· ${esc(it.en)}</span>
          <div class="bar" style="width:${(n / max) * 100}%"></div></span><span>${n}</span></div>`;
      }).join("") : '<p class="muted">Todavía no hay toques esta semana. / No taps yet this week.</p>'}`;
  };

  // ---------- grown-up gate: press and hold the gear ----------
  let holdTimer;
  const lock = $("#lockBtn");
  const startHold = (e) => { e.preventDefault(); lock.classList.add("holding"); holdTimer = setTimeout(() => { endHold(); openPanel(); }, 2500); };
  const endHold = () => { clearTimeout(holdTimer); lock.classList.remove("holding"); };
  lock.addEventListener("pointerdown", startHold);
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => lock.addEventListener(ev, endHold));
  lock.addEventListener("contextmenu", (e) => e.preventDefault());

  const panel = $("#panel");
  const openPanel = () => { syncSettingsUI(); renderStats(); panel.showModal(); };

  document.querySelectorAll(".tabs button").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((x) => x.classList.toggle("on", x === t));
    document.querySelectorAll("[data-pane]").forEach((p) => (p.hidden = p.dataset.pane !== t.dataset.tab));
    if (t.dataset.tab === "uso") renderStats();
  }));

  function fillVoiceSelects() {
    const fill = (sel, re, cur) => {
      if (!sel) return;
      const list = voices.filter((v) => re.test(v.lang));
      sel.innerHTML = `<option value="">Automática / Automatic</option>` +
        list.map((v) => `<option value="${esc(v.voiceURI)}">${esc(v.name)} (${esc(v.lang)})</option>`).join("");
      sel.value = cur || "";
    };
    fill($("#sVoiceEs"), /^es/i, settings.voiceEs);
    fill($("#sVoiceEn"), /^en/i, settings.voiceEn);
  }

  const syncSettingsUI = () => {
    $("#sOrder").value = settings.order;
    $("#sRate").value = settings.rate; $("#sRateOut").textContent = `${settings.rate.toFixed(2)}×`;
    $("#sGuard").value = String(settings.guard);
    $("#sShowEn").checked = settings.showEn;
    $("#sChime").checked = settings.chime;
    fillVoiceSelects();
  };
  const setS = (k, v) => { settings[k] = v; save(KEY.settings, settings); };
  $("#sOrder").addEventListener("change", (e) => setS("order", e.target.value));
  $("#sRate").addEventListener("input", (e) => { setS("rate", +e.target.value); $("#sRateOut").textContent = `${settings.rate.toFixed(2)}×`; });
  $("#sVoiceEs").addEventListener("change", (e) => setS("voiceEs", e.target.value));
  $("#sVoiceEn").addEventListener("change", (e) => setS("voiceEn", e.target.value));
  $("#sGuard").addEventListener("change", (e) => setS("guard", +e.target.value));
  $("#sShowEn").addEventListener("change", (e) => { setS("showEn", e.target.checked); renderAll(); });
  $("#sChime").addEventListener("change", (e) => setS("chime", e.target.checked));
  $("#testVoice").addEventListener("click", () => speak("Hola Lukas. ¿Qué quieres?", "Hi Lukas. What do you want?"));

  $("#clearLog").addEventListener("click", () => {
    if (!confirm("¿Borrar historial? / Clear the usage history?")) return;
    log = {}; save(KEY.log, log); renderStats();
  });

  // ---------- edit mode ----------
  $("#startEdit").addEventListener("click", () => { panel.close(); editing = true; $("#editBanner").hidden = false; renderAll(); });
  $("#editDone").addEventListener("click", () => { editing = false; $("#editBanner").hidden = true; renderAll(); });
  $("#homeBtn").addEventListener("click", () => { if (editing && board !== "home") { board = "home"; renderBoard(true); } });

  const editor = $("#editor");
  let edBase = null, edPhoto; // edPhoto: undefined = unchanged, null = remove, string = new

  const previewItem = () => ({
    ...edBase, es: $("#edEs").value || edBase.es, en: $("#edEn").value || edBase.en,
    icon: $("#edIcon").value || edBase.icon,
  });
  const drawPreview = () => {
    const it = previewItem();
    const ph = edPhoto === undefined ? photos.get(it.id) : edPhoto;
    const b = document.createElement("div");
    b.className = `btn k-${it.kind}${it.link ? " folder" : ""}`;
    const saved = photos.get(it.id);
    if (ph) photos.set(it.id, ph); else photos.delete(it.id);
    b.innerHTML = buttonHTML(it);
    if (saved) photos.set(it.id, saved); else photos.delete(it.id);
    $("#edPreview").innerHTML = ""; $("#edPreview").appendChild(b);
  };

  function openEditor(base) {
    if (!base) return; // empty slots stay empty for now
    edBase = base; edPhoto = undefined;
    const it = item(base);
    $("#edId").textContent = base.id;
    $("#edEs").value = it.es; $("#edEn").value = it.en;
    $("#edSayEs").value = it.sayEs || ""; $("#edSayEn").value = it.sayEn || "";
    $("#edIcon").value = it.icon?.startsWith("svg:") ? "" : it.icon || "";
    $("#edIcon").placeholder = it.icon?.startsWith("svg:") ? "(dibujo / drawing)" : "";
    $("#edHidden").checked = !!it.hidden;
    $("#edPhoto").value = "";
    $("#edOpen").hidden = !base.link;
    editor.returnValue = ""; // closing any other way must not count as Save
    drawPreview(); editor.showModal();
  }
  // in edit mode folders open the editor, so this button walks into the folder
  $("#edOpen").addEventListener("click", () => {
    const to = edBase?.link; editor.close();
    if (to && D.boards[to]) { board = to; renderBoard(true); }
  });
  ["#edEs", "#edEn", "#edIcon"].forEach((s) => $(s).addEventListener("input", drawPreview));

  // shrink photos to 480px squares so storage stays small
  const toSquare = (file) => new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.naturalWidth, img.naturalHeight); const size = 480;
      const c = document.createElement("canvas"); c.width = c.height = size;
      c.getContext("2d").drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = rej; img.src = url;
  });
  $("#edPhoto").addEventListener("change", async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { edPhoto = await toSquare(f); drawPreview(); } catch { alert("No se pudo abrir la foto. / Couldn't open that photo."); }
  });
  $("#edNoPhoto").addEventListener("click", () => { edPhoto = null; drawPreview(); });

  $("#edReset").addEventListener("click", async () => {
    delete edits[edBase.id]; save(KEY.edits, edits);
    photos.delete(edBase.id); await db.del(edBase.id).catch(() => {});
    editor.close(); renderAll();
  });

  editor.addEventListener("close", async () => {
    if (editor.returnValue !== "save" || !edBase) return;
    const base = edBase, e = {};
    const v = (s) => $(s).value.trim();
    if (v("#edEs") && v("#edEs") !== base.es) e.es = v("#edEs");
    if (v("#edEn") && v("#edEn") !== base.en) e.en = v("#edEn");
    if (v("#edSayEs") !== (base.sayEs || "")) e.sayEs = v("#edSayEs");
    if (v("#edSayEn") !== (base.sayEn || "")) e.sayEn = v("#edSayEn");
    if (v("#edIcon") && v("#edIcon") !== base.icon) e.icon = v("#edIcon");
    if ($("#edHidden").checked) e.hidden = true;
    if (Object.keys(e).length) edits[base.id] = e; else delete edits[base.id];
    save(KEY.edits, edits);
    if (edPhoto) { photos.set(base.id, edPhoto); await db.put(base.id, edPhoto).catch(() => alert("No hay espacio para la foto. / No room for that photo.")); }
    else if (edPhoto === null) { photos.delete(base.id); await db.del(base.id).catch(() => {}); }
    renderAll();
  });

  // ---------- backup ----------
  $("#exportBtn").addEventListener("click", async () => {
    const data = { app: "lukas-habla", version: 1, saved: new Date().toISOString(), settings, edits, log, photos: Object.fromEntries(photos) };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const name = `${today()} Lukas Habla - backup.json`;
    const file = new File([blob], name, { type: "application/json" });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: name }); return; } catch {} }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
  $("#importFile").addEventListener("change", async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data.app !== "lukas-habla") throw new Error("not ours");
      if (!confirm("¿Reemplazar todo con esta copia? / Replace everything with this backup?")) return;
      settings = { ...DEFAULTS, ...data.settings }; edits = data.edits || {}; log = data.log || {};
      save(KEY.settings, settings); save(KEY.edits, edits); save(KEY.log, log);
      await db.clear(); photos.clear();
      for (const [id, v] of Object.entries(data.photos || {})) { photos.set(id, v); await db.put(id, v); }
      panel.close(); renderAll(); alert("¡Listo! / Done!");
    } catch { alert("Ese archivo no es una copia de Lukas Habla. / That file isn't a Lukas Habla backup."); }
    e.target.value = "";
  });
  $("#resetAll").addEventListener("click", async () => {
    if (!confirm("¿Borrar fotos y cambios y volver a lo original? / Delete photos and changes and start over?")) return;
    edits = {}; save(KEY.edits, edits); settings = { ...DEFAULTS }; save(KEY.settings, settings);
    await db.clear(); photos.clear(); panel.close(); renderAll();
  });

  // ---------- start ----------
  if (synth) { refreshVoices(); synth.onvoiceschanged = refreshVoices; }
  // Ask the browser to keep our data (photos) even when storage is tight.
  navigator.storage?.persist?.().catch(() => {});
  db.all().then((all) => { Object.entries(all).forEach(([k, v]) => photos.set(k, v)); renderAll(); }).catch(renderAll);
  renderAll();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
