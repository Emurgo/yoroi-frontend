# Build 

## Build source container

Execute from git repo root:

```
docker build -t emurgo/yoroi-frontend-src:latest -f Dockerfile.src .
```

## Build development environment

Execute from git repo root:

```
docker build --target yoroi -t emurgo/yoroi-frontend .
```

# Build standalone-chrome container

Execute from git repo root:

```
docker build \
  --build-arg=$(date +%s) \
  --target yoroi-standalone-chrome-mainnet \
  -t emurgo/yoroi-standalone-chrome:mainnet .
```

# Run

## Run confined-chrome

Replace *DATA_DIR* with your secure location and don't use this browser to navigate :)

```
DATA_DIR=/mnt/supersecure-encrypted-usbdrive
docker run -it --rm \
  --cap-add=ALL \
  --net host --cpuset-cpus 0 \
  -e DEVELOPER_USER=$(basename $HOME) \
  -e DISPLAY=unix$DISPLAY \
  -v $HOME/Downloads:/home/$(basename $HOME)/Downloads \
  -v $DATA_DIR/yoroi-chrome/:/data \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -v /dev/shm:/dev/shm \
  --device /dev/snd \
  --device /dev/dri \
  --name yoroi \
  emurgo/yoroi-standalone-chrome:mainnet
```

## Run development environment

Execute from git repo root:

```
docker run --rm -it \
  -e DEVELOPER_USER=$(basename $HOME) \
  -e HOST_UID=$(id -u) \
  -e HOST_GID=$(id -g) \
  -v $PWD:/host-src \
  -w /host-src \
  -e HOST=0.0.0.0 \
  -p 3000:3000 \
  emurgo/yoroi-frontend:latest
```

You will enter in a shell inside the container and can start the app with:

```
npm run dev
```

Then you can edit the source from outside the container with your IDE of choice.
