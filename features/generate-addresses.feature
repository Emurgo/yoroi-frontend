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
    | Ae2tdPwUPEYyi3jN1dAR6CXbKY335oh8XxD6eLxqqaHMX8decXzuWDP91VX |        
    And I should see the addresses list them
    | address                                                     | index |
    | Ae2tdPwUPEYyi3jN1dAR6CXbKY335oh8XxD6eLxqqaHMX8decXzuWDP91VX | 1     |
    | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod | 2     |
