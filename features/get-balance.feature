Feature: Get balance

  Background:
    Given I have completed the basic setup
    And I am testing "Get balance"

  Scenario: Get balance with 1 address
    Given There is a wallet stored with 1 addresses
    When I see the balance
    Then I should see the balance number "0.000000 ADA"

  Scenario: Get balance with 25 addresses
    Given There is a wallet stored with 25 addresses
    When I see the balance
    Then I should see the balance number "0.000295 ADA"

  Scenario: Get balance with 45 addresses
    Given There is a wallet stored with 45 addresses
    When I see the balance
    Then I should see the balance number "0.020295 ADA"
