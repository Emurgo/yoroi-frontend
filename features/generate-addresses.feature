Feature: Generate Addresses
  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Generate addresses"
    And There is a wallet stored
    And I go to the receive screen

  Scenario: Show my initial receive address
    Then I should see my latest address "Ae2tdPwUPEYvr4nYAWxbYB8P5vw1BXYKpit7eEWYwzn5zG59bPtjWSmPYWt" at the top
    And I should see the addresses list them
    | address                                                     | index |
    | Ae2tdPwUPEYvr4nYAWxbYB8P5vw1BXYKpit7eEWYwzn5zG59bPtjWSmPYWt | 1     |

  Scenario: Generate a new receive address
    When I click on the Generate new address button
    Then I should see my latest address "Ae2tdPwUPEZ6ydLWv4VPC1v7wuXeeWMFbDjTb3oHE2EuVojvoR7Vs1oQwDB" at the top
    And I should see the addresses list them
    | address                                                     | index |
    | Ae2tdPwUPEZ6ydLWv4VPC1v7wuXeeWMFbDjTb3oHE2EuVojvoR7Vs1oQwDB | 1     |
    | Ae2tdPwUPEYvr4nYAWxbYB8P5vw1BXYKpit7eEWYwzn5zG59bPtjWSmPYWt | 2     |

  Scenario: Don't allow more than 20 unused address generation
    When I click on the Generate new address button 20 times
    And  I click on the Generate new address button
    Then I should see an error about max unused addresses

  Scenario: Hide used addresses
    When I click on the Generate new address button
    And I click on the Hide used addresses button
    Then I should see the addresses list them
    | address                                                     | index |
    | Ae2tdPwUPEZ6ydLWv4VPC1v7wuXeeWMFbDjTb3oHE2EuVojvoR7Vs1oQwDB | 1     |
    And I shouldn't see the address "Ae2tdPwUPEYvr4nYAWxbYB8P5vw1BXYKpit7eEWYwzn5zG59bPtjWSmPYWt"
