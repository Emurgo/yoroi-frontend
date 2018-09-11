Feature: Main UI

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup

  Scenario: Get balance with 1 address
    Given I am testing "Main UI"
    And There is a wallet stored named simple-wallet
    Then I should see the balance number "0.000000 ADA"

  Scenario: Get balance with 45 addresses
    Given I am testing "Main UI"
    And There is a wallet stored named complex-wallet
    Then I should see the balance number "0.020295 ADA"

  Scenario: Get balance with a big amount
    Given I am testing "Main UI"
    And There is a wallet stored named Test
    Then I should see the balance number "9,007,199,254.720698 ADA"

  @it-15
  Scenario: Main Screen Tabs Switching (IT-15)
    Given I am testing "Main UI"
    When There is a wallet stored named complex-wallet
    And I go to the send transaction screen
    Then I should see send transaction screen
    When I go to the receive screen
    Then I should see the Receive screen
    When I go to the transaction history screen
    Then I should see the transactions screen

  @it-25
  Scenario: Ensure user can copy Wallet address to Windows clipboard via "Copy address" buttons (IT-25)
    Given I am testing "Main UI"
    When There is a wallet stored named complex-wallet
    When I go to the receive screen
    Then I should see the Receive screen
    When I click on "copy to clipboard" button
    Then I should see "You have successfully copied wallet address" pop up:
    | message                                            |
    | wallet.receive.page.addressCopyNotificationMessage |
