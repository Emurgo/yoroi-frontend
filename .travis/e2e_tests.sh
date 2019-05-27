#!/bin/bash

set -xeo pipefail

env
ps ax
export DISPLAY
npm ci
cp -a artifacts/*crx .
cp -a artifacts/*xpi .
npm run test-e2e-${BROWSER}
