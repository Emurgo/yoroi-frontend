#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout 386cc1ebe9cba1a1bf90304a491221d6986cd865 && \
git submodule update
cd rust && \
git checkout 9bef10d1bbd1321d98aa6b30ba030631806ad153 && \
cd .. && \
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
