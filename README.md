# NAZUN 내전 허브

친구들끼리 쓰는 롤 내전 통합 사이트입니다.

## 포함 기능

- Riot 일반/랭크/칼바람 전적 검색
- 내전 참가자 관리
- 내전 결과 입력 및 랭킹
- 기존 경매 프로그램
- 기존 티어표 프로그램

## 배포 구조

GitHub Pages에는 화면 파일을 올립니다.

- `index.html`
- `styles.css`
- `app.js`
- `auction/`
- `tier/`

Cloudflare Worker에는 `worker.js` 내용을 올립니다.
Riot API 키는 Cloudflare Worker의 Secret에만 저장합니다.

Secret 이름:

```text
RIOT_API_KEY
```

사이트에는 이미 Worker 주소가 기본 연결되어 있습니다.

```text
https://nazun.tprtlwlsvld.workers.dev
```

## 로컬 테스트

```powershell
npm start
```

로컬 서버 주소:

```text
http://localhost:5177
```

## 주의

- `.env` 파일은 GitHub에 올리지 마세요.
- `RGAPI-`로 시작하는 Riot API 키를 `index.html`, `app.js`, README, GitHub 커밋에 넣지 마세요.
- 일반 사용자 설정 게임은 Riot API에서 안정적으로 내려오지 않을 수 있습니다.
