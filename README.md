# 내전 전적 검색

친구들끼리 쓰는 롤 내전 전적 검색 사이트입니다.

## Riot API 키가 뭐냐면

Riot API 키는 Riot Developer Portal에서 Riot API를 호출할 때 쓰는 비밀번호 같은 값입니다.

1. https://developer.riotgames.com 접속
2. Riot 계정으로 로그인
3. 로그인 후 보이는 Development API Key를 복사
4. 이 키는 GitHub에 올리면 안 됩니다.

개발용 키는 테스트/개인 프로젝트용이고 만료될 수 있습니다. 오래 쓰려면 Riot Developer Portal에서 Personal Key 또는 Production Key 신청이 필요할 수 있습니다.

## GitHub Pages로 올릴 때

GitHub Pages는 `index.html`, `styles.css`, `app.js` 같은 정적 파일만 실행합니다.
그래서 `server.js`는 GitHub Pages에서 실행되지 않습니다.

중요:

- Riot API 키를 `app.js`, `index.html`, GitHub README에 넣지 마세요.
- 실제 전적 검색은 `worker.js` 같은 별도 API 서버에 키를 숨겨두고 연결해야 합니다.
- 사이트 화면은 GitHub Pages에서 바로 열립니다.

GitHub에 올릴 파일:

- `index.html`
- `styles.css`
- `app.js`
- `worker.js`
- `README.md`

올리지 말아야 하는 파일:

- `.env`
- Riot API 키가 적힌 모든 파일

## API 서버 연결 방식

### 추천: Cloudflare Worker

1. Cloudflare Workers에서 새 Worker를 만듭니다.
2. `worker.js` 내용을 붙여넣습니다.
3. Worker의 Settings > Variables and Secrets에서 secret을 추가합니다.
   - 이름: `RIOT_API_KEY`
   - 값: Riot Developer Portal에서 복사한 API 키
4. Worker를 배포합니다.
5. 배포 주소 예시: `https://my-lol-api.workers.dev`
6. GitHub Pages 사이트의 `API 서버 주소` 칸에 그 주소를 넣고 저장합니다.

### 로컬 테스트

로컬에서만 테스트할 때는 `.env.example`을 `.env`로 복사하고 `RIOT_API_KEY`를 넣은 뒤 실행합니다.

```powershell
npm start
```

그 다음 `http://localhost:5177`을 엽니다.

## 동작 방식

- 기본 검색 대상은 `장천동부모도둑감성준#6974`입니다.
- Riot API에서 최근 경기 ID를 가져온 뒤, 사용자 설정 5대5만 필터링합니다.
- `mapId`가 `11`이면 협곡, `12`이면 칼바람으로 분류합니다.
- 일반 사용자 설정 게임은 Riot API에서 항상 조회된다고 보장되지 않습니다. 안정적인 내전 자동 기록이 필요하면 Tournament Code 방식으로 내전 방을 만들고 결과를 저장하는 구조가 더 좋습니다.
