const els = {
  authOpenButton: document.querySelector("#authOpenButton"),
  userMenu: document.querySelector("#userMenu"),
  openRenameButton: document.querySelector("#openRenameButton"),
  logoutButton: document.querySelector("#logoutButton"),
  patchNoteButton: document.querySelector("#patchNoteButton"),
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
  blueTeamSelects: document.querySelectorAll('[data-match-team="blue"]'),
  redTeamSelects: document.querySelectorAll('[data-match-team="red"]'),
  winnerInput: document.querySelector("#winnerInput"),
  matchMemoInput: document.querySelector("#matchMemoInput"),
  matchFormMessage: document.querySelector("#matchFormMessage"),
  resetRankingButton: document.querySelector("#resetRankingButton"),
  rankingTable: document.querySelector("#rankingTable"),
  historyList: document.querySelector("#historyList"),
  adminHistoryList: document.querySelector("#adminHistoryList"),
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
  patchModal: document.querySelector("#patchModal"),
  patchCloseButton: document.querySelector("#patchCloseButton"),
  renameModal: document.querySelector("#renameModal"),
  renameCloseButton: document.querySelector("#renameCloseButton"),
  renameCancelButton: document.querySelector("#renameCancelButton"),
  renameSaveButton: document.querySelector("#renameSaveButton"),
  renameNameInput: document.querySelector("#renameNameInput"),
  renamePasswordInput: document.querySelector("#renamePasswordInput"),
  renameMessage: document.querySelector("#renameMessage"),
};

const PLAYER_STORE_KEY = "nazun-players-v2";
const MATCH_STORE_KEY = "nazun-matches";
const MATCH_TABLE = "nazun_matches";
const COMMENT_TABLE = "nazun_match_comments";
const COMMENT_REACTION_TABLE = "nazun_match_comment_reactions";
const MAX_MATCHES = 10;
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
  adminUnlocked: false,
  openComments: new Set(),
  remoteMatchesReady: false,
  realtimeChannel: null,
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

function playerByName(name) {
  return state.players.find((player) => player.name === name);
}

