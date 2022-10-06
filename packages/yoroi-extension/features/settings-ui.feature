Feature: Wallet UI Settings

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-12
  Scenario Outline: User can't change password if it doesn't meet complexity requirements (IT-12)
    And There is a Byron wallet stored named empty-wallet
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password     | repeatedPassword   |
    | <currentPassword>  | <password>   | <repeatedPassword> |
    Then I see the submit button is disabled
    And I should see the following error messages:
    | message                             |
    | global.errors.invalidWalletPassword |

    Examples:
    | currentPassword | password    | repeatedPassword |
    | asdfasdfasdf    | Secre1      | Secre1           |

  @it-94
  Scenario Outline: User is able to change spending password (IT-94)
    And There is a Byron wallet stored named tx-big-input-wallet
    And I have a wallet with funds
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password     | repeatedPassword |
    | asdfasdfasdf         | newSecret123 | newSecret123     |
    And I submit the wallet password dialog
    Then I should not see the change password dialog anymore

    When I navigate to wallet sidebar category
    And I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | <amount> |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | newSecret123 |
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

    Examples:
    | amount              | fee       |
    | 1.000000            | 0.168801  |
  
  @it-91
  Scenario Outline: Password should be case-sensitive [Wallet password changing] (IT-91)
    And There is a Byron wallet stored named empty-wallet
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password  | repeatedPassword      |
    | <currentPassword>  | <password>| <repeatedPassword>    |
    And I submit the wallet password dialog
    Then I should see the following submit error messages:
    | message                           |
    | <errorMessage> |
  Examples:
  | currentPassword | password         |repeatedPassword |errorMessage|
  | aaSecreT_123      | ValidPassword123 |ValidPassword123 |api.errors.IncorrectPasswordError|
  | aaseCReT_123      | ValidPassword123 |ValidPassword123 |api.errors.IncorrectPasswordError|
  | aaSEcRET_123      | ValidPassword123 |ValidPassword123 |api.errors.IncorrectPasswordError|

  
  @it-8
  Scenario Outline: Wallet renaming (IT-8)
    And There is a Byron wallet stored named empty-wallet
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on "name" input field
    And I enter new wallet name:
    | name         |
    | <walletName> |
    And I click outside "name" input field
    And I navigate to wallet sidebar category
    Then I should see new wallet name "<walletName>"
    Examples:
    | walletName                               |                      |
    | first Edited                             | 2 words name         |
    | ウォレットの追加                            | Japanese             |
    | 지갑 추가                                  | Korean               |
    | НАСТРОЙКИ                                | Russian              |
    | a                                        | 1-characters length  |
    | asdfghjklpoiuytrewqazxcvbnmlkjhgfdsaqwer | 40 characters length |

  @it-41
  Scenario Outline: Wallet can't be renamed if new wallet name doesn't meet requirements (IT-41)
    And There is a Byron wallet stored named empty-wallet
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on "name" input field
    And I enter new wallet name:
    | name         |
    | <walletName> |
    And I click outside "name" input field
    Then I should see "Wallet name requires at least 1 and at most 40 letters." error message:
    | message                             |
    | global.errors.invalidWalletName     |

    Examples:
    | walletName                                | |
    | asdfghjklpoiuytrewqazxcvbnmlkjhgfdsaqwerd |41 characters length |

  @it-14
  Scenario: User can't change the password without entering old password (IT-14)
    And There is a Byron wallet stored named empty-wallet
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password     | repeatedPassword |
    | asdfasdfasdf         | newSecret123 | newSecret123     |
    And I clear the current wallet password asdfasdfasdf
    And I submit the wallet password dialog
    Then I should see "Incorrect wallet password." error message

  @it-40
  Scenario: User can't change password without filling Password repeat field (IT-40)
    And There is a Byron wallet stored named empty-wallet
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password     | repeatedPassword |
    | aaSecret_123         | newSecret123 | newSecret123     |
    And I clear the current wallet repeat password newSecret123 
    Then I see the submit button is disabled
    And I should stay in the change password dialog
    And I should see "Doesn't match" error message:
    | message                             |
    | global.errors.invalidRepeatPassword |

  @it-2
  Scenario: Change language in General Settings (IT-2)
    When I navigate to the general settings screen
    And I open General Settings language selection dropdown
    And I select Japanese language
    Then The Japanese language should be selected
    When I refresh the page
    Then The Japanese language should be selected

  @it-3
  Scenario: Yoroi Settings Screen / Terms of Use in Default English(IT-3)
    And I navigate to the general settings screen
    And I click on secondary menu "Terms of use" item
    Then I should see the "Terms of use" screen

  @it-23
  Scenario: Wallet settings tab isn't active if wallet is not created (IT-23)
    When There is no wallet stored
    And I navigate to the general settings screen
    Then I click on secondary menu "wallet" item
    Then I should see a no wallet message

  @it-4
  Scenario: Yoroi Settings Screen / Support (IT-4)
    And I navigate to the general settings screen
    And I click on secondary menu "support" item
    Then I should see support screen

  @it-125
  Scenario: Switch complexity levels (IT-125)
    And I navigate to the general settings screen
    And I click on secondary menu "levelOfComplexity" item
    Then The selected level is "SIMPLE"
    Then I select the most complex level
    Then The selected level is "ADVANCED" 

  @it-126
  Scenario: Yoroi Settings Screen / Blockchain (IT-126)
    And There is a Byron wallet stored named empty-wallet
    And I navigate to the general settings screen
    And I click on secondary menu "blockchain" item
    Then I should see blockchain screen

  @it-172
  Scenario: User is to export their wallet key (IT-172)
    Given There is a Byron wallet stored named simple-pending-wallet
    Then I see the transactions summary
    And I should see that the number of transactions is 3
    Then I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    When I click on export wallet
    Then I should see the wallet export for key "6951f47ec8272208e970de38c55c0098d064ee3eb0161e769e61166ac72b029cef0caf73f59803dd7e9b187274da2933d1e0f0613eff3ac571003816bfb5eccb"
