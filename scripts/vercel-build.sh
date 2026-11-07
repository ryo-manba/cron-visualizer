#!/bin/bash
set -euo pipefail

# Vercel's preinstalled Rust can lack rustup and the wasm32 target.
# Use a complete, isolated rustup toolchain rather than treating cargo's
# presence as proof that WebAssembly builds are supported.
export CARGO_HOME="${TMPDIR:-/tmp}/cron-visualizer-cargo"
export RUSTUP_HOME="${TMPDIR:-/tmp}/cron-visualizer-rustup"
export PATH="$CARGO_HOME/bin:$PATH"

if [[ ! -x "$CARGO_HOME/bin/rustup" ]]; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --no-modify-path --default-toolchain stable --target wasm32-unknown-unknown
fi
rustup target add wasm32-unknown-unknown

if [[ ! -x "$CARGO_HOME/bin/wasm-pack" ]]; then
  cargo install wasm-pack --version 0.15.1 --locked
fi

pnpm build
