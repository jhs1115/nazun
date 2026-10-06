const els = {
  authOpenButton: document.querySelector("#authOpenButton"),
  themeToggle: document.querySelector("#themeToggle"),
  menuToggle: document.querySelector("#menuToggle"),
  screenTabs: document.querySelector("#screenTabs"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  playerForm: document.querySelector("#playerForm"),
  playerNameInput: document.querySelector("#playerNameInput"),
  playerTierInput: document.querySelector("#playerTierInput"),
  playerLaneInput: document.querySelector("#playerLaneInput"),
  playerList: document.querySelector("#playerList"),
  adminPlayerList: document.querySelector("#adminPlayerList"),
  clearPlayersButton: document.querySelector("#clearPlayersButton"),
  inhouseMatchForm: document.querySelector("#inhouseMatchForm"),
  blueTeamInput: document.querySelector("#blueTeamInput"),
  redTeamInput: document.querySelector("#redTeamInput"),
  winnerInput: document.querySelector("#winnerInput"),
  matchMemoInput: document.querySelector("#matchMemoInput"),
  clearMatchesButton: document.querySelector("#clearMatchesButton"),
  rankingTable: document.querySelector("#rankingTable"),
  historyList: document.querySelector("#historyList"),
  authModal: document.querySelector("#authModal"),
  authCloseButton: document.querySelector("#authCloseButton"),
  loginPane: document.querySelector("#loginPane"),
  signupPane: document.querySelector("#signupPane"),
  loginUsername: document.querySelector("#loginUsername"),
  loginPassword: document.querySelector("#loginPassword"),
  loginButton: document.querySelector("#loginButton"),
  loginMessage: document.querySelector("#loginMessage"),
  signupUsername: document.querySelector("#signupUsername"),
  signupPassword: document.querySelector("#signupPassword"),
  signupButton: document.querySelector("#signupButton"),
  signupMessage: document.querySelector("#signupMessage"),
  showSignupButton: document.querySelector("#showSignupButton"),
  showLoginButton: document.querySelector("#showLoginButton"),
  toggleLoginPassword: document.querySelector("#toggleLoginPassword"),
  toggleSignupPassword: document.querySelector("#toggleSignupPassword"),
  adminLock: document.querySelector("#adminLock"),
  adminContent: document.querySelector("#adminContent"),
  adminPasswordInput: document.querySelector("#adminPasswordInput"),
  adminUnlockButton: document.querySelector("#adminUnlockButton"),
  adminMessage: document.querySelector("#adminMessage"),
};

const PLAYER_STORE_KEY = "nazun-players-v2";
const MATCH_STORE_KEY = "nazun-matches";
const SUPABASE_CONFIG = window.NAZUN_SUPABASE || {};
const SUPABASE_READY = Boolean(window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
const supabaseClient = SUPABASE_READY
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;
const AUTH_REDIRECT_URL = SUPABASE_CONFIG.redirectUrl || `${window.location.origin}${window.location.pathname}`;

const state = {
  players: readStore(PLAYER_STORE_KEY, []),
  matches: readStore(MATCH_STORE_KEY, []),
  currentUser: null,
  editingPlayerIndex: null,
  adminUnlocked: sessionStorage.getItem("nazun-admin-unlocked") === "1",
};

const ADMIN_PASSWORD = "jhs081115jhs";

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

function setMessage(el, message, isError = false) {
  el.textContent = message;
  el.classList.toggle("error", isError);
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
  if (name === "admin" && !state.adminUnlocked) {
    els.adminPasswordInput.value = "";
    setMessage(els.adminMessage, "");
  }
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === name));
  els.views.forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
  els.screenTabs.classList.remove("open");
}

function openAuth(mode = "login") {
  els.authModal.classList.add("open");
  els.authModal.setAttribute("aria-hidden", "false");
  showAuthPane(mode);
}

function closeAuth() {
  els.authModal.classList.remove("open");
  els.authModal.setAttribute("aria-hidden", "true");
}

function showAuthPane(mode) {
  const signup = mode === "signup";
  els.loginPane.classList.toggle("active", !signup);
  els.signupPane.classList.toggle("active", signup);
  setMessage(els.loginMessage, "");
  setMessage(els.signupMessage, "");
}

function togglePassword(input, button) {
  const visible = input.type === "text";
  input.type = visible ? "password" : "text";
  button.textContent = visible ? "보기" : "숨기기";
}

