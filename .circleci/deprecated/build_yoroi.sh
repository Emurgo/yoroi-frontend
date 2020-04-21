#!/bin/bash

# NOTE: removing +x mode can reveal credentials in circleci logs
set +x
set -eo pipefail

if [ ! -e "build/${GIT_SHORT_COMMIT}.built" ]
then
  rm -f artifacts/*
  mkdir -p artifacts
  npm run test:build
  mv *crx *xpi artifacts/
  touch build/${GIT_SHORT_COMMIT}.built
fi
