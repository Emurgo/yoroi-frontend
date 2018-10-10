#! /bin/bash

#git submodule update --init --recursive && \
cd js-cardano-wasm && \
npm install && \
./build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
