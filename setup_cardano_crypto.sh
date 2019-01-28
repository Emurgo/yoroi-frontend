#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout 3dcd62d6f10d7281e08a236f3ca5dff92e04e90a && \
git submodule update
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
