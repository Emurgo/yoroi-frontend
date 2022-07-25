Feature: Smoke tests

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @smoke-001
  Scenario: Create a Shelley Era wallet
    Given I create a new Shelley wallet with the name Test Wallet
    Then I should see the balance number "0 ADA"
    When I go to the receive screen
    Then I should see the Receive screen
    And I should see at least 1 addresses

  @smoke-002
  Scenario: Restore a Shelley Era wallet (smoke-001)
    Given There is a Shelley wallet stored named First-Smoke-Test-Wallet
    # Check the balance on the main page
    Then I should see the balance number "0 ADA"
    # Check transactions
    Then I click the transaction page button
    And I should see the summary screen
    And I should see no transactions
#    And I should see 1 successful transactions
    # Check the Receive tab
    When I go to the receive screen
    Then I should see the Receive screen
    And I should see at least 1 addresses