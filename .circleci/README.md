# Build circleci-derivated docker images

Execute from git repo root:
```
docker build --target firefox-nightly -t rcmorano/circleci-node-8-browsers:firefox-nightly .
docker build --target brave -t rcmorano/circleci-node-8-browsers:brave .
```
