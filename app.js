const els = {
  authOpenButton: document.querySelector("#authOpenButton"),
  userMenu: document.querySelector("#userMenu"),
  mailboxOpenButton: document.querySelector("#mailboxOpenButton"),
  lolpsButton: document.querySelector("#lolpsButton"),
  openRenameButton: document.querySelector("#openRenameButton"),
  logoutButton: document.querySelector("#logoutButton"),
  pointAmount: document.querySelector("#pointAmount"),
  patchNoteButton: document.querySelector("#patchNoteButton"),
  themeToggle: document.querySelector("#themeToggle"),
  menuToggle: document.querySelector("#menuToggle"),
  screenTabs: document.querySelector("#screenTabs"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  gachaModeButtons: document.querySelectorAll("[data-gacha-mode]"),
  gachaMachine: document.querySelector("#gachaMachine"),
  gachaDrawButton: document.querySelector("#gachaDrawButton"),
  gachaDrawPanelButton: document.querySelector("#gachaDrawPanelButton"),
  gachaTray: document.querySelector("#gachaTray"),
  capsuleMessage: document.querySelector("#capsuleMessage"),
  rewardModal: document.querySelector("#rewardModal"),
  rewardGrade: document.querySelector("#rewardGrade"),
  rewardTitle: document.querySelector("#rewardTitle"),
  rewardConfirmButton: document.querySelector("#rewardConfirmButton"),
  rateList: document.querySelector("#rateList"),
  inventoryTabs: document.querySelectorAll("[data-inventory-tab]"),
  inventoryList: document.querySelector("#inventoryList"),
  playerList: document.querySelector("#playerList"),
  adminPlayerList: document.querySelector("#adminPlayerList"),
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
  profileModal: document.querySelector("#profileModal"),
  profileCloseButton: document.querySelector("#profileCloseButton"),
  profileNameInput: document.querySelector("#profileNameInput"),
  profileTierInput: document.querySelector("#profileTierInput"),
  profileLaneInput: document.querySelector("#profileLaneInput"),
  profileMessage: document.querySelector("#profileMessage"),
  profileSaveButton: document.querySelector("#profileSaveButton"),
  playerEditModal: document.querySelector("#playerEditModal"),
  playerEditCloseButton: document.querySelector("#playerEditCloseButton"),
  playerEditCancelButton: document.querySelector("#playerEditCancelButton"),
  editPlayerNameInput: document.querySelector("#editPlayerNameInput"),
  editPlayerTierInput: document.querySelector("#editPlayerTierInput"),
  editPlayerLaneInput: document.querySelector("#editPlayerLaneInput"),
  playerEditMessage: document.querySelector("#playerEditMessage"),
  playerEditSaveButton: document.querySelector("#playerEditSaveButton"),
  mailboxModal: document.querySelector("#mailboxModal"),
  mailboxCloseButton: document.querySelector("#mailboxCloseButton"),
  mailboxCodeInput: document.querySelector("#mailboxCodeInput"),
  mailboxCodeButton: document.querySelector("#mailboxCodeButton"),
  mailboxList: document.querySelector("#mailboxList"),
  mailboxMessage: document.querySelector("#mailboxMessage"),
};

const PLAYER_STORE_KEY = "nazun-players-v2";
const MATCH_STORE_KEY = "nazun-matches";
const POINT_STORE_KEY = "nazun-points-v1";
const REDEEMED_CODE_STORE_KEY = "nazun-redeemed-codes-v1";
const OWNED_TITLE_STORE_KEY = "nazun-owned-titles-v1";
const EQUIPPED_TITLE_STORE_KEY = "nazun-equipped-title-v1";
const ITEM_STORE_KEY = "nazun-items-v1";
const MATCH_TABLE = "nazun_matches";
const COMMENT_TABLE = "nazun_match_comments";
const COMMENT_REACTION_TABLE = "nazun_match_comment_reactions";
const POINT_TABLE = "nazun_user_points";
const MAIL_TABLE = "nazun_match_point_mails";
const PROFILE_TABLE = "nazun_user_profiles";
const MAX_MATCHES = 10;
const SUPABASE_CONFIG = window.NAZUN_SUPABASE || {};
const SUPABASE_READY = Boolean(window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
const supabaseClient = SUPABASE_READY
  ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  : null;
const AUTH_REDIRECT_URL = SUPABASE_CONFIG.redirectUrl || `${window.location.origin}${window.location.pathname}`;
const TITLE_DRAW_COST = 10;
const TITLE_RATES = [
  { grade: "common", label: "COMMON", rate: 45 },
  { grade: "uncommon", label: "UNCOMMON", rate: 28 },
  { grade: "rare", label: "RARE", rate: 17 },
  { grade: "epic", label: "EPIC", rate: 8 },
  { grade: "legendary", label: "LEGENDARY", rate: 2 },
];
const TITLE_CATALOG = [
  { id: "good-inhouse", name: "내전이 좋은", grade: "common" },
  { id: "handsome", name: "잘생긴", grade: "common" },
  { id: "pretty", name: "예쁜", grade: "common" },
  { id: "normal", name: "평범한", grade: "common" },
  { id: "strongest", name: "최강", grade: "uncommon" },
  { id: "serious-inhouse", name: "내전에 진심인", grade: "uncommon" },
  { id: "dirty-game", name: "더럽게 게임하는", grade: "uncommon" },
  { id: "solid", name: "단단한", grade: "uncommon" },
  { id: "bug", name: "벌레", grade: "rare" },
  { id: "life-inhouse", name: "내전에 목숨건", grade: "rare" },
  { id: "jangcheon", name: "장천동부모도둑", grade: "rare" },
  { id: "not-fool", name: "절대 바보가 아닌", grade: "rare" },
  { id: "princess", name: "공주", grade: "epic" },
  { id: "king", name: "KING", grade: "epic" },
  { id: "big-heart", name: "가슴이 큰", grade: "epic" },
  { id: "devil", name: "내전의 악마", grade: "legendary" },
  { id: "predator", name: "PREDATOR", grade: "legendary" },
  { id: "developer", name: "개발자", grade: "special" },
];

const state = {
  players: readStore(PLAYER_STORE_KEY, []),
  matches: readStore(MATCH_STORE_KEY, []),
  currentUser: null,
  editingPlayerIndex: null,
  editingProfileUserId: "",
  editingProfileOldName: "",
  adminUnlocked: false,
  openComments: new Set(),
  points: 0,
  redeemedCodes: [],
  ownedTitles: [],
  equippedTitle: "",
  items: {},
  mailboxRewards: [],
  gachaMode: "title",
  inventoryTab: "title",
  gachaBusy: false,
  pendingRewardTitle: "",
  commentDrafts: {},
  remoteMatchesReady: false,
  realtimeChannel: null,
  profileRealtimeChannel: null,
};

const ADMIN_PASSWORD = "jhs081115jhs";
const POINT_CODES = {
  lemon: 100,
  lemon_2: 100,
  lemon_lemon: 200,
  beta_point: 30,
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

function pointOwnerKey() {
  return state.currentUser?.id || state.currentUser?.email || "guest";
}

function pointMapKey(baseKey) {
  return `${baseKey}:${pointOwnerKey()}`;
}

function loadLocalPointState() {
  state.points = Number(localStorage.getItem(pointMapKey(POINT_STORE_KEY)) || 0);
  state.redeemedCodes = readStore(pointMapKey(REDEEMED_CODE_STORE_KEY), []);
  state.ownedTitles = readStore(pointMapKey(OWNED_TITLE_STORE_KEY), []);
  state.equippedTitle = localStorage.getItem(pointMapKey(EQUIPPED_TITLE_STORE_KEY)) || "";
  state.items = readStore(pointMapKey(ITEM_STORE_KEY), {});
  renderPoints();
  renderCollectibles();
}

function saveLocalPointState() {
  localStorage.setItem(pointMapKey(POINT_STORE_KEY), String(state.points));
  writeStore(pointMapKey(REDEEMED_CODE_STORE_KEY), state.redeemedCodes);
  writeStore(pointMapKey(OWNED_TITLE_STORE_KEY), state.ownedTitles);
  localStorage.setItem(pointMapKey(EQUIPPED_TITLE_STORE_KEY), state.equippedTitle || "");
  writeStore(pointMapKey(ITEM_STORE_KEY), state.items);
}

function renderPoints() {
  els.pointAmount.textContent = `${Number(state.points) || 0}P`;
}

async function loadPointState() {
  loadLocalPointState();
  loadMailboxRewards();
  if (!supabaseClient || !state.currentUser?.id) return;

  const { data, error } = await supabaseClient
    .from(POINT_TABLE)
    .select("points, redeemed_codes, owned_titles, equipped_title, items")
    .eq("user_id", state.currentUser.id)
    .maybeSingle();

  if (error) return;
  if (!data) {
    await supabaseClient.from(POINT_TABLE).upsert({
      user_id: state.currentUser.id,
      points: state.points,
      redeemed_codes: state.redeemedCodes,
      owned_titles: state.ownedTitles,
      equipped_title: state.equippedTitle,
      items: state.items,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  state.points = Number(data.points) || 0;
  state.redeemedCodes = Array.isArray(data.redeemed_codes) ? data.redeemed_codes : [];
  state.ownedTitles = Array.isArray(data.owned_titles) ? data.owned_titles : [];
  state.equippedTitle = data.equipped_title || "";
  state.items = data.items && typeof data.items === "object" ? data.items : {};
  saveLocalPointState();
  renderPoints();
  renderCollectibles();
}

async function savePointState() {
  saveLocalPointState();
  renderPoints();
  if (!supabaseClient || !state.currentUser?.id) return;
  await supabaseClient
    .from(POINT_TABLE)
    .upsert({
      user_id: state.currentUser.id,
      points: state.points,
      redeemed_codes: state.redeemedCodes,
      owned_titles: state.ownedTitles,
      equipped_title: state.equippedTitle,
      items: state.items,
      updated_at: new Date().toISOString(),
    });
}

function profileToPlayer(row) {
  return {
    userId: row.user_id || "",
    name: row.nickname || row.display_name || "이름 없음",
    tier: row.tier || "아이언",
    lane: row.lane || "상관없음",
  };
}

async function loadUserProfiles() {
  if (!supabaseClient) {
    renderManager();
    return;
  }
  const { data, error } = await supabaseClient
    .from(PROFILE_TABLE)
    .select("*")
    .order("nickname", { ascending: true });
  if (error) {
    renderManager();
    return;
  }
  state.players = (data || []).map(profileToPlayer).filter((player) => player.name && player.name !== "이름 없음");
  savePlayers();
  renderAuth();
  renderManager();
}

function subscribeUserProfiles() {
  if (!supabaseClient || state.profileRealtimeChannel) return;
  state.profileRealtimeChannel = supabaseClient
    .channel("nazun-profile-updates")
    .on("postgres_changes", { event: "*", schema: "public", table: PROFILE_TABLE }, () => loadUserProfiles())
    .subscribe();
}

async function loadMyProfile() {
  if (!supabaseClient || !state.currentUser?.id) return null;
  const { data, error } = await supabaseClient
    .from(PROFILE_TABLE)
    .select("*")
    .eq("user_id", state.currentUser.id)
    .maybeSingle();
  if (error) return null;
  return data || null;
}

function openProfileModal(profile = null, force = false) {
  if (!state.currentUser) return;
  els.profileNameInput.value = profile?.nickname || state.currentUser.user_metadata?.lol_name || "";
  els.profileTierInput.value = profile?.tier || "아이언";
  els.profileLaneInput.value = profile?.lane || "상관없음";
  setMessage(els.profileMessage, "");
  els.profileCloseButton.hidden = force;
  els.profileModal.classList.add("open");
  els.profileModal.setAttribute("aria-hidden", "false");
  els.profileNameInput.focus();
}

function closeProfileModal() {
  els.profileModal.classList.remove("open");
  els.profileModal.setAttribute("aria-hidden", "true");
}

async function ensureUserProfile() {
  if (!state.currentUser || !supabaseClient) return;
  const profile = await loadMyProfile();
  if (!profile?.nickname) {
    openProfileModal(profile, true);
  }
}

async function saveMyProfile() {
  if (!state.currentUser || !checkSupabaseReady(els.profileMessage)) return;
  const nickname = els.profileNameInput.value.trim();
  if (!nickname) {
    setMessage(els.profileMessage, "롤 이름 + 태그를 입력하세요.", true);
    return;
  }

  els.profileSaveButton.disabled = true;
  const row = {
    user_id: state.currentUser.id,
    nickname,
    tier: els.profileTierInput.value,
    lane: els.profileLaneInput.value,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabaseClient.from(PROFILE_TABLE).upsert(row);
  if (!error) {
    await supabaseClient.auth.updateUser({
      data: {
        display_name: nickname,
        lol_name: nickname,
      },
    });
    const { data } = await supabaseClient.auth.getUser();
    state.currentUser = data.user || state.currentUser;
  }
  els.profileSaveButton.disabled = false;
  if (error) {
    setMessage(els.profileMessage, "프로필 저장에 실패했습니다. Supabase 테이블을 확인하세요.", true);
    return;
  }
  closeProfileModal();
  renderAuth();
  await loadUserProfiles();
  await loadMailboxRewards();
}

function openPlayerEditModal(index) {
  const player = state.players[index];
  if (!player) return;
  state.editingProfileUserId = player.userId;
  state.editingProfileOldName = player.name;
  els.editPlayerNameInput.value = player.name;
  els.editPlayerTierInput.value = player.tier;
  els.editPlayerLaneInput.value = player.lane;
  setMessage(els.playerEditMessage, "");
  els.playerEditModal.classList.add("open");
  els.playerEditModal.setAttribute("aria-hidden", "false");
  els.editPlayerNameInput.focus();
}

function closePlayerEditModal() {
  els.playerEditModal.classList.remove("open");
  els.playerEditModal.setAttribute("aria-hidden", "true");
  state.editingProfileUserId = "";
  state.editingProfileOldName = "";
}

function replacePlayerNameInMatch(match, oldName, nextName) {
  let changed = false;
  const replace = (name) => {
    if (name !== oldName) return name;
    changed = true;
    return nextName;
  };
  match.blue = (match.blue || []).map(replace);
  match.red = (match.red || []).map(replace);
  return changed;
}

async function syncRenamedPlayerInMatches(oldName, nextName) {
  if (!oldName || oldName === nextName) return;
  const changedMatches = state.matches.filter((match) => replacePlayerNameInMatch(match, oldName, nextName));
  if (changedMatches.length) {
    saveMatches();
    renderManager();
  }
  if (!supabaseClient || !changedMatches.length) return;
  await Promise.all(changedMatches.map((match) => supabaseClient
    .from(MATCH_TABLE)
    .update({
      blue: match.blue,
      red: match.red,
    })
    .eq("id", getMatchId(match))));
}

async function saveEditedPlayerProfile() {
  if (!state.editingProfileUserId || !checkSupabaseReady(els.playerEditMessage)) return;
  const nickname = els.editPlayerNameInput.value.trim();
  if (!nickname) {
    setMessage(els.playerEditMessage, "이름을 입력하세요.", true);
    return;
  }
  els.playerEditSaveButton.disabled = true;
  const oldName = state.editingProfileOldName;
  const { error } = await supabaseClient
    .from(PROFILE_TABLE)
    .update({
      nickname,
      tier: els.editPlayerTierInput.value,
      lane: els.editPlayerLaneInput.value,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", state.editingProfileUserId);
  els.playerEditSaveButton.disabled = false;
  if (error) {
    setMessage(els.playerEditMessage, "수정에 실패했습니다. Supabase 권한을 확인하세요.", true);
    return;
  }
  if (state.currentUser?.id === state.editingProfileUserId) {
    const { data } = await supabaseClient.auth.updateUser({
      data: {
        display_name: nickname,
        lol_name: nickname,
      },
    });
    state.currentUser = data?.user || state.currentUser;
    renderAuth();
  }
  await syncRenamedPlayerInMatches(oldName, nickname);
  closePlayerEditModal();
  await loadUserProfiles();
  await loadMailboxRewards();
}

async function deletePlayerProfile(index) {
  const player = state.players[index];
  if (!player?.userId || !checkSupabaseReady(els.adminMessage)) return;
  const confirmed = confirm(`${player.name} 참가자를 삭제할까요?`);
  if (!confirmed) return;

  const { error } = await supabaseClient
    .from(PROFILE_TABLE)
    .delete()
    .eq("user_id", player.userId);
  if (error) {
    alert("참가자 삭제에 실패했습니다. Supabase 삭제 정책을 확인하세요.");
    return;
  }

  state.players = state.players.filter((item) => item.userId !== player.userId);
  savePlayers();
  renderManager();
  if (state.currentUser?.id === player.userId) {
    await supabaseClient.auth.updateUser({
      data: {
        display_name: "",
        lol_name: "",
      },
    });
    const { data } = await supabaseClient.auth.getUser();
    state.currentUser = data.user || state.currentUser;
    renderAuth();
  }
  await loadUserProfiles();
}

function renderMailbox() {
  if (!els.mailboxList) return;
  updateMailboxIndicators();
  if (!state.currentUser) {
    els.mailboxList.innerHTML = `<p class="mailbox-empty">로그인 후 우편함을 확인하세요.</p>`;
    return;
  }
  if (!state.mailboxRewards.length) {
    els.mailboxList.innerHTML = `<p class="mailbox-empty">우편이 없습니다.</p>`;
    return;
  }

  els.mailboxList.innerHTML = state.mailboxRewards.map((mail) => `
    <article class="mailbox-item">
      <div>
        <strong>${mail.result === "win" ? "승리 보상" : "패배 보상"}</strong>
        <small>${formatDate(mail.createdAt)} 경기 ${mail.result === "win" ? "승리" : "패배"} 기록 보상입니다.</small>
        <span>${Number(mail.amount) || 0}P</span>
      </div>
      <button class="mail-claim-button" type="button" data-claim-mail="${escapeHtml(mail.id)}">받기</button>
    </article>
  `).join("");
}

function updateMailboxIndicators() {
  const hasMail = Boolean(state.currentUser && state.mailboxRewards.length);
  els.authOpenButton.classList.toggle("has-mail", hasMail);
  els.mailboxOpenButton.classList.toggle("has-mail", hasMail);
}

async function loadMailboxRewards() {
  state.mailboxRewards = [];
  renderMailbox();
  if (!supabaseClient || !state.currentUser) return;

  const playerName = getUserLabel(state.currentUser);
  if (!playerName) return;
  const { data, error } = await supabaseClient
    .from(MAIL_TABLE)
    .select("*")
    .eq("player_name", playerName)
    .is("claimed_at", null)
    .order("created_at", { ascending: false });
  if (error) return;

  state.mailboxRewards = (data || []).map((row) => ({
    id: row.id,
    amount: Number(row.amount) || 0,
    result: row.result === "win" ? "win" : "loss",
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
  }));
  renderMailbox();
}

async function createMatchPointMails(match) {
  if (!supabaseClient) return;
  const matchId = getMatchId(match);
  const winners = match.winner === "blue" ? match.blue : match.red;
  const losers = match.winner === "blue" ? match.red : match.blue;
  const rows = [
    ...winners.map((name) => ({ name, result: "win", amount: 20 })),
    ...losers.map((name) => ({ name, result: "loss", amount: 10 })),
  ].map((reward) => ({
    id: `${matchId}-${reward.name}`.replace(/[^\w가-힣-]/g, "_"),
    match_id: matchId,
    player_name: reward.name,
    result: reward.result,
    amount: reward.amount,
    created_at: new Date(match.createdAt || Date.now()).toISOString(),
  }));

  await supabaseClient.from(MAIL_TABLE).upsert(rows, { onConflict: "id" });
  await loadMailboxRewards();
}

async function claimMatchMail(mailId) {
  if (!supabaseClient || !state.currentUser) return;
  const mail = state.mailboxRewards.find((item) => item.id === mailId);
  if (!mail) return;
  const { error } = await supabaseClient
    .from(MAIL_TABLE)
    .update({
      claimed_by: state.currentUser.id,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", mailId)
    .is("claimed_at", null);
  if (error) {
    setMessage(els.mailboxMessage, "우편 수령에 실패했습니다. Supabase 테이블을 확인하세요.", true);
    return;
  }

  state.points = (Number(state.points) || 0) + mail.amount;
  await savePointState();
  setMessage(els.mailboxMessage, `${mail.amount}P를 받았습니다.`);
  await loadMailboxRewards();
}

function titleById(id) {
  return TITLE_CATALOG.find((title) => title.id === id);
}

function titleClass(title) {
  return `title-chip title-${title?.grade || "common"}`;
}

function titleMarkup(title) {
  if (!title) return "";
  return `<span class="${titleClass(title)}">${escapeHtml(title.name)}</span>`;
}

function setCapsuleMessage(message) {
  if (els.capsuleMessage) {
    els.capsuleMessage.textContent = message;
  }
}

function equippedTitleMarkup() {
  return titleMarkup(titleById(state.equippedTitle));
}

function decorateName(name) {
  const label = escapeHtml(name || "");
  const currentLabel = getUserLabel(state.currentUser);
  if (!state.equippedTitle || !currentLabel || name !== currentLabel) return label;
  return `${equippedTitleMarkup()} ${label}`;
}

function decoratedNameList(names) {
  return names.map((name) => decorateName(name)).join(", ");
}

function renderCollectibles() {
  renderGacha();
  renderInventory();
  renderManager();
  renderAuth();
}

function renderGacha() {
  if (!els.gachaMachine) return;
  const titleMode = state.gachaMode === "title";
  els.gachaModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.gachaMode === state.gachaMode);
  });
  els.gachaMachine.classList.toggle("item-machine", !titleMode);
  els.gachaMachine.classList.toggle("title-machine", titleMode);
  els.gachaDrawPanelButton.textContent = titleMode ? `${TITLE_DRAW_COST}P로 칭호 뽑기` : "아이템뽑기 공사중";
  els.gachaDrawPanelButton.disabled = !titleMode || state.gachaBusy;
  els.gachaDrawButton.disabled = !titleMode || state.gachaBusy;
  els.rateList.innerHTML = titleMode
    ? TITLE_RATES.map((item) => `
        <div class="rate-row">
          <span class="grade-text grade-${item.grade}">${item.label}</span>
          <strong>${item.rate}%</strong>
        </div>
      `).join("")
    : `<div class="rate-row"><span>ITEM</span><strong>공사중</strong></div>`;
  if (!titleMode) {
    setCapsuleMessage("아이템뽑기 공사중");
  } else if (!state.pendingRewardTitle && !state.gachaBusy) {
    setCapsuleMessage("손잡이를 돌려 캡슐을 뽑으세요.");
  }
}

function renderInventory() {
  if (!els.inventoryList) return;
  els.inventoryTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.inventoryTab === state.inventoryTab);
  });

  if (state.inventoryTab === "item") {
    const entries = Object.entries(state.items || {});
    els.inventoryList.innerHTML = entries.length
      ? entries.map(([name, count]) => `
          <article class="inventory-card">
            <strong>${escapeHtml(name)}</strong>
            <span>${Number(count) || 0}개</span>
          </article>
        `).join("")
      : `<div class="empty inventory-empty">보유한 아이템이 없습니다.</div>`;
    return;
  }

  const owned = state.ownedTitles.map(titleById).filter(Boolean);
  els.inventoryList.innerHTML = owned.length
    ? owned.map((title) => `
        <article class="inventory-card title-inventory-card">
          <div>
            ${titleMarkup(title)}
            <small>${title.grade.toUpperCase()}</small>
          </div>
          <button class="ghost" type="button" data-equip-title="${escapeHtml(title.id)}">
            ${state.equippedTitle === title.id ? "장착중" : "장착"}
          </button>
        </article>
      `).join("")
    : `<div class="empty inventory-empty">보유한 칭호가 없습니다.</div>`;
}

function pickTitleGrade() {
  const roll = Math.random() * 100;
  let cursor = 0;
  for (const item of TITLE_RATES) {
    cursor += item.rate;
    if (roll < cursor) return item.grade;
  }
  return "common";
}

function pickAvailableTitle() {
  const owned = new Set(state.ownedTitles);
  const available = TITLE_CATALOG.filter((title) => title.grade !== "special" && !owned.has(title.id));
  if (!available.length) return null;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const grade = pickTitleGrade();
    const pool = available.filter((title) => title.grade === grade);
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

async function drawTitle() {
  if (state.gachaBusy || state.gachaMode !== "title") return;
  if (state.points < TITLE_DRAW_COST) {
    setCapsuleMessage("포인트가 부족합니다.");
    return;
  }

  const reward = pickAvailableTitle();
  if (!reward) {
    setCapsuleMessage("뽑을 수 있는 칭호를 모두 모았습니다.");
    return;
  }

  state.gachaBusy = true;
  state.pendingRewardTitle = "";
  renderGacha();
  els.gachaMachine.classList.add("is-drawing");
  els.gachaTray.innerHTML = `<div class="reward-capsule capsule-${reward.grade}"></div>`;
  setCapsuleMessage("캡슐이 나오고 있습니다.");

  window.setTimeout(async () => {
    state.points -= TITLE_DRAW_COST;
    state.ownedTitles = [...state.ownedTitles, reward.id];
    await savePointState();
    state.gachaBusy = false;
    state.pendingRewardTitle = reward.id;
    els.gachaMachine.classList.remove("is-drawing");
    els.gachaTray.innerHTML = `<button class="reward-capsule opened capsule-${reward.grade}" type="button" data-open-capsule aria-label="캡슐 열기"></button>`;
    setCapsuleMessage("캡슐을 클릭하세요.");
    renderCollectibles();
  }, 1050);
}

function openRewardModal(title) {
  if (!title) return;
  els.rewardGrade.textContent = title.grade.toUpperCase();
  els.rewardGrade.className = `reward-grade grade-${title.grade}`;
  els.rewardTitle.innerHTML = titleMarkup(title);
  els.rewardModal.classList.add("open");
  els.rewardModal.setAttribute("aria-hidden", "false");
}

function closeRewardModal() {
  els.rewardModal.classList.remove("open");
  els.rewardModal.setAttribute("aria-hidden", "true");
  state.pendingRewardTitle = "";
  els.gachaTray.innerHTML = "";
  setCapsuleMessage(state.gachaMode === "title" ? "손잡이를 돌려 캡슐을 뽑으세요." : "아이템뽑기 공사중");
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

function openMailbox() {
  if (!state.currentUser) {
    openAuth("login");
    return;
  }
  els.userMenu.classList.remove("open");
  els.mailboxCodeInput.value = "";
  setMessage(els.mailboxMessage, "");
  loadMailboxRewards();
  els.mailboxModal.classList.add("open");
  els.mailboxModal.setAttribute("aria-hidden", "false");
  els.mailboxCodeInput.focus();
}

function closeMailbox() {
  els.mailboxModal.classList.remove("open");
  els.mailboxModal.setAttribute("aria-hidden", "true");
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
  const profileName = state.players.find((player) => player.userId && player.userId === user?.id)?.name;
  if (profileName) return profileName;
  return user?.user_metadata?.lol_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";
}

function setCurrentUser(user) {
  state.currentUser = user || null;
  loadPointState();
  renderAuth();
  if (supabaseClient) {
    loadRemoteMatches();
    loadUserProfiles();
    ensureUserProfile();
  }
}

async function redeemMailboxCode() {
  if (!state.currentUser) {
    closeMailbox();
    openAuth("login");
    return;
  }
  const code = els.mailboxCodeInput.value.trim().toLowerCase();
  if (!code) {
    setMessage(els.mailboxMessage, "코드를 입력하세요.", true);
    return;
  }
  if (!POINT_CODES[code] && code !== "jhs6974") {
    setMessage(els.mailboxMessage, "없는 코드입니다.", true);
    return;
  }
  if (state.redeemedCodes.includes(code)) {
    setMessage(els.mailboxMessage, "이미 사용한 코드입니다.", true);
    return;
  }

  els.mailboxCodeButton.disabled = true;
  if (POINT_CODES[code]) {
    state.points = (Number(state.points) || 0) + POINT_CODES[code];
  }
  if (code === "jhs6974" && !state.ownedTitles.includes("developer")) {
    state.ownedTitles = [...state.ownedTitles, "developer"];
  }
  state.redeemedCodes = [...state.redeemedCodes, code];
  await savePointState();
  els.mailboxCodeInput.value = "";
  els.mailboxCodeButton.disabled = false;
  setMessage(els.mailboxMessage, POINT_CODES[code] ? `${POINT_CODES[code]}P를 받았습니다.` : "개발자 칭호를 받았습니다.");
}

function renderAuth() {
  const label = getUserLabel(state.currentUser);
  if (label) {
    els.authOpenButton.innerHTML = decorateName(label);
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
    },
  });
  els.signupButton.disabled = false;

  if (error) {
    setMessage(els.signupMessage, error.message, true);
    return;
  }

  if (data.user && !data.session) {
    setMessage(els.signupMessage, "가입 확인 메일을 보냈습니다. 메일 인증 후 로그인하면 롤 이름 + 태그 설정 창이 나옵니다.");
    return;
  }

  setCurrentUser(data.user);
  els.signupUsername.value = "";
  els.signupPassword.value = "";
  closeAuth();
  openProfileModal(null, true);
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

  const profile = await loadMyProfile();
  if (profile) {
    await supabaseClient
      .from(PROFILE_TABLE)
      .update({ nickname: nextName, updated_at: new Date().toISOString() })
      .eq("user_id", state.currentUser.id);
  }

  setCurrentUser(data.user);
  closeRenameModal();
  await loadUserProfiles();
}

async function initAuth() {
  if (!supabaseClient) {
    renderAuth();
    return;
  }

  const { data } = await supabaseClient.auth.getUser();
  setCurrentUser(data.user);
  loadUserProfiles();
  subscribeUserProfiles();
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
  await createMatchPointMails(match);
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
        <strong>${decorateName(player.name)}</strong>
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
          <strong>${decorateName(player.name)}</strong>
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
          <strong>${index + 1}. ${decorateName(row.name)} ${tierBadge}</strong>
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
      const draft = state.commentDrafts[matchId] || "";
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
              <span class="history-team blue">블루팀</span> : ${decoratedNameList(match.blue)}<br />
              <span class="history-team red">레드팀</span> : ${decoratedNameList(match.red)}
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
                              <strong>${decorateName(comment.author || "익명")}</strong>
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
                <form class="comment-form" data-comment-form="${index}" data-comment-match-id="${escapeHtml(matchId)}">
                  <input name="comment" maxlength="160" placeholder="댓글 입력" autocomplete="off" value="${escapeHtml(draft)}" />
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
        <p><span class="history-team blue">블루팀</span> : ${decoratedNameList(match.blue)}</p>
        <p><span class="history-team red">레드팀</span> : ${decoratedNameList(match.red)}</p>
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

els.mailboxOpenButton.addEventListener("click", openMailbox);
els.lolpsButton.addEventListener("click", () => {
  els.userMenu.classList.remove("open");
  window.open("https://lol.ps/", "_blank", "noopener,noreferrer");
});
els.openRenameButton.addEventListener("click", openRenameModal);
els.logoutButton.addEventListener("click", logout);
els.mailboxCloseButton.addEventListener("click", closeMailbox);
els.mailboxCodeButton.addEventListener("click", redeemMailboxCode);
els.mailboxCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") redeemMailboxCode();
});
els.mailboxModal.addEventListener("click", (event) => {
  if (event.target === els.mailboxModal) closeMailbox();
});
els.mailboxList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-claim-mail]");
  if (!button) return;
  claimMatchMail(button.dataset.claimMail);
});
els.renameCloseButton.addEventListener("click", closeRenameModal);
els.renameCancelButton.addEventListener("click", closeRenameModal);
els.renameSaveButton.addEventListener("click", renameUser);
els.renamePasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") renameUser();
});
els.renameModal.addEventListener("click", (event) => {
  if (event.target === els.renameModal) closeRenameModal();
});
els.profileCloseButton.addEventListener("click", closeProfileModal);
els.profileSaveButton.addEventListener("click", saveMyProfile);
els.profileNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") saveMyProfile();
});
els.profileModal.addEventListener("click", (event) => {
  if (event.target === els.profileModal && !els.profileCloseButton.hidden) closeProfileModal();
});
els.playerEditCloseButton.addEventListener("click", closePlayerEditModal);
els.playerEditCancelButton.addEventListener("click", closePlayerEditModal);
els.playerEditSaveButton.addEventListener("click", saveEditedPlayerProfile);
els.editPlayerNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") saveEditedPlayerProfile();
});
els.playerEditModal.addEventListener("click", (event) => {
  if (event.target === els.playerEditModal) closePlayerEditModal();
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
els.gachaModeButtons.forEach((button) => button.addEventListener("click", () => {
  state.gachaMode = button.dataset.gachaMode;
  state.pendingRewardTitle = "";
  els.gachaTray.innerHTML = "";
  renderGacha();
}));
els.gachaDrawButton.addEventListener("click", drawTitle);
els.gachaDrawPanelButton.addEventListener("click", drawTitle);
els.gachaTray.addEventListener("click", (event) => {
  if (!event.target.closest("[data-open-capsule]")) return;
  openRewardModal(titleById(state.pendingRewardTitle));
});
els.rewardConfirmButton.addEventListener("click", closeRewardModal);
els.inventoryTabs.forEach((button) => button.addEventListener("click", () => {
  state.inventoryTab = button.dataset.inventoryTab;
  renderInventory();
}));
els.inventoryList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-equip-title]");
  if (!button) return;
  const titleId = button.dataset.equipTitle;
  state.equippedTitle = state.equippedTitle === titleId ? "" : titleId;
  await savePointState();
  renderCollectibles();
});

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

els.adminPlayerList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-player]");
  if (editButton) {
    openPlayerEditModal(Number(editButton.dataset.editPlayer));
    return;
  }
  const removeButton = event.target.closest("[data-remove-player]");
  if (!removeButton) return;
  deletePlayerProfile(Number(removeButton.dataset.removePlayer));
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

els.historyList.addEventListener("input", (event) => {
  const input = event.target.closest('[name="comment"]');
  if (!input) return;
  const form = input.closest("[data-comment-form]");
  if (!form) return;
  const match = state.matches[Number(form.dataset.commentForm)];
  const matchId = form.dataset.commentMatchId || (match ? getMatchId(match) : "");
  if (!matchId) return;
  state.commentDrafts[matchId] = input.value;
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
  const matchId = form.dataset.commentMatchId || getMatchId(match);

  match.comments = Array.isArray(match.comments) ? match.comments : [];
  const comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: state.currentUser?.id || "",
    author: getUserLabel(state.currentUser),
    text,
    createdAt: Date.now(),
  };
  match.comments.push(comment);
  state.openComments.add(matchId);
  delete state.commentDrafts[matchId];
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
loadLocalPointState();
initAuth();
renderCollectibles();
loadRemoteMatches();
subscribeRemoteMatches();
