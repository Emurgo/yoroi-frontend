#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout 2833341059426b0aefc60e60b7d281f7ff6bde26 && \
git submodule update
cd rust && \
git checkout 9bef10d1bbd1321d98aa6b30ba030631806ad153 && \
cd .. && \
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
