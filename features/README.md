# Scenario Testing 

We use [Cucumber](https://cucumber.io/) to create scenarios and them run them using Selenium (Chrome Web driver)

These tests mock the `backend-service` by spinning up a server on localhost that answers to `backend-service` requests.
No other part of the application is mocked.

Initial data to perform the tests seed by a `JSON` file. 
Note: The JSON file is just miscellaneous faked data. It is
- Not a blockchain
- Not a valid state in Cardano
