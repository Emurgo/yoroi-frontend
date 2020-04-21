#!/bin/bash

# NOTE: removing +x mode can reveal credentials in circleci logs
set +x
set -eo pipefail

# HACK: circleci does not support composing environment from other env
echo -e "export GIT_COMMIT_MESSAGE='$(git log --pretty=format:'%s' -n1 ${CIRCLE_SHA1} | perl -pe 's/[^\w #.-]+//g' )'" >> $BASH_ENV
echo -e "export GIT_SHORT_COMMIT=${CIRCLE_SHA1:0:7}" >> $BASH_ENV
echo -e "export REPO_SLUG=${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}" >> $BASH_ENV
echo -e "export CIRCLE_PR_NUMBER=$(bash .circleci/get_github_pr_for_associated_branch.sh)" >> $BASH_ENV
echo -e "export CIRCLE_PR_BASE_BRANCH=$(bash .circleci/get_github_pr_base_branch.sh)" >> $BASH_ENV
