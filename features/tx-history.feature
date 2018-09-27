Feature: Txs History

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Transaction History"

  @it-101
  Scenario: Open the tx history of an empty wallet (IT-101)
    Given There is a wallet stored named empty-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 0
    And I should see no transactions

  @it-102
  Scenario: Open the tx history of a simple wallet (IT-102)
    And There is a wallet stored named simple-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 3
    And I should see 2 pending transactions in simple-wallet
    And I should see 1 confirmed transactions in simple-wallet

  @it-103 @it-56
  Scenario: Open the tx history of a complex wallet (IT-103)
    Given There is a wallet stored named complex-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 45
    And I should see 45 confirmed transactions in complex-wallet

  @it-66
  Scenario: Ensure that "Number of transactions" message is correspond to the actual number of transactions (IT-66)
    Given There is a wallet stored named complex-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 45
    And I should see 45 transactions in complex-wallet

  @it-104
  Scenario: Open the tx history of a wallet with a big input tx (IT-104)
    Given There is a wallet stored named tx-big-input-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 1
    And I should see 1 confirmed transactions in tx-big-input-wallet

  @it-105
  Scenario: Open the tx history of an already loaded wallet (IT-105)
    Given There are transactions already stored
    And There is a wallet stored named simple-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 3
    And I should see 2 pending transactions in simple-wallet
    And I should see 1 confirmed transactions in simple-wallet
