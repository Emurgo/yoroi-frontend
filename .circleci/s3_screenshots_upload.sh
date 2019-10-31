#!/bin/bash

# NOTE: removing +x mode can reveal credentials in circleci logs
set +x
set -eo pipefail

GITHUB_PAT="${GITHUB_PAT}"
REPO_SLUG="${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}"
PR_NUMBER="${CIRCLE_PR_NUMBER}"
PR_BASE_BRANCH="${CIRCLE_PR_BASE_BRANCH}"
BRANCH="${CIRCLE_BRANCH}"

export AWS_ACCESS_KEY_ID="${ARTIFACTS_KEY}"
export AWS_SECRET_ACCESS_KEY="${ARTIFACTS_SECRET}"
export AWS_REGION="${ARTIFACTS_REGION}"
S3_BUCKET="${ARTIFACTS_BUCKET}"
S3_ENDPOINT="https://${S3_BUCKET}.s3.amazonaws.com"

test -z $SCREENSHOT_DIFF_THRESHOLD && SCREENSHOT_DIFF_THRESHOLD=0
test -z $SCREENSHOT_DIFF_COLOR && SCREENSHOT_DIFF_COLOR=yellow

for browser in ${BROWSERS}
do
  # check if there are any screenshots
  if [ $(find screenshots/${browser} -type f | wc -l) -gt 0 ]
  then
    if [ ! -z "${PR_NUMBER}" ]
    then
      OBJECT_KEY_BASEPATH="screenshots/${browser}/${PR_NUMBER}-${GIT_SHORT_COMMIT}"
    else
      OBJECT_KEY_BASEPATH="screenshots/${browser}/${BRANCH}"
    fi

    # since we cannot control if circleci triggered jobs by type (PR), we control here if we need
    # to upload artifacts or not if this was triggered by a normal branch
    if [[ ! -z $(echo ${BRANCH} | grep "^develop$\|^staging$\|^master$\|^shelley$") ]] || [[ ! -z "${PR_NUMBER}" ]]
    then
      aws s3 sync --only-show-errors screenshots/${browser} "s3://${S3_BUCKET}/${OBJECT_KEY_BASEPATH}"
      
      rm -f /tmp/pr-screenshots-urls
      find screenshots/${browser} -type f | while read file;
      do
        BASENAME=$(echo ${file} | sed "s|^screenshots/${browser}/||")
        OBJECT_KEY="${OBJECT_KEY_BASEPATH}/${BASENAME}"
        S3_URI="$(echo "${S3_ENDPOINT}/${OBJECT_KEY}" | sed 's| |%20|g')"
        echo "**- $(echo ${BASENAME} | sed 's|.png||'):**" >> /tmp/pr-screenshots-urls
        echo "![${BASENAME}](${S3_URI})" >> /tmp/pr-screenshots-urls
      done
      aws s3 cp /tmp/pr-screenshots-urls "s3://${S3_BUCKET}/${OBJECT_KEY_BASEPATH}/pr-screenshots-urls"
    fi
    
    # compare with PR base branch's screenshots and add diferences
    if [ ! -z "${PR_NUMBER}" ]
    then
    
      rm -f /tmp/pr-differences-urls
      DIFFERENCES_OBJECT_KEY="${OBJECT_KEY_BASEPATH}/differences"
      mkdir -p ${DIFFERENCES_OBJECT_KEY}
      find screenshots/${browser} -type f | while read file;
      do
        BASENAME=$(echo ${file} | sed "s|^screenshots/${browser}/||")
        BASE_BRANCH_OBJECT_KEY="screenshots/${browser}/${PR_BASE_BRANCH}/${BASENAME}"
        BASE_BRANCH_S3_URI="$(echo "${S3_ENDPOINT}/${BASE_BRANCH_OBJECT_KEY}" | sed 's| |%20|g')"
        PR_OBJECT_KEY="${OBJECT_KEY_BASEPATH}/${BASENAME}"
        PR_S3_URI="$(echo "${S3_ENDPOINT}/${PR_OBJECT_KEY}" | sed 's| |%20|g')"
        if [ ! -e "${BASE_BRANCH_OBJECT_KEY}" ]
        then
          curl -sLo base-image.png "${BASE_BRANCH_S3_URI}"
          # workaround first deploy where branches images do not exist
          if [ -z "$(file base-image.png | awk -F: '{print $2}' | grep -i png)" ]
          then
            cp -a "${file}" base-image.png
          fi
        fi
        # compare will cause the script fail
        set +e
        DIFF_VALUE=$(compare -metric RMSE -lowlight-color transparent -highlight-color ${SCREENSHOT_DIFF_COLOR} base-image.png "${file}" difference.png 2>&1| awk '{print $1}' | sed 's|\.||g')
        set -e
        if [ $DIFF_VALUE -gt $SCREENSHOT_DIFF_THRESHOLD ]
        then
          DIFFERENCE_OBJECT_KEY="${DIFFERENCES_OBJECT_KEY}/${BASENAME}"
          DIFFERENCE_S3_URI="$(echo "${S3_ENDPOINT}/${DIFFERENCE_OBJECT_KEY}" | sed 's| |%20|g')"
          mkdir -p "$(dirname "${DIFFERENCES_OBJECT_KEY}/${BASENAME}")"
          cp -a difference.png "${DIFFERENCES_OBJECT_KEY}/${BASENAME}"
          echo "**- $(echo ${BASENAME} | sed 's|.png||'):**" >> /tmp/pr-differences-urls
          echo "[Base branch (${PR_BASE_BRANCH}) image](${BASE_BRANCH_S3_URI})" >> /tmp/pr-differences-urls
          echo "[PR #${PR_NUMBER} (origin branch '${BRANCH}') image](${PR_S3_URI})" >> /tmp/pr-differences-urls
          echo "![${BASENAME}](${DIFFERENCE_S3_URI})" >> /tmp/pr-differences-urls
        fi
      done
      aws s3 sync --only-show-errors ${DIFFERENCES_OBJECT_KEY} "s3://${S3_BUCKET}/${DIFFERENCES_OBJECT_KEY}"
      if [ -e /tmp/pr-differences-urls ]
      then
        aws s3 cp /tmp/pr-differences-urls "s3://${S3_BUCKET}/${OBJECT_KEY_BASEPATH}/pr-differences-urls"
      fi
    fi
  fi
done
