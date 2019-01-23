#!/bin/bash

echo "copying folder to docker..."
sudo docker cp . yoroi_ci:/yoroi
echo "done copying"
user=$(sudo docker exec -t yoroi_ci whoami | tr -d '\r')
sudo docker exec -u root -t yoroi_ci chown -R "$user:$user" /CI

echo "start post-copy build"
sudo docker exec -u root -t yoroi_ci /bin/bash CI/post_copy.sh
