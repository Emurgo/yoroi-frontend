#!/usr/bin/env bash
# script borrowed from: https://discuss.circleci.com/t/auto-cancel-redundant-builds-not-working-for-workflow/13852/31

# NOTE: removing +x mode can reveal credentials in circleci logs
set +x
set -eo pipefail

# CIRCLE_TOKEN comes from env
CIRCLE_BASE_URL="https://circleci.com/api/v1.1/project/github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME"

getRunningJobs() {
  local circleApiResponse
  local runningJobs

  circleApiResponse=$(curl -u ${CIRCLE_TOKEN}: --silent --show-error "$CIRCLE_BASE_URL/tree/$CIRCLE_BRANCH" -H "Accept: application/json")
  runningJobs=$(echo "$circleApiResponse" | jq 'map(if .status == "running" then .build_num else "None" end) - ["None"] | .[]' | sed "s|${CIRCLE_BUILD_NUM}||g" )
  echo "$runningJobs"
}

cancelRunningJobs() {
  local runningJobs
  runningJobs=$(getRunningJobs)
  for buildNum in $runningJobs;
  do
    echo Canceling "$buildNum"
    curl --silent --show-error -u ${CIRCLE_TOKEN}: -X POST "$CIRCLE_BASE_URL/$buildNum/cancel"
  done
}

cancelRunningJobs