function getUserLabel(user) {
  return user?.user_metadata?.display_name || user?.email || "";
}

function setCurrentUser(user) {
  state.currentUser = user || null;
  renderAuth();
}

function renderAuth() {
  const label = getUserLabel(state.currentUser);
  if (label) {
    els.authOpenButton.textContent = `${label} 로그아웃`;
  } else {
    els.authOpenButton.textContent = "로그인";
  }
}

function checkSupabaseReady(messageEl) {
  if (SUPABASE_READY) return true;
  setMessage(messageEl, "Supabase 설정을 찾지 못했습니다.", true);
  return false;
}

async function signup() {
  if (!checkSupabaseReady(els.signupMessage)) return;
  const email = els.signupUsername.value.trim();
  const password = els.signupPassword.value;
  if (!email || !password) {
    setMessage(els.signupMessage, "이메일과 비밀번호를 입력하세요.", true);
    return;
  }
  if (password.length < 6) {
    setMessage(els.signupMessage, "비밀번호는 6자 이상으로 해주세요.", true);
    return;
  }

  els.signupButton.disabled = true;
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: AUTH_REDIRECT_URL,
      data: {
        display_name: email.split("@")[0],
      },
    },
  });
  els.signupButton.disabled = false;

  if (error) {
    setMessage(els.signupMessage, error.message, true);
    return;
  }

  if (data.user && !data.session) {
    setMessage(els.signupMessage, "가입 확인 메일을 보냈습니다. 메일 인증 후 로그인하세요.");
    return;
  }

  setCurrentUser(data.user);
  els.signupUsername.value = "";
  els.signupPassword.value = "";
  closeAuth();
}

async function login() {
  if (!checkSupabaseReady(els.loginMessage)) return;
  const email = els.loginUsername.value.trim();
  const password = els.loginPassword.value;
  if (!email || !password) {
    setMessage(els.loginMessage, "이메일과 비밀번호를 입력하세요.", true);
    return;
  }

  els.loginButton.disabled = true;
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  els.loginButton.disabled = false;

  if (error) {
    setMessage(els.loginMessage, "이메일이나 비밀번호가 맞지 않습니다.", true);
    return;
  }

  setCurrentUser(data.user);
  els.loginPassword.value = "";
  closeAuth();
}

async function logout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  setCurrentUser(null);
}

async function initAuth() {
  if (!supabaseClient) {
    renderAuth();
    return;
  }

  const { data } = await supabaseClient.auth.getUser();
  setCurrentUser(data.user);
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    setCurrentUser(session?.user || null);
  });
}

function toggleTheme() {
  const dark = !document.body.classList.contains("dark-mode");
  document.body.classList.toggle("dark-mode", dark);
  localStorage.setItem("nazun-theme", dark ? "dark" : "light");
  els.themeToggle.textContent = dark ? "라이트모드" : "다크모드";
  applyToolTheme();
}

function initTheme() {
  const dark = localStorage.getItem("nazun-theme") === "dark";
  document.body.classList.toggle("dark-mode", dark);
  els.themeToggle.textContent = dark ? "라이트모드" : "다크모드";
  applyToolTheme();
}

function applyToolTheme() {
  const dark = document.body.classList.contains("dark-mode");
  document.querySelectorAll(".tool-view iframe").forEach((frame) => {
    try {
      frame.contentDocument?.body?.classList.toggle("dark-mode", dark);
    } catch {
      // Same-origin iframe expected. Ignore until the frame finishes loading.
    }
  });
}

function renderPlayers() {
  const publicRows = state.players.map((player) => {
    const row = document.createElement("div");
    row.className = "player-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        <div class="player-meta"><span class="tier-badge ${tierClass(player.tier)}">${escapeHtml(player.tier)}</span> · ${escapeHtml(player.lane)}</div>
      </div>
    `;
    return row;
  });
  els.playerList.replaceChildren(...publicRows);

  const adminRows = state.players.map((player, index) => {
      const row = document.createElement("div");
      row.className = "player-row";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(player.name)}</strong>
          <div class="player-meta"><span class="tier-badge ${tierClass(player.tier)}">${escapeHtml(player.tier)}</span> · ${escapeHtml(player.lane)}</div>
        </div>
        <div class="row-actions">
          <button class="ghost" type="button" data-edit-player="${index}">수정</button>
          <button class="ghost" type="button" data-remove-player="${index}">삭제</button>
        </div>
      `;
      return row;
  });
  els.adminPlayerList.replaceChildren(...adminRows);

  if (!state.players.length) {
    els.playerList.innerHTML = `<div class="empty">참가자를 추가하세요.</div>`;
    els.adminPlayerList.innerHTML = `<div class="empty">참가자를 추가하세요.</div>`;
  }
}

