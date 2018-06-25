Feature: Generate Addresses
  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Generate addresses"
    And There is a wallet stored

  Scenario: Show my initial receive address
    When I go to the receive screen
    Then I should see my latest address at the top
    | latestAddress                                               |
    | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod |
    And I should see the addresses list them
    | address                                                     | index |
    | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod | 1     |

  Scenario: Generate a new receive address
    When I go to the receive screen
    And I click on the Generate new address button
    Then I should see my latest address at the top
    | latestAddress                                               |
    | Ae2tdPwUPEZ3vu63a1tJVMghcbu5CWSrybC2pzwzh6dvPx7uxngY36LQnVk |        
    And I should see the addresses list them
    | address                                                     | index |
    | Ae2tdPwUPEZ3vu63a1tJVMghcbu5CWSrybC2pzwzh6dvPx7uxngY36LQnVk | 1     |
    | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod | 2     |
