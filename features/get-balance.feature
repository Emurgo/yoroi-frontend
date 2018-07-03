Feature: Get balance

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Get balance"

  Scenario: Get balance with 1 address
    Given There is a wallet stored with the name simple-wallet
    When I see the balance
    Then I should see the balance number "0.000000 ADA"

  Scenario: Get balance with 45 addresses
    Given There is a wallet stored with the name complex-wallet
    When I see the balance
    Then I should see the balance number "0.020295 ADA"

  Scenario: Get balance with a big amount
    Given There is a wallet stored
    When I see the balance
    Then I should see the balance number "9,007,199,254.720698 ADA"
