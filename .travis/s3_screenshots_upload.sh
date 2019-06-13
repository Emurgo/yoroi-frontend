#!/bin/bash
set -x

GITHUB_PAT="${GITHUB_PAT}"
REPO_SLUG="${TRAVIS_REPO_SLUG}"
PR_NUMBER="${TRAVIS_PULL_REQUEST}"

export AWS_ACCESS_KEY_ID="${ARTIFACTS_KEY}"
export AWS_SECRET_ACCESS_KEY="${ARTIFACTS_SECRET}"
export AWS_REGION="${ARTIFACTS_REGION}"
S3_BUCKET="${ARTIFACTS_BUCKET}"
S3_ENDPOINT="https://${S3_BUCKET}.s3.amazonaws.com"

test -z $SCREENSHOT_DIFF_THRESHOLD && SCREENSHOT_DIFF_THRESHOLD=0
test -z $SCREENSHOT_DIFF_COLOR && SCREENSHOT_DIFF_COLOR=yellow

# install bc calculator if not present
BC_BIN=$(which bc); if [ -z "${BC_BIN}" ]; then sudo apt-get install -qqy bc; fi

# check if there are any screenshots
if [ $(find screenshots -type f | wc -l) -gt 0 ]
then
  if [ "${TRAVIS_PULL_REQUEST}" != "false" ]
  then
    OBJECT_KEY_BASEPATH="screenshots/${BROWSER}/${PR_NUMBER}-${GIT_SHORT_COMMIT}"
  else
    OBJECT_KEY_BASEPATH="screenshots/${BROWSER}/${TRAVIS_BRANCH}"
  fi
  
  rm -f /tmp/pr-screenshots-urls
  find screenshots -type f | while read file;
  do
    BASENAME=$(echo ${file} | sed "s|^screenshots/||")
    OBJECT_KEY="${OBJECT_KEY_BASEPATH}/${BASENAME}"
    S3_URI="$(echo ${S3_ENDPOINT}/${OBJECT_KEY} | sed 's| |%20|g')"
    aws s3 cp "${file}" "s3://${S3_BUCKET}/${OBJECT_KEY}"
    echo "**- $(echo ${BASENAME} | sed 's|.png||'):**" >> /tmp/pr-screenshots-urls
    echo "![${BASENAME}](${S3_URI})" >> /tmp/pr-screenshots-urls
  done
  aws s3 cp /tmp/pr-screenshots-urls "s3://${S3_BUCKET}/${OBJECT_KEY_BASEPATH}/pr-screenshots-urls"
  
  # compare with PR base branch's screenshots and add diferences
  if [ "${TRAVIS_PULL_REQUEST}" != "false" ]
  then
  
    rm -f /tmp/pr-differences-urls
    find screenshots -type f | while read file;
    do
      BASENAME=$(echo ${file} | sed "s|^screenshots/||")
      BASE_BRANCH_OBJECT_KEY="screenshots/${BROWSER}/${TRAVIS_BRANCH}/${BASENAME}"
      BASE_BRANCH_S3_URI="$(echo ${S3_ENDPOINT}/${BASE_BRANCH_OBJECT_KEY} | sed 's| |%20|g')"
      DIFFERENCE_OBJECT_KEY="${OBJECT_KEY_BASEPATH}/differences/${BASENAME}"
      # TODO: implement cache (tho it might not make much sense)
      if [ ! -e "${BASE_BRANCH_OBJECT_KEY}" ]
      then
        curl -sLo base-image.png "${BASE_BRANCH_S3_URI}"
        # workaround first deploy where branches images do not exist
        if [ -z "$(file base-image.png | awk -F: '{print $2}' | grep -i png)" ]
        then
          cp -a "${file}" base-image.png
        fi
      fi
      compare -metric RMSE -lowlight-color transparent -highlight-color ${SCREENSHOT_DIFF_COLOR} base-image.png "${file}" difference.png
      DIFF_VALUE=$(compare -metric RMSE -highlight-color ${SCREENSHOT_DIFF_COLOR} base-image.png "${file}" difference.png 2>&1| awk '{print $1}' | sed 's|\.||g')
      if [ $DIFF_VALUE -gt $SCREENSHOT_DIFF_THRESHOLD ]
      then
        DIFFERENCE_S3_URI="$(echo ${S3_ENDPOINT}/${DIFFERENCE_OBJECT_KEY} | sed 's| |%20|g')"
        aws s3 cp "difference.png" "s3://${S3_BUCKET}/${DIFFERENCE_OBJECT_KEY}"
        echo "**- $(echo ${BASENAME} | sed 's|.png||'):**" >> /tmp/pr-differences-urls
        echo "![${BASENAME}](${DIFFERENCE_S3_URI})" >> /tmp/pr-differences-urls
      fi
    done
    if [ -e /tmp/pr-differences-urls ]
    then
      aws s3 cp /tmp/pr-differences-urls "s3://${S3_BUCKET}/${OBJECT_KEY_BASEPATH}/pr-differences-urls"
    fi
  fi
fi
