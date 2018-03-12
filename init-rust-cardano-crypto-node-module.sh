#!/bin/bash

cd rust-cardano-crypto;
npm install;
./build;
cd ..;
rsync -rv --exclude=.git ./rust-cardano-crypto ./node_modules/ ;
