# Blog v5 — TODO

플랜: `~/.claude/plans/fluffy-jumping-key.md`
스택: TanStack Start + Cloudflare Workers(@cloudflare/vite-plugin) / D1+Drizzle / R2 / Milkdown(Crepe) / Base UI + Tailwind v4 / Cloudflare Access

## 구현 단계

- [x] 1. 스캐폴드 + 부팅 — `pnpm build`(client+worker 번들) + `pnpm dev` SSR 200 OK 확인
- [x] 2. Tailwind v4 + Base UI — 빌드 게이트 통과, Base UI Dialog SSR 렌더 확인
- [x] 3. D1 스키마 + 마이그레이션 — posts 테이블+인덱스 로컬 D1 적용, tsc 통과
- [x] 4. 공개 읽기 경로 — 홈 목록/글 페이지/404/태그배열/Date직렬화 확인
- [x] 5. 관리자 인증 — dev 우회 게이트 + draft/publish 분리(초안 비공개) 확인. 서버 fn은 핸들러 내부 verifyAccess() 호출
- [x] 6. 에디터 — Playwright로 작성→저장→공개렌더, 편집 로드(defaultValue), draft/publish 확인
- [x] 7. 이미지 업로드 — POST→R2→GET 왕복 바이트 동일, 비이미지 415 거부 확인
- [x] 8. 렌더링/하이라이팅 — workerd에서 Shiki(JS엔진, WASM無)+GFM표+prose 렌더 확인
- [x] 9. 태그 페이지 — /tags/$tag 필터·빈상태·클릭가능 태그 링크 확인
- [x] 10. 기존 글 9편 + 이미지 11개 마이그레이션 (D1+R2, 로컬·원격 모두)
- [x] 11. 배포 — blog.preinpost.in 라이브 (공개 블로그 동작). /admin은 Access 설정 후 해제

## 진행 메모

- 확정 버전: `@tanstack/react-start` 1.168.26 / `@tanstack/react-router` 1.170.16 / react 19.2.7 /
  vite 8.0.16 / `@cloudflare/vite-plugin` 1.41.0 / wrangler 4.101.0 / `@base-ui/react` 1.5.0 /
  tailwindcss 4.3.1 / drizzle-orm 0.45.2 / drizzle-kit 0.31.10 / typescript 6.0.3
- pnpm 11: 빌드 스크립트 허용은 `pnpm-workspace.yaml`의 `allowBuilds`(esbuild/workerd/sharp: true)
- TS6: `baseUrl` deprecated → 제거(paths만 사용). vite-tsconfig-paths 제거 → `resolve.tsconfigPaths: true`
- D1 `database_id`는 placeholder(b8303450-...) — 배포 시 `wrangler d1 create` 실제 id로 교체
- Base UI 패키지명 `@base-ui/react` (구 `@base-ui-components/react` 아님, rc에 멈춤)
- 버전 핀 고정(^→고정)은 배포 직전 일괄 처리 예정

## 결과 리뷰

**steps 1–9 완료 (로컬 기능 완성).** 모든 단계 빌드+타입체크+런타임 검증 통과.

검증 핵심:
- 스캐폴드/빌드: client+worker 번들, SSR 200
- Tailwind v4 + Base UI Dialog SSR (빌드 게이트 통과)
- D1 posts 테이블 + Drizzle, 마이그레이션
- 공개 읽기(홈/글/404), draft 비공개 분리
- 관리자 인증 dev 우회(prod는 Cloudflare Access + jose) — 서버 fn은 핸들러 내부 verifyAccess()
- Milkdown(Crepe) 에디터: 작성→저장→공개렌더, 편집 defaultValue 복원, draft/publish 토글 (Playwright 검증)
- R2 이미지 업로드 왕복(바이트 동일), 비이미지 415
- Shiki 렌더링: workerd에서 WASM 없이 동작, GFM 표/prose
- 태그 페이지 필터 + 클릭 링크

**남은 작업 (사용자 입력 필요):**
- 10. (선택) 기존 글 마이그레이션 — blog/public/article/*/page.md ~8편
- 11. 배포 — `wrangler login`(대화형, 사용자 실행) + 원격 D1/R2 생성 + Cloudflare Access 구성 + db:migrate:remote + deploy.
  - 배포 전: D1 `database_id` placeholder → 실제 id 교체, vars(TEAM_DOMAIN/ACCESS_AUD/R2_PUBLIC_BASE) 설정, `^`→버전 핀 고정
  - 로컬 테스트 데이터(seed-*, 에디터 작성글)는 마이그레이션/배포 전 정리
