#!/bin/bash

set -xeo pipefail

npm ci
cp -a artifacts/*crx .
cp -a artifacts/*xpi .
npm run test:run:e2e:${BROWSER}
mv screenshots screenshots-${BROWSER}
mkdir screenshots
mv screenshots-${BROWSER} screenshots/${BROWSER}
