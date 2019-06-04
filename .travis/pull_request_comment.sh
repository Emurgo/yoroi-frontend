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

# comment header
cat > /tmp/pr-comment.json <<EOF
{ "body": "
<details>\n
EOF

for browser in brave chrome firefox
do

  if [ "${TRAVIS_PULL_REQUEST}" != "false" ]
  then
    OBJECT_KEY_BASEPATH="screenshots/${BROWSER}/${PR_NUMBER}-${GIT_SHORT_COMMIT}"

    aws s3 cp "s3://${S3_BUCKET}/${OBJECT_KEY_BASEPATH}/pr-screenshots-urls" /tmp/pr-screenshots-urls
    if [ $(cat /tmp/pr-screenshots-urls | wc -l) -gt 0 ]
    then
      
      # add differences detail only if we found any
      cat >> /tmp/pr-comment.json <<EOF
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
    fi
  fi
done
  
# check if there is something to comment
if [ $(cat /tmp/pr-comment.json | wc -l) -gt 2 ]
then
  curl -s -H "Authorization: token ${GITHUB_PAT}" \
    -X POST --data @/tmp/pr-comment.json \
    "https://api.github.com/repos/${REPO_SLUG}/issues/${PR_NUMBER}/comments"
fi