function getMatchId(match) {
  if (!match.id) {
    match.id = `match-${match.createdAt || Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return match.id;
}

function normalizeRemoteMatch(row, commentsByMatch) {
  return {
    id: row.id,
    blue: Array.isArray(row.blue) ? row.blue : [],
    red: Array.isArray(row.red) ? row.red : [],
    winner: row.winner === "red" ? "red" : "blue",
    memo: row.memo || "",
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
    comments: commentsByMatch.get(row.id) || [],
  };
}

function matchToRemoteRow(match) {
  return {
    id: getMatchId(match),
    blue: match.blue,
    red: match.red,
    winner: match.winner,
    memo: match.memo || "",
    created_at: new Date(match.createdAt || Date.now()).toISOString(),
  };
}

function commentToRemoteRow(match, comment) {
  return {
    id: comment.id,
    match_id: getMatchId(match),
    user_id: state.currentUser?.id || null,
    author: comment.author || getUserLabel(state.currentUser) || "익명",
    message: comment.text,
    created_at: new Date(comment.createdAt || Date.now()).toISOString(),
  };
}

function formatDate(value) {
  const date = new Date(value || Date.now());
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function findDuplicateName(names) {
  const seen = new Set();
  for (const name of names) {
    if (seen.has(name)) return name;
    seen.add(name);
  }
  return "";
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

function openRenameModal() {
  els.userMenu.classList.remove("open");
  els.renameNameInput.value = getUserLabel(state.currentUser);
  els.renamePasswordInput.value = "";
  setMessage(els.renameMessage, "");
  els.renameModal.classList.add("open");
  els.renameModal.setAttribute("aria-hidden", "false");
  els.renameNameInput.focus();
}

function closeRenameModal() {
  els.renameModal.classList.remove("open");
  els.renameModal.setAttribute("aria-hidden", "true");
}

function openPatchNotes() {
  els.patchModal.classList.add("open");
  els.patchModal.setAttribute("aria-hidden", "false");
}

function closePatchNotes() {
  els.patchModal.classList.remove("open");
  els.patchModal.setAttribute("aria-hidden", "true");
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
  return user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";
}

function setCurrentUser(user) {
  state.currentUser = user || null;
  renderAuth();
  if (supabaseClient) {
    loadRemoteMatches();
  }
}

function renderAuth() {
  const label = getUserLabel(state.currentUser);
  if (label) {
    els.authOpenButton.textContent = label;
  } else {
    els.authOpenButton.textContent = "로그인";
    els.userMenu.classList.remove("open");
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
  els.userMenu.classList.remove("open");
  setCurrentUser(null);
}

async function renameUser() {
  if (!state.currentUser?.email) {
    closeRenameModal();
    openAuth("login");
    return;
  }
  if (!checkSupabaseReady(els.renameMessage)) return;

  const nextName = els.renameNameInput.value.trim();
  const password = els.renamePasswordInput.value;
  if (!nextName || !password) {
    setMessage(els.renameMessage, "변경할 이름과 비밀번호를 입력하세요.", true);
    return;
  }
  if (nextName.length > 18) {
    setMessage(els.renameMessage, "이름은 18자 이하로 입력하세요.", true);
    return;
  }

  els.renameSaveButton.disabled = true;
  const loginResult = await supabaseClient.auth.signInWithPassword({
    email: state.currentUser.email,
    password,
  });

  if (loginResult.error) {
    els.renameSaveButton.disabled = false;
    setMessage(els.renameMessage, "비밀번호가 맞지 않습니다.", true);
    return;
  }

  const { data, error } = await supabaseClient.auth.updateUser({
    data: { display_name: nextName },
  });
  els.renameSaveButton.disabled = false;

  if (error) {
    setMessage(els.renameMessage, error.message, true);
    return;
  }

  setCurrentUser(data.user);
  closeRenameModal();
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

async function loadRemoteMatches(showMessage = false) {
  if (!supabaseClient) return false;

  const [matchesResult, commentsResult, reactionsResult] = await Promise.all([
    supabaseClient.from(MATCH_TABLE).select("*").order("created_at", { ascending: false }).limit(MAX_MATCHES),
    supabaseClient.from(COMMENT_TABLE).select("*").order("created_at", { ascending: true }),
    supabaseClient.from(COMMENT_REACTION_TABLE).select("*"),
  ]);

  if (matchesResult.error || commentsResult.error) {
    state.remoteMatchesReady = false;
    if (showMessage && els.matchFormMessage) {
      setMessage(els.matchFormMessage, "Supabase 테이블을 먼저 만들어야 공유가 됩니다.", true);
    }
    return false;
  }

  const reactionsByComment = new Map();
  for (const row of reactionsResult.error ? [] : reactionsResult.data || []) {
    const summary = reactionsByComment.get(row.comment_id) || { like: 0, dislike: 0, myReaction: "" };
    if (row.reaction === "like") summary.like += 1;
    if (row.reaction === "dislike") summary.dislike += 1;
    if (state.currentUser?.id && row.user_id === state.currentUser.id) {
      summary.myReaction = row.reaction;
    }
    reactionsByComment.set(row.comment_id, summary);
  }

  const commentsByMatch = new Map();
  for (const row of commentsResult.data || []) {
    const list = commentsByMatch.get(row.match_id) || [];
    list.push({
      id: row.id,
      userId: row.user_id || "",
      author: row.author || "익명",
      text: row.message || "",
      createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
      reactions: reactionsByComment.get(row.id) || { like: 0, dislike: 0, myReaction: "" },
    });
    commentsByMatch.set(row.match_id, list);
  }

  state.remoteMatchesReady = true;
  state.matches = (matchesResult.data || []).map((row) => normalizeRemoteMatch(row, commentsByMatch)).slice(0, MAX_MATCHES);
  saveMatches();
  renderManager();
  return true;
}

function subscribeRemoteMatches() {
  if (!supabaseClient || state.realtimeChannel) return;
  state.realtimeChannel = supabaseClient
    .channel("nazun-match-updates")
    .on("postgres_changes", { event: "*", schema: "public", table: MATCH_TABLE }, () => loadRemoteMatches())
    .on("postgres_changes", { event: "*", schema: "public", table: COMMENT_TABLE }, () => loadRemoteMatches())
    .on("postgres_changes", { event: "*", schema: "public", table: COMMENT_REACTION_TABLE }, () => loadRemoteMatches())
    .subscribe();
}

async function saveRemoteMatch(match) {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient.from(MATCH_TABLE).insert(matchToRemoteRow(match));
  if (error) {
    state.remoteMatchesReady = false;
    setMessage(els.matchFormMessage, "Supabase 저장 실패: 테이블을 확인하세요.", true);
    return false;
  }
  state.remoteMatchesReady = true;
  await trimRemoteMatches();
  return true;
}

async function trimRemoteMatches() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from(MATCH_TABLE)
    .select("id")
    .order("created_at", { ascending: false })
    .range(MAX_MATCHES, 1000);
  if (!error && data?.length) {
    await supabaseClient.from(MATCH_TABLE).delete().in("id", data.map((row) => row.id));
  }
}

async function clearRemoteMatches() {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient.from(MATCH_TABLE).delete().not("id", "is", null);
  if (error) {
    setMessage(els.matchFormMessage, "Supabase 삭제 실패: 권한을 확인하세요.", true);
    return false;
  }
  return true;
}

async function deleteRemoteMatch(matchId) {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient.from(MATCH_TABLE).delete().eq("id", matchId);
  if (error) {
    setMessage(els.matchFormMessage, "Supabase 경기 삭제 실패: 권한을 확인하세요.", true);
    return false;
  }
  return true;
}

async function saveRemoteComment(match, comment) {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient.from(COMMENT_TABLE).insert(commentToRemoteRow(match, comment));
  if (error) {
    alert("댓글 공유 저장에 실패했습니다. Supabase 테이블을 확인하세요.");
    return false;
  }
  return true;
}

async function deleteRemoteComment(commentId) {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient.from(COMMENT_TABLE).delete().eq("id", commentId);
  if (error) {
    alert("댓글 삭제에 실패했습니다. Supabase 권한을 확인하세요.");
    return false;
  }
  return true;
}

async function toggleCommentReaction(matchIndex, commentId, reaction) {
  if (!supabaseClient) return;
  if (!state.currentUser) {
    openAuth("login");
    return;
  }

  const match = state.matches[matchIndex];
  const comment = (match?.comments || []).find((item) => item.id === commentId);
  if (!comment) return;

  const currentReaction = comment.reactions?.myReaction || "";
  if (currentReaction === reaction) {
    const { error } = await supabaseClient
      .from(COMMENT_REACTION_TABLE)
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", state.currentUser.id);
    if (error) {
      alert("반응 취소에 실패했습니다. Supabase 테이블을 확인하세요.");
      return;
    }
  } else {
    const { error } = await supabaseClient
      .from(COMMENT_REACTION_TABLE)
      .upsert(
        {
          comment_id: commentId,
          user_id: state.currentUser.id,
          reaction,
          created_at: new Date().toISOString(),
        },
        { onConflict: "comment_id,user_id" }
      );
    if (error) {
      alert("반응 저장에 실패했습니다. Supabase 테이블을 확인하세요.");
      return;
    }
  }

  await loadRemoteMatches();
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

  renderMatchSelectOptions();
}

function renderMatchSelectOptions() {
  const selects = [...els.blueTeamSelects, ...els.redTeamSelects];
  for (const select of selects) {
    const currentValue = select.value;
    const lane = select.dataset.matchLane;
    const preferredPlayers = state.players
      .filter((player) => player.lane === lane || player.lane === "상관없음")
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));
    const otherPlayers = state.players
      .filter((player) => player.lane !== lane && player.lane !== "상관없음")
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));
    const options = [
      `<option value="">선택</option>`,
      ...preferredPlayers.map((player) => `<option value="${escapeHtml(player.name)}">${escapeHtml(player.name)} · ${escapeHtml(player.tier)}</option>`),
      ...(preferredPlayers.length && otherPlayers.length ? [`<option disabled>────────</option>`] : []),
      ...otherPlayers.map((player) => `<option value="${escapeHtml(player.name)}">${escapeHtml(player.name)} · ${escapeHtml(player.tier)}</option>`),
    ];
    select.innerHTML = options.join("");
    if (state.players.some((player) => player.name === currentValue)) {
      select.value = currentValue;
    }
  }
}

function getSelectedTeam(selects) {
  return [...selects].map((select) => select.value.trim()).filter(Boolean);
}

function resetMatchSelects() {
  [...els.blueTeamSelects, ...els.redTeamSelects].forEach((select) => {
    select.value = "";
  });
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

  for (const match of state.matches.slice(0, MAX_MATCHES)) {
    const winners = match.winner === "blue" ? match.blue : match.red;
    const losers = match.winner === "blue" ? match.red : match.blue;
    for (const name of winners) {
      if (!table.has(name)) continue;
      const item = table.get(name);
      item.win += 1;
      item.games += 1;
    }
    for (const name of losers) {
      if (!table.has(name)) continue;
      const item = table.get(name);
      item.loss += 1;
      item.games += 1;
    }
  }

  const rows = [...table.values()].sort((a, b) => b.win - a.win || a.loss - b.loss || a.name.localeCompare(b.name, "ko"));
  els.rankingTable.replaceChildren(
    ...rows.map((row, index) => {
      const winRate = row.games ? Math.round((row.win / row.games) * 100) : 0;
      const player = playerByName(row.name);
      const tierBadge = player
        ? `<span class="tier-badge rank-tier ${tierClass(player.tier)}">${escapeHtml(player.tier)}</span>`
        : "";
      const el = document.createElement("div");
      el.className = "rank-row";
      el.innerHTML = `
        <div>
          <strong>${index + 1}. ${escapeHtml(row.name)} ${tierBadge}</strong>
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
    ...state.matches.slice(0, MAX_MATCHES).map((match, index) => {
      const matchId = getMatchId(match);
      const comments = Array.isArray(match.comments) ? match.comments : [];
      const isOpen = state.openComments.has(matchId);
      const el = document.createElement("div");
      el.className = `history-row ${isOpen ? "comments-open" : ""}`;
      const winner = match.winner === "blue" ? "블루팀" : "레드팀";
      const winnerClass = match.winner === "blue" ? "blue" : "red";
      el.innerHTML = `
        <div class="history-main">
          <div class="history-content">
            <strong class="history-title"><span class="history-team ${winnerClass}">${winner}</span> 승리</strong>
            <div class="history-date">${formatDate(match.createdAt)}</div>
            <div class="history-meta history-teams">
              <span class="history-team blue">블루팀</span> : ${escapeHtml(match.blue.join(", "))}<br />
              <span class="history-team red">레드팀</span> : ${escapeHtml(match.red.join(", "))}
            </div>
            <div class="history-memo">메모 : ${escapeHtml(match.memo || "없음")}</div>
          </div>
          <button class="ghost comment-toggle" type="button" data-toggle-comments="${index}">${isOpen ? "접기" : `댓글 ${comments.length}`}</button>
        </div>
        ${
          isOpen
            ? `
              <div class="comments-panel">
                <div class="comment-list">
                  ${
                    comments.length
                      ? comments.map((comment) => `
                          <article class="comment-item">
                            <div class="comment-top">
                              <strong>${escapeHtml(comment.author || "익명")}</strong>
                              <button class="comment-delete" type="button" data-delete-comment="${index}:${escapeHtml(comment.id)}">삭제</button>
                            </div>
                            <p>${escapeHtml(comment.text || "")}</p>
                            <div class="comment-reactions">
                              <button class="comment-reaction-button ${comment.reactions?.myReaction === "like" ? "active" : ""}" type="button" data-comment-reaction="${index}:${escapeHtml(comment.id)}:like">좋아요 ${comment.reactions?.like || 0}</button>
                              <button class="comment-reaction-button ${comment.reactions?.myReaction === "dislike" ? "active" : ""}" type="button" data-comment-reaction="${index}:${escapeHtml(comment.id)}:dislike">싫어요 ${comment.reactions?.dislike || 0}</button>
                            </div>
                          </article>
                        `).join("")
                      : `<div class="empty comment-empty">댓글이 없습니다.</div>`
                  }
                </div>
                <form class="comment-form" data-comment-form="${index}">
                  <input name="comment" maxlength="160" placeholder="댓글 입력" autocomplete="off" />
                  <button type="submit">등록</button>
                </form>
              </div>
            `
            : ""
        }
      `;
      return el;
    })
  );
  if (!state.matches.length) {
    els.historyList.innerHTML = `<div class="empty">아직 저장된 내전 기록이 없습니다.</div>`;
  }
}

