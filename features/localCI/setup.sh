#!/bin/bash

# install same base as our CI build
sudo docker run --name yoroi_ci -p 5900:5900 -dit rcmorano/circleci-node-8-browsers:firefox-nightly

sudo docker cp features/localCI/. yoroi_ci:/CI
user=$(sudo docker exec -t yoroi_ci whoami | tr -d '\r')
sudo docker exec -u root -t yoroi_ci chown -R "$user:$user" /CI/
sudo docker exec -t yoroi_ci /bin/bash CI/create.sh
sudo docker exec -d yoroi_ci /bin/bash CI/connect.sh

