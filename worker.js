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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (url.pathname !== "/api/search") {
      return withCors(json({ message: "Not found" }, 404));
    }

    try {
      if (!env.RIOT_API_KEY) {
        return withCors(json({ message: "Cloudflare Worker에 RIOT_API_KEY secret이 없습니다." }, 500));
      }

      const gameName = required(url, "gameName");
      const tagLine = required(url, "tagLine").replace(/^#/, "");
      const region = (url.searchParams.get("region") || "kr").toLowerCase();
      const count = clamp(Number(url.searchParams.get("count") || 20), 1, 20);
      const group = regionGroups[region];
      if (!group) throw new Error("지원하지 않는 서버입니다.");

      const account = await riotFetch(
        `https://${group}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        env.RIOT_API_KEY
      );

      const matchIds = await riotFetch(
        `https://${group}.api.riotgames.com/lol/match/v5/matches/by-puuid/${account.puuid}/ids?start=0&count=${count}`,
        env.RIOT_API_KEY
      );

      const matches = [];
      for (const matchId of matchIds) {
        const detail = await riotFetch(`https://${group}.api.riotgames.com/lol/match/v5/matches/${matchId}`, env.RIOT_API_KEY);
        const normalized = normalizeMatch(detail, account.puuid);
        if (normalized) matches.push(normalized);
      }

      return withCors(json({
        source: "riot",
        target: `${account.gameName}#${account.tagLine}`,
        matches,
      }));
    } catch (error) {
      return withCors(json({ message: error.message || "검색에 실패했습니다." }, 500));
    }
  },
};

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

function required(url, key) {
  const value = url.searchParams.get(key);
  if (!value) throw new Error(`${key} 값이 필요합니다.`);
  return value;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
