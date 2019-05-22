FROM circleci/node:8-browsers AS circleci-node-8-browsers

FROM circleci-node-8-browsers AS brave

# hardcode ubuntu version for circleci's debian-9 based image
ENV UBUNTU_CODENAME=cosmic
ENV BRAVE_CHROMEDRIVER_VER=2.33
RUN /bin/bash -c 'set -e; \
    sudo apt-get install apt-transport-https; \
    curl -s https://brave-browser-apt-release.s3.brave.com/brave-core.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/brave-browser-release.gpg add -a; \
    echo "deb [arch=amd64] https://brave-browser-apt-release.s3.brave.com/ $UBUNTU_CODENAME main" | sudo tee /etc/apt/sources.list.d/brave-browser-release-${UBUNTU_CODENAME}.list; \
    sudo apt update; \
    sudo apt install brave-keyring brave-browser'

# add chromedriver tho it's not configurable on selenium-webdriver 
RUN /bin/bash -c 'set -e; \
    BRAVE_VERSION=$(apt-cache policy brave-browser|grep -i installed | awk "{print \$NF}"); \
    cd /tmp; \
    curl -o chromedriver_linux64.zip -L https://github.com/brave/brave-browser/releases/download/v${BRAVE_VERSION}/chromedriver-v${BRAVE_CHROMEDRIVER_VER}-linux-x64.zip; \
    unzip chromedriver_linux64.zip; \
    rm -rf chromedriver_linux64.zip; \
    sudo mv chromedriver /usr/local/bin/chromedriver; \
    sudo chmod +x /usr/local/bin/chromedriver; \
    chromedriver --version'

FROM circleci-node-8-browsers AS firefox-dev

ENV FIREFOX_VERSION=67.0b9

RUN /bin/bash -c 'set -xe; \
    curl -o /tmp/firefox.bz2 -sL https://download-installer.cdn.mozilla.net/pub/devedition/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2; \
    sudo tar -C /opt -jxf /tmp/firefox.bz2; \
    sudo rm -f /opt/firefox/firefox; \
    sudo rm -f /usr/local/bin/firefox; \
    sudo ln -s /opt/firefox/firefox-bin /usr/local/bin/firefox'
