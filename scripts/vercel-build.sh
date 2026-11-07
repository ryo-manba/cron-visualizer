#!/bin/bash
set -euo pipefail

# Keep the build toolchain isolated without changing the runner's HOME.
if ! command -v cargo >/dev/null 2>&1; then
  export CARGO_HOME="${CARGO_HOME:-${TMPDIR:-/tmp}/cron-visualizer-cargo}"
  export RUSTUP_HOME="${RUSTUP_HOME:-${TMPDIR:-/tmp}/cron-visualizer-rustup}"
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --no-modify-path
  export PATH="$CARGO_HOME/bin:$PATH"
fi

if ! command -v wasm-pack >/dev/null 2>&1; then
  cargo install wasm-pack --version 0.15.1 --locked
fi

pnpm build
