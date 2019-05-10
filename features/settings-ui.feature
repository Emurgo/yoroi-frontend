Feature: Wallet UI Settings

  Background:
    Given I have opened the extension
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
  | currentPassword | password    | repeatedPassword | |
  | aaSecret_123      | Secre1      | Secre1           | too short                 |

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
    | aaSecret_123         | newSecret123 | newSecret123     |
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
      | 0.001000            | 0.168082  | # Sent tx to a valid adress|
  
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
    | <errorMessage> |
  Examples:
  | currentPassword | password         |repeatedPassword |errorMessage|
  | aaSecreT_123      | ValidPassword123 |ValidPassword123 |api.errors.IncorrectPasswordError|
  | aaseCReT_123      | ValidPassword123 |ValidPassword123 |api.errors.IncorrectPasswordError|
  | aaSEcRET_123      | ValidPassword123 |ValidPassword123 |api.errors.IncorrectPasswordError|

  
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
    | walletName                               |                    |
    | first Edited                             |2 words name        | 
    |ウォレットの追加                             |Japanese            |
    |지갑 추가                                 | Korean             |
    |НАСТРОЙКИ                                 | Russian            |
    | a                                        |1-characters length |
    | asdfghjklpoiuytrewqazxcvbnmlkjhgfdsaqwer |40 characters length|

  @it-41
  Scenario Outline: Wallet can't be renamed if new wallet name doesn't meet requirements (IT-41)
    When I am testing "Wallet Settings Screen"
    And There is a wallet stored named Test
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
    When I am testing "Wallet Settings Screen"
    And There is a wallet stored named Test
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password     | repeatedPassword |
    | aaSecret_123         | newSecret123 | newSecret123     |
    And I clear the current wallet password aaSecret_123
    And I submit the wallet password dialog
    Then I should stay in the change password dialog

  @it-40
  Scenario: User can't change password without filling Password repeat field (IT-40)
    When I am testing "Wallet Settings Screen"
    And There is a wallet stored named Test
    And I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    And I click on the "change" password label
    And I should see the "change" wallet password dialog
    And I change wallet password:
    | currentPassword    | password     | repeatedPassword |
    | aaSecret_123         | newSecret123 | newSecret123     |
    And I clear the current wallet repeat password newSecret123 
    And I submit the wallet password dialog
    Then I should stay in the change password dialog
    And I should see "Doesn't match" error message:
    | message                             |
    | global.errors.invalidRepeatPassword |

  @it-2
  Scenario: Change language in General Settings (IT-2)
    Given I am testing "General Settings"
    When There is a wallet stored named Test
    When I navigate to the general settings screen
    And I open General Settings language selection dropdown
    And I select Japanese language
    Then The Japanese language should be selected
    When I refresh the page
    Then The Japanese language should be selected

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

  @it-10
  Scenario: Change theme in General Settings
    And I navigate to the general settings screen
    And I click on secondary menu "display" item
    And I select second theme
    Then I should see second theme as selected

  @it-77
  Scenario: Paper wallet creation (IT-77)
    And I navigate to the general settings screen
    Then I click on secondary menu "paperWallet" item
    Then I open Number of Adddresses selection dropdown
    And I select 2 addresses
    Then I click the create paper wallet button
    Then I enter the paper wallet password "cool password"
    And I repeat the wallet password "cool password"
    Then I press the next button
    # wait for paper wallet generation then go to next
    Then I press the next button
    And I enter the paper recovery phrase
    And I enter the paper wallet password "cool password"
    # swap addresses for UI testing
    Given I swap the paper wallet addresses
    Then I click then button labeled "Verify wallet"
    Then I should see two addresses displayed
    Then I press the next button