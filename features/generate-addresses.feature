Feature: Generate Addresses
  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Generate addresses"
    And There is a wallet stored
    And I go to the receive screen

  Scenario: Show my initial receive address
    Then I should see my latest address "Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod" at the top
    And I should see the addresses list them
    | address                                                     | index |
    | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod | 1     |

  Scenario: Generate a new receive address
    When I click on the Generate new address button
    Then I should see my latest address "Ae2tdPwUPEYyi3jN1dAR6CXbKY335oh8XxD6eLxqqaHMX8decXzuWDP91VX" at the top
    And I should see the addresses list them
    | address                                                     | index |
    | Ae2tdPwUPEYyi3jN1dAR6CXbKY335oh8XxD6eLxqqaHMX8decXzuWDP91VX | 1     |
    | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod | 2     |

  Scenario: Don't allow more than 20 unused address generation
    When I click on the Generate new address button 21 times
    Then I should see an error about max unused addresses

  Scenario: Hide used addresses
    When I click on the Generate new address button
    And I click on the Hide used addresses button
    Then I should see the addresses list them
    | address                                                     | index |
    | Ae2tdPwUPEYyi3jN1dAR6CXbKY335oh8XxD6eLxqqaHMX8decXzuWDP91VX | 1     |
    And I shouldn't see the address "Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod"