function tierClass(tier) {
  const map = {
    "아이언": "tier-iron",
    "브론즈": "tier-bronze",
    "실버": "tier-silver",
    "골드": "tier-gold",
    "플래티넘": "tier-platinum",
    "에메랄드": "tier-emerald",
    "다이아": "tier-diamond",
    "마스터+": "tier-master",
  };
  return map[tier] || "tier-default";
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

function renderAdmin() {
  els.adminLock.hidden = state.adminUnlocked;
  els.adminContent.hidden = !state.adminUnlocked;
}

function renderManager() {
  renderPlayers();
  renderRankings();
  renderHistory();
  renderAdmin();
}

function savePlayers() {
  writeStore(PLAYER_STORE_KEY, state.players);
}

function saveMatches() {
  writeStore(MATCH_STORE_KEY, state.matches);
}

els.menuToggle.addEventListener("click", () => {
  els.screenTabs.classList.toggle("open");
});

els.themeToggle.addEventListener("click", toggleTheme);

els.authOpenButton.addEventListener("click", () => {
  if (state.currentUser) {
    logout();
    return;
  }
  openAuth("login");
});

els.authCloseButton.addEventListener("click", closeAuth);
els.showSignupButton.addEventListener("click", () => showAuthPane("signup"));
els.showLoginButton.addEventListener("click", () => showAuthPane("login"));
els.signupButton.addEventListener("click", () => signup());
els.loginButton.addEventListener("click", () => login());
els.toggleLoginPassword.addEventListener("click", () => togglePassword(els.loginPassword, els.toggleLoginPassword));
els.toggleSignupPassword.addEventListener("click", () => togglePassword(els.signupPassword, els.toggleSignupPassword));
els.loginPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") login();
});
els.signupPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") signup();
});
els.authModal.addEventListener("click", (event) => {
  if (event.target === els.authModal) closeAuth();
});

els.tabs.forEach((tab) => tab.addEventListener("click", () => activateView(tab.dataset.view)));

document.querySelectorAll(".tool-view iframe").forEach((frame) => {
  frame.addEventListener("load", applyToolTheme);
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".screen-menu") || event.target.closest("#screenTabs")) return;
  els.screenTabs.classList.remove("open");
});

els.playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = els.playerNameInput.value.trim();
  if (!name) return;
  const nextPlayer = { name, tier: els.playerTierInput.value, lane: els.playerLaneInput.value };
  if (state.editingPlayerIndex === null) {
    state.players.push(nextPlayer);
  } else {
    state.players[state.editingPlayerIndex] = nextPlayer;
    state.editingPlayerIndex = null;
    els.playerForm.querySelector("button").textContent = "추가";
  }
  els.playerNameInput.value = "";
  savePlayers();
  renderManager();
});

els.adminPlayerList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-player]");
  if (editButton) {
    const index = Number(editButton.dataset.editPlayer);
    const player = state.players[index];
    state.editingPlayerIndex = index;
    els.playerNameInput.value = player.name;
    els.playerTierInput.value = player.tier;
    els.playerLaneInput.value = player.lane;
    els.playerForm.querySelector("button").textContent = "수정 완료";
    return;
  }
  const button = event.target.closest("[data-remove-player]");
  if (!button) return;
  state.players.splice(Number(button.dataset.removePlayer), 1);
  state.editingPlayerIndex = null;
  els.playerForm.querySelector("button").textContent = "추가";
  savePlayers();
  renderManager();
});

els.clearPlayersButton.addEventListener("click", () => {
  state.players = [];
  savePlayers();
  renderManager();
});

els.adminUnlockButton.addEventListener("click", () => {
  if (els.adminPasswordInput.value !== ADMIN_PASSWORD) {
    setMessage(els.adminMessage, "비밀번호가 맞지 않습니다.", true);
    return;
  }
  state.adminUnlocked = true;
  sessionStorage.setItem("nazun-admin-unlocked", "1");
  setMessage(els.adminMessage, "");
  renderManager();
});

els.adminPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") els.adminUnlockButton.click();
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

initTheme();
initAuth();
renderManager();
