Feature: Txs History

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Transaction History"

  Scenario: Empty Txs History
    Given There is a wallet stored named empty-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 0
    And I go to Txs History tab
    And I should see no transactions

  Scenario: Simple Txs History
    Given There is a wallet stored named simple-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 3
    And I go to Txs History tab
    And I should see 2 pending transactions in simple-wallet
    And I should see 1 confirmed transactions in simple-wallet

  Scenario: Complex Txs History
    Given There is a wallet stored named complex-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 45
    And I go to Txs History tab
    And I should see 45 confirmed transactions in complex-wallet

  Scenario: Single Tx with big input
    Given There is a wallet stored named tx-big-input-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 1
    And I go to Txs History tab
    And I should see 1 confirmed transactions in tx-big-input-wallet

  # TODO: Make tests for existing / non-existing txs in lovefield db 
