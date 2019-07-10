#!/bin/bash

set -xeo pipefail

curl https://sh.rustup.rs -sSf | sh -s -- -y
echo 'export PATH=$HOME/.cargo/bin/:$PATH' >> ~/.bashrc
rustup install ${RUST_VERSION}
rustup target add ${RUST_TARGETS} --toolchain ${RUST_VERSION}

sudo pip install awscli
