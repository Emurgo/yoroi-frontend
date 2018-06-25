Feature: Wallet Settings

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Wallet Settings Screen"
    And There is a wallet stored named Test

#  Scenario: User sets Wallet password
#    Given I am on the "first" wallet "settings" screen
#    And I click on the "create" password label
#    And I should see the "create" wallet password dialog
#    And I enter wallet password:
#    | password  | repeatedPassword |
#    | Secret123 | Secret123        |
#    And I submit the wallet password dialog
#    Then I should see "change" label in password field
#
#  Scenario: User tries to set Wallet password with invalid password format
#    Given I am on the "first" wallet "settings" screen
#    And I click on the "create" password label
#    And I should see the "create" wallet password dialog
#    And I enter wallet password:
#    | password | repeatedPassword |
#    | secret   | secret           |
#    And I submit the wallet password dialog
#    Then I should see the following error messages:
#    | message                             |
#    | global.errors.invalidWalletPassword |
#
#  Scenario: User changes Wallet password
#    Given I am on the "second" wallet "settings" screen
#    And I click on the "change" password label
#    And I should see the "change" wallet password dialog
#    And I change wallet password:
#    | currentPassword | password     | repeatedPassword |
#    | Secret123       | newSecret123 | newSecret123     |
#    And I submit the wallet password dialog
#    Then I should not see the change password dialog anymore
#
  Scenario: User renames Wallet
    Given I am on the wallet "settings" screen
    And I click on "name" input field
    And I enter new wallet name:
    | name         |
    | first Edited |
    And I click outside "name" input field
    Then I should see new wallet name "first Edited"
