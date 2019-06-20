#!/bin/bash

if [ ! -z "$(echo ${GIT_COMMIT_MESSAGE} | grep '#skip-e2e')" ]
then
  echo "[!] Cancelling e2e tests due to tag '#skip-e2e' in '\$GIT_COMMIT_MESSAGE'."
  CIRCLE_BASE_URL="https://circleci.com/api/v1.1/project/github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME"
  curl --silent --show-error -u ${CIRCLE_TOKEN}: -X POST "$CIRCLE_BASE_URL/${CIRCLE_BUILD_NUM}/cancel"
fi

# let some time to circleci to avoid going for the next step
sleep 5
