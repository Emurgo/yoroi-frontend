# Scenario Testing

We use [Cucumber](https://cucumber.io/) to create scenarios and them run them using Selenium (Chrome Web driver and Gecko Web Driver)

These tests mock the `backend-service` by spinning up a server on localhost that answers to `backend-service` requests.
No other part of the application is mocked.

Initial data to perform the tests seed by a `JSON` file.
Note: The JSON file is just miscellaneous faked data. It is
- Not a blockchain
- Not a valid state in Cardano

## Local CI

Sometimes it is useful and faster to simulate running our CI on your local machine. We do this by creating the same docker container that our CI uses and locally copying your code to the docker container.

1) If this is your first time using localci,
use `npm run localci-setup` to create the docker image.
Otherwise, start the existing image and use `sudo docker exec -d yoroi_ci /bin/bash CI/connect.sh`
1) `npm run localci-newbuild` whenever you make a code change
1) `npm run localci-test` to run the test (ex: `npm run localci-test test-e2e`)

This localci also allows you to attach a monitor to your container to inspect visually why a test is failing. To do this, you need an application that can run a `VNC` connection. If you are using Ubuntu, I suggest the following steps:
1) Run `Remmina` (comes preinstalled)
1) Set the protocol to `VNC`
1) Set `127.0.0.1` as the connection
