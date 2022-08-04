Feature: Wallet UI Settings

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I should see the "General Settings" page

@currency-1
  Scenario Outline: Change currency pair
    When I select <currency> as fiat pairing currency
    Then I see the correct conversion value for <currency> on header

    Examples:
    | currency |
    | USD |
    | JPY |
    | EUR |
    | CNY |
    | KRW |
    | BTC |
    | ETH |
    | BRL |

@currency-2
  Scenario Outline: Change currency pair back to ADA
    When I select <currency> as fiat pairing currency
    And I select ADA as fiat pairing currency
    Then I see only ADA value on header

    Examples:
    | currency |
    | USD |
    | JPY |
    | EUR |
    | CNY |
    | KRW |
    | BTC |
    | ETH |
    | BRL |

@currency-3
  Scenario Outline: Check wallet transactions pairings after changing currency
    When I select <currency> as fiat pairing currency
    And Revamp. I go to the wallet shelley-simple-15
    Then I validate the transaction amount to <currency> currency pairing

    Examples:
    | currency |
    | USD |
    | JPY |
    | EUR |
    | CNY |
    | KRW |
    | BTC |
    | ETH |
    | BRL |

