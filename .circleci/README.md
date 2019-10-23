# Build circleci-derivated docker images

Execute from `.circleci` repo dir:
```
# This one is the generic one inherited as it is (by the moment) from CircleCI
docker build --target circleci-node-12-browsers -t emurgornd/circleci-node-12-browsers:latest .
docker build --target firefox-dev -t emurgornd/circleci-node-12-browsers:firefox-dev .
docker build --target brave -t emurgornd/circleci-node-12-browsers:brave .
```

Images push snippet:
```
for tag in latest brave firefox-dev
do
  docker push emurgornd/circleci-node-12-browsers:${tag}
done
```
