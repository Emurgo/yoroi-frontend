Feature: Hardware device

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-119
  Scenario: Test Byron Ledger (IT-119)
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
    Then I submit the wallet send form
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
    # test restoration
    When I select a Shelley-era Ledger device
    And I restore the Ledger device
    Then I should see the summary screen
    Then I should see a plate KHDC-5476
    # test sending
    Given I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe | 1.000000 |
    Then I add a transaction memo that says "my awesome memo"
    And I click on the next button in the wallet send form
    Then I see the hardware send money confirmation dialog
    Then I submit the wallet send form
    Then I should see the summary screen
    # test address verification
    When I go to the receive screen
    Given I should see the Receive screen
    And I click on the verify address button
    Then I see the verification address "addr1qx7ef2pmnrl3ejempwfnn920ukm2rftj7untkcgsvulrgzc0vckke6cmv4en56dpa4e0smct43dpv5z6q2yf0tcmudzst5ydks"
    And I see the derivation path "m/1852'/1815'/0'/0/1"
    Then I verify the address on my ledger device

   @it-100
   Scenario: Test Shelley Ledger delegation (IT-100)
     # test restoration
     When I select a Shelley-era Ledger device
     And I restore the Ledger device
     Then I should see the summary screen
     Then I should see a plate KHDC-5476
     # test delegation
     Given I go to the delegation by id screen
     And I fill the delegation id form:
       | stakePoolId                                              |
       | df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207 |
     Then I see the stakepool ticker "YOROI"
     And I click on the next button in the delegation by id
     Then I see the hardware delegation confirmation dialog
     Then I submit the wallet send form
     Given I click on see dashboard
     Then I should see the dashboard screen

  @it-120
  Scenario: Test Byron Trezor (IT-120)
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
    Then I submit the wallet send form
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

  @it-136
  Scenario: Test Shelley Trezor (IT-136)
    # test restoration
    When I select a Shelley-era Trezor device
    And I restore the Trezor device
    Then I should see the summary screen
    Then I should see a plate PXCA-2349
    # test sending
    Given I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe | 5.144385 |
    Then I add a transaction memo that says "my awesome memo"
    And I click on the next button in the wallet send form
    Then I see the hardware send money confirmation dialog
    Then I submit the wallet send form
    Then I should see the summary screen
    # test address verification
    When I go to the receive screen
    Given I should see the Receive screen
    And I click on the verify address button
    Then I see the verification address "addr1qyqypeu6872rx9m587ahv0yppjzuhkplzj7qsntrvuka6emyyw9u88yk923gz44ytfrpyymhpkydszyfv7zljtp65nfqhkztup"
    And I see the derivation path "m/1852'/1815'/0'/0/3"
    Then I verify the address on my trezor device



