const apiBaseUrl = (window.INHOUSE_CONFIG?.API_BASE_URL || "").replace(/\/+$/, "");

const els = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  apiState: document.querySelector("#apiState"),
  form: document.querySelector("#searchForm"),
  gameName: document.querySelector("#gameName"),
  tagLine: document.querySelector("#tagLine"),
  region: document.querySelector("#region"),
  notice: document.querySelector("#notice"),
  targetName: document.querySelector("#targetName"),
  totalCount: document.querySelector("#totalCount"),
  winLoss: document.querySelector("#winLoss"),
  matchList: document.querySelector("#matchList"),
  matchTemplate: document.querySelector("#matchTemplate"),
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

function setNotice(message, type = "") {
  els.notice.className = `notice ${type}`.trim();
  els.notice.textContent = message;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(ms) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function formatDuration(seconds) {
  const min = Math.floor((seconds || 0) / 60);
  const sec = Math.floor((seconds || 0) % 60);
  return `${min}분 ${String(sec).padStart(2, "0")}초`;
}

function queueLabel(queueId, gameMode) {
  const labels = {
    400: "일반 교차 선택",
    420: "솔로랭크",
    430: "일반 비공개 선택",
    440: "자유랭크",
    450: "칼바람",
    490: "빠른 대전",
  };
  return labels[queueId] || gameMode || `Queue ${queueId}`;
}

function activateView(name) {
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === name));
  els.views.forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
}

function renderMatch(match) {
  const node = els.matchTemplate.content.firstElementChild.cloneNode(true);
  const player = match.player || {};
  const participants = match.teams?.flat?.() || [];
  node.querySelector("h3").textContent = `${match.mapName || "소환사의 협곡"} · ${player.championName || "챔피언 정보 없음"}`;
  node.querySelector(".match-meta").textContent = `${formatDate(match.gameStart)} · ${formatDuration(match.duration)} · ${match.matchId}`;
  node.querySelector(".champion").textContent = player.championName || "-";
  node.querySelector(".kda").textContent = `${player.kills ?? 0} / ${player.deaths ?? 0} / ${player.assists ?? 0}`;
  node.querySelector(".queue").textContent = queueLabel(match.queueId, match.gameMode);
  const result = node.querySelector(".result");
  result.textContent = player.win ? "승리" : "패배";
  result.classList.add(player.win ? "win" : "loss");
  node.querySelector(".participants").textContent = participants.length ? participants.join(" · ") : "참가자 정보 없음";
  return node;
}

function renderSearch(data) {
  const matches = data.matches || [];
  const wins = matches.filter((match) => match.player?.win).length;
  els.targetName.textContent = data.target || `${els.gameName.value}#${els.tagLine.value}`;
  els.totalCount.textContent = String(matches.length);
  els.winLoss.textContent = `${wins} / ${matches.length - wins}`;
  els.matchList.replaceChildren(...matches.map(renderMatch));
  if (!matches.length) {
    els.matchList.innerHTML = `<div class="empty">최근 조회 범위에서 표시할 일반/랭크 전적이 없습니다.</div>`;
  }
}

async function search(event) {
  event.preventDefault();
  const button = els.form.querySelector("button");
  const gameName = els.gameName.value.trim();
  const tagLine = els.tagLine.value.trim().replace(/^#/, "");
  const region = els.region.value;
  button.disabled = true;
  setNotice("Riot API에서 최근 전적을 가져오는 중입니다.");

  try {
    const params = new URLSearchParams({ gameName, tagLine, region, count: "10", mode: "all" });
    const response = await fetch(`${apiBaseUrl}/api/search?${params}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "검색 실패");
    renderSearch(data);
    setNotice(`${data.target} 최근 전적 ${data.matches.length}개를 불러왔습니다.`);
  } catch (error) {
    renderSearch({ target: `${gameName}#${tagLine}`, matches: [] });
    setNotice(error.message, "error");
  } finally {
    button.disabled = false;
  }
}

function splitNames(value) {
  return value
    .split(/\r?\n|,/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function renderPlayers() {
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

els.tabs.forEach((tab) => tab.addEventListener("click", () => activateView(tab.dataset.view)));
els.form.addEventListener("submit", search);

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

els.apiState.textContent = apiBaseUrl ? "Riot API 자동 연결" : "API 주소 없음";
renderManager();
renderSearch({ target: "장천동부모도둑감성준#6974", matches: [] });