function renderAdminHistory() {
  if (!els.adminHistoryList) return;
  const rows = state.matches.slice(0, MAX_MATCHES).map((match, index) => {
    const winner = match.winner === "blue" ? "블루팀" : "레드팀";
    const winnerClass = match.winner === "blue" ? "blue" : "red";
    const el = document.createElement("div");
    el.className = "admin-history-row";
    el.innerHTML = `
      <div class="admin-history-info">
        <strong><span class="history-team ${winnerClass}">${winner}</span> 승리</strong>
        <span>${formatDate(match.createdAt)}</span>
        <p><span class="history-team blue">블루팀</span> : ${escapeHtml(match.blue.join(", "))}</p>
        <p><span class="history-team red">레드팀</span> : ${escapeHtml(match.red.join(", "))}</p>
        <p>메모 : ${escapeHtml(match.memo || "없음")}</p>
      </div>
      <button class="ghost danger-button" type="button" data-delete-match="${index}">삭제</button>
    `;
    return el;
  });
  els.adminHistoryList.replaceChildren(...rows);
  if (!state.matches.length) {
    els.adminHistoryList.innerHTML = `<div class="empty">삭제할 경기 기록이 없습니다.</div>`;
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
  renderAdminHistory();
  renderAdmin();
}

function savePlayers() {
  writeStore(PLAYER_STORE_KEY, state.players);
}

function saveMatches() {
  writeStore(MATCH_STORE_KEY, state.matches);
}

async function clearMatchRecords(message = "") {
  state.matches = [];
  saveMatches();
  if (state.remoteMatchesReady) {
    await clearRemoteMatches();
  }
  if (message) {
    setMessage(els.matchFormMessage, message);
  }
  renderManager();
}

els.menuToggle.addEventListener("click", () => {
  els.screenTabs.classList.toggle("open");
});

els.themeToggle.addEventListener("click", toggleTheme);
els.patchNoteButton.addEventListener("click", openPatchNotes);
els.patchCloseButton.addEventListener("click", closePatchNotes);
els.patchModal.addEventListener("click", (event) => {
  if (event.target === els.patchModal) closePatchNotes();
});

els.authOpenButton.addEventListener("click", () => {
  if (state.currentUser) {
    els.userMenu.classList.toggle("open");
    return;
  }
  openAuth("login");
});

els.openRenameButton.addEventListener("click", openRenameModal);
els.logoutButton.addEventListener("click", logout);
els.renameCloseButton.addEventListener("click", closeRenameModal);
els.renameCancelButton.addEventListener("click", closeRenameModal);
els.renameSaveButton.addEventListener("click", renameUser);
els.renamePasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") renameUser();
});
els.renameModal.addEventListener("click", (event) => {
  if (event.target === els.renameModal) closeRenameModal();
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
  if (!event.target.closest(".user-menu-wrap")) {
    els.userMenu.classList.remove("open");
  }
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

els.adminHistoryList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-match]");
  if (!button) return;
  const index = Number(button.dataset.deleteMatch);
  const match = state.matches[index];
  if (!match) return;
  const winner = match.winner === "blue" ? "블루팀" : "레드팀";
  const confirmed = confirm(`${formatDate(match.createdAt)} ${winner} 승리 기록을 삭제할까요?`);
  if (!confirmed) return;

  state.matches.splice(index, 1);
  saveMatches();
  renderManager();

  if (state.remoteMatchesReady) {
    const deleted = await deleteRemoteMatch(getMatchId(match));
    if (deleted) await loadRemoteMatches();
  }
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
  setMessage(els.adminMessage, "");
  renderManager();
});

