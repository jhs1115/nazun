const els = {
  form: document.querySelector("#searchForm"),
  settingsForm: document.querySelector("#settingsForm"),
  gameName: document.querySelector("#gameName"),
  tagLine: document.querySelector("#tagLine"),
  region: document.querySelector("#region"),
  apiBaseUrl: document.querySelector("#apiBaseUrl"),
  notice: document.querySelector("#notice"),
  targetName: document.querySelector("#targetName"),
  totalCount: document.querySelector("#totalCount"),
  mapSplit: document.querySelector("#mapSplit"),
  riftCount: document.querySelector("#riftCount"),
  aramCount: document.querySelector("#aramCount"),
  riftList: document.querySelector("#riftList"),
  aramList: document.querySelector("#aramList"),
  template: document.querySelector("#matchTemplate"),
};

const storageKey = "inhouse-api-base-url";
const configuredBaseUrl = window.INHOUSE_CONFIG?.API_BASE_URL || "";

const demoData = {
  source: "demo",
  target: "장천동부모도둑감성준#6974",
  matches: [
    {
      matchId: "DEMO_RIFT_1",
      isDemo: true,
      map: "rift",
      mapName: "협곡",
      gameMode: "CLASSIC",
      gameStart: Date.now() - 1000 * 60 * 60 * 7,
      duration: 1814,
      player: { championName: "Yone", kills: 8, deaths: 5, assists: 9, win: true, teamId: 100 },
      teams: [
        ["장천동부모도둑감성준", "Mid Gap", "Jungle King", "Top Lane", "Bot Duo"],
        ["Friend A", "Friend B", "Friend C", "Friend D", "Friend E"],
      ],
    },
    {
      matchId: "DEMO_ARAM_1",
      isDemo: true,
      map: "aram",
      mapName: "칼바람",
      gameMode: "ARAM",
      gameStart: Date.now() - 1000 * 60 * 60 * 29,
      duration: 1190,
      player: { championName: "Ezreal", kills: 14, deaths: 8, assists: 21, win: false, teamId: 200 },
      teams: [
        ["Friend A", "Friend B", "Friend C", "Friend D", "Friend E"],
        ["장천동부모도둑감성준", "Snowball", "Poro Snack", "Bridge", "ARAM Enjoyer"],
      ],
    },
  ],
};

function setNotice(message, type = "") {
  els.notice.className = `notice ${type}`.trim();
  els.notice.textContent = message;
}

function getApiBaseUrl() {
  return (localStorage.getItem(storageKey) || configuredBaseUrl || "").replace(/\/+$/, "");
}

function getApiUrl(path) {
  const baseUrl = getApiBaseUrl();
  if (baseUrl) return `${baseUrl}${path}`;
  if (location.protocol === "http:" || location.protocol === "https:") return path;
  return "";
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}분 ${String(secs).padStart(2, "0")}초`;
}

function formatDate(ms) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function emptyState(container, message) {
  container.innerHTML = `<div class="empty">${message}</div>`;
}

function renderTeam(team, title) {
  return `
    <div class="team-box">
      <div class="team-title">${title}</div>
      ${team.map((name) => `<div class="summoner" title="${escapeHtml(name)}">${escapeHtml(name)}</div>`).join("")}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderMatch(match) {
  const node = els.template.content.firstElementChild.cloneNode(true);
  const player = match.player || {};
  const resultText = player.win ? "승리" : "패배";
  const resultClass = player.win ? "win" : "loss";

  node.querySelector("h3").textContent = `${match.mapName} · ${player.championName || "챔피언 정보 없음"}`;
  node.querySelector(".match-meta").textContent = `${formatDate(match.gameStart)} · ${formatDuration(match.duration)} · ${match.matchId}`;
  const result = node.querySelector(".result");
  result.textContent = resultText;
  result.classList.add(resultClass);
  node.querySelector(".player-line").innerHTML = `
    <strong>${escapeHtml(player.championName || "-")}</strong>
    <span>${player.kills ?? 0} / ${player.deaths ?? 0} / ${player.assists ?? 0}</span>
  `;
  node.querySelector(".sample-label").textContent = match.isDemo ? "샘플 팀 목록입니다. API 서버가 연결되면 실제 참가자 목록으로 바뀝니다." : "";
  node.querySelector(".team-grid").innerHTML = `
    ${renderTeam(match.teams?.[0] || [], "블루팀")}
    ${renderTeam(match.teams?.[1] || [], "레드팀")}
  `;
  return node;
}

