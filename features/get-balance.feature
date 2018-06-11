Feature: Get balance

  Background:
    Given I have opened the chrome extension
    And There is no wallet stored
  Scenario: Get balance
    Given There is a wallet stored
    And I should see the opened wallet