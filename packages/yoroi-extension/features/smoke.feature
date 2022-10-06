@smoke
Feature: Smoke tests

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @smoke-001
  Scenario: Create a Shelley Era wallet (smoke-001)
    Given I create a new Shelley wallet with the name Test Wallet
    Then I should see the balance number "0 ADA"
    When I go to the receive screen
    Then I should see the Receive screen
    And I should see at least 1 addresses

  @smoke-002
  Scenario: Restore a Shelley Era wallet (smoke-002)
    Given There is a Shelley wallet stored named First-Smoke-Test-Wallet
    # Check the balance on the main page
    Then I should see the balance number "6.527639 ADA"
    And I should see the Total ADA is equal to "6.527639"
    And I should see the Reward is equal to "0"
    # Check transactions
    Then I go to the transaction history screen
    And I should see the summary screen
    And I should see 6 successful transactions
    # Check the Receive tab
    When I go to the receive screen
    Then I should see the Receive screen
    And I should see at least 5 addresses

  @smoke-003
  Scenario: Sending intrawallet transaction. 1 ADA (smoke-003)
    Given There is a Shelley wallet stored named Second-Smoke-Test-Wallet
    And I have a wallet with funds
    Then I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   | browser |
      | addr1qx2dzfu535t6n9nlmh4y8l5mmjvvw7qk3vuser0rdsq04vc0hkzu65nj2s7rcluetdmcxm030cxcuwcn2fq7l0l6pexqsd4d95 | 1 | chrome |
      | addr1qxtrynld5ry55hrdznrdu7yzzjk5hjcna9grs3gegwznxv3ll380dw9nf8u3fry0xlxl4endeur3esvcnxewycdn3epqt4sv08 | 1 | firefox |
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen
    And I should see 1 pending transactions
    Then I wait for 3 minute(s) the last transaction is confirmed

  @smoke-004
  Scenario: Sending intrawallet transaction. Custom token (smoke-004)
    Given There is a Shelley wallet stored named Second-Smoke-Test-Wallet
    And I have a wallet with funds
    Then I go to the send transaction screen
    And I open the token selection dropdown
    And I select token "yoroi"
    And I fill the form:
      | address                                                     | amount   | browser |
      | addr1qx2dzfu535t6n9nlmh4y8l5mmjvvw7qk3vuser0rdsq04vc0hkzu65nj2s7rcluetdmcxm030cxcuwcn2fq7l0l6pexqsd4d95 | 4 | chrome |
      | addr1qxtrynld5ry55hrdznrdu7yzzjk5hjcna9grs3gegwznxv3ll380dw9nf8u3fry0xlxl4endeur3esvcnxewycdn3epqt4sv08 | 4 | firefox |
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen
    And I should see 1 pending transactions
    Then I wait for 3 minute(s) the last transaction is confirmed

  @smoke-005
  Scenario Outline: Sending intrawallet transaction. Registered token - <token> (smoke-005)
    Given There is a Shelley wallet stored named Second-Smoke-Test-Wallet
    And I have a wallet with funds
    Then I go to the send transaction screen
    And I open the token selection dropdown
    And I select token "<token>"
    And I fill the form:
      | address                                                     | amount   | browser |
      | addr1qx2dzfu535t6n9nlmh4y8l5mmjvvw7qk3vuser0rdsq04vc0hkzu65nj2s7rcluetdmcxm030cxcuwcn2fq7l0l6pexqsd4d95 | 7 | chrome |
      | addr1qxtrynld5ry55hrdznrdu7yzzjk5hjcna9grs3gegwznxv3ll380dw9nf8u3fry0xlxl4endeur3esvcnxewycdn3epqt4sv08 | 7 | firefox |
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen
    And I should see 1 pending transactions
    Then I wait for 3 minute(s) the last transaction is confirmed

    Examples:
      | token |
      | SPACE |
      | DRIP  |
      | XRAY  |

  @smoke-006
  Scenario: Sending intrawallet transaction. Send all (smoke-006)
    Given There is a Shelley wallet stored named Second-Smoke-Test-Wallet
    And I have a wallet with funds
    Then I go to the send transaction screen
    And I open the token selection dropdown
    And I select token "ADA"
    And I fill the address of the form:
      | address                                                                                                 | browser |
      | addr1qx2dzfu535t6n9nlmh4y8l5mmjvvw7qk3vuser0rdsq04vc0hkzu65nj2s7rcluetdmcxm030cxcuwcn2fq7l0l6pexqsd4d95 | chrome  |
      | addr1qxtrynld5ry55hrdznrdu7yzzjk5hjcna9grs3gegwznxv3ll380dw9nf8u3fry0xlxl4endeur3esvcnxewycdn3epqt4sv08 | firefox |
    And I open the amount dropdown and select send all
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen
    And I should see 1 pending transactions
    Then I wait for 3 minute(s) the last transaction is confirmed

  @smoke-007
  Scenario: Delegating (smoke-007)
    Given There is a Shelley wallet stored named Second-Smoke-Test-Wallet
    And I have a wallet with funds
    Given I go to the delegation list screen
    Then I select the pool with the id "df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207"
    Then I see the delegation confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Then I submit the wallet send form
    Given I click on see dashboard
    Then I should see the dashboard screen
    Then I go to the transaction history screen
    And I should see 1 pending transactions
    Then I wait for 3 minute(s) the last transaction is confirmed

  @smoke-008
  Scenario: Deregister (smoke-008)
    Given There is a Shelley wallet stored named Second-Smoke-Test-Wallet
    And I have a wallet with funds
    When I click on the withdraw button
    Then I click on the checkbox
    And I click the next button
    And I see the deregistration for the transaction
    And I enter the wallet password:
      | password     |
      | asdfasdfasdf |
    When I confirm Yoroi transfer funds
    Then I do not see the deregistration for the transaction
    Then I should see the summary screen
    And I should see 1 pending transactions
    Then I wait for 4 minute(s) the last transaction is confirmed