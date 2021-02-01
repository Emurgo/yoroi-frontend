# docker login registry.gitlab.com
# docker build -t registry.gitlab.com/emurgo.io/yoroi-frontend .
# docker push registry.gitlab.com/emurgo.io/yoroi-frontend

FROM node:12-buster

RUN apt-get update && apt-get install -y \
    build-essential \
    xvfb \
    libgtk2.0-0 \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2

USER root

RUN \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y dbus-x11 google-chrome-stable google-chrome-beta && \
    rm -rf /var/lib/apt/lists/*

ENV DBUS_SESSION_BUS_ADDRESS=/dev/null
ENV TERM xterm
ENV npm_config_loglevel warn
ENV npm_config_unsafe_perm true
