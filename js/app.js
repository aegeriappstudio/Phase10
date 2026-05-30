/* Phase 10 – Punkte-Erfassung
 * Datenmodell wird in localStorage gespeichert, läuft komplett offline.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "phase10-state-v1";
  const MAX_PHASE = 10;
  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 6;

  /** @typedef {{name:string, points:number[], done:boolean[]}} Player
   *  points[r] = Restpunkte in Runde r, done[r] = Phase in Runde r geschafft */

  let state = load() || null;

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const el = {
    tabs: document.querySelectorAll(".tab"),
    views: { game: $("#view-game"), rules: $("#view-rules") },
    setup: $("#setup"),
    playerInputs: $("#player-inputs"),
    addPlayer: $("#add-player"),
    startGame: $("#start-game"),
    game: $("#game"),
    roundCount: $("#round-count"),
    standings: $("#standings"),
    history: $("#history"),
    winnerBanner: $("#winner-banner"),
    newRound: $("#new-round"),
    undoRound: $("#undo-round"),
    resetGame: $("#reset-game"),
    dialog: $("#round-dialog"),
    dialogTitle: $("#round-dialog-title"),
    roundRows: $("#round-rows"),
    rulesContent: $("#rules-content"),
  };

  // ---------- Persistenz ----------
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }

  // ---------- Ableitungen ----------
  function rounds() {
    return state && state.players.length ? state.players[0].points.length : 0;
  }
  // Aktuelle Phase eines Spielers = 1 + Anzahl geschaffter Phasen (max 10)
  function currentPhase(p) {
    const completed = completedCount(p);
    return Math.min(completed + 1, MAX_PHASE);
  }
  function completedCount(p) {
    return p.done.filter(Boolean).length;
  }
  function totalPoints(p) {
    return p.points.reduce((a, b) => a + (b || 0), 0);
  }
  function isFinished(p) {
    return completedCount(p) >= MAX_PHASE;
  }
  // Gewinner: hat Phase 10 geschafft; bei Gleichstand wenigste Punkte
  function findWinner() {
    const finishers = state.players.filter(isFinished);
    if (!finishers.length) return null;
    return finishers.slice().sort((a, b) => totalPoints(a) - totalPoints(b))[0];
  }

  // ---------- Tab-Navigation ----------
  el.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      el.tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      Object.values(el.views).forEach((v) => v.classList.remove("is-active"));
      el.views[tab.dataset.view].classList.add("is-active");
    });
  });

  // ---------- Setup ----------
  function addPlayerInput(name = "") {
    const rows = el.playerInputs.children.length;
    if (rows >= MAX_PLAYERS) return;
    const idx = rows + 1;
    const row = document.createElement("div");
    row.className = "player-row";
    row.innerHTML = `
      <span class="seat">${idx}</span>
      <input type="text" maxlength="20" placeholder="Spieler ${idx}" value="${escapeAttr(name)}" />
      <button class="remove" type="button" title="Entfernen" aria-label="Entfernen">×</button>`;
    row.querySelector(".remove").addEventListener("click", () => {
      row.remove();
      renumberSeats();
    });
    row.querySelector("input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); startGame(); }
    });
    el.playerInputs.appendChild(row);
  }
  function renumberSeats() {
    [...el.playerInputs.children].forEach((row, i) => {
      row.querySelector(".seat").textContent = i + 1;
      const inp = row.querySelector("input");
      if (!inp.value) inp.placeholder = `Spieler ${i + 1}`;
    });
  }
  el.addPlayer.addEventListener("click", () => addPlayerInput());

  function startGame() {
    const names = [...el.playerInputs.querySelectorAll("input")]
      .map((i, idx) => i.value.trim() || `Spieler ${idx + 1}`);
    if (names.length < MIN_PLAYERS) {
      flash(el.startGame, "Mind. 2 Spieler");
      return;
    }
    state = { players: names.map((name) => ({ name, points: [], done: [] })) };
    save();
    render();
  }
  el.startGame.addEventListener("click", startGame);

  // ---------- Runden-Dialog ----------
  el.newRound.addEventListener("click", openRoundDialog);

  function openRoundDialog() {
    if (findWinner()) {
      if (!confirm("Das Spiel ist beendet. Trotzdem eine weitere Runde erfassen?")) return;
    }
    el.dialogTitle.textContent = `Durchgang ${rounds() + 1} erfassen`;
    el.roundRows.innerHTML = state.players.map((p, i) => {
      const ph = currentPhase(p);
      const finished = isFinished(p);
      return `
        <div class="round-row" data-i="${i}">
          <div class="rr-name">${escapeHtml(p.name)}
            <div class="rr-phase">${finished ? "Alle Phasen geschafft ✓" : "Aktuell: Phase " + ph}</div>
          </div>
          <input class="rr-points" type="number" inputmode="numeric" min="0" step="5"
                 value="0" aria-label="Restpunkte ${escapeAttr(p.name)}" />
          <label class="rr-check">
            <input type="checkbox" ${finished ? "disabled" : ""} />
            Phase ${finished ? "✓" : ph + " ok"}
          </label>
        </div>`;
    }).join("");

    // Punkte-Feld bei Fokus selektieren
    el.roundRows.querySelectorAll(".rr-points").forEach((inp) => {
      inp.addEventListener("focus", () => inp.select());
    });
    el.dialog.showModal();
    el.roundRows.querySelector(".rr-points").focus();
  }

  // Dialog-Schließen verarbeiten
  el.dialog.addEventListener("close", () => {
    if (el.dialog.returnValue !== "save") return;
    const rows = el.roundRows.querySelectorAll(".round-row");
    rows.forEach((row) => {
      const i = +row.dataset.i;
      const p = state.players[i];
      const pts = Math.max(0, Math.round(+row.querySelector(".rr-points").value || 0));
      const chk = row.querySelector('input[type="checkbox"]');
      const done = chk.checked && !chk.disabled && !isFinished(p);
      p.points.push(pts);
      p.done.push(done);
    });
    save();
    render();
  });

  // ---------- Letzte Runde löschen ----------
  el.undoRound.addEventListener("click", () => {
    if (rounds() === 0) return;
    if (!confirm("Die zuletzt erfasste Runde wirklich löschen?")) return;
    state.players.forEach((p) => { p.points.pop(); p.done.pop(); });
    save();
    render();
  });

  // ---------- Neues Spiel ----------
  el.resetGame.addEventListener("click", () => {
    if (!confirm("Aktuelles Spiel verwerfen und ein neues starten?")) return;
    state = null;
    localStorage.removeItem(STORAGE_KEY);
    render();
  });

  // ---------- Rendering ----------
  function render() {
    // Setup vs. Spiel
    if (!state) {
      el.setup.classList.remove("hidden");
      el.game.classList.add("hidden");
      el.playerInputs.innerHTML = "";
      addPlayerInput();
      addPlayerInput();
    } else {
      el.setup.classList.add("hidden");
      el.game.classList.remove("hidden");
      renderStandings();
      renderHistory();
      renderWinner();
      el.roundCount.textContent = rounds();
      el.undoRound.disabled = rounds() === 0;
      el.undoRound.style.opacity = rounds() === 0 ? 0.5 : 1;
    }
  }

  function renderStandings() {
    const winner = findWinner();
    // Sortierung: zuerst nach geschafften Phasen (absteigend), dann nach Punkten (aufsteigend)
    const ranked = state.players
      .map((p) => ({ p, total: totalPoints(p), comp: completedCount(p) }))
      .sort((a, b) => b.comp - a.comp || a.total - b.total);

    const head = `
      <thead><tr>
        <th class="rank">#</th><th>Spieler</th><th>Phase</th><th style="text-align:right">Punkte</th>
      </tr></thead>`;
    const body = ranked.map((r, i) => {
      const p = r.p;
      const finished = isFinished(p);
      const phaseLabel = finished
        ? `<span class="phase-pill phase-done">Fertig ✓</span>`
        : `<span class="phase-pill">Phase ${currentPhase(p)}</span>`;
      return `
        <tr class="${winner === p ? "is-winner" : ""}">
          <td class="rank">${i + 1}</td>
          <td class="pname">${escapeHtml(p.name)}</td>
          <td class="phase-cell">${phaseLabel} <small style="color:var(--muted)">(${r.comp}/10)</small></td>
          <td class="total">${r.total}</td>
        </tr>`;
    }).join("");
    el.standings.innerHTML = head + "<tbody>" + body + "</tbody>";
  }

  function renderHistory() {
    const n = rounds();
    if (n === 0) {
      el.history.innerHTML =
        `<tbody><tr><td class="empty">Noch keine Runde erfasst. Tippe auf „+ Runde erfassen“.</td></tr></tbody>`;
      return;
    }
    const head = `<thead><tr><th>Runde</th>${
      state.players.map((p) => `<th>${escapeHtml(p.name)}</th>`).join("")
    }</tr></thead>`;

    let body = "";
    for (let r = 0; r < n; r++) {
      body += `<tr><td class="rnd">${r + 1}</td>${
        state.players.map((p) => {
          const pts = p.points[r] ?? 0;
          const done = p.done[r];
          return `<td>
            <span class="cell-pts">${pts}</span>
            <div class="cell-phase">${done ? '<span class="ok">Phase ✓</span>' : "Phase –"}</div>
          </td>`;
        }).join("")
      }</tr>`;
    }
    // Summenzeile
    body += `<tr style="background:var(--bg-2)"><td class="rnd">Σ</td>${
      state.players.map((p) =>
        `<td><span class="cell-pts" style="color:var(--gold-2)">${totalPoints(p)}</span>
         <div class="cell-phase">${completedCount(p)}/10 Phasen</div></td>`).join("")
    }</tr>`;

    el.history.innerHTML = head + "<tbody>" + body + "</tbody>";
  }

  function renderWinner() {
    const winner = findWinner();
    if (!winner) { el.winnerBanner.classList.add("hidden"); return; }
    el.winnerBanner.classList.remove("hidden");
    el.winnerBanner.innerHTML =
      `🎉 <strong>${escapeHtml(winner.name)}</strong> hat alle 10 Phasen geschafft und gewinnt mit
       ${totalPoints(winner)} Punkten!`;
  }

  // ---------- Helfer ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }
  function flash(node, msg) {
    const old = node.textContent;
    node.textContent = msg;
    node.disabled = true;
    setTimeout(() => { node.textContent = old; node.disabled = false; }, 1200);
  }

  // ---------- Init ----------
  el.rulesContent.innerHTML = buildRulesHTML();
  render();
})();
