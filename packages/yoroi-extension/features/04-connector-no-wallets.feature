@dApp
Feature: dApp connector no wallets
  Background:
    Given I have opened the mock dApp

  @dApp-1010
  Scenario: dApp, no wallets, connecting wallet (DAPP-1010)
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I should see "No Cardano wallets is found" message
    When I press the "Create wallet" button (Connector pop-up window)
    Then The pop-up is closed and the extension tab is opened
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Then Revamp. I switch to revamp version
    Given There is a Shelley wallet stored named shelley-simple-15
    Given I switch back to the mock dApp
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed