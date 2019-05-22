# Build circleci-derivated docker images

Execute from git repo root:
```
docker build --target firefox-updated -t emurgornd/circleci-node-8-browsers:firefox-updated .
docker build --target brave -t emurgornd/circleci-node-8-browsers:brave .
```
