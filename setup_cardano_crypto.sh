#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout a58f66a3fbcb94f1e827ba0525facd5eb84d1545 && \
cd rust && \
git checkout 8b441cbbeba32ada20d065399083a16d85a5fe29 && \
cd .. && \
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
