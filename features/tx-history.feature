Feature: Txs History

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-101
  Scenario: Open the tx history of an empty wallet (IT-101)
    Given There is a wallet stored named empty-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 0
    And I should see no transactions

  @it-102
  Scenario: Open the tx history of a simple wallet (IT-102)
    Given There is a wallet stored named simple-pending-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 3
    And I should see 2 pending transactions
    And I should see 1 successful transactions 

  @it-56
  Scenario: Check content of successful transaction (IT-56)
    Given There is a wallet stored named many-tx-wallet
    When I see the transactions summary
    # TODO: need to give time to address stores to update
    Given I sleep for 1500
    Then I verify top transaction content many-tx-wallet

  @it-57
  Scenario: Check content of pending transaction (IT-57)
    Given There is a wallet stored named simple-pending-wallet
    When I see the transactions summary
    # TODO: need to give time to address stores to update
    Given I sleep for 1500
    Then I verify top transaction content simple-pending-wallet

  @it-58
  Scenario: Check content of failed transaction (IT-58)
    Given There is a wallet stored named failed-single-tx
    When I see the transactions summary
    # TODO: need to give time to address stores to update
    Given I sleep for 1500
    Then I verify top transaction content failed-single-tx

  @it-103
  Scenario: Open the tx history of a complex wallet (IT-103)
    Given There is a wallet stored named many-tx-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 6
    And I should see 6 successful transactions

  @it-104
  Scenario: Open the tx history of a wallet with a big input tx (IT-104)
    Given There is a wallet stored named tx-big-input-wallet
    When I see the transactions summary
    Then I should see that the number of transactions is 1
    And I should see 1 successful transactions

  @it-105
  Scenario: Open the tx history of an already loaded wallet (IT-105)
    Given There is a wallet stored named simple-pending-wallet
    Given I see the transactions summary
    And I refresh the page
    Then I see the transactions summary
    And I should see that the number of transactions is 3

  @it-96
  Scenario: Tx from other client updates tx history (IT-96)
    Given There is a wallet stored named many-tx-wallet
    Given I see the transactions summary
    Then A successful tx gets sent from my wallet from another client
    Then I see the transactions summary
    And I should see that the number of transactions is 7
    Then I should see the balance number "2.290005 ADA"

  @it-121 @TestAssuranceChain
  Scenario: Number of confirmation increases overt time (IT-121)
    Given There is a wallet stored named small-single-tx
    Given I see the transactions summary
    Then I should see that the number of transactions is 1
    Then I expand the top transaction
    And The number of confirmations of the top tx is 199
    Then A successful tx gets sent from my wallet from another client
    Given I sleep for 500
    And The number of confirmations of the top tx is 201
