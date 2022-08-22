Feature: Hardware device

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-119
  Scenario: Test Byron Ledger (IT-119)
    Given I connected Ledger device 707fa118bf6b83
    # test restoration
    When I select a Byron-era Ledger device
    And I restore the Ledger device
    Then I should see the summary screen
    Then I should see a plate JSKA-2258
    # test sending
    Given I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000 |
    Then I add a transaction memo that says "my awesome memo"
    And I click on the next button in the wallet send form
    Then I see the hardware send money confirmation dialog
    Given The expected transaction is "hKQAgYJYIBZt/eWxg7fglIOvu/zntB59b+00tAXMEEG0XyfosF1HAAGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAD0JAAhoACb4hAxoR/pTNoQKBhFgg8elBZl4BQGla+Tli4OXssZO+OKu0a4uE90ZUlPqOjApYQFfNdN84xjlYUK+VJmNfrCv5BsNoKskjkCN4ixLwUUrICfdRrmvqgAdQI2eczTSA1wvWZjl8mkFwPxNtZVjH6gVYINNT5ssGb8HUyAOT9k5hdlJG+NKzPSnWME87YabidYnjQaD19g=="
    Then I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen
    And I expand the top transaction
    Then The memo content says "my awesome memo"
    # test address verification
    When I go to the receive screen
    Given I should see the Receive screen
    And I click on the verify address button
    Then I see the verification address "Ae2tdPwUPEYxqRJXnstgBN88qtjtDVNRXD5Ghm3wK9NS7fhKRseQ2TVVpth"
    And I see the derivation path "m/44'/1815'/0'/0/1"
    Then I verify the address on my ledger device

  @it-116
  Scenario: Test Shelley Ledger (IT-116)
    Given I connected Ledger device 707fa118bf6b83
    # test restoration
    When I select a Shelley-era Ledger device
    And I restore the Ledger device
    And I click skip the transfer
    Then I should see the dashboard screen
    Then I should see a plate KHDC-5476
    # test sending
    Given I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe | 1.000000 |
    Then I add a transaction memo that says "my awesome memo"
    And I click on the next button in the wallet send form
    Then I see the hardware send money confirmation dialog
    Given The expected transaction is "hKQAgYJYIDZ351x7ppmv3GzVfULyRvhvaa79dgJQBqx4MT+tK7ohAQGCglgrgtgYWCGDWByJGsmrqsmZsJfIHqPARQsPu2k9C9IyvrwPSjkfoAAa8v9+IRoAD0JAglg5AXU/qJHPfuF4AaA3RBmWAEAnGtmf6+kXwe182LUPZi1s6xtlczppoe1y+G8LrFoWUFoCiJevG+NFGgBCGwsCGgACjxUDGhH+lM2hAIGCWCA2j8onDd+7a+1yUcwDde1mFT4vweBhzNgescbtdEs7BVhAptWz/dmziL1SKTguqmcbzD8o1xiaGUMAijhl2oCy7AfHwFZSewXWi+eQQEJX/umPAjjcnjZjkDEc65kECAUCBPX2"
    Then I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen
    # test address verification
    When I go to the receive screen
    Given I should see the Receive screen
    And I click on the verify address button
    Then I see the verification address "addr1qx7ef2pmnrl3ejempwfnn920ukm2rftj7untkcgsvulrgzc0vckke6cmv4en56dpa4e0smct43dpv5z6q2yf0tcmudzst5ydks"
    And I see the derivation path "m/1852'/1815'/0'/0/1"
    Then I verify the address on my ledger device

  @it-138
  Scenario: Test Shelley Ledger upgrade transaction (IT-138)
    Given I connected Ledger device 707fa118bf6b83
    # test restoration
    When I select a Shelley-era Ledger device
    And I restore the Ledger device
    Given The expected transaction is "hKQAgYJYIBZt/eWxg7fglIOvu/zntB59b+00tAXMEEG0XyfosF1HAAGBglg5AXU/qJHPfuF4AaA3RBmWAEAnGtmf6+kXwe182LUPZi1s6xtlczppoe1y+G8LrFoWUFoCiJevG+NFGgAWc+ACGgACjIEDGhH+lM2hAoGEWCDx6UFmXgFAaVr5OWLg5eyxk744q7Rri4T3RlSU+o6MClhA8JNsFwN1WFUz6F3jt72Xgdwc0k9NwIs7X1P1vpumle3BmRxf2eTL4uSZJipKy2MLiJjP7eZWeWgN2QVcjPmnBFgg01PmywZvwdTIA5P2TmF2Ukb40rM9KdYwTzthpuJ1ieNBoPX2"
    Then I see the transfer transaction
    And I accept the prompt
    Then I should see the dashboard screen
    Then I go to the tx history screen
    And I should see that the number of transactions is 2
    And I should see 1 pending transactions

   @it-100
   Scenario: Test Shelley Ledger delegation (IT-100)
    Given I connected Ledger device 707fa118bf6b83
    When I select a Shelley-era Ledger device
    And I restore the Ledger device
    And I click skip the transfer
    Then I should see the dashboard screen
    Then I should see a plate KHDC-5476
    # test delegation
    Given I go to the delegation by id screen
    And I fill the delegation id form:
      | stakePoolId                                              |
      | df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207 |
    Then I see the stakepool ticker "YOROI"
    And I click on the next button in the delegation by id
    Then I see the delegation confirmation dialog
    Given The expected transaction is "hKUAgYJYIDZ351x7ppmv3GzVfULyRvhvaa79dgJQBqx4MT+tK7ohAQGBglg5AXU/qJHPfuF4AaA3RBmWAEAnGtmf6+kXwe182LUPZi1s6xtlczppoe1y+G8LrFoWUFoCiJevG+NFGgAyvwMCGgACqN0DGhH+lM0EgoIAggBYHA9mLWzrG2VzOmmh7XL4bwusWhZQWgKIl68b40WDAoIAWBwPZi1s6xtlczppoe1y+G8LrFoWUFoCiJevG+NFWBzfF1Dfmy3yhfz7UPR0BlehjuOvQnJ9QQw3uGIHoQCCglggNo/KJw3fu2vtclHMA3XtZhU+L8HgYczYHrHG7XRLOwVYQE0YC2UzEBrWg4P4ayvC4rwO83E8ZXTGa/KYuxehREgflqxgVKZ7xUwLNkrpR3nKmvIQDKVbpA2oah/weopxzwWCWCCJBYq1BjLaHESdxLaCRYL2F8gcQ7Zqu0RfZ1/u85XwPlhA0jtEUXVlkf0GbPRTWZGWpyM9sXh1+ht9xZIIbwqKvKtF5eZtwMtDE7ArbJzjhrpNvHWaxqIk8r1+YmNGqZtlAvX2"
    Then I submit the wallet send form
    Given I click on see dashboard
    Then I should see the dashboard screen

  @it-120 @ignore
  Scenario: Test Byron Trezor (IT-120)
    Given I connected Trezor device 6495958994A4025BB5EE1DB0
    # test restoration
    When I select a Byron-era Trezor device
    And I restore the Trezor device
    Then I should see the summary screen
    Then I should see a plate CZSA-2051
    # test sending
    Given I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe | 5.144385 |
    Then I add a transaction memo that says "my awesome memo"
    And I click on the next button in the wallet send form
    Then I see the hardware send money confirmation dialog
    Given The expected transaction is "g6QAg4JYIDZ351x7ppm/3GzVfULyRvhvaa79dgJQBqx4MT+tK7ogAYJYIAWEBYkvZgddg6vRt/40HS1b/S9hIrL4dHAAOeUHjg3VAYJYIBAp7vW7DwaXmrC5UwpiusEeGAeX0IyrmA/jk4nUKzZXAAGBglgrgtgYWCGDWByJGsmrqsmZsJfIHqPARQsPu2k9C9IyvrwPSjkfoAAa8v9+IRoATn9BAhoAAsX1AxoR/pTNoQKDhFgg/OzJFHxPlMKFDW9EFxmYPVVgPVzugQEeJKi8G6Z53SBYQL6AGt9yNRSaA62/trcYpxUTx3b3g0zn+sRN1dRj2B9WH6MRJE6fDab5MqSab9TpGNNG4xPcpSoE1aepTVBmfAVYIDV5JxLCyqvpBdt0le+EfezS1nIHZ/SVPbtaFugdNbENQaCEWCBuJwykTKqtfi5OyMYeJG+UyCLYack5wLGIlNEp24UZVlhAP7nKpcJyuREGWncNtFNy1ZOqifzgi0Cji4oBRuTv5hapZWSEL1fRVitJVWL7FSdHEXaPsa1OOfu+ZzXWhQKaAFggfWWCXtxX4sbaJDEuCcMwUmas37GGCd6TftqcwcstFCZBoIRYIO9odrsMMrrk705nbVG5FWZXouCzkB8U8VHjAMiKu+FbWECGGzqdT95Z8q+gE1e7Ax897Unj62yPC80ru7EPo5fJenRmoOwv+kWefItSZArK9YAv5Vs2qMsfIL9HjlcwGr0LWCDbr4V5V0+JN2EAd8rerGsUQVAxeKvkdq4sVrOvsCZ9akGg9g=="
    Then I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen
    And I expand the top transaction
    Then The memo content says "my awesome memo"
    # test address verification
    When I go to the receive screen
    Given I should see the Receive screen
    And I click on the verify address button
    Then I see the verification address "Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe"
    And I see the derivation path "m/44'/1815'/0'/0/8"
    Then I verify the address on my trezor device