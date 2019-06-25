Feature: Main UI

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-81
  Scenario: Get balance with many addresses
    And There is a wallet stored named many-tx-wallet
    Then I should see the balance number "3.110004 ADA"

  @it-15
  Scenario: Main Screen Tabs Switching (IT-15)
    When There is a wallet stored named empty-wallet
    And I go to the send transaction screen
    Then I should see send transaction screen
    When I go to the receive screen
    Then I should see the Receive screen
    When I go to the transaction history screen
    Then I should see the transactions screen

  @it-21
  Scenario: Yoroi Wallet "Home Button" Test (IT-21)
  When There is a wallet stored named empty-wallet
    And I am on the Daedalus Transfer instructions screen
    And I go to the main screen
    Then I should see the transactions screen
    When I navigate to the general settings screen
    And I go to the main screen
    Then I should see the transactions screen

  @it-25
  Scenario: Ensure user can copy Wallet address to Windows clipboard via "Copy address" buttons (IT-25)
    When There is a wallet stored named empty-wallet
    When I go to the receive screen
    Then I should see the Receive screen
    When I click on "copy to clipboard" button
    Then I should see "You have successfully copied wallet address" pop up:
    | message                                            |
    | wallet.receive.page.addressCopyNotificationMessage |

  @it-30
  Scenario: User can't restore Daedalus wallet in Yoroi if Yoroi wallet is not created (IT-30)
    When There is no wallet stored
    And I am on the Daedalus Transfer instructions screen
    Then I see transactions buttons are disabled
