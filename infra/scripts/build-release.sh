set -euo pipefail

npm ci
npm run build
JWT_SECRET=ci-only-not-a-production-secret \
  PGHOST=postgres.test.invalid PGDATABASE=simsimplay_test PGUSER=test_identity \
  npm test --workspace=services/simsimplay-api
npm test --workspace=services/simsimplay-web -- --passWithNoTests
node infra/scripts/package-api.cjs