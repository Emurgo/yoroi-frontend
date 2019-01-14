#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout def5d9a0ebd69435d29e737c7e99ea04f692ab70 && \
cd rust && \
git checkout 8b441cbbeba32ada20d065399083a16d85a5fe29 && \
cd .. && \
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
