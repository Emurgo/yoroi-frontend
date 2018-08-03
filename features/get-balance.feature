Feature: Get balance

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Get balance"

  Scenario: Get balance with 1 address
    Given There is a wallet stored named simple-wallet
    Then I should see the balance number "0.000000 ADA"

  Scenario: Get balance with 45 addresses
    Given There is a wallet stored named complex-wallet
    Then I should see the balance number "0.020295 ADA"

  Scenario: Get balance with a big amount
    Given There is a wallet stored named Test
    Then I should see the balance number "9,007,199,254.720698 ADA"
