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
  Scenario: Main Screen Tabs Switching
    Given I am testing "Main UI"
    Given There is a wallet stored named complex-wallet
    When I go to the send transaction screen
    Then I should see send transaction screen
    When I go to the receive screen
    Then I should see the Receive screen
    When I go to the transaction history screen
    Then I should see the transactions screen
