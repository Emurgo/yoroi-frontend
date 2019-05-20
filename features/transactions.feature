Feature: Send transaction

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    And I am testing "Send transaction"

  @it-54 @it-52
  Scenario Outline: User can send funds from one Yoroi wallet to another (IT-54)
    Given There is a wallet stored named Test
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | <amount> |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | aaSecret_123 |
    And I submit the wallet send form
    Then I should see the summary screen

    Examples:
      | amount              | fee       | |
      | 0.001000            | 0.168082  | # Sent tx to a valid adress|
      | 2007199254.552484  | 0.168038  | # Sent all funds|
      | 2007199253.720698  | 0.168170  | # Sent a big amount|

  @it-90
  Scenario Outline: Spending Password should be case-sensitive [Transaction confirmation] (IT-90)
    Given There is a wallet stored named Test
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.100000 |
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | <password> |
    And I submit the wallet send form
    Then I should see an incorrect wallet password error message

    Examples:
      | password              | 
      | secret_123            | 
      | SECRET_123            |
      | sECRET_123            |

  @it-48
  Scenario Outline: CONFIRM TRANSACTION Pop up displays properly (IT-48)
    Given There is a wallet stored named Test
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                        | amount   |
      | <address>                      | <amount> |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see CONFIRM TRANSACTION Pop up:
      | address   | amount    |fee      |
      | <address> | <amount>  |<fee>    |

  Examples:
      | address                                                     | amount    |fee      |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.001000  |0.168082 | 

  @it-46
  Scenario: User can't send funds to the invalid address (IT-46)
    Given There is a wallet stored named Test
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                    | amount   | |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMC | 0.001000 | Some characters in address has been changed and removed|
    Then I should see an invalid address error
    And I should not be able to submit

  @it-47
  Scenario: User can't send more funds than he has (IT-47)
    Given There is a wallet stored named Test
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount     |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 9007199255 |
    Then I should see a not enough ada error
    And I should not be able to submit

  @it-55
  Scenario Outline: User can send all funds from one Yoroi wallet to another
    Given There is a wallet stored named Test
    And I have a wallet with funds
    When I go to the send transaction screen
	And I click on "Use all my ADA" checkbox
    And I fill the address of the form:
      | address                                                     |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | aaSecret_123 |
    And I submit the wallet send form
    Then I should see the summary screen

    Examples:
      | amount              | fee       | |
      | 2007199254.554682  | 0.166016  | # Sent all funds|

  @invalidWitnessTest @it-20
  Scenario: Sending a Tx and receiving from the server an invalid signature error
    Given There is a wallet stored named Test
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.001000 |
    And The transaction fees are "0.168082"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | aaSecret_123 |
    And I submit the wallet send form
    Then I should see an invalid signature error message

  @it-42
  Scenario: User can't send funds with incorrect Spending password (IT-42)
    Given There is a wallet stored named Test
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.001000 |
    And The transaction fees are "0.168082"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password      |
      | WrongPassword |
    And I submit the wallet send form
    Then I should see an incorrect wallet password error message

  @it-53
  Scenario: Sending a Tx changing a valid address for an invalid one (IT-53)
    Given There is a wallet stored named Test
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.001000 |
    And I clear the receiver
    And I fill the receiver as "Invalid address"
    Then I should not be able to submit
    When I clear the receiver
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdXXXX | 0.001000 |
    Then I should not be able to submit  

  @it-89
  Scenario: Try to make a transactions from the empty wallet (IT-89)
    # note: this test must be the last test in the file
    # since we switch the wallet test code that is being run in order to get an empty wallet
    And I am testing ""
    Given There is a wallet stored named empty-wallet
    # should not be necessary since we're using an empty wallet but just to be sure
    Given I cleared my local balance
    # need this for cleared wallet to take into affect properly
    When I refresh the page
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 0.100000 |
    Then I should see a not enough ada error