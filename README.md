# CoupleRoom

React Native + Expo + TypeScript로 만든 실시간 커플 미니룸 MVP입니다. Supabase Auth, PostgreSQL, Realtime Channel을 사용하며, Supabase 설정이 없을 때는 mock mode로 기본 화면과 흐름을 확인할 수 있습니다.

## 주요 기능

- 이메일 회원가입과 로그인
- 초대 코드 생성 및 코드 입력으로 커플 연결
- 2D 미니룸에서 내 캐릭터 이동
- Supabase Realtime 기반 상대 캐릭터 위치 반영
- 최근 50개 메시지 기반 실시간 채팅
- 가까이 있을 때 안아주기 상호작용과 하트 효과
- 오늘의 질문 카드와 서로 답변 후 공개되는 답변 구조
- PostgreSQL schema와 MVP용 RLS 정책

## 설치

```bash
cd CoupleRoom
npm install
```

## 환경 변수

`.env.example`을 참고해 `.env`를 만드세요.

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_ENABLE_MOCKS=false
```

Supabase 없이 먼저 실행하려면 `EXPO_PUBLIC_ENABLE_MOCKS=true`로 두거나 URL/key를 비워두면 됩니다.

## Supabase 설정

1. Supabase 프로젝트를 생성합니다.
2. `supabase/schema.sql` 내용을 SQL Editor에서 실행합니다.
3. Authentication > Providers에서 Email provider를 켭니다.
4. Database > Replication에서 `room_presence`, `messages`, `interactions`가 realtime publication에 포함됐는지 확인합니다.
5. `.env`에 Supabase URL과 anon key를 입력합니다.

## 실행

```bash
npm run start
```

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

## Vercel 배포

Vercel에서 이 저장소를 가져온 뒤 Root Directory를 `CoupleRoom`으로 설정하세요.

Build Command:

```bash
npx expo export -p web
```

Output Directory:

```bash
dist
```

실제 로그인, 커플 연결, 실시간 채팅을 공유하려면 Vercel 환경 변수에 아래 값을 넣어야 합니다.

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_ENABLE_MOCKS=false
```

Supabase 없이 데모 화면만 공유하려면 `EXPO_PUBLIC_ENABLE_MOCKS=true`로 배포할 수 있습니다. 이 경우 데이터는 각 브라우저의 로컬 저장소에만 남아 실제 사용자끼리 동기화되지는 않습니다.

## 프로젝트 구조

```text
src/
  screens/
    SplashScreen.tsx
    LoginScreen.tsx
    SignupScreen.tsx
    CoupleLinkScreen.tsx
    CoupleRoomScreen.tsx
  components/
    Character.tsx
    ChatPanel.tsx
    DirectionControls.tsx
    DailyQuestionCard.tsx
    InteractionButton.tsx
  lib/
    supabase.ts
    realtime.ts
  stores/
    authStore.ts
    roomStore.ts
  types/
    database.ts
    models.ts
  utils/
    throttle.ts
    distance.ts
```

## 개발 순서

1. Expo + TypeScript 프로젝트 구조 생성
2. 로그인/회원가입 화면과 Supabase 연결
3. 커플 초대 코드 생성/입력 기능
4. CoupleRoom 화면, 캐릭터 이동, 위치 동기화
5. 실시간 채팅
6. 안아주기 상호작용과 하트 효과
7. 오늘의 질문 카드와 답변 공개 로직
8. UI 정리, 에러 처리, README 작성

## 이후 확장 아이디어

- 커플별 방 꾸미기 아이템
- 캐릭터 아바타 선택과 감정 상태
- 하루 기록 캘린더
- 푸시 알림
- 답변 히스토리와 추억 카드
- Edge Function을 사용한 초대 코드 만료 처리
