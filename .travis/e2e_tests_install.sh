#!/bin/bash

set -xeo pipefail

if [ "${BROWSER}" == "brave" ]
then
  curl -sL https://brave-browser-apt-release.s3.brave.com/brave-core.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/brave-browser-release.gpg add -a
  source /etc/lsb-release
  echo "deb [arch=amd64] https://brave-browser-apt-release.s3.brave.com/ $DISTRIB_CODENAME main" | sudo tee /etc/apt/sources.list.d/brave-browser-release-${UBUNTU_CODENAME}.list
  sudo apt-get update -qqy
  sudo apt-get install -qqy brave-keyring brave-browser
  BRAVE_VERSION=$(apt-cache policy brave-browser|grep -i installed | awk "{print \$NF}")
  echo "Using chromedriver version: ${BRAVE_CHROMEDRIVER_VERSION}"
  curl -o /tmp/chromedriver_linux64.zip -sL https://github.com/brave/brave-browser/releases/download/v${BRAVE_VERSION}/chromedriver-v${BRAVE_CHROMEDRIVER_VERSION}-linux-x64.zip
  unzip /tmp/chromedriver_linux64.zip -d /tmp
  rm -rf chromedriver_linux64.zip
  sudo mv /tmp/chromedriver /usr/local/bin/chromedriver
  sudo chmod +x /usr/local/bin/chromedriver
fi

if [ "${BROWSER}" == "chrome" ]
then
  curl -sL https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
  echo "deb http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
  sudo apt-get update -qqy
  sudo apt-get install -qqy ${CHROME_VERSION:-google-chrome-stable}
  CHROME_STRING=$(google-chrome --version)
  CHROME_VERSION_STRING=$(echo "${CHROME_STRING}" | grep -oP "\d+\.\d+\.\d+\.\d+")
  CHROME_MAYOR_VERSION=$(echo "${CHROME_VERSION_STRING%%.*}")
  CD_VERSION=$(curl -sL "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_MAYOR_VERSION}")
  if [ -z "$CHROME_DRIVER_VERSION" ]; \
  then
    CHROME_DRIVER_VERSION="${CD_VERSION}"
  fi
  echo "Using chromedriver version: $CD_VERSION"
  curl -o /tmp/chromedriver_linux64.zip -sL https://chromedriver.storage.googleapis.com/$CD_VERSION/chromedriver_linux64.zip
  unzip /tmp/chromedriver_linux64.zip -d /tmp
  rm -rf chromedriver_linux64.zip
  sudo mv /tmp/chromedriver /usr/local/bin/chromedriver
  sudo chmod +x /usr/local/bin/chromedriver
fi

if [ "${BROWSER}" == "firefox" ]
then
  curl -o /tmp/firefox.bz2 -sL https://download-installer.cdn.mozilla.net/pub/devedition/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2
  sudo rm -f /opt/firefox/firefox
  sudo tar -C /opt -jxf /tmp/firefox.bz2
  sudo rm -f /usr/local/bin/firefox
  sudo ln -s /opt/firefox/firefox-bin /usr/local/bin/firefox
  which firefox
fi
