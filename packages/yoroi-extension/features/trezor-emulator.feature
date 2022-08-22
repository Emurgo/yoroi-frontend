@trezorEmulatorTest @Trezor
Feature: Trezor wallet emulator

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I connect to trezor controller
    And I start trezor emulator environment
    When I setup trezor emulator for trezor-wallet
    And I connected Trezor emulator device
    Then I should see the dashboard screen
    Then I should see a plate PXCA-2349

  @Trezor-001
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

  @Trezor-002
  Scenario: Trezor (emulator). Verify address.
    When I go to the receive screen
    Given I should see the Receive screen
    And I click on the verify address button
    Then I see the verification address "addr1qyqypeu6872rx9m587ahv0yppjzuhkplzj7qsntrvuka6emyyw9u88yk923gz44ytfrpyymhpkydszyfv7zljtp65nfqhkztup"
    And I see the derivation path "m/1852'/1815'/0'/0/3"
    And I verify the address on the trezor emulator

  @Trezor-003
  Scenario: Test Shelley Trezor delegation
    When I go to the delegation by id screen
    And I fill the delegation id form:
      | stakePoolId                                              |
      | df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207 |
    Then I see the stakepool ticker "YOROI"
    And I click on the next button in the delegation by id
    Then I see the delegation confirmation dialog
    Given The expected transaction is "hKUAgYJYIDZ351x7ppm/3GzVfULyRvhvaa79dgJQBqx4MT+tK7ohAQGBglg5AWUcSwdFBud7UJKQ+QefaKw+IqQtpmDiefjzV7dkI4vDnJYqooFWpFpGEhN3DYjYCIlnhfksOqTSGgAyvwMCGgACqN0DGhH+lM0EgoIAggBYHGQji8OcliqigVakWkYSE3cNiNgIiWeF+Sw6pNKDAoIAWBxkI4vDnJYqooFWpFpGEhN3DYjYCIlnhfksOqTSWBzfF1Dfmy3yhfz7UPR0BlehjuOvQnJ9QQw3uGIHoQCCglggIL1t3O4RKx2YKpd4BSHseH/S7owdieZYrByrYgJ36IhYQO1UXCZaLUzxEB0ww7GVRBLBlVJfifKVNe7wBQypSJc+9zOLmcQhkpAUB03iaM/+nSmfLhRFoOJ+zz43gDJGKQKCWCBSNIIHv+9Ne4kuzm9920PNEffFihrFH/jaJK5cLCyehlhAVLgIT2aPqRMFOJB+LPss8b47x5iXf43zSldgwlaR5t4Eed8UzDuHRkbNrGutD86iY/ry6YcS4Jxrgh7xJljuBfX2"
    Then I submit the wallet send form
    Then I switch to Trezor-connect screen and allow using
    And I press Yes on the Trezor emulator
    Given I click on see dashboard
    Then I should see the dashboard screen

  @Trezor-004
  Scenario: Trezor (emulator). Withdraw rewards w/ deregistration.
    When I go to the dashboard screen
    And I click on the withdraw button
    And I click on the checkbox
    And I click the next button
    Then I see the deregistration for the transaction
    And I should see on the Yoroi withdrawal transfer summary screen:
      | fromAddress                                                 | reward | fees     |
      | stake1u9jz8z7rnjtz4g5p26j953sjzdmsmzxcpzyk0p0e9sa2f5sjeqemq | 5      | 0.193793 |
    Given The expected transaction is "hKYAgYJYIDZ36Gx7ppmv3BzVfULyRvhvaa79dgJQBqx4MT+tK7ohAAGBglg5AfiMMmOcqBWRIjRN6CEig4T8YKJcOWtIDaUVnSFW21zUiJyEEQ1N6QwNUDtRuETbPm/YeZEjiZW7GgCV8hsCGgACpGUDGhH+lM0EgYIBggBYHFbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsFoVgd4VbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsaAExLQKEAgoJYIDHFsozgC4AMMNymh4uSd8Xls6VSRnf9Dxv6kiJPzsubWEAXpQuoGfhAzvgfp0H9ouqVNr4ZQPpQnFG9frwUkkyzA7dLIl1GmIuFbkJFMp3AakfKpXSZ9s+3dpaw9hYFkKgLglgg6cWNnhkPKitPspqy3T6+Lqi2VU1F/s8JE36FUprlBHBYQICDQmLn20i7qEzQSnFGhJv3Yp2qiAFF/6XxaqOeIvva6u/jxDYC/CFoA3UV4B6thf4QFJZ9owY9EsOhQuu14A319g=="
    When I confirm Yoroi transfer funds
    Then I switch to Trezor-connect screen and allow using
    When I press Yes on the Trezor emulator
    Then I do not see the deregistration for the transaction
    Then I should see the transactions screen

  @Trezor-005
  Scenario: Trezor (emulator). Send Assets.
    Given I go to the send transaction screen
    And I select the asset "nicoin" on the form
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe | 123 |
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