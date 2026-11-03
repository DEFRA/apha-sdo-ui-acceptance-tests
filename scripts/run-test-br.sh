#!/usr/bin/env bash
set -euo pipefail

if [[ "$#" -gt 1 ]]; then
  printf 'Usage: npm run test:local:test [-- "scenario name"]\n' >&2
  exit 2
fi

scenario_name="${1:-}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

export BASE_URL="https://apha-sdo-system.test.cdp-int.defra.cloud"
export CUCUMBER_TAG_EXPRESSION="@test"
export TEST_ENTRA_USERNAME="${TEST_ENTRA_USERNAME:-${DEV_ENTRA_USERNAME:-SDO.test1@defradev.onmicrosoft.com}}"
export TEST_ENTRA_PASSWORD="${TEST_ENTRA_PASSWORD:-${DEV_ENTRA_PASSWORD:-}}"

cleanup() {
  unset TEST_ENTRA_PASSWORD TEST_ENTRA_USERNAME CUCUMBER_TAG_EXPRESSION BASE_URL
}
trap cleanup EXIT

if [[ -z "$TEST_ENTRA_PASSWORD" ]]; then
  read -r -s -p "TEST password: " TEST_ENTRA_PASSWORD
  printf '\n'
  export TEST_ENTRA_PASSWORD
fi

if [[ -z "$TEST_ENTRA_PASSWORD" ]]; then
  printf 'A TEST password is required.\n' >&2
  exit 1
fi

npm run clean

wdio_args=(
  run
  wdio.test.conf.js
  --spec
  ./test/features/test/sdo-bat-rabies-test.feature
)

if [[ -n "$scenario_name" ]]; then
  wdio_args+=(--cucumberOpts.name "$scenario_name")
fi

npm exec -- wdio "${wdio_args[@]}"
