# Scenario Testing

We use [Cucumber](https://cucumber.io/) to create scenarios and them run them using Selenium (Chrome Web driver and Gecko Web Driver)

These tests mock the `backend-service` by spinning up a server on localhost that answers to `backend-service` requests.
No other part of the application is mocked.

Initial data to perform the tests seed by a `JSON` file.
Note: The JSON file is just miscellaneous faked data. It is
- Not a blockchain
- Not a valid state in Cardano

Each scenario is tagged with `@it-<number>` so that we can use run specific scenarios by their tags, such as `npm run test:run:tag:chrome @it-99`. To add new scenarios, pick unique numbers as tags. This command may suggest from which number to start: `grep -oh '@it-[0-9]*' features/*.feature | sort -Vr | head`.

## Reproducing CI builds

You can checkout [LocalCI](./localCI/README.md) for how to reproduce the CI's build

## Exporting a Yoroi snapshot

Yoroi snapshots are created by adding the step `I export a snapshot named SNAPSHOT_NAME` and running locally the scenario once. This creates the files `localStorage.json` and `indexedDB.json` in the folder `features/yoroi_snapshots/SNAPSHOT_NAME`. Then you can import the snapshot with the  step `I import a snapshot named SNAPSHOT_NAME`.
