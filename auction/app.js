    const MODE_STORAGE_KEY = "league-team-auction-mode-v1";
    const STORAGE_PREFIX = "league-team-auction-state-v9";
    const AUGMENT_DRAW_COST = 20;
    const MAX_AUGMENTS_PER_TEAM = 2;
    const AUCTION_MODES = {
      palhyeop: {
        title: "팔협지식 경매",
        subtitle: "이래서 팔협지 팔협지 하는구나...",
        hasAugments: true
      },
      normal: {
        title: "일반 경매",
        subtitle: "",
        hasAugments: false
      }
    };
    const BASE_PLAYER_POINT_NORMAL = 1;
    const TIER_MIN_BIDS = {
      I: 1,
      B: 1,
      S: 1,
      G: 1,
      P: 1,
      E: 1,
      D: 1,
      M: 50
    };
    const APOSTLE_PLAYERS = new Set(["왁왁", "힘웃사", "레전드", "다람쥐", "레몬", "그그달"]);

    function getBasePoint(playerName) {
      return TIER_MIN_BIDS[getPlayerTierByName(playerName)] || BASE_PLAYER_POINT_NORMAL;
    }
    const MIN_BID_NORMAL = 1;

    function getMinBid(playerName) {
      if (state?.effects?.reroundBaseOne) {
        return MIN_BID_NORMAL;
      }

      const baseMinBid = TIER_MIN_BIDS[getPlayerTierByName(playerName)] || MIN_BID_NORMAL;
      return state?.effects ? getActiveMinBid(baseMinBid) : baseMinBid;
    }

    const initialTeams = [
      { id: "himutsa", name: "힘웃사", points: 200, tier: "G", line: "Jug-Sup", primaryLine: "Jug", secondaryLine: "Sup", champions: "", note: "1팀장" },
      { id: "legend", name: "레전드", points: 200, tier: "P", line: "Adc-Mid", primaryLine: "Adc", secondaryLine: "Mid", champions: "유나라-카이사-자야 / 사일러스-아칼리-요네", note: "2팀장" },
      { id: "daramjwi", name: "다람쥐", points: 200, tier: "P", line: "Mid-Jug", primaryLine: "Mid", secondaryLine: "Jug", champions: "제드(상징)-녹턴-라 칸 / 녹턴-카직스-제드", note: "3팀장" },
      { id: "geugeudal", name: "그그달", points: 200, tier: "G", line: "Adc-Top", primaryLine: "Adc", secondaryLine: "Top", champions: "아펠리오스(상징)-유나라-이즈리얼 / 잭스-자헨-모데카이저", note: "4팀장" }
    ];

    function createPlayer(line, name, tier, champions = "") {
      const [primaryLine = line, secondaryLine = ""] = String(line || "").split("-");
      return { line, primaryLine, secondaryLine, name, tier, champions };
    };

    const initialPlayers = [
      createPlayer("Top-Mid", "왁왁", "P"),
      createPlayer("Sup-Adc", "레몬", "P", "레오나-노틸러스-아무무(상징) / 미스 포츈(상징)-트리스타나-코그모"),
      createPlayer("Jug-Top", "롤못함", "M", "바이-리 신-비에고 / 요네(상징)-판테온-모데카이저"),
      createPlayer("Top-Sup", "김덕신", "M", "야스오(상징)-이렐리아-요네 / 이즈리얼-레오나-카르마"),
      createPlayer("Jug", "레큐임", "P", "녹턴-자헨-오공"),
      createPlayer("Sup-Mid", "Acheron", "P", "럭스-밀리오-멜 / 벡스-조이"),
      createPlayer("Mid", "제네바", "G", "오리아나(상징)-빅토르-갈리오"),
      createPlayer("Adc-Top", "부바탄보", "G"),
      createPlayer("Sup-Adc", "심쿵사", "G", "룰루(상징)-레오나-탐 켄치 / 트위치-미스 포츈-세나"),
      createPlayer("Adc-Mid", "윈드", "S", "루시안(상징)-자야-애쉬 / 갈리오-트위스티드 페이트-제드"),
      createPlayer("Top-Mid", "망객", "S", "블라디 / 요네"),
      createPlayer("Adc-Top", "천사", "S", "유나라-애쉬"),
      createPlayer("Sup-Adc", "유바룐", "B", "바드-카밀-쓰레쉬 / 카이사-제리-바루스"),
      createPlayer("Top-Mid", "이현우", "B", "요릭-사이온-오른 / 애니비아-신드라-로크"),
      createPlayer("Mid", "밴치", "B", "아칼리(상징)"),
      createPlayer("Mid-Top", "최고최고", "I", "베이가-사일러스-오로라 / 트런들-세트-모데카이저")
    ];

    const augmentPool = [
      {
        id: "three-two-one-cataclysm",
        name: "쓰리 투 원 대격변!!!",
        description: "자신의 팀에 있는 사람을 사람 수만큼 랜덤으로 바꿉니다. 또한 남은 포인트도 0~원래 남은 포인트+15로 랜덤 조정됩니다.",
        image: "증강 - 쓰리투원 대격변.png",
        effect: "team-reroll-and-point-chaos"
      },
      {
        id: "night-guy",
        name: "밤가이",
        description: "다음 경매에서 포인트가 무제한이 됩니다. 다음 경매에서 낙찰이 될시, 포인트가 0이됩니다.",
        image: "증강 - 밤가이.png",
        effect: "next-auction-infinite-points"
      },
      {
        id: "palhyeop-secret",
        name: "팔협지 비기.",
        description: "모든 팀 현황을 랜덤으로 바꿉니다. 각각의 팀원수 만큼 랜덤으로 팀원이 바뀝니다. 자신은 모든 포인트를 잃으며, 자신을 제외한 모든 팀장은 40P를 얻습니다.",
        image: "증강 - 팔협지 비기.png",
        effect: "all-team-reroll-point-transfer"
      },
      {
        id: "dad-limit",
        name: "아빠도 이제 한계다.",
        description: "자신에 팀에서 원하는 한명을 방출시킵니다. 방출된 팀원은 80%의 포인트를 가지고 랜덤한 팀에게 갑니다.",
        image: "증강 - 아빠도 이제 한계다..png",
        effect: "release-one-member"
      },
      {
        id: "no-ban-game",
        name: "노밴전",
        description: "딱 한경기 노밴전으로 진행합니다. 만약 밴을 할시 게임 종료가 가능합니다. 칼바람 게임이라면 원할때 딱한번 종료가 가능합니다. 10P를 얻습니다.",
        image: "증강 - 노밴전.png",
        effect: "no-ban-match"
      },
      {
        id: "dice-roll",
        name: "주사위 굴리기",
        description: "주사위를 굴려 주사위 눈 - 1 * 10에 해당하는 포인트를 얻습니다.",
        image: "증강 - 주사위 굴리기.png",
        effect: "dice-point-gain"
      },
      {
        id: "inflation",
        name: "물가 상승",
        description: "골드 미만 매물의 최소 포인트를 20P로 설정합니다.",
        image: "증강 - 물가상승.png",
        effect: "minimum-bid-20"
      },
      {
        id: "roulette",
        name: "룰렛",
        description: "20P를 추가로 소모합니다. 선수 목록에 있는 랜덤한 매물을 얻습니다.",
        image: "증강 - 룰렛.png",
        effect: "random-free-player-for-extra-cost"
      },
      {
        id: "contract-break",
        name: "계약 파기",
        description: "자신의 팀원 1명을 선수목록으로 돌려보내고 그 선수 점수의 70%를 받습니다.",
        image: "증강 - 계약 파기.png",
        effect: "contract-break"
      },
      {
        id: "bounty",
        name: "현상금",
        description: "선수 목록에 있는 매물중 원하는 매물의 기본 점수를 마음대로 변경시킵니다. (최대 50P)",
        image: "증강 - 현상금.png",
        effect: "bounty-score-change"
      },
      {
        id: "loan",
        name: "대출",
        description: "즉시 60P를 얻는 대신, 다음 낙찰때 부른 값의 2배로 측정됩니다.",
        image: "증강 - 대출.png",
        effect: "loan-next-double"
      },
      {
        id: "tax-bomb",
        name: "세금 폭탄",
        description: "현재 포인트가 제일 많은 팀에게 20P를 차감시킵니다.",
        image: "증강 - 세금폭탄.png",
        effect: "tax-bomb"
      },
      {
        id: "hold-wins",
        name: "존버는 승리한다",
        description: "현재 경매에서 입찰을 포기하는대신 해당 매물의 최종낙찰가의 50%를 획득합니다. 최대 50P",
        image: "증강 - 존버는 승리한다.png",
        effect: "hold-final-bid-reward"
      },
      {
        id: "you-buy-it",
        name: "님이 사셈",
        description: "현재 선수의 입찰에 성공한다면, 원하는 팀을 선택하여 자신이 입찰한 가격의 90%로 선택한 팀에게 입찰시킵니다.",
        image: "증강 - 님이 사셈.png",
        effect: "force-target-team-buy"
      },
      {
        id: "clean-sweep",
        name: "싹쓸이",
        description: "현재 선수의 입찰을 성공하면 바로 다음 매물을 같은가격으로 구매합니다.",
        image: "증강 - 싹쓸이.png",
        effect: "buy-next-player-same-price"
      },
      {
        id: "not-that",
        name: "그건좀...",
        description: "현재 최고 입찰가격인 선수를 선수목록으로 보낸후 현재 경매 순서의 바로 다음 경매순서로 미룹니다. 그 선수를 가지고 있던 팀은 입찰 가격을 돌려받고 또한 + 10P를 얻습니다.",
        image: "증강 - 그건좀.png",
        effect: "delay-highest-bid-player-refund"
      },
      {
        id: "see-you-later",
        name: "나중에 보자",
        description: "현재 경매 매물의 순서를 맨 뒤로 보냅니다.",
        image: "증강 - 나중에 보자.png",
        effect: "move-current-auction-player-last"
      }
    ];

    const heroAugmentPool = [];

    const modeScreen = document.getElementById("modeScreen");
    const auctionApp = document.getElementById("auctionApp");
    const appTitle = document.getElementById("appTitle");
    const appSubtitle = document.getElementById("appSubtitle");
    const backButton = document.getElementById("backButton");
    const ruleButton = document.getElementById("ruleButton");
    const ruleModal = document.getElementById("ruleModal");
    const closeRuleButton = document.getElementById("closeRuleButton");
    const augmentRuleSection = document.getElementById("augmentRuleSection");
    const teamsGrid = document.getElementById("teamsGrid");
    const playersList = document.getElementById("playersList");
    const reroundShuffleButton = document.getElementById("reroundShuffleButton");
    const cataclysmToggleButton = document.getElementById("cataclysmToggleButton");
    const resetButton = document.getElementById("resetButton");
    const auctionPlayerSelect = document.getElementById("auctionPlayerSelect");
    const auctionPlayerButtons = document.getElementById("auctionPlayerButtons");
    const auctionTeamSelect = document.getElementById("auctionTeamSelect");
    const auctionTeamButtons = document.getElementById("auctionTeamButtons");
    const auctionBidInput = document.getElementById("auctionBidInput");
    const auctionBidSlider = document.getElementById("auctionBidSlider");
    const auctionApplyButton = document.getElementById("auctionApplyButton");
    const awardButton = document.getElementById("awardButton");
    const clearBidsButton = document.getElementById("clearBidsButton");
    const auctionMessage = document.getElementById("auctionMessage");
    const auctionBidList = document.getElementById("auctionBidList");
    const scoreModal = document.getElementById("scoreModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const scoreInput = document.getElementById("scoreInput");
    const modalError = document.getElementById("modalError");
    const cancelScoreButton = document.getElementById("cancelScoreButton");
    const saveScoreButton = document.getElementById("saveScoreButton");
    const augmentModal = document.getElementById("augmentModal");
    const augmentOptions = document.getElementById("augmentOptions");
    const augmentSituationButton = document.getElementById("augmentSituationButton");
    const augmentSituation = document.getElementById("augmentSituation");
    const screenEffect = document.getElementById("screenEffect");
    const diceOverlay = document.getElementById("diceOverlay");
    const diceFace = document.getElementById("diceFace");
    const diceResult = document.getElementById("diceResult");

    let currentMode = localStorage.getItem(MODE_STORAGE_KEY);
    let state = createInitialState();
    let draggedPlayerId = null;
    let editingPlayerId = null;
    let pendingAugmentTeamId = null;
    let pendingAugmentOptions = [];
    let pendingTargetAction = null;
    let editingTeamId = null;
    let rouletteHighlightPlayerId = null;
    let rouletteActive = false;

    if (!AUCTION_MODES[currentMode]) {
      currentMode = "";
    }

    function createInitialState() {
      return {
        teams: initialTeams.map((team) => ({
          ...team,
          augmentSpend: 0,
          augments: [],
          sleepAuctionCount: 0
        })),
        players: initialPlayers.map((player, index) => ({
          id: `player-${index}`,
          name: player.name,
          tier: player.tier,
          line: player.line,
          primaryLine: player.primaryLine || player.line,
          secondaryLine: player.secondaryLine || "",
          champions: player.champions || "",
          hoverMessage: player.champions || "",
          isApostle: APOSTLE_PLAYERS.has(player.name),
          auctionLabel: "",
          score: getBasePoint(player.name),
          teamId: null
        })),
        auctionBids: [],
        effects: {
          nightGuyTeamId: null,
          minimumBidOverride: null,
          noBanActive: false,
          loanTeamIds: [],
          cataclysmAugmentsEnabled: true,
          reroundBaseOne: false,
          holdRewardReservations: [],
          forceBuyReservations: [],
          sweepReservations: []
        }
      };
    }

    function getModeConfig() {
      return AUCTION_MODES[currentMode] || AUCTION_MODES.normal;
    }

    function isAugmentMode() {
      return getModeConfig().hasAugments;
    }

    function getStorageKey(mode = currentMode) {
      return `${STORAGE_PREFIX}-${mode}`;
    }

    function loadState() {
      const savedState = localStorage.getItem(getStorageKey());

      if (!savedState) {
        return createInitialState();
      }

      try {
        const parsedState = JSON.parse(savedState);
        const hasPlayers = Array.isArray(parsedState.players);
        const hasTeams = Array.isArray(parsedState.teams);
        return hasPlayers && hasTeams ? normalizeState(parsedState) : createInitialState();
      } catch (error) {
        return createInitialState();
      }
    }

    function normalizeState(savedState) {
      const freshState = createInitialState();
      const savedPlayersByName = new Map(savedState.players.map((player) => [player.name, player]));
      const savedTeamsById = new Map((savedState.teams || []).map((team) => [team.id, team]));
      const shouldKeepAugments = isAugmentMode();

      return {
        teams: freshState.teams.map((freshTeam) => {
          const savedTeam = savedTeamsById.get(freshTeam.id);
          const augmentSpend = Number(savedTeam?.augmentSpend);

          return {
            ...freshTeam,
            augmentSpend: shouldKeepAugments && Number.isInteger(augmentSpend) && augmentSpend > 0 ? augmentSpend : 0,
            augments: shouldKeepAugments ? normalizeAugments(savedTeam?.augments) : [],
            sleepAuctionCount: shouldKeepAugments ? Math.max(0, Number(savedTeam?.sleepAuctionCount) || 0) : 0
          };
        }),
        players: freshState.players.map((freshPlayer) => {
          const savedPlayer = savedPlayersByName.get(freshPlayer.name);

          if (!savedPlayer) {
            return freshPlayer;
          }

          const savedScore = Number(savedPlayer.score);
          const basePoint = getBasePoint(freshPlayer.name);
          const score = Number.isInteger(savedScore) ? Math.max(basePoint, savedScore) : basePoint;
          const teamExists = freshState.teams.some((team) => team.id === savedPlayer.teamId);

          return {
            ...freshPlayer,
            score,
            tier: freshPlayer.tier,
            line: freshPlayer.line,
            primaryLine: freshPlayer.primaryLine || freshPlayer.line,
            secondaryLine: freshPlayer.secondaryLine || "",
            champions: freshPlayer.champions || "",
            hoverMessage: freshPlayer.hoverMessage || freshPlayer.champions || "",
            isApostle: freshPlayer.isApostle,
            auctionLabel: savedPlayer.auctionLabel === "유찰" ? "유찰" : "",
            teamId: teamExists ? savedPlayer.teamId : null
          };
        }),
        auctionBids: normalizeAuctionBids(savedState.auctionBids, freshState),
        effects: normalizeEffects(savedState.effects, shouldKeepAugments)
      };
    }

    function normalizeEffects(savedEffects, shouldKeepAugments) {
      if (!shouldKeepAugments) {
        return {
          ...createInitialState().effects,
          reroundBaseOne: Boolean(savedEffects?.reroundBaseOne)
        };
      }

      const nightGuyTeamId = stateTeamExists(savedEffects?.nightGuyTeamId) ? savedEffects.nightGuyTeamId : null;
      const minimumBidOverride = Number(savedEffects?.minimumBidOverride);

      return {
        nightGuyTeamId,
        minimumBidOverride: Number.isInteger(minimumBidOverride) && minimumBidOverride > 0 ? minimumBidOverride : null,
        noBanActive: Boolean(savedEffects?.noBanActive),
        loanTeamIds: Array.isArray(savedEffects?.loanTeamIds)
          ? savedEffects.loanTeamIds.filter((teamId) => stateTeamExists(teamId))
          : [],
        cataclysmAugmentsEnabled: savedEffects?.cataclysmAugmentsEnabled !== false,
        reroundBaseOne: Boolean(savedEffects?.reroundBaseOne),
        holdRewardReservations: normalizeEffectReservations(savedEffects?.holdRewardReservations, ["teamId", "playerId"]),
        forceBuyReservations: normalizeEffectReservations(savedEffects?.forceBuyReservations, ["sourceTeamId", "targetTeamId", "playerId"]),
        sweepReservations: normalizeEffectReservations(savedEffects?.sweepReservations, ["teamId", "playerId"])
      };
    }

    function normalizeEffectReservations(reservations, keys) {
      if (!Array.isArray(reservations)) {
        return [];
      }

      return reservations.filter((reservation) => {
        return keys.every((key) => {
          const value = reservation?.[key];
          return key.toLowerCase().includes("team") ? stateTeamExists(value) : statePlayerExists(value);
        });
      });
    }

    function stateTeamExists(teamId) {
      return initialTeams.some((team) => team.id === teamId);
    }

    function statePlayerExists(playerId) {
      return createInitialState().players.some((player) => player.id === playerId);
    }

    function normalizeAugments(savedAugments) {
      if (!Array.isArray(savedAugments)) {
        return [];
      }

      return savedAugments
        .map((augment) => getAugmentById(augment.id) || augment)
        .filter((augment) => augment && augment.id && augment.name)
        .map((augment) => ({
          id: augment.id,
          name: augment.name,
          description: augment.description || "",
          image: augment.image || "",
          effect: augment.effect || ""
        }));
    }

    function normalizeAuctionBids(savedBids, freshState) {
      if (!Array.isArray(savedBids)) {
        return [];
      }

      return savedBids
        .filter((bid) => {
          const hasPlayer = freshState.players.some((player) => player.id === bid.playerId);
          const hasTeam = freshState.teams.some((team) => team.id === bid.teamId);
          return hasPlayer && hasTeam;
        })
        .map((bid) => {
          const player = freshState.players.find((p) => p.id === bid.playerId);
          const minBid = player ? getMinBid(player.name) : MIN_BID_NORMAL;
          return {
            playerId: bid.playerId,
            teamId: bid.teamId,
            value: Math.max(minBid, Number(bid.value) || minBid)
          };
        });
    }

    function saveState() {
      if (currentMode) {
        localStorage.setItem(getStorageKey(), JSON.stringify(state));
      }
    }

    function getTeam(teamId) {
      return state.teams.find((team) => team.id === teamId);
    }

    function getPlayer(playerId) {
      return state.players.find((player) => player.id === playerId);
    }

    function getTeamPlayers(teamId) {
      return state.players.filter((player) => player.teamId === teamId);
    }

    function getPlayerUsedPoints(teamId) {
      return getTeamPlayers(teamId).reduce((total, player) => total + player.score, 0);
    }

    function getAugmentUsedPoints(teamId) {
      if (!isAugmentMode()) {
        return 0;
      }

      const team = getTeam(teamId);
      return team?.augmentSpend || 0;
    }

    function getUsedPoints(teamId) {
      return getPlayerUsedPoints(teamId) + getAugmentUsedPoints(teamId);
    }

    function getRemainPoints(teamId) {
      const team = getTeam(teamId);
      if (state.effects?.nightGuyTeamId === teamId) {
        return Infinity;
      }

      return team.points - getUsedPoints(teamId);
    }

    function getAugmentById(augmentId) {
      return augmentPool.find((augment) => augment.id === augmentId);
    }

    function isCataclysmAugment(augmentId) {
      return augmentId === "three-two-one-cataclysm" || augmentId === "palhyeop-secret";
    }

    function getDisplayName(name) {
      return name.split("#")[0].trim();
    }

    function getPlayerTierByName(playerName) {
      return initialPlayers.find((player) => player.name === getDisplayName(playerName))?.tier || "I";
    }

    function getTierClass(tier) {
      return `tier-${String(tier || "I").toLowerCase()}`;
    }

    function getLineLabel(player) {
      return player?.line || [player?.primaryLine, player?.secondaryLine].filter(Boolean).join("-") || "-";
    }

    function getPrimaryLine(player) {
      return player?.primaryLine || String(player?.line || "").split("-")[0] || "";
    }

    function getChampionLabel(player) {
      return player?.champions || player?.hoverMessage || "";
    }

    function getChampionRows(player) {
      const championText = getChampionLabel(player);
      if (!championText) {
        return [];
      }

      const [primaryChampions = "", secondaryChampions = ""] = championText.split(" / ");
      return [
        { label: getPrimaryLine(player) || "주라인", champions: primaryChampions },
        { label: player?.secondaryLine || "부라인", champions: secondaryChampions }
      ].filter((row) => row.champions);
    }

    function getHoverInfo(entity) {
      const championRows = getChampionRows(entity);
      if (championRows.length) {
        return championRows.map((row) => `<span><b>${row.label}</b>${row.champions}</span>`).join("");
      }

      return getLineLabel(entity);
    }

    function hasDuplicateLine(player) {
      const playerLine = getPrimaryLine(player);
      if (!player.teamId || !playerLine) {
        return false;
      }

      return getTeamPlayers(player.teamId).filter((teamPlayer) => getPrimaryLine(teamPlayer) === playerLine).length > 1;
    }

    function isPlayerListEmpty() {
      return state.players.every((player) => player.teamId !== null);
    }

    function canReleasePlayerForZero(player) {
      return Boolean(player?.teamId) && (hasDuplicateLine(player) || isPlayerListEmpty());
    }

    function spendLeavingPlayerCost(player) {
      if (!player?.teamId) {
        return;
      }

      const sourceTeam = getTeam(player.teamId);

      if (sourceTeam) {
        sourceTeam.points -= player.score;
      }
    }

    function releasePlayerForZero(playerId) {
      const player = getPlayer(playerId);

      if (!canReleasePlayerForZero(player)) {
        return;
      }

      spendLeavingPlayerCost(player);
      player.teamId = null;
      player.score = 0;
      player.auctionLabel = "";
      state.auctionBids = state.auctionBids.filter((bid) => bid.playerId !== player.id);
      showAuctionMessage(`${getDisplayName(player.name)} 매물을 0P로 돌려보냈습니다.`, "success");
      render();
    }

    function updateAuctionBidMin() {
      const player = getPlayer(auctionPlayerSelect.value);
      const team = getTeam(auctionTeamSelect.value);
      const minBid = player ? getMinBid(player.name) : MIN_BID_NORMAL;
      const activeMinBid = getActiveMinBid(minBid);
      const maxBid = getMaxBidForSlider(player, team, activeMinBid);
      const recommendedBid = getRecommendedBidValue(player, activeMinBid);
      auctionBidInput.min = activeMinBid;
      auctionBidInput.max = maxBid;
      auctionBidSlider.min = activeMinBid;
      auctionBidSlider.max = maxBid;

      auctionBidInput.value = Math.max(activeMinBid, Math.min(maxBid, recommendedBid));

      auctionBidSlider.value = auctionBidInput.value;
      updateBidSliderFill();
    }

    function getRecommendedBidValue(player, minBid) {
      if (!player) {
        return minBid;
      }

      const highestBid = state.auctionBids
        .filter((bid) => bid.playerId === player.id)
        .reduce((highest, bid) => Math.max(highest, bid.value), 0);

      return highestBid > 0 ? highestBid + 1 : minBid;
    }

    function getMaxBidForSlider(player, team, activeMinBid = MIN_BID_NORMAL) {
      if (!player || !team) {
        return 200;
      }

      const availablePoints = getAvailablePointsForPlayerTeam(player, team.id);

      if (availablePoints === Infinity) {
        return 999;
      }

      const maxBid = state.effects?.loanTeamIds?.includes(team.id)
        ? Math.floor(availablePoints / 2)
        : availablePoints;

      return Math.max(activeMinBid, maxBid);
    }

    function updateBidSliderFill() {
      const min = Number(auctionBidSlider.min) || 1;
      const max = Number(auctionBidSlider.max) || min;
      const value = Number(auctionBidSlider.value) || min;
      const percent = max === min ? 100 : ((value - min) / (max - min)) * 100;
      auctionBidSlider.style.setProperty("--slider-fill", `${Math.max(0, Math.min(100, percent))}%`);
    }

    function syncBidInputFromSlider() {
      auctionBidInput.value = auctionBidSlider.value;
      updateBidSliderFill();
    }

    function syncBidSliderFromInput() {
      const min = Number(auctionBidInput.min) || 1;
      const max = Number(auctionBidInput.max) || min;
      const typedValue = Number(auctionBidInput.value);

      if (!auctionBidInput.value || !Number.isFinite(typedValue)) {
        return;
      }

      const nextValue = Math.max(min, Math.min(max, typedValue));
      auctionBidSlider.value = nextValue;
      updateBidSliderFill();
    }

    function clampAuctionBidInput() {
      const min = Number(auctionBidInput.min) || 1;
      const max = Number(auctionBidInput.max) || min;
      const nextValue = Math.max(min, Math.min(max, Number(auctionBidInput.value) || min));
      auctionBidInput.value = nextValue;
      auctionBidSlider.value = nextValue;
      updateBidSliderFill();
    }

    function getActiveMinBid(baseMinBid) {
      return Math.max(baseMinBid, state.effects?.minimumBidOverride || 0);
    }

    function renderApp() {
      if (!currentMode) {
        modeScreen.classList.remove("hidden");
        auctionApp.classList.add("hidden");
        return;
      }

      const modeConfig = getModeConfig();
      appTitle.textContent = modeConfig.title;
      appSubtitle.textContent = modeConfig.subtitle;
      appSubtitle.classList.toggle("hidden", !modeConfig.subtitle);
      augmentRuleSection.classList.toggle("hidden", !modeConfig.hasAugments);
      document.title = modeConfig.title;
      modeScreen.classList.add("hidden");
      auctionApp.classList.remove("hidden");
      updateCataclysmToggleButton();
      render();
    }

    function selectMode(mode) {
      if (!AUCTION_MODES[mode]) {
        return;
      }

      currentMode = mode;
      localStorage.setItem(MODE_STORAGE_KEY, currentMode);
      state = loadState();
      renderApp();
    }

    function goBackToModeSelect() {
      currentMode = "";
      localStorage.removeItem(MODE_STORAGE_KEY);
      closeScoreModal();
      closeAugmentModal();
      auctionApp.classList.add("hidden");
      modeScreen.classList.remove("hidden");
      document.title = "경매 모드 선택";
    }

    function render() {
      if (!currentMode) {
        return;
      }

      renderTeams();
      renderPlayers();
      renderAuctionControls();
      renderAuctionBoard();
      updateCataclysmToggleButton();
      screenEffect.classList.toggle("roulette", rouletteActive);
      attachDropZoneEvents();
      attachPlayerEvents();
      saveState();
    }

    function updateCataclysmToggleButton() {
      if (!cataclysmToggleButton) {
        return;
      }

      const isVisible = isAugmentMode();
      const isEnabled = state.effects?.cataclysmAugmentsEnabled !== false;
      cataclysmToggleButton.classList.toggle("hidden", !isVisible);
      cataclysmToggleButton.classList.toggle("active", isEnabled);
      cataclysmToggleButton.classList.toggle("off", !isEnabled);
      cataclysmToggleButton.textContent = `대격변류 증강 ${isEnabled ? "ON" : "OFF"}`;
    }

    function renderTeams() {
      teamsGrid.innerHTML = "";

      state.teams.forEach((team) => {
        const remainPoints = getRemainPoints(team.id);
        const assignedPlayers = getTeamPlayers(team.id);
        const hasMaxAugments = (team.augments || []).length >= MAX_AUGMENTS_PER_TEAM;
        const canDrawAugment = isAugmentMode() && !hasMaxAugments && remainPoints >= AUGMENT_DRAW_COST && state.effects?.nightGuyTeamId !== team.id;
        const hasNightGuy = state.effects?.nightGuyTeamId === team.id;
        const isSleeping = team.sleepAuctionCount > 0;

        const teamCard = document.createElement("article");
        teamCard.className = `team-card ${pendingTargetAction?.type === "sleep-team" ? "target-selectable" : ""}`;
        teamCard.dataset.teamId = team.id;

        teamCard.innerHTML = `
          <div class="team-header">
            <div class="team-heading">
              <div class="team-title-row">
                <span class="team-name-hover">
                  <span class="player-hover-message team-hover-message">${getHoverInfo(team)}</span>
                  <h3 class="team-name ${getTierClass(team.tier)}">${getDisplayName(team.name)}</h3>
                </span>
                <span class="team-line-badge">${team.line || "Sup"}</span>
                ${
                  isAugmentMode()
                    ? `<button class="augment-draw-button" type="button" data-augment-draw="${team.id}" ${canDrawAugment ? "" : "disabled"}>증강 뽑기 - 20P</button>`
                    : ""
                }
              </div>
              ${team.note ? `<span class="team-note">${team.note}</span>` : ""}
              ${isSleeping ? `<span class="team-note effect-note">수면상태</span>` : ""}
            </div>
            <button class="point-pill ${hasNightGuy ? "infinity" : ""}" type="button" data-team-points="${team.id}">${formatPoint(remainPoints)}</button>
          </div>
          <div class="team-stats">
            <div class="stat-box">
              <span>남은 포인트</span>
              <strong>${formatPoint(remainPoints)}</strong>
            </div>
          </div>
          ${
            isAugmentMode()
              ? `<div class="team-augments">
                  ${
                    team.augments.length
                      ? team.augments.map((augment) => `<span class="augment-chip">${augment.name}</span>`).join("")
                      : `<div class="empty-message">선택한 증강이 없습니다.</div>`
                  }
                </div>`
              : ""
          }
          <div class="team-members" data-drop-zone="team" data-team-id="${team.id}">
            ${
              assignedPlayers.length
                ? assignedPlayers.map((player) => createPlayerCardMarkup(player)).join("")
                : `<div class="empty-message">아직 팀원이 없습니다.</div>`
            }
          </div>
        `;

        teamsGrid.appendChild(teamCard);
      });

    }

    function renderPlayers() {
      const freePlayers = state.players.filter((player) => player.teamId === null);

      playersList.innerHTML = freePlayers.length
        ? freePlayers.map((player) => createPlayerCardMarkup(player)).join("")
        : `<div class="empty-message">모든 선수가 팀에 배정되었습니다.</div>`;

      playersList.dataset.dropZone = "free";
      playersList.classList.toggle("roulette-active", rouletteActive);
      playersList.closest(".panel-card")?.classList.toggle("roulette-stage-panel", rouletteActive);
    }

    function renderAuctionControls() {
      const selectedPlayerId = getNextAuctionPlayerId(auctionPlayerSelect.value);
      const selectedTeamId = auctionTeamSelect.value || state.teams[0]?.id || "";

      auctionPlayerSelect.innerHTML = state.players
        .map((player) => `<option value="${player.id}">${getDisplayName(player.name)}</option>`)
        .join("");

      auctionTeamSelect.innerHTML = state.teams
        .map((team) => `<option value="${team.id}">${getDisplayName(team.name)} - 남은 ${formatPoint(getRemainPoints(team.id))}</option>`)
        .join("");

      if (getPlayer(selectedPlayerId)) {
        auctionPlayerSelect.value = selectedPlayerId;
      }

      if (getTeam(selectedTeamId)) {
        auctionTeamSelect.value = selectedTeamId;
      }

      renderAuctionPlayerButtons(auctionPlayerSelect.value);
      renderAuctionTeamButtons(auctionTeamSelect.value);
      updateAuctionBidMin();
    }

    function renderAuctionPlayerButtons(selectedPlayerId) {
      const player = getPlayer(selectedPlayerId);

      auctionPlayerButtons.innerHTML = player
        ? `
          <div class="auction-player-current ${player.isApostle ? "apostle" : ""}" data-auction-player-id="${player.id}">
            ${player.hoverMessage ? `<div class="player-hover-message">${player.hoverMessage}</div>` : ""}
            <div class="auction-player-current-main">
              <div class="auction-player-title">
                <strong class="${getTierClass(player.tier)}">${getDisplayName(player.name)}</strong>
                <span>${getLineLabel(player)}</span>
              </div>
              <div class="auction-player-detail">
                <span>${player.score}P</span>
                ${
                  getChampionRows(player).length
                    ? getChampionRows(player).map((row) => `<p><b>${row.label}</b>${row.champions}</p>`).join("")
                    : `<p>주챔 정보 없음</p>`
                }
              </div>
            </div>
            <button class="send-last-button" type="button" data-send-current-last>맨 뒤로 보내기</button>
          </div>
        `
        : `<div class="empty-message">선택할 매물이 없습니다.</div>`;
    }

    function renderAuctionTeamButtons(selectedTeamId) {
      auctionTeamButtons.innerHTML = state.teams.map((team) => {
        const remainPoints = getRemainPoints(team.id);
        const hasMaxAugments = (team.augments || []).length >= MAX_AUGMENTS_PER_TEAM;
        const canDrawAugment = isAugmentMode() && !hasMaxAugments && remainPoints >= AUGMENT_DRAW_COST && state.effects?.nightGuyTeamId !== team.id;

        return `
          <button class="auction-team-button ${team.id === selectedTeamId ? "selected" : ""}" type="button" data-auction-team-id="${team.id}">
            <span class="auction-team-name-row">
              ${
                isAugmentMode()
                  ? `<span class="auction-augment-draw-button" role="button" tabindex="0" data-augment-draw="${team.id}" ${canDrawAugment ? "" : "aria-disabled=\"true\""}>증강 뽑기 - 20P</span>`
                  : ""
              }
              <strong class="${getTierClass(team.tier)}">${getDisplayName(team.name)}</strong>
            </span>
            <span>${team.line || "Sup"} · 남은 ${formatPoint(remainPoints)}</span>
          </button>
        `;
      }).join("");
    }

    function getNextAuctionPlayerId(currentPlayerId) {
      const currentPlayer = getPlayer(currentPlayerId);

      if (currentPlayer && currentPlayer.teamId === null) {
        return currentPlayer.id;
      }

      const currentIndex = state.players.findIndex((player) => player.id === currentPlayerId);
      const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
      const orderedPlayers = [
        ...state.players.slice(startIndex),
        ...state.players.slice(0, Math.max(0, startIndex))
      ];
      const nextFreePlayer = orderedPlayers.find((player) => player.teamId === null);

      return nextFreePlayer?.id || currentPlayerId || state.players[0]?.id || "";
    }

    function renderAuctionBoard() {
      if (!state.auctionBids.length) {
        auctionBidList.innerHTML = `<div class="empty-message">아직 입력된 경매값이 없습니다.</div>`;
        return;
      }

      auctionBidList.innerHTML = [...state.auctionBids]
        .sort((firstBid, secondBid) => secondBid.value - firstBid.value)
        .map((bid) => {
          const player = getPlayer(bid.playerId);
          const team = getTeam(bid.teamId);
          const tierClass = player ? getTierClass(player.tier) : "";

          return `
            <div class="auction-bid-item">
              <div class="auction-bid-top">
                <span class="${tierClass}">${player ? getDisplayName(player.name) : "-"}</span>
                <span class="auction-bid-point">${bid.value}P</span>
              </div>
              <div class="auction-bid-team">${team ? getDisplayName(team.name) : "-"}</div>
            </div>
          `;
        })
        .join("");
    }

    function renderAugmentOptions() {
      augmentOptions.innerHTML = pendingAugmentOptions
        .map((augment) => `
          <button class="augment-option ${augment.isHero ? "hero-augment" : ""}" type="button" data-augment-id="${augment.id}">
            <div class="augment-image">
              ${augment.image ? `<img src="${augment.image}" alt="${augment.name}">` : `<span>${augment.name.slice(0, 1)}</span>`}
            </div>
            <strong>${augment.name}</strong>
            <span>${augment.description}</span>
          </button>
        `)
        .join("");
      renderAugmentSituation();
    }

    function renderAugmentSituation() {
      const freePlayers = state.players.filter((player) => player.teamId === null);

      augmentSituation.innerHTML = freePlayers.length
        ? freePlayers
        .map((player) => {
          const team = getTeam(player.teamId);
          return `
            <div class="situation-player">
              ${getDisplayName(player.name)}
              <span>${player.score}P · ${team ? getDisplayName(team.name) : "선수 목록"}</span>
            </div>
          `;
        })
        .join("")
        : `<div class="empty-message">선수 목록에 남은 매물이 없습니다.</div>`;
    }

    function formatPoint(point) {
      return point === Infinity ? "∞P" : `${point}P`;
    }

    function handleTeamGridClick(event) {
      const teamPointsButton = event.target.closest("[data-team-points]");
      const drawButton = event.target.closest("[data-augment-draw]");
      const augmentOption = event.target.closest("[data-augment-id]");
      const teamCard = event.target.closest(".team-card");

      if (teamPointsButton) {
        openTeamPointsModal(teamPointsButton.dataset.teamPoints);
        return;
      }

      if (pendingTargetAction?.type === "sleep-team" && teamCard) {
        finishSleepTargetTeam(teamCard.dataset.teamId);
        return;
      }

      if (drawButton) {
        drawAugments(drawButton.dataset.augmentDraw);
        return;
      }

      if (augmentOption) {
        selectAugment(augmentOption.dataset.augmentId);
      }
    }

    function handleAuctionPlayerButtonClick(event) {
      if (event.target.closest("[data-send-current-last]")) {
        event.preventDefault();
        moveCurrentAuctionPlayerLast();
        showAuctionMessage("현재 매물을 맨 뒤로 보내고 다음 매물로 넘어갔습니다.", "success");
        render();
        return;
      }

      const button = event.target.closest("[data-auction-player-id]");

      if (!button) {
        return;
      }

      auctionPlayerSelect.value = button.dataset.auctionPlayerId;
      updateAuctionBidMin();
      renderAuctionPlayerButtons(auctionPlayerSelect.value);
    }

    function handleAuctionTeamButtonClick(event) {
      const drawButton = event.target.closest("[data-augment-draw]");

      if (drawButton) {
        event.preventDefault();
        event.stopPropagation();

        if (drawButton.getAttribute("aria-disabled") === "true") {
          return;
        }

        drawAugments(drawButton.dataset.augmentDraw);
        return;
      }

      const button = event.target.closest("[data-auction-team-id]");

      if (!button) {
        return;
      }

      auctionTeamSelect.value = button.dataset.auctionTeamId;
      renderAuctionTeamButtons(auctionTeamSelect.value);
      updateAuctionBidMin();
    }

    function handleAuctionTeamButtonKeydown(event) {
      const drawButton = event.target.closest("[data-augment-draw]");

      if (!drawButton || (event.key !== "Enter" && event.key !== " ")) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (drawButton.getAttribute("aria-disabled") === "true") {
        return;
      }

      drawAugments(drawButton.dataset.augmentDraw);
    }

    function drawAugments(teamId) {
      if (!isAugmentMode()) {
        return;
      }

      const team = getTeam(teamId);

      if (!team) {
        return;
      }

      if ((team.augments || []).length >= MAX_AUGMENTS_PER_TEAM) {
        showAugmentNotice("이미 증강을 2개 선택했습니다.");
        return;
      }

      if (getRemainPoints(team.id) < AUGMENT_DRAW_COST) {
        showAugmentNotice("포인트가 없습니다.");
        return;
      }

      pendingAugmentOptions = pickRandomAugments(3, team);

      if (!pendingAugmentOptions.length) {
        showAugmentNotice("더 이상 뽑을 수 있는 증강이 없습니다.");
        return;
      }

      team.augmentSpend = (team.augmentSpend || 0) + AUGMENT_DRAW_COST;
      pendingAugmentTeamId = team.id;
      render();
      renderAugmentOptions();
      augmentModal.classList.add("open");
    }

    function pickRandomAugments(count, team) {
      const ownedAugmentIds = new Set(
        state.teams.flatMap((team) => (team.augments || []).map((augment) => augment.id))
      );
      const teamPlayers = getTeamPlayers(team.id);
      const shuffledAugments = augmentPool.filter((augment) => {
        if (ownedAugmentIds.has(augment.id)) {
          return false;
        }

        if (isCataclysmAugment(augment.id) && state.effects?.cataclysmAugmentsEnabled === false) {
          return false;
        }

        if (augment.id === "dad-limit" && !teamPlayers.length) {
          return false;
        }

        if (augment.id === "contract-break" && !teamPlayers.length) {
          return false;
        }

        if (augment.id === "bounty" && !state.players.some((player) => player.teamId === null)) {
          return false;
        }

        if (["hold-wins", "you-buy-it", "clean-sweep"].includes(augment.id) && !getCurrentAuctionPlayer()) {
          return false;
        }

        if (augment.id === "not-that" && !getHighestAuctionBid(team.id)) {
          return false;
        }

        return true;
      });

      for (let index = shuffledAugments.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledAugments[index], shuffledAugments[randomIndex]] = [shuffledAugments[randomIndex], shuffledAugments[index]];
      }

      const selectedAugments = shuffledAugments.slice(0, count);
      return selectedAugments;
    }

    function hasPlayerByDisplayName(players, displayName) {
      return players.some((player) => getDisplayName(player.name) === displayName);
    }

    function pickEligibleHeroAugment(teamPlayers, ownedAugmentIds) {
      const eligibleHeroAugments = heroAugmentPool.filter((augment) => {
        return !ownedAugmentIds.has(augment.id) && hasPlayerByDisplayName(teamPlayers, augment.requiredPlayer);
      });

      if (!eligibleHeroAugments.length) {
        return null;
      }

      return {
        ...shuffleArray(eligibleHeroAugments)[0],
        isHero: true
      };
    }

    function selectAugment(augmentId) {
      const team = getTeam(pendingAugmentTeamId);
      const augment = pendingAugmentOptions.find((option) => option.id === augmentId);

      if (!team || !augment) {
        return;
      }

      const applied = applyAugmentEffect(team, augment);

      if (!applied) {
        return;
      }

      team.augments.push({ ...augment });
      closeAugmentModal();
      render();
    }

    function closeAugmentModal() {
      augmentModal.classList.remove("open");
      pendingAugmentTeamId = null;
      pendingAugmentOptions = [];
      augmentOptions.innerHTML = "";
      augmentSituation.classList.remove("open");
      augmentSituationButton.textContent = "현재 상황 보기";
    }

    function applyAugmentEffect(team, augment) {
      switch (augment.effect) {
        case "team-reroll-and-point-chaos":
          const previousRemainPoints = getRemainPoints(team.id);
          rerollTeamMembers(team);
          team.points = getUsedPoints(team.id) + getRandomInt(0, Math.max(0, previousRemainPoints) + 15);
          return true;
        case "next-auction-infinite-points":
          state.effects.nightGuyTeamId = team.id;
          return true;
        case "all-team-reroll-point-transfer":
          rerollAllTeamsByCurrentCounts();
          team.points = getUsedPoints(team.id);
          state.teams.forEach((otherTeam) => {
            if (otherTeam.id !== team.id) {
              otherTeam.points += 40;
            }
          });
          return true;
        case "release-one-member":
          return startReleaseTeamMember(team, augment);
        case "no-ban-match":
          state.effects.noBanActive = true;
          team.points += 10;
          return true;
        case "sleep-team-next-auction":
          return startSleepTargetTeam(team, augment);
        case "dice-point-gain":
          return rollDiceForTeam(team, augment);
        case "minimum-bid-20":
          state.effects.minimumBidOverride = 20;
          state.players.forEach((player) => {
            if (getBasePoint(player.name) < 20) {
              player.score = Math.max(player.score, 20);
            }
          });
          updateAuctionBidMin();
          return true;
        case "random-free-player-for-extra-cost":
          return rouletteFreePlayer(team);
        case "hero-random-point-down":
          reduceOtherTeamPoints(team);
          return true;
        case "hero-ban-ban-10-point":
          team.points += 10;
          return true;
        case "hero-top-ban-card":
          return true;
        case "contract-break":
          return startContractBreak(team, augment);
        case "bounty-score-change":
          return startBountyScoreChange(team, augment);
        case "loan-next-double":
          applyLoan(team);
          return true;
        case "tax-bomb":
          applyTaxBomb(team);
          return true;
        case "hold-final-bid-reward":
          return reserveHoldReward(team);
        case "force-target-team-buy":
          return reserveForceBuy(team);
        case "buy-next-player-same-price":
          return reserveSweep(team);
        case "delay-highest-bid-player-refund":
          return delayHighestBidPlayerAndRefund(team);
        case "move-current-auction-player-last":
          return moveCurrentAuctionPlayerLast();
        default:
          return true;
      }
    }

    function getCurrentAuctionPlayer() {
      return getPlayer(auctionPlayerSelect.value);
    }

    function reserveHoldReward(team) {
      const player = getCurrentAuctionPlayer();

      if (!player) {
        showAugmentNotice("현재 경매 매물을 찾을 수 없습니다.");
        return false;
      }

      state.effects.holdRewardReservations = [
        ...(state.effects.holdRewardReservations || []).filter((reservation) => reservation.teamId !== team.id || reservation.playerId !== player.id),
        { teamId: team.id, playerId: player.id }
      ];
      state.auctionBids = state.auctionBids.filter((bid) => bid.playerId !== player.id || bid.teamId !== team.id);
      return true;
    }

    function reserveForceBuy(team) {
      const player = getCurrentAuctionPlayer();
      const targetTeam = promptTargetTeam(team.id, "입찰시킬 팀 번호를 입력하세요.");

      if (!player || !targetTeam) {
        showAugmentNotice("대상 팀을 선택하지 않아 증강을 취소했습니다.");
        return false;
      }

      state.effects.forceBuyReservations = [
        ...(state.effects.forceBuyReservations || []).filter((reservation) => reservation.sourceTeamId !== team.id || reservation.playerId !== player.id),
        { sourceTeamId: team.id, targetTeamId: targetTeam.id, playerId: player.id }
      ];
      return true;
    }

    function reserveSweep(team) {
      const player = getCurrentAuctionPlayer();

      if (!player) {
        showAugmentNotice("현재 경매 매물을 찾을 수 없습니다.");
        return false;
      }

      state.effects.sweepReservations = [
        ...(state.effects.sweepReservations || []).filter((reservation) => reservation.teamId !== team.id || reservation.playerId !== player.id),
        { teamId: team.id, playerId: player.id }
      ];
      return true;
    }

    function promptTargetTeam(sourceTeamId, message) {
      const options = state.teams
        .filter((team) => team.id !== sourceTeamId)
        .map((team, index) => `${index + 1}. ${getDisplayName(team.name)} (${formatPoint(getRemainPoints(team.id))})`);
      const inputValue = prompt(`${message}\n${options.join("\n")}`);

      if (inputValue === null || inputValue.trim() === "") {
        return null;
      }

      const selectedIndex = Number(inputValue) - 1;

      if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= options.length) {
        return null;
      }

      return state.teams.filter((team) => team.id !== sourceTeamId)[selectedIndex];
    }

    function applyLoan(team) {
      team.points += 60;

      if (!state.effects.loanTeamIds.includes(team.id)) {
        state.effects.loanTeamIds.push(team.id);
      }
    }

    function applyTaxBomb(sourceTeam) {
      const targetTeams = state.teams.filter((team) => team.id !== sourceTeam.id);
      const targetTeam = targetTeams.reduce((highestTeam, team) => {
        if (!highestTeam || getRemainPoints(team.id) > getRemainPoints(highestTeam.id)) {
          return team;
        }

        return highestTeam;
      }, null);

      if (targetTeam) {
        targetTeam.points = Math.max(getUsedPoints(targetTeam.id), targetTeam.points - 20);
      }
    }

    function moveCurrentAuctionPlayerLast() {
      const playerId = auctionPlayerSelect.value;
      const playerIndex = state.players.findIndex((player) => player.id === playerId);

      if (playerIndex < 0) {
        showAugmentNotice("현재 경매 매물을 찾을 수 없습니다.");
        return false;
      }

      const [player] = state.players.splice(playerIndex, 1);
      state.players.push(player);
      const nextPlayer = state.players.find((candidate) => candidate.teamId === null);
      auctionPlayerSelect.value = nextPlayer?.id || "";
      return true;
    }

    function delayHighestBidPlayerAndRefund(sourceTeam) {
      const highestBid = getHighestAuctionBid(sourceTeam.id);

      if (!highestBid) {
        showAugmentNotice("현재 최고 입찰가가 없습니다.");
        return false;
      }

      const player = getPlayer(highestBid.playerId);
      const bidTeam = getTeam(highestBid.teamId);

      if (!player || !bidTeam) {
        showAugmentNotice("현재 최고 입찰 정보를 찾을 수 없습니다.");
        return false;
      }

      if (bidTeam) {
        bidTeam.points += highestBid.value + 10;
      }

      player.teamId = null;
      player.score = getBasePoint(player.name);
      player.auctionLabel = "";
      state.auctionBids = state.auctionBids.filter((bid) => bid.playerId !== player.id);
      movePlayerToNextAuctionSlot(player.id);
      showAuctionMessage(`${getDisplayName(player.name)} 매물을 다음 경매순서로 미뤘습니다.`, "success");
      return true;
    }

    function getHighestAuctionBid(excludeTeamId = null) {
      return state.auctionBids
        .filter((bid) => bid.teamId !== excludeTeamId && getPlayer(bid.playerId) && getTeam(bid.teamId))
        .reduce((highest, bid) => (!highest || bid.value > highest.value ? bid : highest), null);
    }

    function movePlayerToNextAuctionSlot(playerId) {
      const playerIndex = state.players.findIndex((player) => player.id === playerId);

      if (playerIndex < 0) {
        return;
      }

      const [player] = state.players.splice(playerIndex, 1);
      const insertIndex = Math.min(playerIndex + 1, state.players.length);
      state.players.splice(insertIndex, 0, player);
      auctionPlayerSelect.value = state.players.find((candidate) => candidate.teamId === null)?.id || "";
    }

    function reduceOtherTeamPoints(sourceTeam) {
      state.teams.forEach((team) => {
        if (team.id !== sourceTeam.id) {
          team.points = Math.max(getUsedPoints(team.id), team.points - getRandomInt(10, 30));
        }
      });
    }

    function rerollTeamMembers(team) {
      const currentMembers = shuffleArray(getTeamPlayers(team.id));
      const candidates = shuffleArray(state.players.filter((player) => player.teamId === null));
      const swapCount = Math.min(currentMembers.length, candidates.length);
      const outgoingMembers = currentMembers.slice(0, swapCount);
      const nextMembers = candidates.slice(0, swapCount);

      outgoingMembers.forEach((player) => {
        player.teamId = null;
      });

      nextMembers.forEach((player) => {
        player.teamId = team.id;
      });
    }

    function rerollAllTeamsByCurrentCounts() {
      const teamCounts = state.teams.map((team) => ({
        teamId: team.id,
        count: getTeamPlayers(team.id).length
      }));
      const assignedPlayers = shuffleArray(state.players);
      let cursor = 0;

      state.players.forEach((player) => {
        player.teamId = null;
      });

      teamCounts.forEach(({ teamId, count }) => {
        assignedPlayers.slice(cursor, cursor + count).forEach((player) => {
          player.teamId = teamId;
        });
        cursor += count;
      });
    }

    function startReleaseTeamMember(team, augment) {
      const members = getTeamPlayers(team.id);

      if (!members.length) {
        showAugmentNotice("방출할 팀원이 없습니다.");
        return false;
      }

      pendingTargetAction = {
        type: "release-member",
        sourceTeamId: team.id,
        augment: augment ? { ...augment } : null
      };
      closeAugmentModal();
      render();
      return false;
    }

    function startContractBreak(team, augment) {
      const members = getTeamPlayers(team.id);

      if (!members.length) {
        showAugmentNotice("계약 파기할 팀원이 없습니다.");
        return false;
      }

      pendingTargetAction = {
        type: "contract-break",
        sourceTeamId: team.id,
        augment: augment ? { ...augment } : null
      };
      closeAugmentModal();
      render();
      return false;
    }

    function finishContractBreak(playerId) {
      const sourceTeam = getTeam(pendingTargetAction?.sourceTeamId);
      const player = getPlayer(playerId);

      if (!sourceTeam || !player || player.teamId !== sourceTeam.id) {
        showAugmentNotice("계약 파기할 팀원을 선택해주세요.");
        pendingTargetAction = null;
        render();
        return;
      }

      const refund = Math.floor(player.score * 0.7);
      sourceTeam.points += refund;
      player.teamId = null;
      player.auctionLabel = "";

      if (pendingTargetAction?.augment) {
        sourceTeam.augments.push({ ...pendingTargetAction.augment });
      }

      pendingTargetAction = null;
      render();
    }

    function startBountyScoreChange(team, augment) {
      const freePlayers = state.players.filter((player) => player.teamId === null);

      if (!freePlayers.length) {
        showAugmentNotice("점수를 바꿀 매물이 없습니다.");
        return false;
      }

      pendingTargetAction = {
        type: "bounty-score",
        sourceTeamId: team.id,
        augment: augment ? { ...augment } : null
      };
      closeAugmentModal();
      render();
      return false;
    }

    function finishBountyScoreChange(playerId) {
      const sourceTeam = getTeam(pendingTargetAction?.sourceTeamId);
      const player = getPlayer(playerId);

      if (!sourceTeam || !player || player.teamId !== null) {
        showAugmentNotice("선수 목록에 있는 매물을 선택해주세요.");
        pendingTargetAction = null;
        render();
        return;
      }

      const minScore = Math.min(getMinBid(player.name), 50);
      const inputValue = prompt(`${getDisplayName(player.name)} 점수를 입력하세요. (${minScore}~50P)`);
      const nextScore = Number(inputValue);

      if (!Number.isInteger(nextScore) || nextScore < minScore || nextScore > 50) {
        showAugmentNotice(`${minScore}~50P 사이의 정수를 입력해주세요.`);
        return;
      }

      player.score = nextScore;

      if (pendingTargetAction?.augment) {
        sourceTeam.augments.push({ ...pendingTargetAction.augment });
      }

      pendingTargetAction = null;
      render();
    }

    function finishReleaseTeamMember(playerId) {
      const sourceTeam = getTeam(pendingTargetAction?.sourceTeamId);
      const player = getPlayer(playerId);

      if (!sourceTeam || !player || player.teamId !== sourceTeam.id) {
        showAugmentNotice("방출할 팀원을 선택해주세요.");
        pendingTargetAction = null;
        render();
        return;
      }

      const targetTeams = state.teams.filter((targetTeam) => targetTeam.id !== sourceTeam.id);
      const targetTeam = shuffleArray(targetTeams)[0];
      player.score = Math.max(1, Math.floor(player.score * 0.8));
      player.teamId = targetTeam ? targetTeam.id : null;
      player.auctionLabel = "";

      if (pendingTargetAction?.augment) {
        sourceTeam.augments.push({ ...pendingTargetAction.augment });
      }

      pendingTargetAction = null;
      render();
    }

    function sleepTargetTeam() {
      return startSleepTargetTeam(null, null);
    }

    function startSleepTargetTeam(sourceTeam, augment) {
      pendingTargetAction = {
        type: "sleep-team",
        sourceTeamId: sourceTeam?.id || null,
        augment: augment ? { ...augment } : null
      };
      closeAugmentModal();
      render();
      return false;
    }

    function finishSleepTargetTeam(teamId) {
      const targetTeam = getTeam(teamId);

      if (!targetTeam) {
        showAugmentNotice("해당 팀을 찾지 못했습니다.");
        pendingTargetAction = null;
        render();
        return;
      }

      targetTeam.sleepAuctionCount = 1;

      if (pendingTargetAction?.augment && pendingTargetAction.sourceTeamId) {
        const sourceTeam = getTeam(pendingTargetAction.sourceTeamId);
        if (sourceTeam) {
          sourceTeam.augments.push({ ...pendingTargetAction.augment });
        }
      }

      pendingTargetAction = null;
      render();
    }

    function rollDiceForTeam(team, augment) {
      const dice = getRandomInt(1, 6);
      const pointGain = (dice - 1) * 10;
      closeAugmentModal();
      showDiceRollAnimation(dice, pointGain, () => {
        team.points += pointGain;
        team.augments.push({ ...augment });
        render();
      });
      return false;
    }

    function showDiceRollAnimation(finalDice, pointGain, onComplete) {
      let ticks = 0;
      const maxTicks = 22;
      diceOverlay.classList.add("open", "rolling");
      diceFace.dataset.value = "1";
      diceResult.textContent = "주사위 굴리는 중";

      const intervalId = window.setInterval(() => {
        ticks += 1;
        diceFace.dataset.value = getRandomInt(1, 6);

        if (ticks >= maxTicks) {
          window.clearInterval(intervalId);
          diceFace.dataset.value = finalDice;
          diceResult.textContent = `${pointGain}P 획득`;
          diceOverlay.classList.remove("rolling");

          window.setTimeout(() => {
            diceOverlay.classList.remove("open");
            onComplete();
          }, 1100);
        }
      }, 85);
    }

    function rouletteFreePlayer(team) {
      if (getRemainPoints(team.id) < 20) {
        showAugmentNotice("룰렛 추가 비용 20P가 부족합니다.");
        return false;
      }

      const freePlayers = state.players.filter((player) => player.teamId === null);

      if (!freePlayers.length) {
        showAugmentNotice("선수 목록에 남은 매물이 없습니다.");
        return false;
      }

      const shuffledPlayers = shuffleArray(freePlayers);
      const player = shuffledPlayers[0];
      team.augmentSpend += 20;
      animateRouletteResult(team.id, shuffledPlayers.map((p) => p.id), player.id);
      return true;
    }

    function animateRouletteResult(teamId, playerIdList, finalPlayerId) {
      rouletteActive = true;
      playersList.scrollIntoView({ behavior: "smooth", block: "center" });

      let elapsed = 0;
      const highlightSeq = [];
      const fastSteps = 22;
      const slowSteps = 10;

      for (let index = 0; index < fastSteps; index += 1) {
        highlightSeq.push({
          id: playerIdList[Math.floor(Math.random() * playerIdList.length)],
          delay: 70
        });
      }

      for (let index = 0; index < slowSteps; index += 1) {
        highlightSeq.push({
          id: playerIdList[Math.floor(Math.random() * playerIdList.length)],
          delay: 110 + index * 42
        });
      }

      highlightSeq.push({ id: finalPlayerId, delay: 560 });

      highlightSeq.forEach((cur) => {
        elapsed += cur.delay;
        window.setTimeout(() => {
          rouletteHighlightPlayerId = cur.id;
          render();
        }, elapsed);
      });

      window.setTimeout(() => {
        const player = getPlayer(finalPlayerId);

        if (!player) {
          rouletteHighlightPlayerId = null;
          rouletteActive = false;
          render();
          return;
        }

        player.teamId = teamId;
        player.score = 0; // 룰렛으로 먹은 선수는 0P로 조정
        player.auctionLabel = "";
        rouletteHighlightPlayerId = player.id;
        render();

        window.setTimeout(() => {
          rouletteHighlightPlayerId = null;
          rouletteActive = false;
          render();
        }, 1400);
      }, elapsed + 220);
    }

    function showAugmentNotice(message) {
      auctionMessage.className = "auction-message error";
      auctionMessage.textContent = message;
    }

    function shuffleArray(items) {
      const shuffledItems = [...items];

      for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
      }

      return shuffledItems;
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function createPlayerCardMarkup(player) {
      const isAssigned = Boolean(player.teamId);
      const tierClass = getTierClass(player.tier);
      const isRouletteHit = rouletteHighlightPlayerId === player.id;
      const isReleaseSelectable = pendingTargetAction?.type === "release-member" && pendingTargetAction.sourceTeamId === player.teamId;
      const isContractSelectable = pendingTargetAction?.type === "contract-break" && pendingTargetAction.sourceTeamId === player.teamId;
      const isBountySelectable = pendingTargetAction?.type === "bounty-score" && player.teamId === null;
      const canZeroRelease = canReleasePlayerForZero(player);
      const hoverMessage = getChampionLabel(player);
      const auctionLabel = player.teamId && player.auctionLabel ? player.auctionLabel : "";
      return `
        <article class="player-card ${isAssigned ? "assigned" : ""} ${player.isApostle ? "apostle-card" : ""} ${isRouletteHit ? "roulette-hit" : ""} ${isReleaseSelectable ? "release-selectable" : ""} ${isContractSelectable ? "contract-selectable" : ""} ${isBountySelectable ? "bounty-selectable" : ""}" draggable="true" role="button" tabindex="0" data-player-id="${player.id}">
          ${hoverMessage ? `<div class="player-hover-message">${hoverMessage}</div>` : ""}
          ${auctionLabel ? `<span class="auction-label-badge">${auctionLabel}</span>` : ""}
          <div class="player-card-top">
            <div class="player-title">
              <div class="player-name ${tierClass}">${getDisplayName(player.name)}</div>
              <span class="player-line-text">${getLineLabel(player)}</span>
            </div>
            ${canZeroRelease ? `<button class="zero-release-button" type="button" data-zero-release="${player.id}">0P 방출</button>` : ""}
          </div>
          <div class="player-meta">
            <span class="score-badge">${player.score}P</span>
            <span class="status-badge ${isAssigned ? "selected" : ""}">${isAssigned ? "선택됨" : "미선택"}</span>
          </div>
        </article>
      `;
    }

    function attachPlayerEvents() {
      document.querySelectorAll(".player-card").forEach((card) => {
        card.addEventListener("dragstart", handleDragStart);
        card.addEventListener("dragend", handleDragEnd);
      });
    }

    function attachDropZoneEvents() {
      document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
        if (zone.dataset.dropBound === "true") {
          return;
        }

        zone.dataset.dropBound = "true";
        zone.addEventListener("dragover", handleDragOver);
        zone.addEventListener("dragleave", handleDragLeave);
        zone.addEventListener("drop", handleDrop);
      });
    }

    function handleDragStart(event) {
      draggedPlayerId = event.currentTarget.dataset.playerId;
      event.currentTarget.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedPlayerId);
    }

    function handleDragEnd(event) {
      draggedPlayerId = null;
      event.currentTarget.classList.remove("dragging");
      document.querySelectorAll(".drag-over").forEach((element) => element.classList.remove("drag-over"));
    }

    function handleDragOver(event) {
      event.preventDefault();
      const highlightTarget = getHighlightTarget(event.currentTarget);
      highlightTarget.classList.add("drag-over");
    }

    function handleDragLeave(event) {
      if (event.currentTarget.contains(event.relatedTarget)) {
        return;
      }

      const highlightTarget = getHighlightTarget(event.currentTarget);
      highlightTarget.classList.remove("drag-over");
    }

    function handleDrop(event) {
      event.preventDefault();
      const playerId = event.dataTransfer.getData("text/plain") || draggedPlayerId;
      const player = getPlayer(playerId);

      if (!player) {
        return;
      }

      const zone = event.currentTarget;
      const teamId = zone.dataset.dropZone === "team" ? zone.dataset.teamId : null;

      if (teamId && teamId !== player.teamId && player.score > getRemainPoints(teamId)) {
        alert("포인트가 없습니다.");
        document.querySelectorAll(".drag-over").forEach((element) => element.classList.remove("drag-over"));
        return;
      }

      if (teamId !== player.teamId) {
        spendLeavingPlayerCost(player);
        player.auctionLabel = "";
      }

      player.teamId = teamId;
      document.querySelectorAll(".drag-over").forEach((element) => element.classList.remove("drag-over"));
      render();
    }

    function getHighlightTarget(zone) {
      return zone.dataset.dropZone === "team" ? zone.closest(".team-card") : zone;
    }

    function handlePlayerCardClick(event) {
      const zeroReleaseButton = event.target.closest("[data-zero-release]");

      if (zeroReleaseButton) {
        event.preventDefault();
        event.stopPropagation();
        releasePlayerForZero(zeroReleaseButton.dataset.zeroRelease);
        return;
      }

      const playerCard = event.target.closest(".player-card");

      if (!playerCard || playerCard.classList.contains("dragging")) {
        return;
      }

      event.preventDefault();

      if (pendingTargetAction?.type === "release-member") {
        finishReleaseTeamMember(playerCard.dataset.playerId);
        return;
      }

      if (pendingTargetAction?.type === "contract-break") {
        finishContractBreak(playerCard.dataset.playerId);
        return;
      }

      if (pendingTargetAction?.type === "bounty-score") {
        finishBountyScoreChange(playerCard.dataset.playerId);
        return;
      }

      openScoreModal(playerCard.dataset.playerId);
    }

    function handlePlayerCardKeydown(event) {
      const playerCard = event.target.closest(".player-card");

      if (!playerCard || (event.key !== "Enter" && event.key !== " ")) {
        return;
      }

      event.preventDefault();

      if (pendingTargetAction?.type === "release-member") {
        finishReleaseTeamMember(playerCard.dataset.playerId);
        return;
      }

      if (pendingTargetAction?.type === "contract-break") {
        finishContractBreak(playerCard.dataset.playerId);
        return;
      }

      if (pendingTargetAction?.type === "bounty-score") {
        finishBountyScoreChange(playerCard.dataset.playerId);
        return;
      }

      openScoreModal(playerCard.dataset.playerId);
    }

    function openScoreModal(playerId) {
      const player = getPlayer(playerId);
      editingTeamId = null;
      editingPlayerId = playerId;
      modalError.textContent = "";
      scoreInput.value = player.score;
      scoreInput.min = getMinBid(player.name);
      modalTitle.textContent = `${getDisplayName(player.name)} 점수 입력`;

      if (player.teamId) {
        const team = getTeam(player.teamId);
        const remainExceptCurrent = getRemainPoints(team.id) + player.score;
        modalDescription.textContent = `${getDisplayName(team.name)} 팀에서 사용할 점수를 입력하세요. 입력 가능 포인트: ${formatPoint(remainExceptCurrent)}`;
      } else {
        modalDescription.textContent = "아직 팀에 배정되지 않은 선수입니다. 기본 포인트는 1P이며, 팀 배정 전에도 점수를 바꿀 수 있습니다.";
      }

      scoreModal.classList.add("open");
      scoreInput.focus();
      scoreInput.select();
    }

    function openTeamPointsModal(teamId) {
      const team = getTeam(teamId);

      if (!team) {
        return;
      }

      editingPlayerId = null;
      editingTeamId = teamId;
      modalError.textContent = "";
      scoreInput.value = team.points;
      scoreInput.min = "0";
      modalTitle.textContent = `${getDisplayName(team.name)} 포인트 수정`;
      modalDescription.textContent = `팀 총 포인트를 원하는 값으로 입력하세요. 현재 사용 포인트: ${formatPoint(getUsedPoints(team.id))}`;
      scoreModal.classList.add("open");
      scoreInput.focus();
      scoreInput.select();
    }

    function closeScoreModal() {
      scoreModal.classList.remove("open");
      editingPlayerId = null;
      editingTeamId = null;
    }

    function savePlayerScore() {
      if (editingTeamId) {
        saveTeamPoints();
        return;
      }

      const player = getPlayer(editingPlayerId);
      const nextScore = Number(scoreInput.value);

      if (!player) {
        return;
      }

      const validationMessage = validateScore(player, nextScore);

      if (validationMessage) {
        modalError.textContent = validationMessage;
        return;
      }

      player.score = nextScore;
      closeScoreModal();
      render();
    }

    function saveTeamPoints() {
      const team = getTeam(editingTeamId);
      const nextPoints = Number(scoreInput.value);

      if (!team) {
        return;
      }

      if (!Number.isInteger(nextPoints) || nextPoints < 0) {
        modalError.textContent = "팀 포인트는 0 이상의 정수로 입력해주세요.";
        return;
      }

      team.points = nextPoints;
      closeScoreModal();
      render();
    }

    function validateScore(player, nextScore) {
      const minBid = getMinBid(player.name);

      if (!Number.isInteger(nextScore)) {
        return "점수는 1 단위의 정수로 입력해주세요.";
      }

      if (nextScore < 0) {
        return "음수 점수는 입력할 수 없습니다.";
      }

      if (nextScore < minBid) {
        return `최소 베팅은 ${minBid}입니다.`;
      }

      if (player.teamId) {
        const remainExceptCurrent = getRemainPoints(player.teamId) + player.score;

        if (nextScore > remainExceptCurrent) {
          return "포인트가 없습니다.";
        }
      }

      return "";
    }

    function applyAuctionBid() {
      const player = getPlayer(auctionPlayerSelect.value);
      const team = getTeam(auctionTeamSelect.value);
      const bidValue = Number(auctionBidInput.value);

      auctionMessage.className = "auction-message";

      if (!player || !team) {
        showAuctionMessage("선수와 부른 사람을 선택해주세요.", "error");
        return;
      }

      if (team.sleepAuctionCount > 0) {
        showAuctionMessage("현재 수면상태입니다.", "error");
        return;
      }

      const validationMessage = validateAuctionBid(team.id, bidValue);

      if (validationMessage) {
        showAuctionMessage(validationMessage, "error");
        return;
      }

      const existingBid = state.auctionBids.find((bid) => bid.playerId === player.id && bid.teamId === team.id);

      if (existingBid) {
        existingBid.value = bidValue;
        state.auctionBids = [
          existingBid,
          ...state.auctionBids.filter((bid) => bid !== existingBid)
        ];
      } else {
        state.auctionBids.unshift({
          playerId: player.id,
          teamId: team.id,
          value: bidValue
        });
      }

      showAuctionMessage(`${getDisplayName(player.name)} ${bidValue}P 경매값을 기록했습니다.`, "success");
      render();
    }

    function awardHighestBid() {
      const player = getPlayer(auctionPlayerSelect.value);

      if (!player) {
        showAuctionMessage("낙찰할 선수를 선택해주세요.", "error");
        return;
      }

      const bidsForPlayer = state.auctionBids.filter((bid) => {
        const bidTeam = getTeam(bid.teamId);
        return bid.playerId === player.id && bidTeam && bidTeam.sleepAuctionCount <= 0;
      });

      if (!bidsForPlayer.length) {
        showAuctionMessage("이 선수에게 낙찰 가능한 경매값이 없습니다.", "error");
        return;
      }

      const highestBid = bidsForPlayer.reduce((highest, bid) => {
        if (bid.value > highest.value) {
          return bid;
        }

        return highest;
      });
      const team = getTeam(highestBid.teamId);

      if (!team) {
        showAuctionMessage("낙찰할 팀 정보를 찾을 수 없습니다.", "error");
        return;
      }

      const finalBidCost = getBidCostForTeam(team.id, highestBid.value);
      const minBidForPlayer = getActiveMinBid(getMinBid(player.name));

      if (finalBidCost > getAvailablePointsForPlayerTeam(player, team.id)) {
        showAuctionMessage("포인트가 없습니다.", "error");
        return;
      }

      const forceBuyReservation = (state.effects.forceBuyReservations || [])
        .find((reservation) => reservation.sourceTeamId === team.id && reservation.playerId === player.id);
      let ownerTeam = team;
      let ownerScore = finalBidCost;
      let extraMessage = "";

      if (forceBuyReservation) {
        const targetTeam = getTeam(forceBuyReservation.targetTeamId);
        const targetBidValue = Math.max(minBidForPlayer, Math.ceil(highestBid.value * 0.9));

        if (targetTeam && targetBidValue <= getAvailablePointsForPlayerTeam(player, targetTeam.id)) {
          ownerTeam = targetTeam;
          ownerScore = targetBidValue;
          extraMessage = ` 님이 사셈 효과로 ${getDisplayName(targetTeam.name)} 팀이 ${targetBidValue}P에 가져갑니다.`;
        }
      }

      player.teamId = ownerTeam.id;
      player.score = ownerScore;
      player.auctionLabel = highestBid.value === minBidForPlayer ? "유찰" : "";
      state.auctionBids = state.auctionBids.filter((bid) => bid.playerId !== player.id);
      state.effects.loanTeamIds = (state.effects.loanTeamIds || []).filter((teamId) => teamId !== team.id && teamId !== ownerTeam.id);
      applyAuctionReservationEffects(player, team, highestBid.value, finalBidCost);
      applyPostAuctionEffects();
      showAuctionMessage(`${getDisplayName(player.name)} ${ownerScore}P, ${getDisplayName(ownerTeam.name)} 팀에 낙찰되었습니다.${extraMessage}`, "success");
      render();
    }

    function validateAuctionBid(teamId, bidValue) {
      const player = getPlayer(auctionPlayerSelect.value);
      const minBid = getActiveMinBid(player ? getMinBid(player.name) : MIN_BID_NORMAL);
      const bidCost = getBidCostForTeam(teamId, bidValue);

      if ((state.effects.holdRewardReservations || []).some((reservation) => reservation.teamId === teamId && reservation.playerId === player?.id)) {
        return "존버는 승리한다 효과로 이 매물 입찰을 포기한 상태입니다.";
      }

      if (!Number.isInteger(bidValue)) {
        return "경매값은 1 단위의 정수로 입력해주세요.";
      }

      if (bidValue < minBid) {
        return `최소 베팅은 ${minBid}입니다.`;
      }

      if (player && bidCost > getAvailablePointsForPlayerTeam(player, teamId)) {
        return "포인트가 없습니다.";
      }

      return "";
    }

    function getAvailablePointsForPlayerTeam(player, teamId) {
      if (state.effects?.nightGuyTeamId === teamId) {
        return Infinity;
      }

      const currentScore = player.teamId === teamId ? player.score : 0;
      return getRemainPoints(teamId) + currentScore;
    }

    function getBidCostForTeam(teamId, bidValue) {
      return state.effects?.loanTeamIds?.includes(teamId) ? bidValue * 2 : bidValue;
    }

    function applyAuctionReservationEffects(player, winningTeam, winningBidValue, finalBidCost) {
      applyHoldRewardReservations(player, winningTeam.id, winningBidValue);
      applySweepReservations(player, winningTeam, finalBidCost);
      clearResolvedAuctionReservations(player.id);
    }

    function applyHoldRewardReservations(player, winningTeamId, winningBidValue) {
      (state.effects.holdRewardReservations || [])
        .filter((reservation) => reservation.playerId === player.id && reservation.teamId !== winningTeamId)
        .forEach((reservation) => {
          const team = getTeam(reservation.teamId);
          if (team) {
            team.points += Math.min(50, Math.floor(winningBidValue * 0.5));
          }
        });
    }

    function applySweepReservations(player, winningTeam, finalBidCost) {
      const hasSweep = (state.effects.sweepReservations || [])
        .some((reservation) => reservation.playerId === player.id && reservation.teamId === winningTeam.id);

      if (!hasSweep) {
        return;
      }

      const nextPlayer = getNextFreePlayerAfter(player.id);

      if (!nextPlayer || finalBidCost > getRemainPoints(winningTeam.id)) {
        return;
      }

      nextPlayer.teamId = winningTeam.id;
      nextPlayer.score = finalBidCost;
      nextPlayer.auctionLabel = "";
      state.auctionBids = state.auctionBids.filter((bid) => bid.playerId !== nextPlayer.id);
    }

    function clearResolvedAuctionReservations(playerId) {
      state.effects.holdRewardReservations = (state.effects.holdRewardReservations || [])
        .filter((reservation) => reservation.playerId !== playerId);
      state.effects.forceBuyReservations = (state.effects.forceBuyReservations || [])
        .filter((reservation) => reservation.playerId !== playerId);
      state.effects.sweepReservations = (state.effects.sweepReservations || [])
        .filter((reservation) => reservation.playerId !== playerId);
    }

    function getNextFreePlayerAfter(playerId) {
      const startIndex = state.players.findIndex((player) => player.id === playerId);

      if (startIndex < 0) {
        return null;
      }

      for (let offset = 1; offset < state.players.length; offset += 1) {
        const player = state.players[(startIndex + offset) % state.players.length];
        if (player.teamId === null) {
          return player;
        }
      }

      return null;
    }

    function applyPostAuctionEffects() {
      if (state.effects?.nightGuyTeamId) {
        const nightGuyTeam = getTeam(state.effects.nightGuyTeamId);

        if (nightGuyTeam) {
          nightGuyTeam.points = getUsedPoints(nightGuyTeam.id);
        }

        state.effects.nightGuyTeamId = null;
      }

      state.teams.forEach((team) => {
        if (team.sleepAuctionCount > 0) {
          team.sleepAuctionCount -= 1;
        }
      });
    }

    function showAuctionMessage(message, type) {
      auctionMessage.textContent = message;
      auctionMessage.classList.toggle("error", type === "error");
      auctionMessage.classList.toggle("success", type === "success");
    }

    function shuffleReroundPlayers() {
      const freePlayers = state.players.filter((player) => player.teamId === null);

      if (!freePlayers.length) {
        showAuctionMessage("섞을 유찰/방출 매물이 없습니다.", "error");
        return;
      }

      const shuffledFreePlayers = shuffleArray(freePlayers);
      let freeCursor = 0;

      state.players = state.players.map((player) => {
        if (player.teamId !== null) {
          return player;
        }

        const nextPlayer = shuffledFreePlayers[freeCursor];
        freeCursor += 1;
        nextPlayer.score = 1;
        return nextPlayer;
      });

      state.effects.reroundBaseOne = true;
      state.auctionBids = state.auctionBids.filter((bid) => getPlayer(bid.playerId)?.teamId !== null);
      auctionPlayerSelect.value = state.players.find((player) => player.teamId === null)?.id || "";
      auctionBidInput.value = 1;
      showAuctionMessage("유찰/방출 매물을 랜덤으로 섞고 남은 매물 기본가를 1P로 통일했습니다.", "success");
      render();
    }

    function toggleCataclysmAugments() {
      if (!isAugmentMode()) {
        return;
      }

      state.effects.cataclysmAugmentsEnabled = state.effects.cataclysmAugmentsEnabled === false;
      render();
    }

    function resetAll() {
      document.getElementById("resetConfirmModal").classList.add("open");
    }

    function confirmReset() {
      document.getElementById("resetConfirmModal").classList.remove("open");
      state = createInitialState();
      localStorage.removeItem(getStorageKey());
      render();
    }

    function cancelReset() {
      document.getElementById("resetConfirmModal").classList.remove("open");
    }

    function openRuleModal() {
      ruleModal.classList.add("open");
    }

    function closeRuleModal() {
      ruleModal.classList.remove("open");
    }

    function clearAuctionBids() {
      state.auctionBids = [];
      showAuctionMessage("입력된 경매값을 모두 취소했습니다.", "success");
      render();
    }

    modeScreen.addEventListener("click", (event) => {
      const modeButton = event.target.closest("[data-mode]");

      if (modeButton) {
        selectMode(modeButton.dataset.mode);
      }
    });

    backButton.addEventListener("click", goBackToModeSelect);
    ruleButton.addEventListener("click", openRuleModal);
    closeRuleButton.addEventListener("click", closeRuleModal);
    ruleModal.addEventListener("click", (event) => {
      if (event.target === ruleModal) closeRuleModal();
    });
    auctionPlayerSelect.addEventListener("change", updateAuctionBidMin);
    auctionPlayerButtons.addEventListener("click", handleAuctionPlayerButtonClick);
    auctionTeamButtons.addEventListener("click", handleAuctionTeamButtonClick);
    auctionTeamButtons.addEventListener("keydown", handleAuctionTeamButtonKeydown);
    auctionBidSlider.addEventListener("input", syncBidInputFromSlider);
    auctionBidInput.addEventListener("input", syncBidSliderFromInput);
    auctionBidInput.addEventListener("blur", clampAuctionBidInput);
    reroundShuffleButton.addEventListener("click", (event) => { event.stopPropagation(); shuffleReroundPlayers(); });
    cataclysmToggleButton.addEventListener("click", (event) => { event.stopPropagation(); toggleCataclysmAugments(); });
    resetButton.addEventListener("click", (event) => { event.stopPropagation(); resetAll(); });
    auctionApplyButton.addEventListener("click", applyAuctionBid);
    awardButton.addEventListener("click", awardHighestBid);
    clearBidsButton.addEventListener("click", clearAuctionBids);
    teamsGrid.addEventListener("click", handleTeamGridClick);
    augmentOptions.addEventListener("click", handleTeamGridClick);
    augmentSituationButton.addEventListener("click", () => {
      renderAugmentSituation();
      augmentSituation.classList.toggle("open");
      augmentSituationButton.textContent = augmentSituation.classList.contains("open") ? "현재 상황 닫기" : "현재 상황 보기";
    });
    document.addEventListener("click", handlePlayerCardClick);
    document.addEventListener("keydown", handlePlayerCardKeydown);
    cancelScoreButton.addEventListener("click", closeScoreModal);
    saveScoreButton.addEventListener("click", savePlayerScore);
    document.getElementById("cancelResetButton").addEventListener("click", cancelReset);
    document.getElementById("confirmResetButton").addEventListener("click", confirmReset);
    document.getElementById("resetConfirmModal").addEventListener("click", (event) => {
      if (event.target === document.getElementById("resetConfirmModal")) cancelReset();
    });

    auctionBidInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        applyAuctionBid();
      }
    });

    scoreInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        savePlayerScore();
      }

      if (event.key === "Escape") {
        closeScoreModal();
      }
    });

    scoreModal.addEventListener("click", (event) => {
      if (event.target === scoreModal) {
        closeScoreModal();
      }
    });

    if (currentMode) {
      state = loadState();
    }

    renderApp();
