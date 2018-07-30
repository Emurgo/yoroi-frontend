Feature: Send transaction

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Send transaction"
    And There is a wallet stored named Test
    And I have a wallet with funds

  Scenario Outline: Sending successful tx
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount  |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | <amount> |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password  |
      | Secret123 |
    And I submit the wallet send form
    Then I should see the summary screen

    Examples:
      | amount              | fee       |
      | 0.001000            | 0.167950  | # Sent tx to a valid adress
      | 9007199254..552484  | 0.168214  | # Sent all funds
      | 9007199253..720698  | 0.168214  | # Sent a big amount

  Scenario: Sending a Tx to an invalid address
    When I go to the send transaction screen
    And I fill the form:
      | address                                                    | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMC | 0.001000 |
    Then I should see an invalid address error
    And I should not be able to submit

  Scenario: Sending a Tx with less founds than needed
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount     |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 9007199255 |
    Then I should see a not enough ada error
    And I should not be able to submit

  @invalidWitnessTest
  Scenario: Sending a Tx and receiving from the server an invalid signature error
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.001000 |
    And The transaction fees are "0.167950"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password  |
      | Secret123 |
    And I submit the wallet send form
    Then I should see an invalid signature error message

  Scenario: Sending a Tx entering a wrong password
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.001000 |
    And The transaction fees are "0.167950"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password      |
      | WrongPassword |
    And I submit the wallet send form
    Then I should see an incorrect wallet password error message
