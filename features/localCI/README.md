# Local CI

Sometimes it is useful and faster to simulate running our CI on your local machine. We do this by creating the same docker container that our CI uses and locally copying your code to the docker container.

### Updating an existing LocalCI

#### Starting existing image
1) Start the docker image with `docker start yoroi_ci`
1) Reconnect the image with `sudo docker exec -d yoroi_ci /bin/bash CI/connect.sh`

#### Using LocalCI

1) (ONLY FIRST TIME) `npm run localci:setup` to create the docker image.
1) `npm run localci:newbuild` whenever you make a code change
1) (MAC ONLY) `npm install` isn't compatible across operating systems so if you've run `npm install` on your host machine in the past, you you have to delete `node_modules` inside the docker image and re-run `npm install`.
1) `npm run localci:test` to run the test (ex: `npm run localci:test test:run:e2e:chrome`)

#### Updating image

You sometimes need to update your docker image (for example get the latest version of browsers). This requires you to delete your existing image and recreate a new one
1) `docker pull -a emurgornd/circleci-node-12-browsers`
1) `docker stop yoroi_ci`
1) `docker rm yoroi_ci`
1) See instructions for setting up LocalCI for the first time

### See LocalCI browser behavior using a virtual monitor

This localci also allows you to attach a monitor to your container to inspect visually why a test is failing. To do this, you need an application that can run a `VNC` connection. 

#### Ubuntu

If you are using Ubuntu, I suggest the following steps:
1) Run `Remmina` (comes preinstalled)
1) Set the protocol to `VNC`
1) Set `127.0.0.1` as the connection

#### Mac

1) Use Royal TSX with `VNC`
