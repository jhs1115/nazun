const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5177);
const regionGroups = {
  kr: "asia",
  jp1: "asia",
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
};

loadDotEnv();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/search") {
      await handleSearch(url, res);
      return;
    }

    serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, 500, { message: error.message || "서버 오류가 발생했습니다." });
  }
});

server.listen(port, () => {
  console.log(`내전 전적 검색 사이트: http://localhost:${port}`);
});

function loadDotEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function handleSearch(url, res) {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    sendJson(res, 200, {
      source: "demo",
      target: `${url.searchParams.get("gameName") || "장천동부모도둑감성준"}#${url.searchParams.get("tagLine") || "6974"}`,
      message: ".env 파일에 RIOT_API_KEY를 넣으면 실제 Riot API 검색이 켜집니다.",
      matches: [],
    });
    return;
  }

  const gameName = required(url, "gameName");
  const tagLine = required(url, "tagLine").replace(/^#/, "");
  const region = (url.searchParams.get("region") || "kr").toLowerCase();
  const count = clamp(Number(url.searchParams.get("count") || 80), 1, 100);
  const group = regionGroups[region];
  if (!group) throw new Error("지원하지 않는 서버입니다.");

  const account = await riotFetch(
    `https://${group}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    apiKey
  );

  const matchIds = await riotFetch(
    `https://${group}.api.riotgames.com/lol/match/v5/matches/by-puuid/${account.puuid}/ids?start=0&count=${count}`,
    apiKey
  );

  const details = [];
  for (const matchId of matchIds) {
    const detail = await riotFetch(`https://${group}.api.riotgames.com/lol/match/v5/matches/${matchId}`, apiKey);
    const normalized = normalizeMatch(detail, account.puuid);
    if (normalized) details.push(normalized);
  }

  sendJson(res, 200, {
    source: "riot",
    target: `${account.gameName}#${account.tagLine}`,
    matches: details,
  });
}

function normalizeMatch(match, puuid) {
  const info = match.info;
  if (!info) return null;

  const isCustom = info.gameType === "CUSTOM_GAME" || info.queueId === 0;
  const isFiveVsFive = Array.isArray(info.participants) && info.participants.length === 10;
  const isRift = info.mapId === 11;
  const isAram = info.mapId === 12;
  if (!isCustom || !isFiveVsFive || (!isRift && !isAram)) return null;

  const player = info.participants.find((participant) => participant.puuid === puuid);
  const blue = info.participants.filter((participant) => participant.teamId === 100);
  const red = info.participants.filter((participant) => participant.teamId === 200);

  return {
    matchId: match.metadata.matchId,
    map: isRift ? "rift" : "aram",
    mapName: isRift ? "협곡" : "칼바람",
    gameMode: info.gameMode,
    gameStart: info.gameStartTimestamp || info.gameCreation,
    duration: info.gameDuration,
    player: player
      ? {
          championName: player.championName,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          win: player.win,
          teamId: player.teamId,
        }
      : null,
    teams: [blue.map(displayName), red.map(displayName)],
  };
}

function displayName(participant) {
  if (participant.riotIdGameName && participant.riotIdTagline) {
    return `${participant.riotIdGameName}#${participant.riotIdTagline}`;
  }
  return participant.summonerName || participant.championName || "Unknown";
}

async function riotFetch(url, apiKey) {
  const response = await fetch(url, { headers: { "X-Riot-Token": apiKey } });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Riot API 오류 ${response.status}: ${text.slice(0, 160)}`);
  }
  return response.json();
}

function serveStatic(rawPath, res) {
  const safePath = rawPath === "/" ? "/index.html" : rawPath;
  const filePath = path.normalize(path.join(root, decodeURIComponent(safePath)));
  if (!filePath.startsWith(root)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(res, 404, "Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
  };
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function required(url, key) {
  const value = url.searchParams.get(key);
  if (!value) throw new Error(`${key} 값이 필요합니다.`);
  return value;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}
