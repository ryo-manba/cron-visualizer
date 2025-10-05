#!/bin/bash
set -euxo pipefail

# Set HOME to match euid home directory
export HOME=/root

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env

# Install wasm-pack
cargo install wasm-pack

# Build the project
pnpm build
