@dApp
Feature: dApp connector data signing

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab

  @dApp-sign
  Scenario: dApp, anonymous wallet, sign Cardano data
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request signing the data:
    | payload   |
    | sign data |
    Then I should see the connector popup for signing data
    And I should see the data to sign:
    | payload   |
    | sign data |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed