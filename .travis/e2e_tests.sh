#!/bin/bash

set -xeo pipefail

npm ci
cp -a artifacts/*crx .
cp -a artifacts/*xpi .
npm run test-e2e-${BROWSER}
