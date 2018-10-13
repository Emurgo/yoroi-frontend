#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout e099e7e666805b5efb4eac14103b5dafdb1b73de && \
cd rust && \
git checkout fe3f0870638ae41bb80afdc0cea59febe502d687 && \
cd .. && \
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
