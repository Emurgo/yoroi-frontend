Feature: Wallet creation

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And There is no wallet stored

  @it-5
  Scenario:  Wallet creation (IT-5)
    When I click the create button
    And I enter the name "Created Wallet"
    And I enter the created wallet password:
    | password   | repeatedPassword  |
    | Secret_123 | Secret_123        |
    And I click the "Create personal wallet" button
    And I accept the creation terms
    And I copy and enter the displayed mnemonic phrase
    Then I should see the opened wallet with name "Created Wallet"

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

  @it-16
  Scenario Outline: Wallet can't be created if wallet name doesn't meet requirements (IT-16) test
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
    And I should see "Wallet name requires at least 3 and at most 40 letters." error message on Wallet creation pop up


    Examples:
    | invalidWalletName                        | 
    | ab                                       |
    | qwertyuiopasdfghjklzxcvbnmzxcvbnmlkjhgfds|