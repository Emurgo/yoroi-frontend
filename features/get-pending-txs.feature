Feature: Get Pending Txs

  Scenario Outline: Get Pending Txs
    Given I am testing "Get Pending Txs"
    And I have opened the chrome extension
    And There is a wallet stored with <addressNumber> addresses starting with <addressPrefix>
    When I see the transactions summary
    Then I should see that the number of transactions is <txsNumber>
    And I go to Txs History tab
    And I should see the txs corresponding to prefix <addressPrefix>

  Examples: 
      | addressPrefix                                              | txsNumber | addressNumber |
      | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     3     |       25      |

# TODO: Tests for:
# - addresses: <20, >20 and <40, >40
# - txs pending: 1, 30
# - txs not pending: <20, >20 and <40, >40