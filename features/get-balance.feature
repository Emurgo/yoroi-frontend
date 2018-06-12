Feature: Get balance

  Scenario: Get balance with no addresses
    Given I have opened the chrome extension
      And There is a wallet stored without addresses
    When I see the balance
    Then I should see the balance number "0.000000"

  Scenario: Get balance with 1 address
    Given I have opened the chrome extension
      And There is a wallet stored with 1 addresses
    When I see the balance
    Then I should see the balance number "0.000000"

  Scenario: Get balance with 25 addresses
    Given I have opened the chrome extension
      And There is a wallet stored with 25 addresses
    When I see the balance
    Then I should see the balance number "0.000295"

  Scenario: Get balance with 45 addresses
    Given I have opened the chrome extension
      And There is a wallet stored with 45 addresses
    When I see the balance
    Then I should see the balance number "0.020295"
