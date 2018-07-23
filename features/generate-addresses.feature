Feature: Generate Addresses
  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Generate addresses"
    And There is a wallet stored
    And I go to the receive screen

  Scenario: Show my initial receive address
    Then I should see my latest address "Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod" at the top
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod |

  Scenario: Generate a new receive address
    When I click on the Generate new address button
    Then I should see my latest address "Ae2tdPwUPEYyi3jN1dAR6CXbKY335oh8XxD6eLxqqaHMX8decXzuWDP91VX" at the top
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEYyi3jN1dAR6CXbKY335oh8XxD6eLxqqaHMX8decXzuWDP91VX |
    | Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod |

  Scenario: Don't allow more than 20 unused address generation
    When I click on the Generate new address button 20 times
    And  I click on the Generate new address button
    Then I should see an error about max unused addresses

  Scenario: Hide used addresses
    When I click on the Generate new address button
    And I click on the Hide used addresses button
    Then I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEYyi3jN1dAR6CXbKY335oh8XxD6eLxqqaHMX8decXzuWDP91VX |
    And I shouldn't see the address "Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxod"
