Feature: Wallet creation

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And There is no wallet stored

  @it-5
  Scenario: Wallet creation (IT-5)
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password   | repeatedPassword  |
    | Secret_123 | Secret_123        |
    And I click the "Create personal wallet" button
    And I accept the creation terms
    And I copy and enter the displayed mnemonic phrase
    Then I should see the opened wallet with name "Created Wallet"

  @it-9
  Scenario: Wallet access after Chrome restart (IT-9)
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password   | repeatedPassword  |
    | Secret_123 | Secret_123        |
    And I click the "Create personal wallet" button
    And I accept the creation terms
    And I copy and enter the displayed mnemonic phrase
    Then I should see the opened wallet with name "Created Wallet"
    When I restart the browser
    Then I should see the opened wallet with name "Created Wallet"

  @it-18
  Scenario: Mnemonic words can be cleared by clicking "Clear button" on wallet creation screen (IT-18)
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password   | repeatedPassword  |
    | Secret_123 | Secret_123        |
    And I click the "Create personal wallet" button
    And I accept the creation terms
    And I enter random mnemonic phrase
    And I click Clear button
    Then I see All selected words are cleared

  @it-24
  Scenario: Wallet can't be created without entering password (IT-24)
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password   | repeatedPassword  |
    | Secret_123 | Secret_123        |
    And I clear the created wallet password Secret_123
    And I click the "Create personal wallet" button
    Then I should stay in the create wallet dialog

  @it-27
   Scenario: Users will be presented with a security warning prior to seed creation (IT-27)
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password   | repeatedPassword  |
    | Secret_123 | Secret_123        |
    And I click the "Create personal wallet" button
    Then I see the security warning prior:
    | message                             |
    | wallet.backup.privacy.warning.dialog.checkbox.label.nobodyWatching   |

  @it-16
  Scenario Outline: Wallet can't be created if wallet name doesn't meet requirements (IT-16)
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password   | repeatedPassword  |
    | Secret_123 | Secret_123        |
    And I clear the name "Created Wallet"
    And I click the "Create personal wallet" button
    Then I should stay in the create wallet dialog

    And I enter the name "<invalidWalletName>"
    And I click the "Create personal wallet" button
    Then I should stay in the create wallet dialog
    And I should see "Wallet name requires at least 1 and at most 40 letters." error message:
    | message                             |
    | global.errors.invalidWalletName     |
    Examples:
    | invalidWalletName                        |               |
    | qwertyuiopasdfghjklzxcvbnmzxcvbnmlkjhgfds|41 letters name| 

  @it-7
  Scenario Outline: Wallet can't be created if its password doesn't meet complexity requirements (IT-7)
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password        | repeatedPassword  |
    | <wrongPassword> | <wrongPassword>   |
    And I click the "Create personal wallet" button
    Then I should see "Invalid Password" error message:
    | message                             |
    | global.errors.invalidWalletPassword |
  Examples:
  | wrongPassword |                         |
  | secret_123  | without upper case letters|
  | SECRET_123  | without lower case letters|
  | Secre1      | too short                 |
  | SecretSecret| without numbers           |