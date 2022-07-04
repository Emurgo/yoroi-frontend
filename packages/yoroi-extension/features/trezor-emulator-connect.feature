@trezorEmulatorTest
Feature: Trezor wallet emulator

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I connect to trezore controler
    And I start trezor emulator environment
    Given I connected Trezor emulator device
    Then I should see the dashboard screen
    Then I should see a plate PXCA-2349

  @hw-trezor-001
  Scenario: Trezor (emulator). Send ADA.
    Given I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe | 4.5 |
    Then I add a transaction memo that says "my awesome memo"
    And I click on the next button in the wallet send form
    Then I see the hardware send money confirmation dialog
    Given The expected transaction is "hKQAgYJYIDZ351x7ppm/3GzVfULyRvhvaa79dgJQBqx4MT+tK7ohAQGBglgrgtgYWCGDWByJGsmrqsmZsJfIHqPARQsPu2k9C9IyvrwPSjkfoAAa8v9+IRoARKogAhoAD0JAAxoR/pTNoQCBglggIL1t3O4RKx2YKpd4BSHseH/S7owdieZYrByrYgJ36IhYQFjVE/uopnIMYcnbrHgNxjqM6RamCo2bqEkHrtdG9boMd7btZ7I5M97lZQtyWHqmWRU02FrTl1/bhGHsOaduhAP19g=="
    Then I submit the wallet send form
    Then I switch to Trezor-connect screen and allow using
    And I press Yes on the Trezor emulator
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

  @hw-trezor-002
  Scenario: Trezor (emulator). Verify address.
    When I go to the receive screen
    Given I should see the Receive screen
    And I click on the verify address button
    Then I see the verification address "addr1qyqypeu6872rx9m587ahv0yppjzuhkplzj7qsntrvuka6emyyw9u88yk923gz44ytfrpyymhpkydszyfv7zljtp65nfqhkztup"
    And I see the derivation path "m/1852'/1815'/0'/0/3"
    And I verify the address on the trezor emulator
