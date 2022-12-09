@dApp
Feature: dApp connector data signing

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab

  @dApp-1019
  Scenario: dApp, anonymous wallet, unused address, sign Cardano data (DAPP-1019)
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request unused addresses
    And I request signing the data:
    | payload   |
    | sign data anonymous wallet |
    Then I should see the connector popup for signing data
    And I should see the data to sign:
    | payload   |
    | sign data anonymous wallet |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed

  @dApp-1020
  Scenario: dApp, anonymous wallet, used address, sign Cardano data (DAPP-1020)
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request used addresses
    And I request signing the data:
    | payload   |
    | sign data anonymous wallet |
    Then I should see the connector popup for signing data
    And I should see the data to sign:
    | payload   |
    | sign data anonymous wallet |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed

  @dApp-1021
  Scenario: dApp, authorised wallet, unused address, sign Cardano data (DAPP-1021)
    And I request access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request unused addresses
    Then I request signing the data:
    | payload   |
    | sign data authorized wallet |
    Then I should see the connector popup for signing data
    And I should see the data to sign:
    | payload   |
    | sign data authorized wallet |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed

  @dApp-1022
  Scenario: dApp, authorised wallet, used address, sign Cardano data (DAPP-1022)
    And I request access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request used addresses
    Then I request signing the data:
    | payload   |
    | sign data authorized wallet |
    Then I should see the connector popup for signing data
    And I should see the data to sign:
    | payload   |
    | sign data authorized wallet |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed