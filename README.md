# CoupleRoom

React Native + Expo + TypeScript + Supabase로 만든 커플 전용 실시간 2D 미니룸 앱입니다. 따뜻한 베이지/크림/브라운/연핑크 톤의 “우리 둘만의 작은 방” 감성을 목표로 합니다.

## 주요 기능

- 이메일 회원가입/로그인
- 회원가입 시 닉네임 입력, 로그인 후 닉네임 수정
- 초대 코드 생성 및 입력으로 커플 연결
- `room:{couple_id}` Supabase Presence Channel 기반 온라인 상태와 캐릭터 위치 동기화
- `messages` INSERT Realtime 기반 최근 50개 메시지 양방향 채팅
- 캐릭터 위 내 닉네임과 상대 닉네임 표시
- 안아주기, 뽀뽀하기, 쓰다듬기 상호작용
- 방 꾸미기: 소파, 테이블, 화분, 스탠드, 러그 추가와 위치 이동
- 오늘의 질문 카드와 서로 답변 후 공개되는 답변 구조
- PostgreSQL schema와 MVP용 RLS 정책

## 설치

```bash
npm install
```

## 환경 변수

`.env.example`을 참고해 `.env`를 만드세요.

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_ENABLE_MOCKS=false
```

Supabase 없이 화면과 mock 흐름만 확인하려면 `EXPO_PUBLIC_ENABLE_MOCKS=true`로 실행할 수 있습니다. 이 경우 데이터는 브라우저/기기의 로컬 저장소에만 남습니다.

## Supabase 설정

1. Supabase 프로젝트를 생성합니다.
2. `supabase/schema.sql` 내용을 SQL Editor에서 실행합니다.
3. Authentication > Providers에서 Email provider를 켭니다.
4. Database > Replication에서 `room_presence`, `messages`, `interactions`, `room_furniture`가 realtime publication에 포함됐는지 확인합니다.
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

Web:

```bash
npm run web
```

## Vercel 배포

Vercel에서 `myeryeong/CoupleRoom` 저장소를 새 프로젝트로 연결하세요.

Build Command:

```bash
npx expo export -p web
```

Output Directory:

```bash
dist
```

실제 로그인, 커플 연결, 실시간 채팅/위치/가구 동기화를 사용하려면 Vercel 환경 변수에 아래 값을 넣어야 합니다.

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_ENABLE_MOCKS=false
```

## 프로젝트 구조

```text
src/
  components/
  lib/
  screens/
  stores/
  theme/
  types/
  utils/
supabase/
  schema.sql
```

## 이후 확장 아이디어

- 커플 기념일과 D-day 위젯
- 방 꾸미기 아이템 잠금 해제
- 감정 상태와 캐릭터 의상
- 푸시 알림
- 하루 기록 캘린더
- 사진/메모 추억 카드
- 초대 코드 만료 처리용 Supabase Edge Function
