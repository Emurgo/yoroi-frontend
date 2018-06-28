Feature: Send transaction

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Send transaction"
    And There is a wallet stored

  Scenario: Sending a Tx to a valid address
    Given I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.001000 |
    And The transaction fees are calculated
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password  |
      | Secret123 |
    And I submit the wallet send form
    Then I should see the summary screen

  Scenario: Sending a Tx to an invalid address
    Given I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                    | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMC | 0.001000 |
    Then I should see an invalid address error
    And I should not be able to submit

  Scenario: Sending a Tx with less founds than needed
    Given I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 100000 |
    Then I should see a not enough ada error
    And I should not be able to submit
