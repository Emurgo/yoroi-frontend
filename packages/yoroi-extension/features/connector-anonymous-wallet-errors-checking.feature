@dApp
Feature: dApp connector anonymous wallet errors checking

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab

  @dApp-1003
  Scenario: dApp, anonymous wallet, connecting wallet, close pop-up (DAPP-1003)
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    Then I close the dApp-connector pop-up window
    And The user reject is received

  @dApp-1004
  Scenario: dApp, anonymous wallet, signing transaction, close pop-up (DAPP-1004)
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    Then I request signing the transaction:
      | amount | toAddress                                                                                               |
      | 3      | addr1q97xu8uvdgjpqum6sjv9vptzulkc53x7tk69vj2lynywxppq3e92djqml4tjxz2avcgem3u8z7r54yvysm20qasxx5gqyx8evw |
    Then I should see the connector popup for signing
    Then I close the dApp-connector pop-up window
    And The user reject for signing is received

  @dApp-1005
  Scenario: dApp, anonymous wallet, disconnect wallet (DAPP-1005)
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    Then I disconnect the wallet shelley-simple-15 from the dApp localhost
    And I receive the wallet disconnection message

  @dApp-1013
  Scenario: dApp, anonymous wallet, signing transaction, cancel signing (DAPP-1013)
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    Then I request signing the transaction:
      | amount | toAddress                                                                                               |
      | 3      | addr1q97xu8uvdgjpqum6sjv9vptzulkc53x7tk69vj2lynywxppq3e92djqml4tjxz2avcgem3u8z7r54yvysm20qasxx5gqyx8evw |
    Then I should see the connector popup for signing
    Then I cancel signing the transaction
    And The user reject for signing is received
  
  @dApp-1015
  Scenario: dApp, anonymous wallet, signing data, cancel signing
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I request signing the data:
    | payload   |
    | sign data anonymous wallet |
    Then I should see the connector popup for signing data
    Then I cancel signing the transaction
    And The user reject for signing data is received