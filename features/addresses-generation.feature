Feature: Generate Addresses
  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Generate addresses"
    And There is a wallet stored named Test
    And I go to the receive screen

  Scenario: Show my initial receive address
    Then I should see my latest address "Ae2tdPwUPEYvr4nYAWxbYB8P5vw1BXYKpit7eEWYwzn5zG59bPtjWSmPYWt" at the top
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEYvr4nYAWxbYB8P5vw1BXYKpit7eEWYwzn5zG59bPtjWSmPYWt |

  @it-17
  Scenario: Generate a new receive address (IT-17)
    When I click on the Generate new address button
    Then I should see my latest address "Ae2tdPwUPEZ6ydLWv4VPC1v7wuXeeWMFbDjTb3oHE2EuVojvoR7Vs1oQwDB" at the top
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZ6ydLWv4VPC1v7wuXeeWMFbDjTb3oHE2EuVojvoR7Vs1oQwDB |
    | Ae2tdPwUPEYvr4nYAWxbYB8P5vw1BXYKpit7eEWYwzn5zG59bPtjWSmPYWt |

  @it-49
  Scenario: User can't create more than 20 consecutive unused addresses (IT-49)
    When I click on the Generate new address button 20 times
    And  I click on the Generate new address button
    Then I should see an error about max unused addresses

  @it-22
  Scenario: Ensure user can hide used Addresses under "Receive tab" (IT-22)
    When I click on the Generate new address button
    And I click on the Hide used addresses button
    Then I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZ6ydLWv4VPC1v7wuXeeWMFbDjTb3oHE2EuVojvoR7Vs1oQwDB |
    And I shouldn't see the address "Ae2tdPwUPEYvr4nYAWxbYB8P5vw1BXYKpit7eEWYwzn5zG59bPtjWSmPYWt"
