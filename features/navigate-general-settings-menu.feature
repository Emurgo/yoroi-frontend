Feature: General Settings

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "General Settings"

  Scenario: Change language in General Settings
    Given There is a wallet stored named Test
    When I navigate to the general settings screen
    And I open General Settings language selection dropdown
    And I select Japanese language
    Then I should see Japanese language as selected

  Scenario: Users should not be able to navigate wallet settings if there isn't any created
    Given There is no wallet stored
    When I navigate to the general settings screen
    Then I should see secondary menu "wallet" item disabled