function render(data) {
  const matches = data.matches || [];
  const rift = matches.filter((match) => match.map === "rift");
  const aram = matches.filter((match) => match.map === "aram");

  els.targetName.textContent = data.target || `${els.gameName.value}#${els.tagLine.value}`;
  els.totalCount.textContent = String(matches.length);
  els.mapSplit.textContent = `${rift.length} / ${aram.length}`;
  els.riftCount.textContent = `${rift.length}경기`;
  els.aramCount.textContent = `${aram.length}경기`;

  els.riftList.replaceChildren(...rift.map(renderMatch));
  els.aramList.replaceChildren(...aram.map(renderMatch));

  if (!rift.length) emptyState(els.riftList, "최근 기록에서 협곡 사용자 설정 5대5를 찾지 못했습니다.");
  if (!aram.length) emptyState(els.aramList, "최근 기록에서 칼바람 사용자 설정 5대5를 찾지 못했습니다.");
}

async function search(event) {
  event.preventDefault();
  const button = els.form.querySelector("button");
  const gameName = els.gameName.value.trim();
  const tagLine = els.tagLine.value.trim().replace(/^#/, "");
  const region = els.region.value;

  els.targetName.textContent = `${gameName}#${tagLine}`;
  button.disabled = true;
  setNotice("최근 경기에서 사용자 설정 5대5를 찾는 중입니다.");

  try {
    const params = new URLSearchParams({ gameName, tagLine, region, count: "80" });
    const apiUrl = getApiUrl(`/api/search?${params}`);

    if (!apiUrl) {
      render(demoData);
      setNotice("GitHub Pages에서 실제 전적을 보려면 API 서버 주소를 먼저 연결해야 합니다.", "warning");
      return;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "검색에 실패했습니다.");
    }

    render(data);
    if (data.source === "demo") {
      setNotice(data.message || "Riot API 키가 없어 데모 데이터를 표시합니다.", "warning");
    } else {
      setNotice(`${data.target}의 최근 사용자 설정 5대5 ${data.matches.length}경기를 불러왔습니다.`);
    }
  } catch (error) {
    render({ target: `${gameName}#${tagLine}`, matches: [] });
    setNotice(error.message, "error");
  } finally {
    button.disabled = false;
  }
}

function saveSettings(event) {
  event.preventDefault();
  const value = els.apiBaseUrl.value.trim().replace(/\/+$/, "");
  if (value.startsWith("RGAPI-")) {
    setNotice("이 값은 Riot API 키입니다. API 서버 주소 칸에는 https://...workers.dev 같은 주소를 넣어야 합니다.", "error");
    return;
  }
  if (value) {
    localStorage.setItem(storageKey, value);
    setNotice(`API 서버 주소를 저장했습니다: ${value}`);
  } else {
    localStorage.removeItem(storageKey);
    setNotice("API 서버 주소를 비웠습니다. 같은 주소의 /api/search를 사용합니다.", "warning");
  }
}

function initSettings() {
  els.apiBaseUrl.value = getApiBaseUrl();
  if (!getApiBaseUrl() && location.hostname.includes("github.io")) {
    setNotice("GitHub Pages에서는 먼저 API 서버 주소를 연결해야 실제 Riot 전적을 불러올 수 있습니다.", "warning");
  }
}

els.form.addEventListener("submit", search);
els.settingsForm.addEventListener("submit", saveSettings);
initSettings();
render(demoData);
