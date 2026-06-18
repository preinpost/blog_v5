# Lessons — blog_v5

이 스택(TanStack Start + Cloudflare + pnpm 11 + TS6)에서 겪은 함정과 규칙.

## TanStack Start: 서버 전용 코드는 핸들러 *안에서만* 호출

- 클라이언트 번들에 `@tanstack/react-start/server`(getRequest/getRequestHeader 등) import가 끌려가면
  `[import-protection] Import denied in client environment`로 빌드 실패.
- 원인: `createServerFn().middleware([mw])`에 넘긴 미들웨어 값은 클라이언트 모듈에서 **제거되지 않음** →
  그 미들웨어가 import한 서버 전용 모듈이 클라이언트 그래프에 남음.
- **규칙**: 인증 등 서버 전용 헬퍼(`verifyAccess` 등)는 `.middleware()`로 넘기지 말고
  **각 `.handler()` 내부에서 호출**하라. 핸들러 본문에서만 쓰이는 import는 클라이언트 번들에서 제거된다.
  (`getDb()`가 `cloudflare:workers`를 쓰면서도 통과하는 이유와 동일.)
- `.server.ts` 접미사는 서버 전용 표시지만, 클라이언트 그래프가 정적 import하면 `**/*.server.*` 패턴으로 거부됨 →
  접미사만으로는 부족하고, "핸들러 내부 호출"로 import 자체가 사라지게 해야 함.

## 요청 헤더 헬퍼 이름

- 이 버전(1.16x~1.17x)의 요청 헬퍼는 `getWebRequest`가 아니라 **`getRequest()`** / **`getRequestHeader(name)`**
  (`@tanstack/react-start/server`에서 export). 플랜 문서의 `getWebRequest`는 틀림.

## pnpm 11 빌드 스크립트 허용

- 빌드 스크립트(esbuild/workerd/sharp)는 `package.json`의 `pnpm.onlyBuiltDependencies`가 **안 먹힘**.
- pnpm 11은 `pnpm-workspace.yaml`의 `allowBuilds: { esbuild: true, workerd: true, sharp: true }`로 허용.
- `pnpm build`는 사전 deps-status 체크로 `pnpm install`을 돌리는데, 미승인 빌드가 있으면 exit 1로 실패.

## TypeScript 6 / Vite 8

- TS6: `baseUrl` deprecated(→ TS7에서 제거). `paths`만 두면 tsconfig 위치 기준으로 동작하니 `baseUrl` 제거.
- Vite 8: `vite-tsconfig-paths` 플러그인 불필요 → `resolve.tsconfigPaths: true` 네이티브 사용.

## Base UI

- 패키지명은 **`@base-ui/react`** (구 `@base-ui-components/react`는 rc에 멈춤). import는 `@base-ui/react/<part>`.

## 서버 fn ↔ 클라이언트 직렬화

- D1 `timestamp_ms` 컬럼은 Drizzle에서 Date로 오고, TanStack Start 서버 fn 경계에서 **Date 객체로 보존**됨
  (하이드레이션 데이터에 `new Date(...)`로 직렬화). json 모드 `tags`도 배열로 보존.
