#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout bd40ab0f8d6ae27998c7ef5125c8c5cbd109a285 && \
git submodule update
cd rust && \
git checkout 9bef10d1bbd1321d98aa6b30ba030631806ad153 && \
cd .. && \
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
