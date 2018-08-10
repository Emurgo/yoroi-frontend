Feature: Create wallet

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And There is no wallet stored

  Scenario: Successfully creating a wallet
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password   | repeatedPassword  |
    | Secret_123 | Secret_123        |
    And I click the "Create personal wallet" button
    And I accept the creation terms
    And I copy and enter the displayed mnemonic phrase
    Then I should see the opened wallet with name "Created Wallet"

  Scenario: Fail to create due to incomplete fields
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password   | repeatedPassword  |
    | Secret_123 | Secret_123        |
    And I clear the name "Created Wallet"
    And I clear the created wallet password Secret_123
    And I click the "Create personal wallet" button
    Then I should stay in the create wallet dialog