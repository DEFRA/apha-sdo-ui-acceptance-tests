#!/usr/bin/env bash
set -euo pipefail

if [[ "$#" -gt 1 ]]; then
  printf 'Usage: npm run test:local:dev:ahr [-- "scenario name"]\n' >&2
  exit 2
fi

scenario_name="${1:-}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [[ -f .env.ahr ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.ahr
  set +a
fi

export BASE_URL="https://apha-sdo-system.dev.cdp-int.defra.cloud"
export CUCUMBER_TAG_EXPRESSION="@dev"
export DEV_ENTRA_USERNAME="${DEV_ENTRA_USERNAME:-SDO.test1@defradev.onmicrosoft.com}"

cleanup() {
  unset DEV_ENTRA_PASSWORD DEV_ENTRA_USERNAME CUCUMBER_TAG_EXPRESSION BASE_URL
}
trap cleanup EXIT

if [[ -z "${DEV_ENTRA_PASSWORD:-}" ]]; then
  read -r -s -p "DEV password: " DEV_ENTRA_PASSWORD
  printf '\n'
  export DEV_ENTRA_PASSWORD
fi

if [[ -z "$DEV_ENTRA_PASSWORD" ]]; then
  printf 'A DEV password is required.\n' >&2
  exit 1
fi

npm run clean

wdio_args=(
  run
  wdio.dev.conf.js
  --spec
  ./test/features/dev/sdo-ahr-dev.feature
)

if [[ -n "$scenario_name" ]]; then
  wdio_args+=(--cucumberOpts.name "$scenario_name")
fi

npm exec -- wdio "${wdio_args[@]}"
