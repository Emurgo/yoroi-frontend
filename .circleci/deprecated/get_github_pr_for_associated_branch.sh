#!/bin/bash

# NOTE: removing +x mode can reveal credentials in circleci logs
set +x
set -eo pipefail

curl -su $GITHUB_USERNAME:$GITHUB_PAT \
  https://api.github.com/repos/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/pulls | \
  jq --arg CIRCLE_BRANCH "${CIRCLE_BRANCH}" '.[] | select(.head.ref==$CIRCLE_BRANCH and (.base.ref|test("develop|master|shelley")) ) | .number' | \
  head -n1
