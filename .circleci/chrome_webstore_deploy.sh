#!/bin/bash

# NOTE: removing +x mode can reveal credentials in circleci logs
set +x
set -eo pipefail

function yoroi-build(){

  npm run build -- --env "$TEMPLATE"
  sed -i "s|\"name\": \".*|\"name\":\"Yoroi ${RELEASE_TAG}\",|" build/manifest.json
  find build -type f -exec sha256sum {} \; | sed 's| build/||' > sha256sum.list
  mv sha256sum.list build/
  npm run compress -- --env "${TEMPLATE}" --zip-only --app-id ${APP_ID} --codebase "${CHROME_CODEBASE_URL}"
  ls -hl . build;
  mv Yoroi*zip artifacts/${ZIP_NAME}
  mv Yoroi*xpi artifacts/${XPI_NAME}

}

function chrome-webstore-upndown(){

  webstore upload --source "artifacts/${ZIP_NAME}" --extension-id="${APP_ID}" --client-id="${GOOGLE_CLIENT_ID}" --client-secret="${GOOGLE_CLIENT_SECRET}" --refresh-token="${GOOGLE_REFRESH_TOKEN}" --trusted-testers
  ACCESS_TOKEN=$(curl -s -X POST -d "client_id=$GOOGLE_CLIENT_ID&client_secret=$GOOGLE_CLIENT_SECRET&refresh_token=$GOOGLE_REFRESH_TOKEN&grant_type=refresh_token" https://www.googleapis.com/oauth2/v4/token | grep access_token | awk -F: '{print $2}' | sed 's|.*"\(.*\)".*|\1|g')
  curl -o artifacts/${CRX_NAME} \
    -H "Authorization: Bearer ${ACCESS_TOKEN}"  \
    -H "x-goog-api-version: 2" \
    https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}

}

rm -rf build
rm -rf artifacts/*

if [ ! -z "${CIRCLE_PR_NUMBER}" ]
then
  export TEMPLATE="testnet"
  export RELEASE_TAG="${TEMPLATE}-PR${CIRCLE_PR_NUMBER}-${GIT_SHORT_COMMIT}"
  export ZIP_NAME="yoroi-${RELEASE_TAG}.zip"
  export XPI_NAME="yoroi-${RELEASE_TAG}.xpi"
  export CRX_NAME="yoroi-${RELEASE_TAG}.crx"
  echo "Building Yoroi-${RELEASE_TAG}..."

  export ACCESS_TOKEN=$(curl -s -X POST -d "client_id=$GOOGLE_CLIENT_ID&client_secret=$GOOGLE_CLIENT_SECRET&refresh_token=$GOOGLE_REFRESH_TOKEN&grant_type=refresh_token" https://www.googleapis.com/oauth2/v4/token | grep access_token | awk -F: '{print $2}' | sed 's|.*"\(.*\)".*|\1|g')
  yoroi-build

  APP_ID=$(curl  \
    -H "Authorization: Bearer ${ACCESS_TOKEN}"  \
    -H "x-goog-api-version: 2" \
    -X POST \
    -T artifacts/${ZIP_NAME} \
    ${CHROME_WEBSTORE_API_ENDPOINT}/items | sed 's|.*"id":"\(.*\)","upload.*|\1|g')

  chrome-webstore-upndown

else

  if [ "${CIRCLE_BRANCH}" == "develop" ] || [[ "${CIRCLE_BRANCH}" == "shelley" ]]
  then
    export TEMPLATE="testnet"
    export RELEASE_TAG="${TEMPLATE}-$(echo ${CIRCLE_BRANCH} | sed 's|/|-|g')-${GIT_SHORT_COMMIT}"
    export ZIP_NAME="yoroi-${RELEASE_TAG}.zip"
    export XPI_NAME="yoroi-${RELEASE_TAG}.xpi"
    export CRX_NAME="yoroi-${RELEASE_TAG}.crx"
    export APP_ID="${CHROME_DEV_APP_ID}"
    echo "Building Yoroi-${RELEASE_TAG}..."
    yoroi-build
    chrome-webstore-upndown
  fi
  if [ "${CIRCLE_BRANCH}" == "staging" ]
  then
    export TEMPLATE="testnet"
    export RELEASE_TAG="${TEMPLATE}-$(echo ${CIRCLE_BRANCH} | sed 's|/|-|g')-${GIT_SHORT_COMMIT}"
    export ZIP_NAME="yoroi-${RELEASE_TAG}.zip"
    export XPI_NAME="yoroi-${RELEASE_TAG}.xpi"
    export CRX_NAME="yoroi-${RELEASE_TAG}.crx"
    export APP_ID="${CHROME_STG_APP_ID}"
    echo "Building Yoroi-${RELEASE_TAG}..."
    yoroi-build
    chrome-webstore-upndown
  fi
  if [ "${CIRCLE_BRANCH}" == "master" ]
  then
    export TEMPLATE="mainnet"
    export RELEASE_TAG="${TEMPLATE}-$(echo ${CIRCLE_BRANCH} | sed 's|/|-|g')-${GIT_SHORT_COMMIT}"
    export ZIP_NAME="yoroi-${RELEASE_TAG}.zip"
    export XPI_NAME="yoroi-${RELEASE_TAG}.xpi"
    export CRX_NAME="yoroi-${RELEASE_TAG}.crx"
    export APP_ID="${CHROME_PRO_APP_ID}"
    echo "Building Yoroi-${RELEASE_TAG}..."
    yoroi-build
    chrome-webstore-upndown
    # maybe apply diff settings to the upload?
  fi
fi

if [[ ! -z $(echo ${BRANCH} | grep "^develop$\|^staging$\|^master$\|^shelley$") ]] || [[ ! -z "${PR_NUMBER}" ]]
then
  tar -zcf artifacts/build-${RELEASE_TAG}.tar.gz build
  echo "Release sha256 checksums:"
  find build -type f -exec sha256sum {} \; | tee -a artifacts/sha256sum.list
  sha256sum artifacts/build*tar.gz | tee -a artifacts/sha256sum.list
  sha256sum artifacts/${CRX_NAME} | tee -a artifacts/sha256sum.list
  sha256sum artifacts/${XPI_NAME} | tee -a artifacts/sha256sum.list
  sha256sum artifacts/${ZIP_NAME} | tee -a artifacts/sha256sum.list
fi
