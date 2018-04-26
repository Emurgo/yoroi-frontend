#! /bin/bash

git submodule update --init
cd js-cardano-wasm
npm install
./build
npm link
cd ..
npm link cardano-crypto