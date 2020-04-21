Feature: Main UI

  Background:
    Given I have opened the extension

  @it-81
  Scenario: Restore wallet and get balance with many addresses (IT-81)
    Given I have completed the basic setup
    And There is a wallet stored named many-tx-wallet
    Then I should see the balance number "3.110005 ADA"

  @it-15
  Scenario: Main Screen Tabs Switching (IT-15)
    Given I have completed the basic setup
    When There is a wallet stored named empty-wallet
    And I go to the send transaction screen
    Then I should see send transaction screen
    When I go to the receive screen
    Then I should see the Receive screen
    When I go to the transaction history screen
    Then I should see the transactions screen

  @it-21
  Scenario: Yoroi Wallet "Home Button" Test (IT-21)
    Given I have completed the basic setup
    When There is a wallet stored named empty-wallet
    And I am on the transfer start screen
    And I go to the main screen
    Then I should see the transactions screen
    When I navigate to the general settings screen
    And I go to the main screen
    Then I should see the transactions screen

  @it-25
  Scenario: Ensure user can copy Wallet address to Windows clipboard via "Copy address" buttons (IT-25)
    Given I have completed the basic setup
    When There is a wallet stored named empty-wallet
    When I go to the receive screen
    Then I should see the Receive screen
    When I click on "copy to clipboard" button
    Then I should see "copied" tooltip message:
    | message                                            |
    | global.copyTooltipMessage |

  @serverDown @it-31
  Scenario: The networkError banner must be displayed if the server is not reachable (IT-31)
  Then I should see the networkError banner

  @serverMaintenance @it-32
  Scenario: The serverError banner must be displayed for as long as the server reports an issue (IT-32)
  Then I should see the serverError banner

  @appMaintenance @it-118
  Scenario: The maintenance page must be shown is app in maintenance (IT-118)
  Then I should see the app maintenance page

  @it-110
  Scenario: Ensure user can hide balance (IT-110)
    Given I have completed the basic setup
    And There is a wallet stored named many-tx-wallet
    And I click on hide balance button
    Then I should see my balance hidden
    When I refresh the page
    Then I should see my balance hidden
    When I click on hide balance button
    Then I should see the balance number "3.110005 ADA"
