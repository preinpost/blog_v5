# AGENTS.md

React 19 + TanStack Router (Start) + Tailwind CSS 4 기반 블로그.
백엔드는 Cloudflare Workers, 데이터는 D1, 이미지는 R2. 에디터는 Milkdown Crepe.

## 배포 정책 — 반드시 GitHub Actions 경유 ⚠️

- **배포는 `git push origin main` 만으로 진행한다.** `.github/workflows/deploy.yml`이
  빌드 후 Cloudflare Workers에 배포한다 (build → deploy, 자동 트리거 + 수동 실행 가능).
- **로컬에서 `wrangler deploy` / `pnpm run deploy` / `task deploy` 를 실행하지 마라.**
  로컬 OAuth 로그인 계정이 실서비스 worker(`blog-v5`)가 속한 Cloudflare 계정과
  달라 `Authentication error [code: 10000]` 로 항상 실패한다.
  CI는 GitHub Secrets의 `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`로 배포한다.
- 배포 확인: `gh run list` / `gh run watch <run-id> --exit-status`.
- 실서비스: `https://blog.preinpost.in` (Cloudflare Access로 관리자 영역 보호됨)
- 배포 후 마이그레이션이 필요하면 워크플로가 아닌 별도로
  `task db:migrate:remote` 를 실행한다 (스키마 변경 시에만).

## 주요 명령어

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 로컬 개발 서버 (workerd + 로컬 D1/R2, `:3000`) |
| `pnpm build` | 프로덕션 빌드 (client + worker 번들) |
| `pnpm exec tsc --noEmit` | 타입체크 |
| `pnpm db:generate` / `db:migrate:local` / `db:migrate:remote` | Drizzle 마이그레이션 |
| `task` | Taskfile 명령 목록 |

## 구조

- `src/routes/` — TanStack Router 라우트 (`/admin/new`, `/admin/$id/edit` 등)
- `src/components/editor/` — `PostForm.tsx` (글 작성 UI) + `CrepeEditor.tsx` (Milkdown)
- `src/components/ui/` — 공용 프리미티브 (`Button`, `controls.tsx`의 Field/Input/Select/Textarea/Checkbox)
- `src/styles/app.css` — 디자인 토큰, 전역 focus-visible/접근성, **Crepe 테마 오버라이드**
  (헤딩 스케일, 이미지 fit, 에디터 글 영역 폭 등)

## 에디터 개선 시 주의 (Crepe)

- Crepe 테마 CSS는 `@milkdown/crepe/theme/*` import로 app.css 이후 로드된다.
  → app.css에서 오버라이드하려면 `!important` 가 필요하다.
- 에디터 헤딩/이미지는 뷰어(리더 `prose`)와 스케일을 맞추는 것이 원칙.
  Crepe 기본값은 헤딩이 과대(h1 42px), 이미지는 fit-content로 overflow 하므로
  `src/styles/app.css` 의 `.milkdown .ProseMirror h*` / `.milkdown-image-block` 규칙을 따른다.

## 환경 변수 / 시크릿

- `.dev.vars` — 로컬 개발용 (커밋 금지, .gitignore 포함)
- 프로덕션 시크릿은 GitHub Secrets + Cloudflare 콘솔에서 관리
