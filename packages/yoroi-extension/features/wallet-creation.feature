Feature: Wallet creation

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    And There is no wallet stored
    Then I should see the Create wallet screen
    Then Revamp. I switch to revamp version
    When I click the create button

  @it-5 @create-wallet
  Scenario: (IT-5) Wallet creation
    Then I see Create Wallet warning step and continue
    Then I see Recovery Phrase step and remember it
    And I repeat the recovery phrase
    Then I enter wallet details:
    | walletName | password | repeatedPassword |
    | Created Wallet | asdfasdfasdf | asdfasdfasdf |
    And I click the "Create" button
    Then I should see the opened wallet with name "Created Wallet"

  @it-7 @create-wallet
  Scenario Outline: (IT-7) Wallet can't be created if its password doesn't meet complexity requirements
    Then I see Create Wallet warning step and continue
    Then I see Recovery Phrase step and remember it
    And I repeat the recovery phrase
    Then I enter wallet details:
    | walletName | password | repeatedPassword |
    | Created Wallet | <wrongPassword> | <wrongPassword> |
    Then I see the Create button is disabled
    And I should see the invalid password error message:
      | message                             |
      | global.errors.invalidWalletPassword |

    Examples:
      | wrongPassword |           |
      | Secre1        | too short |

  @it-9 @create-wallet
  Scenario: (IT-9) Wallet access after browser restart
    Then I see Create Wallet warning step and continue
    Then I see Recovery Phrase step and remember it
    And I repeat the recovery phrase
    Then I enter wallet details:
    | walletName | password | repeatedPassword |
    | Created Wallet | asdfasdfasdf | asdfasdfasdf |
    And I click the "Create" button
    Then I should see the opened wallet with name "Created Wallet"
    When I restart the browser
    Then I should see the opened wallet with name "Created Wallet"

  @it-16 @create-wallet
  Scenario Outline: (IT-16) Wallet can't be created if wallet name doesn't meet requirements
    Then I see Create Wallet warning step and continue
    Then I see Recovery Phrase step and remember it
    And I repeat the recovery phrase
    Then I enter wallet details:
    | walletName | password | repeatedPassword |
    | Created Wallet | asdfasdfasdf | asdfasdfasdf |
    And I clear the name "Created Wallet"
    Then I see the Create button is disabled
    And I enter the name "<invalidWalletName>"
    Then I see the Create button is disabled
    And I should see the invalid wallet name error message:
      | message                             |
      | global.errors.invalidWalletName     |

    Examples:
      | invalidWalletName                        |               |
      | qwertyuiopasdfghjklzxcvbnmzxcvbnmlkjhgfds|41 letters name|

  @it-24 @create-wallet
  Scenario: (IT-24) Wallet can't be created without entering password
    Then I see Create Wallet warning step and continue
    Then I see Recovery Phrase step and remember it
    And I repeat the recovery phrase
    Then I enter wallet details:
    | walletName | password | repeatedPassword |
    | Created Wallet | asdfasdfasdf | asdfasdfasdf |
    And I clear the created wallet password asdfasdfasdf
    Then I see the Create button is disabled
    And I should see the invalid password error message:
    | message                             |
    | global.errors.invalidWalletPassword |
    And I should see the invalid repeat password error message:
    | message                             |
    | global.errors.invalidRepeatPassword |