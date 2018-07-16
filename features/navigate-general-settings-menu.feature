Feature: General Settings

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup

  Scenario Outline: Navigating through General Settings secondary menu
    Given There is a default wallet stored
    And I am on the General Settings "<FROM>" screen
    When I click on secondary menu "<TO>" item
    Then I should see General Settings "<TO>" screen

    Examples:
    | FROM         | TO           |
    | general      | terms-of-use |
    | general      | support      |
    | general      | wallet       |
    | terms-of-use | general      |
    | terms-of-use | wallet       |
    | terms-of-use | support      |
    | support      | general      |
    | support      | wallet       |
    | support      | terms-of-use |
    | wallet       | general      |
    | wallet       | terms-of-use |
    | wallet       | support      |


  Scenario: Change language in General Settings
    Given There is a default wallet stored
    And I am on the General Settings "general" screen
    And I open General Settings language selection dropdown
    And I select Japanese language
    Then I should see Japanese language as selected

  Scenario: Users should not be able to navigate wallet settings if there isn't any created
    Given I am on the General Settings "general" screen
    When I click on secondary menu "wallet" item
    Then I should see General Settings "general" screen