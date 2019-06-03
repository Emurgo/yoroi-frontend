#!/bin/bash
set -x

GITHUB_PAT="${GITHUB_PAT}"
REPO_SLUG="${TRAVIS_REPO_SLUG}"
PR_NUMBER="${TRAVIS_PULL_REQUEST}"

AWS_ACCESS_KEY_ID="${ARTIFACTS_KEY}"
AWS_SECRET_ACCESS_KEY="${ARTIFACTS_SECRET}"
AWS_REGION="${ARTIFACTS_REGION}"
S3_BUCKET="${ARTIFACTS_BUCKET}"
S3_ENDPOINT="https://${S3_BUCKET}.s3.amazonaws.com"

test -z $SCREENSHOT_DIFF_THRESHOLD && SCREENSHOT_DIFF_THRESHOLD=0
test -z $SCREENSHOT_DIFF_COLOR && SCREENSHOT_DIFF_COLOR=yellow

# install bc calculator if not present
BC_BIN=$(which bc); if [ -z "${BC_BIN}" ]; then sudo apt-get install -qqy bc; fi

for browser in brave chrome firefox
do
  if [ "${TRAVIS_PULL_REQUEST}" != "false" ]
  then
    OBJECT_KEY_BASEPATH="screenshots-${browser}/${PR_NUMBER}-${GIT_SHORT_COMMIT}"
  else
    OBJECT_KEY_BASEPATH="screenshots-${browser}/${TRAVIS_BRANCH}"
  fi
  
  rm -f /tmp/pr-screenshots-urls
  find screenshots/screenshots-${browser} -type f | while read file;
  do
    BASENAME=$(echo ${file} | sed "s|^screenshots/screenshots-${browser}||")
    OBJECT_KEY="${OBJECT_KEY_BASEPATH}/${BASENAME}"
    S3_URI="$(echo ${S3_ENDPOINT}/${OBJECT_KEY} | sed 's| |%20|g')"
    aws s3 cp "${file}" "s3://${S3_BUCKET}/${OBJECT_KEY}"
    echo "**- $(echo ${BASENAME} | sed 's|.png||'):**" >> /tmp/pr-screenshots-urls
    echo "![${BASENAME}](${S3_URI})" >> /tmp/pr-screenshots-urls
  done
  
  # compare with PR base branch's screenshots and add diferences
  if [ "${TRAVIS_PULL_REQUEST}" != "false" ]
  then
  
    rm -f /tmp/pr-differences-urls
    find screenshots/screenshots-${browser} -type f | while read file;
    do
      BASENAME=$(echo ${file} | sed "s|^screenshots/screenshots-${browser}||")
      BASE_BRANCH_OBJECT_KEY="screenshots-${browser}/${TRAVIS_BRANCH}/${BASENAME}"
      BASE_BRANCH_S3_URI="$(echo ${S3_ENDPOINT}/${BASE_BRANCH_OBJECT_KEY} | sed 's| |%20|g')"
      DIFFERENCE_OBJECT_KEY="${OBJECT_KEY_BASEPATH}/differences/${BASENAME}"
      # TODO: implement cache (tho it might not make much sense)
      if [ ! -e "${BASE_BRANCH_OBJECT_KEY}" ]
      then
        curl -sLo base-image.png "${BASE_BRANCH_S3_URI}"
      else
        cp -a "${BASE_BRANCH_OBJECT_KEY}" base-image.png
      fi
      DIFF_VALUE=$(compare -metric RMSE -highlight-color ${SCREENSHOT_DIFF_COLOR} base-image.png "${file}" difference.png 2>&1| awk '{print $1}' | sed 's|\.||g')
      if [ $DIFF_VALUE -gt $SCREENSHOT_DIFF_THRESHOLD ]
      then
        DIFFERENCE_S3_URI="$(echo ${S3_ENDPOINT}/${DIFFERENCE_OBJECT_KEY} | sed 's| |%20|g')"
        aws s3 cp "difference.png" "s3://${S3_BUCKET}/${DIFFERENCE_OBJECT_KEY}"
        echo "**- $(echo ${BASENAME} | sed 's|.png||'):**" >> /tmp/pr-differences-urls
        echo "![${BASENAME}](${DIFFERENCE_S3_URI})" >> /tmp/pr-differences-urls
      fi
    done
  
    cat > /tmp/pr-comment.json <<EOF
{ "body": "
<details>\n
EOF
  # add differences detail only if we found any
  test -e /tmp/pr-differences-urls && cat >> /tmp/pr-comment.json <<EOF
  <summary>E2E _${browser}_ screenshots differences between '**PR${PR_NUMBER}-${GIT_SHORT_COMMIT}**' and base branch '**${TRAVIS_BRANCH}**'</summary>\n\n
$(cat /tmp/pr-differences-urls | while read line; do echo "\\n\\n  $line\\n\\n"; done)\n\n
</details>
EOF
  cat >> /tmp/pr-comment.json <<EOF
<details>\n
  <summary>Complete E2E _${browser}_ screenshots collection for 'PR${PR_NUMBER}-${GIT_SHORT_COMMIT}'</summary>\n\n
$(cat /tmp/pr-screenshots-urls | while read line; do echo "\\n\\n  $line\\n\\n"; done)\n\n
</details>
"}
EOF
  
    curl -s -H "Authorization: token ${GITHUB_PAT}" \
      -X POST --data @/tmp/pr-comment.json \
      "https://api.github.com/repos/${REPO_SLUG}/issues/${PR_NUMBER}/comments"
  
    rm -rf ${OBJECT_KEY_BASEPATH}
  
  fi
