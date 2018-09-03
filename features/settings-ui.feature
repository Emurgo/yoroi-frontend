Feature: Wallet UI Settings

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup

  @it-12
  Scenario Outline: User can't change password if it doesn't meet complexity requirements (IT-12)
    When I am testing "Wallet Settings Screen"
    And There is a wallet stored named Test
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password     | repeatedPassword   |
    | <currentPassword>  | <password>   | <repeatedPassword> |
    And I submit the wallet password dialog
    Then I should see the following error messages:
    | message                             |
    | global.errors.invalidWalletPassword |
  Examples:
  | currentPassword | password    | repeatedPassword |
  | Secret_123      | secret      | secret           |  
  | Secret_123      | secret123   | secret123        |  
  | Secret_123      | secretSecReT| secretSecReT     | 
  | Secret_123      | SECRET1234T | SECRET1234T      | 

@it-94
  Scenario Outline: User is able to change spending password (IT-94)
    When I am testing "Send transaction"
    And There is a wallet stored named Test
    And I have a wallet with funds
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password     | repeatedPassword |
    | Secret_123         | newSecret123 | newSecret123     |
    And I submit the wallet password dialog
    Then I should not see the change password dialog anymore

    When I navigate to wallet transactions screen
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
    Then I should see the summary screen

        Examples:
      | amount              | fee       | |
      | 0.001000            | 0.167950  | # Sent tx to a valid adress|
  
  @it-91
  Scenario Outline: Password should be case-sensitive [Wallet password changing] (IT-91)
    When I am testing "Wallet Settings Screen"
    And There is a wallet stored named Test
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
    | api.errors.IncorrectPasswordError |
  Examples:
  | currentPassword | password         |repeatedPassword |errorMessage|
  | SecreT_123      | ValidPassword123 |ValidPassword123 |api.errors.IncorrectPasswordError|
  | seCReT_123      | ValidPassword123 |ValidPassword123 |api.errors.IncorrectPasswordError|
  | SEcRET_123      | ValidPassword123 |ValidPassword123 |api.errors.IncorrectPasswordError|

  
  @it-8
  Scenario Outline: Wallet renaming (IT-8)
    When I am testing "Wallet Settings Screen"
    And There is a wallet stored named Test
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on "name" input field
    And I enter new wallet name:
    | name         |
    | <walletName> |
    And I click outside "name" input field
    And I navigate to wallet transactions screen
    Then I should see new wallet name "<walletName>"
    Examples:
    | walletName    |
    | first Edited  | 
    |ウォレットの追加  |
    |지갑 추가      |
    |НАСТРОЙКИ      | 

  @it-14
  Scenario: User can't change the password without entering old password (IT-14)
    When I am testing "Wallet Settings Screen"
    And There is a wallet stored named Test
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password     | repeatedPassword |
    | Secret_123         | newSecret123 | newSecret123     |
    And I clear the current wallet password Secret_123
    And I submit the wallet password dialog
    Then I should stay in the change password dialog

  @it-2
  Scenario: Change language in General Settings (IT-2)
    Given I am testing "General Settings"
    When There is a wallet stored named Test
    When I navigate to the general settings screen
    And I open General Settings language selection dropdown
    And I select Japanese language
    Then I should see Japanese language as selected
    When I refresh the page
    Then I should see Japanese language as selected

  @it-3
  Scenario: Yoroi Settings Screen / Terms of Use in Default English(IT-3)
    When I am testing "Wallet Settings Screen"
    And I navigate to the general settings screen
    And I click on secondary menu "Terms of use" item
    Then I should see the "Terms of use" screen

  @it-23
  Scenario: Wallet settings tab isn't active if wallet is not created (IT-23)
    Given I am testing "General Settings"
    When There is no wallet stored
    And I navigate to the general settings screen
    Then I should see secondary menu "wallet" item disabled

  @it-4
  Scenario: Yoroi Settings Screen / Support (IT-4)
    When I am testing "Wallet Settings Screen"
    And There is a wallet stored named Test
    And I navigate to the general settings screen
    And I click on secondary menu "support" item
    Then I should see support screen