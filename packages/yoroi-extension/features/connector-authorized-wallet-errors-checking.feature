@dApp
Feature: dApp connector errors checking

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab

  @dApp-1006
  Scenario: dApp, authorised wallet, connecting wallet, wrong password -> correct password (DAPP-1006)
    When I request access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    When I enter the spending password wrongPassword and click confirm
    Then I see the error Incorrect wallet password
    When I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed

  @dApp-1007
  Scenario: dApp, authorised wallet, connecting wallet, back to wallets and close pop-up (DAPP-1007)
    When I request access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    When I enter the spending password wrongPassword and click confirm
    Then I see the error Incorrect wallet password
    When I click the back button (Connector pop-up window)
    And I should see the wallet's list
    Then I close the dApp-connector pop-up window
    And The user reject is received

  @dApp-1008
  Scenario: dApp, authorised wallet, signing transaction, close pop-up (DAPP-1008)
    When I request access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    Then I request signing the transaction:
      | amount | toAddress                                                                                               |
      | 3      | addr1q97xu8uvdgjpqum6sjv9vptzulkc53x7tk69vj2lynywxppq3e92djqml4tjxz2avcgem3u8z7r54yvysm20qasxx5gqyx8evw |
    Then I should see the connector popup
    Then I close the dApp-connector pop-up window
    And The user reject for signing is received

  @dApp-1009
  Scenario: dApp, authorised wallet, disconnect wallet (DAPP-1009)
    When I request access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    Then I disconnect the wallet shelley-simple-15 from the dApp localhost
    And I receive the wallet disconnection message

  @dApp-1014
  Scenario: dApp, authorised wallet, signing transaction, cancel signing (DAPP-1014)
    When I request access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    Then I request signing the transaction:
      | amount | toAddress                                                                                               |
      | 3      | addr1q97xu8uvdgjpqum6sjv9vptzulkc53x7tk69vj2lynywxppq3e92djqml4tjxz2avcgem3u8z7r54yvysm20qasxx5gqyx8evw |
    Then I should see the connector popup
    Then I cancel signing the transaction
    And The user reject for signing is received