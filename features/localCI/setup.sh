#!/bin/bash

# install same base as our CI build
# TODO: make this use emurgornd once the emurgornd image auto-updates to latest chromedriver
sudo docker run --name yoroi_ci -p 5900:5900 -dit circleci/node:12-browsers

sudo docker cp features/localCI/. yoroi_ci:/CI
user=$(sudo docker exec -t yoroi_ci whoami | tr -d '\r')
sudo docker exec -u root -t yoroi_ci chown -R "$user:$user" /CI/
sudo docker exec -t yoroi_ci /bin/bash CI/create.sh
sudo docker exec -d yoroi_ci /bin/bash CI/connect.sh

