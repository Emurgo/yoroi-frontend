#!/bin/bash

set -x

# FIXME: move this to our own image and rebuild derivated ones
# install depends if not present
WEBSTORE_BIN=$(which webstore); if [ -z "${WEBSTORE_BIN}" ]; then sudo npm install -g chrome-webstore-upload-cli; fi
AWSCLI_BIN=$(which awscli); if [ -z "${AWSCLI_BIN}" ]; then sudo apt-get update -qq; sudo apt-get install -qqy python-pip; sudo pip install awscli; fi
JQ_BIN=$(which jq); if [ -z "${JQ_BIN}" ]; then sudo apt-get update -qq; sudo apt-get install -qqy jq; fi
COMPARE_BIN=$(which compare); if [ -z "${COMPARE_BIN}" ]; then sudo apt-get update -qq; sudo apt-get install -qqy imagemagick; fi
BC_BIN=$(which bc); if [ -z "${BC_BIN}" ]; then sudo apt-get update -qq; sudo apt-get install -qqy bc; fi
