Feature: Get Pending Txs

  Scenario Outline: Get Pending Txs
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Get Pending Txs"
    And There is a wallet stored with <totalAddresses> addresses with the name <walletName> 
    When I see the transactions summary
    Then I should see that the number of transactions is <txsNumber>
    And I go to Txs History tab
    And I should see the txs corresponding to the wallet with the name <walletName>

  Examples: 
      | walletName | txsNumber | totalAddresses |
      | Wallet-1   |     0     |       10       |
      | Wallet-1   |     1     |       25       |
      | Wallet-2   |     3     |       25       |
      | Wallet-3   |     30    |       25       |
      | Wallet-4   |     45    |       25       |
      | Wallet-1   |     1     |       45       |
      | Wallet-2   |     3     |       45       |
      | Wallet-3   |     30    |       45       |
      | Wallet-4   |     45    |       45       |