els.adminPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") els.adminUnlockButton.click();
});

els.inhouseMatchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const blue = getSelectedTeam(els.blueTeamSelects);
  const red = getSelectedTeam(els.redTeamSelects);
  const allNames = [...blue, ...red];
  const duplicateName = findDuplicateName(allNames);
  const missingName = allNames.find((name) => !playerByName(name));

  if (blue.length !== 5 || red.length !== 5) {
    setMessage(els.matchFormMessage, "블루팀과 레드팀의 라인을 모두 선택하세요.", true);
    return;
  }
  if (duplicateName) {
    setMessage(els.matchFormMessage, `${duplicateName} 이름이 중복되어 있습니다.`, true);
    return;
  }
  if (missingName) {
    setMessage(els.matchFormMessage, `${missingName}은 멤버 명단에 없습니다.`, true);
    return;
  }

  const nextMatch = {
    id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    blue,
    red,
    winner: els.winnerInput.value,
    memo: els.matchMemoInput.value.trim(),
    createdAt: Date.now(),
    comments: [],
  };
  state.matches.unshift(nextMatch);
  state.matches = state.matches.slice(0, MAX_MATCHES);
  resetMatchSelects();
  els.matchMemoInput.value = "";
  setMessage(els.matchFormMessage, "경기 결과를 저장했습니다.");
  saveMatches();
  renderManager();
  const saved = await saveRemoteMatch(nextMatch);
  if (saved) {
    await loadRemoteMatches();
  }
});

