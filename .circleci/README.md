# Build circleci-derivated docker images

Execute from git repo root:
```
docker build --target circleci-node-8-browsers emurgornd/circleci-node-8-browsers
docker build --target firefox-dev -t emurgornd/circleci-node-8-browsers:firefox-dev .
docker build --target brave -t emurgornd/circleci-node-8-browsers:brave .
```
