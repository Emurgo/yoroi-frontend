Feature: Generate Addresses
  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Generate addresses"
    And There is a wallet stored named Test
    And I go to the receive screen

  @it-106
  Scenario: Latest address should be displayed at the top (IT-106)
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

  @it-34
  Scenario: Ensure every generated wallet address is unique (IT-34)
  When I click on the Generate new address button 20 times
  Then I see every generated address is unique

  @it-22
  Scenario: Ensure user can hide used Addresses under "Receive tab" (IT-22)
    When I click on the Generate new address button
    And I click on the Hide used addresses button
    Then I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZ6ydLWv4VPC1v7wuXeeWMFbDjTb3oHE2EuVojvoR7Vs1oQwDB |
    And I shouldn't see the address "Ae2tdPwUPEYvr4nYAWxbYB8P5vw1BXYKpit7eEWYwzn5zG59bPtjWSmPYWt"