els.historyList.addEventListener("click", (event) => {
  const toggleButton = event.target.closest("[data-toggle-comments]");
  if (!toggleButton) return;
  const match = state.matches[Number(toggleButton.dataset.toggleComments)];
  if (!match) return;
  const matchId = getMatchId(match);
  if (state.openComments.has(matchId)) {
    state.openComments.delete(matchId);
  } else {
    state.openComments.add(matchId);
  }
  renderManager();
});

els.historyList.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-comment-form]");
  if (!form) return;
  event.preventDefault();

  if (!state.currentUser) {
    openAuth("login");
    return;
  }

  const match = state.matches[Number(form.dataset.commentForm)];
  const input = form.elements.comment;
  const text = input.value.trim();
  if (!match || !text) return;

  match.comments = Array.isArray(match.comments) ? match.comments : [];
  const comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: state.currentUser?.id || "",
    author: getUserLabel(state.currentUser),
    text,
    createdAt: Date.now(),
  };
  match.comments.push(comment);
  state.openComments.add(getMatchId(match));
  input.value = "";
  saveMatches();
  renderManager();
  const saved = await saveRemoteComment(match, comment);
  if (saved) {
    await loadRemoteMatches();
  }
});

els.historyList.addEventListener("click", async (event) => {
  const reactionButton = event.target.closest("[data-comment-reaction]");
  if (reactionButton) {
    event.preventDefault();
    const [matchIndexText, commentId, reaction] = reactionButton.dataset.commentReaction.split(":");
    await toggleCommentReaction(Number(matchIndexText), commentId, reaction);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-comment]");
  if (!deleteButton) return;
  event.preventDefault();
  const [matchIndexText, commentId] = deleteButton.dataset.deleteComment.split(":");
  const match = state.matches[Number(matchIndexText)];
  if (!match) return;
  const targetComment = (match.comments || []).find((comment) => comment.id === commentId);
  const isOwner = Boolean(state.currentUser?.id && targetComment?.userId === state.currentUser.id);
  if (!isOwner) {
    const password = prompt("관리자 비밀번호를 입력하세요.");
    if (password !== ADMIN_PASSWORD) {
      alert("비밀번호가 맞지 않습니다.");
      return;
    }
  }
  match.comments = (match.comments || []).filter((comment) => comment.id !== commentId);
  saveMatches();
  renderManager();
  if (state.remoteMatchesReady) {
    const deleted = await deleteRemoteComment(commentId);
    if (deleted) await loadRemoteMatches();
  }
});

els.resetRankingButton.addEventListener("click", () => {
  clearMatchRecords("랭킹을 초기화했습니다.");
});

initTheme();
initAuth();
renderManager();
loadRemoteMatches();
subscribeRemoteMatches();
