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

if [ ! -z "${PR_NUMBER}" ]
then
 
  for browser in brave chrome firefox
  do
 
    OBJECT_KEY_BASEPATH="screenshots/${browser}/${PR_NUMBER}-${GIT_SHORT_COMMIT}"
  
    set +e; aws s3 cp "s3://${S3_BUCKET}/${OBJECT_KEY_BASEPATH}/pr-screenshots-urls" /tmp/${browser}-pr-screenshots-urls; set -e
    set +e; aws s3 cp "s3://${S3_BUCKET}/${OBJECT_KEY_BASEPATH}/pr-differences-urls" /tmp/${browser}-pr-differences-urls; set -e
    # add differences detail only if we found any
    if [ -e /tmp/${browser}-pr-differences-urls ]
    then
      cat >> /tmp/${browser}-pr-differences-comment.json <<EOF
{ "body": "
<details>\n
  <summary>E2E _${browser}_ screenshots differences between 'PR${PR_NUMBER}-${GIT_SHORT_COMMIT}' and base branch '${PR_BASE_BRANCH}'</summary>\n\n
$(cat /tmp/${browser}-pr-differences-urls | while read line; do echo "\\n\\n  $line\\n\\n"; done)\n\n
</details>\n
"}
EOF
    fi
  
    if [ -e /tmp/${browser}-pr-screenshots-urls ]
    then
      cat >> /tmp/${browser}-pr-collection-comment.json <<EOF
{ "body": "
<details>\n
  <summary>Complete E2E _${browser}_ screenshots collection for 'PR${PR_NUMBER}-${GIT_SHORT_COMMIT}'</summary>\n\n
$(cat /tmp/${browser}-pr-screenshots-urls | while read line; do echo "\\n\\n  $line\\n\\n"; done)\n\n
</details>\n
"}
EOF
    fi

    # check if there is something to comment
    for file in /tmp/${browser}-pr-differences-comment.json /tmp/${browser}-pr-collection-comment.json
    do
      if [ $(cat ${file} | wc -l) -gt 2 ]
      then
        set +e; aws s3 cp "${file}" "s3://${S3_BUCKET}/${OBJECT_KEY_BASEPATH}/$(basename "${file}")"; set -e
        curl -s -H "Authorization: token ${GITHUB_PAT}" \
          -X POST --data @${file} \
          "https://api.github.com/repos/${REPO_SLUG}/issues/${PR_NUMBER}/comments"
      fi
    done
  done
fi
