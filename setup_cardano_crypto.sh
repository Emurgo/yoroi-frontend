#! /bin/bash

git submodule foreach git pull origin master
cd js-cardano-wasm
npm install
./build
npm link
cd ..
npm link cardano-crypto