#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
cd rust && \
git checkout 34076cbd3d6f723f513ae71b8afaf5609daa996c && \
cd .. && \
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
