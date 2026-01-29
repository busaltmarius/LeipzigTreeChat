#!/usr/bin/env bash

set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "ROOT_DIR: $ROOT_DIR"
cd "$ROOT_DIR"

if [ -f $ROOT_DIR/.env ]; then
  source $ROOT_DIR/.env
  echo "SPRING_BOOT_ADMIN_URL: $SPRING_BOOT_ADMIN_URL"
  echo "QANARY_HOST: $QANARY_HOST"
  echo "QANARY_PORT: $QANARY_PORT"
else
  echo "Warning: $ROOT_DIR/.env file not found"
fi



# 1) install all required dependencies
echo "Installing dependencies"
bun install

echo "Building component and dependencies"
bun run build --workspace=api && \
  bun run build --workspace=qanary-component-helpers && \
  bun run build --workspace=shared && \
  bun run build --workspace=qanary-component-core && \
  bun run build --workspace=qanary-component-nerd-simple

# build core component
CORE_DIST_ROOT="$ROOT_DIR/packages/qanary-component-core/dist"
if [ -f "$CORE_DIST_ROOT/src/index.js" ] && [ ! -f "$CORE_DIST_ROOT/index.js" ]; then
  echo 'module.exports = require("./src/index.js");' > "$CORE_DIST_ROOT/index.js"
fi
if [ -f "$CORE_DIST_ROOT/src/index.d.ts" ] && [ ! -f "$CORE_DIST_ROOT/index.d.ts" ]; then
  echo 'export * from "./src/index";' > "$CORE_DIST_ROOT/index.d.ts"
fi

if [ ! -f "$ROOT_DIR/packages/qanary-component-core/dist/index.js" ]; then
  bun run build --workspace=qanary-component-core
fi

# 2) run all tests
echo "Running tests"
cd "$ROOT_DIR/apps/qanary-component-nerd-simple" && bun test

# 3) start the application (Bun runtime)
cd "$ROOT_DIR/apps/qanary-component-nerd-simple"
env "SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL=$SPRING_BOOT_ADMIN_URL" \
  "SPRING_BOOT_ADMIN_URL=$SPRING_BOOT_ADMIN_URL" \
  "QANARY_COMPONENT_PACKAGE_JSON=$ROOT_DIR/apps/qanary-component-nerd-simple/package.json" \
  "SKIP_REGISTRATION=true" \
  bun src/index.ts
