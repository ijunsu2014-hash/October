# October
심심풀이 앱 프로젝트(10월)

## Azure 배포

프론트엔드는 Azure Static Web Apps, NestJS API는 App Service Linux B1에 별도로 배포합니다.
PostgreSQL과 Managed Redis는 API의 관리 ID로 인증합니다. 앱 기능과 JWT 인증 방식은 유지합니다.

### 빌드와 실행

Node.js 22에서 `npm ci`, `npm run build`, `npm start` 순으로 실행합니다.
공용 패키지, API, 프론트엔드 순서로 빌드되며 API 실행 파일은 `services/simsimplay-api/dist/main.js`입니다.
릴리스는 Linux에서 `DEPLOY_ARTIFACT_DIR`을 새 디렉터리로 지정하고
`VITE_API_BASE_URL`을 API 주소로 지정한 뒤 `bash infra/scripts/build-release.sh`로 생성합니다.
`zip`, `curl`이 필요하며 빌드, API 테스트 8개, 운영 의존성만 설치한 패키지의 시작 검증을 수행합니다.
프론트엔드는 아직 테스트 파일이 없어 TypeScript 검사와 Vite 빌드를 필수로 실행합니다.

### 환경변수

웹 빌드의 `VITE_API_BASE_URL`에는 `/api`를 제외한 API 기본 주소를 지정합니다.
API는 `NODE_ENV=production`, `JWT_SECRET`, `AZURE_USE_MANAGED_IDENTITY=true`,
`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGSSLMODE`,
`REDIS_URL=rediss://...:10000`, `AZURE_REDIS_USERNAME`을 사용합니다.
이 설정은 Bicep으로 관리하며 JWT 비밀값은 Git에 올리지 않습니다.

### GitHub Actions

워크플로는 `.github/workflows/azure-deploy.yml` 하나입니다.
PR에서는 빌드와 테스트만 수행하고 `main` push 또는 `main`의 수동 실행만 운영 배포합니다.
빌드 실패 시 배포 작업은 실행되지 않습니다. 운영 배포는 직렬화하고 중간 취소하지 않습니다.

GitHub `production` 환경은 배포 브랜치를 `main`으로 제한해야 합니다.
OIDC 신뢰 대상은 `repo:ijunsu2014-hash@277180662/October@1412652139:environment:production`입니다.
GitHub가 실제 발급하는 소유자·저장소 ID 포함 subject를 정확히 일치시킵니다.
배포 작업에만 `id-token: write` 권한을 주며 Azure 클라이언트 비밀이나 게시 프로필은 사용하지 않습니다.
API의 Website Contributor는 API 하나에, SWA의 Contributor는 SWA 하나에만 부여합니다.
SWA 업로드 토큰은 OIDC 로그인 후 메모리로 조회하고 로그에서 마스킹하며 저장하지 않습니다.

저장소 변수 `API_BASE_URL`과 `production` 환경 변수
`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`,
`AZURE_RESOURCE_GROUP`, `APP_SERVICE_NAME`, `STATIC_WEB_APP_NAME`,
`API_BASE_URL`, `WEB_BASE_URL`이 필요합니다. 이 값들은 비밀값이 아닙니다.

배포 순서는 검증한 ZIP 업로드, 앱 내부 관리 ID 마이그레이션, 웹 배포, 헬스 검사입니다.
마이그레이션은 Azure 인증 SSH 터널 안에서 실행하고 종료 코드를 검사합니다.
DB 방화벽에 GitHub 실행기 IP를 추가하지 않습니다. SCM과 FTP 기본 인증은 비활성화 상태를 유지합니다.
Redis 명령 ACL의 `accessString` 쓰기는 Azure가 요구하는 `2026-05-01-preview` API를 사용합니다.

### 확인과 다음 배포

GitHub 저장소의 Actions에서 `Build and deploy to Azure` 실행과 각 작업 로그를 확인합니다.
Azure Portal의 Static Web App 기본 도메인 또는 GitHub deployment의 환경 URL이 웹사이트 주소입니다.
API `/api/health`는 PostgreSQL과 Redis 상태를 함께 확인합니다.
웹 `/settings` 직접 접근도 검증해 SPA 라우팅 누락을 감지합니다.

이후에는 코드 수정, 로컬 확인, 검토한 파일 커밋, `git push origin main` 순서로 진행합니다.
워크플로와 배포 스크립트를 원격 저장소에 커밋하기 전에는 자동 배포가 활성화되지 않습니다.
인프라 변경은 별도 Bicep 검토와 승인이 필요하며 이 워크플로가 자동 적용하지 않습니다.
API 매칭 상태가 메모리에 있으므로 단일 인스턴스를 유지합니다.

잠정 Azure 비용은 월 약 $73.05이며 세금, 트래픽 및 로그 초과분은 별도입니다.
기존 PostgreSQL의 Azure 전체 서비스 접근 예외와 의존성 취약점은 추가 보안 검토가 필요합니다.
