Feature: Update Txs History

  Scenario Outline: Update Txs History
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Update transaction history"
    And There is a wallet stored with <addressNumber> addresses starting with <addressPrefix>
    When I see the transactions summary
    Then I should see that the number of transactions is <txsNumber>
    And I go to Txs History tab
    And I should see the txs corresponding to prefix <addressPrefix>

  Examples: 
      | addressPrefix                                              | txsNumber | addressNumber |
      | DFvfedPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oREqkSzxo |     0     |       10      |
      | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     0     |       10      |
      | C19iTPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     0     |       10      |
      | B1sy6PwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     0     |       10      |
      | DFvfedPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oREqkSzxo |     1     |       25      |
      | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     3     |       25      |
      | C19iTPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     30    |       25      |
      | B1sy6PwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     45    |       25      |
      | DFvfedPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oREqkSzxo |     1     |       45      |
      | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     3     |       45      |
      | C19iTPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     30    |       45      |
      | B1sy6PwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo |     45    |       45      |
      | EFvfedPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oREqkSzxo |     1     |       1       |

  # TODO: Make tests for existing / non-existing txs in lovefield db 
