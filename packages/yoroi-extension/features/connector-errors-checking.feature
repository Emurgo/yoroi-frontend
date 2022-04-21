@dApp
Feature: dApp connector errors checking

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp

  @dApp-1003
  Scenario: dApp connecting wallet, wrong password -> correct password, request auth (DAPP-1003)
    And I request access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    When I enter the spending password wrongPassword and click confirm
    Then I see the error Incorrect wallet password
    When I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed

  @dApp-1004
  Scenario: dApp connecting wallet, back to wallets and cancel, request auth (DAPP-1004)
    And I request access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    When I enter the spending password wrongPassword and click confirm
    Then I see the error Incorrect wallet password
    When I click the back button (Connector pop-up window)
    And I should see the wallet's list
    Then I close the dApp-connector pop-up window
    And The user reject is received

  @dApp-1005
  Scenario: dApp, disconnect wallet, anonymous wallet (DAPP-1005)
    And I request anonymous access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    Then I disconnect the wallet shelley-simple-15 from the dApp localhost
    And I receive the wallet disconnection message

  @dApp-1006
  Scenario: dApp, disconnect wallet, authorised wallet (DAPP-1006)
    And I request access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    Then I disconnect the wallet shelley-simple-15 from the dApp localhost
    And I receive the wallet disconnection message