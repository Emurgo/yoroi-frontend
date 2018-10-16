#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout e099e7e666805b5efb4eac14103b5dafdb1b73de && \
cd rust && \
git checkout 13e342a3b7cd99676e330d3f36368c063f76544b && \
cd .. && \
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
