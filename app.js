const els = {
  menuToggle: document.querySelector("#menuToggle"),
  screenTabs: document.querySelector("#screenTabs"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  memberCount: document.querySelector("#memberCount"),
  recordCount: document.querySelector("#recordCount"),
  playerForm: document.querySelector("#playerForm"),
  playerNameInput: document.querySelector("#playerNameInput"),
  playerTierInput: document.querySelector("#playerTierInput"),
  playerLaneInput: document.querySelector("#playerLaneInput"),
  playerList: document.querySelector("#playerList"),
  clearPlayersButton: document.querySelector("#clearPlayersButton"),
  inhouseMatchForm: document.querySelector("#inhouseMatchForm"),
  blueTeamInput: document.querySelector("#blueTeamInput"),
  redTeamInput: document.querySelector("#redTeamInput"),
  winnerInput: document.querySelector("#winnerInput"),
  matchMemoInput: document.querySelector("#matchMemoInput"),
  clearMatchesButton: document.querySelector("#clearMatchesButton"),
  rankingTable: document.querySelector("#rankingTable"),
  historyList: document.querySelector("#historyList"),
};

const state = {
  players: readStore("nazun-players", [
    { name: "감성준", tier: "골드", lane: "Mid" },
    { name: "힘웃사", tier: "골드", lane: "Jug" },
    { name: "그그달", tier: "골드", lane: "Adc" },
    { name: "레전드", tier: "플래티넘", lane: "Adc" },
    { name: "다람쥐", tier: "플래티넘", lane: "Mid" },
  ]),
  matches: readStore("nazun-matches", []),
};

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitNames(value) {
  return value
    .split(/\r?\n|,/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function activateView(name) {
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === name));
  els.views.forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
  els.screenTabs.classList.remove("open");
}

function renderPlayers() {
  els.memberCount.textContent = `${state.players.length}명`;
  els.playerList.replaceChildren(
    ...state.players.map((player, index) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(player.name)}</strong>
          <div class="player-meta">${escapeHtml(player.tier)} · ${escapeHtml(player.lane)}</div>
        </div>
        <button class="ghost" type="button" data-remove-player="${index}">삭제</button>
      `;
      return row;
    })
  );
  if (!state.players.length) {
    els.playerList.innerHTML = `<div class="empty">참가자를 추가하세요.</div>`;
  }
}

function renderRankings() {
  const table = new Map();
  for (const player of state.players) {
    table.set(player.name, { name: player.name, win: 0, loss: 0, games: 0 });
  }

  for (const match of state.matches) {
    const winners = match.winner === "blue" ? match.blue : match.red;
    const losers = match.winner === "blue" ? match.red : match.blue;
    for (const name of winners) {
      if (!table.has(name)) table.set(name, { name, win: 0, loss: 0, games: 0 });
      const item = table.get(name);
      item.win += 1;
      item.games += 1;
    }
    for (const name of losers) {
      if (!table.has(name)) table.set(name, { name, win: 0, loss: 0, games: 0 });
      const item = table.get(name);
      item.loss += 1;
      item.games += 1;
    }
  }

  const rows = [...table.values()].sort((a, b) => b.win - a.win || a.loss - b.loss || a.name.localeCompare(b.name, "ko"));
  els.rankingTable.replaceChildren(
    ...rows.map((row, index) => {
      const winRate = row.games ? Math.round((row.win / row.games) * 100) : 0;
      const el = document.createElement("div");
      el.className = "rank-row";
      el.innerHTML = `
        <div>
          <strong>${index + 1}. ${escapeHtml(row.name)}</strong>
          <div class="rank-meta">${row.games}전 ${row.win}승 ${row.loss}패 · 승률 ${winRate}%</div>
        </div>
        <span>${row.win}W</span>
      `;
      return el;
    })
  );
}

function renderHistory() {
  els.recordCount.textContent = `${state.matches.length}경기`;
  els.historyList.replaceChildren(
    ...state.matches.map((match, index) => {
      const el = document.createElement("div");
      el.className = "history-row";
      const winner = match.winner === "blue" ? "블루팀" : "레드팀";
      el.innerHTML = `
        <div>
          <strong>${winner} 승리</strong>
          <div class="history-meta">블루: ${escapeHtml(match.blue.join(", "))}<br />레드: ${escapeHtml(match.red.join(", "))}</div>
          <div class="history-meta">${escapeHtml(match.memo || "메모 없음")}</div>
        </div>
        <button class="ghost" type="button" data-remove-match="${index}">삭제</button>
      `;
      return el;
    })
  );
  if (!state.matches.length) {
    els.historyList.innerHTML = `<div class="empty">아직 저장된 내전 기록이 없습니다.</div>`;
  }
}

function renderManager() {
  renderPlayers();
  renderRankings();
  renderHistory();
}

function savePlayers() {
  writeStore("nazun-players", state.players);
}

function saveMatches() {
  writeStore("nazun-matches", state.matches);
}

els.menuToggle.addEventListener("click", () => {
  els.screenTabs.classList.toggle("open");
});

els.tabs.forEach((tab) => tab.addEventListener("click", () => activateView(tab.dataset.view)));

document.addEventListener("click", (event) => {
  if (event.target.closest(".screen-menu") || event.target.closest("#screenTabs")) return;
  els.screenTabs.classList.remove("open");
});

els.playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = els.playerNameInput.value.trim();
  if (!name) return;
  state.players.push({ name, tier: els.playerTierInput.value, lane: els.playerLaneInput.value });
  els.playerNameInput.value = "";
  savePlayers();
  renderManager();
});

els.playerList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-player]");
  if (!button) return;
  state.players.splice(Number(button.dataset.removePlayer), 1);
  savePlayers();
  renderManager();
});

els.clearPlayersButton.addEventListener("click", () => {
  state.players = [];
  savePlayers();
  renderManager();
});

els.inhouseMatchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const blue = splitNames(els.blueTeamInput.value);
  const red = splitNames(els.redTeamInput.value);
  if (!blue.length || !red.length) return;
  state.matches.unshift({
    blue,
    red,
    winner: els.winnerInput.value,
    memo: els.matchMemoInput.value.trim(),
    createdAt: Date.now(),
  });
  els.blueTeamInput.value = "";
  els.redTeamInput.value = "";
  els.matchMemoInput.value = "";
  saveMatches();
  renderManager();
});

els.historyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-match]");
  if (!button) return;
  state.matches.splice(Number(button.dataset.removeMatch), 1);
  saveMatches();
  renderManager();
});

els.clearMatchesButton.addEventListener("click", () => {
  state.matches = [];
  saveMatches();
  renderManager();
});

renderManager();
