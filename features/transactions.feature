Feature: Send transaction

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-54
  Scenario Outline: User can send funds from one Yoroi wallet to another (IT-54)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | <amount> |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    Then I should see no warning block
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the summary screen

    Examples:
      | amount              | fee       |
      | 1.000000            | 0.640003  |
      | 2.000000            | 0.460004  |

  @it-90
  Scenario Outline: Spending Password should be case-sensitive [Transaction confirmation] (IT-90)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000 |
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
    Given There is a wallet stored named many-tx-wallet
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
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000  |0.640003 | 

  @it-46
  Scenario: User can't send funds to the invalid address (IT-46)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                    | amount   | |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMC | 0.001000 | Some characters in address has been changed and removed|
    Then I should see an invalid address error
    And I should not be able to submit

  @it-47
  Scenario: User can't send more funds than he has (IT-47)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount     |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 9007199255 |
    Then I should see a not enough ada error
    And I should not be able to submit

  @it-55
  Scenario Outline: User can send all funds from one Yoroi wallet to another (IT-55)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
	And I click on "Send all my ADA" checkbox
    And I fill the address of the form:
      | address                                                     |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the summary screen

    Examples:
      | fee       |
      | 0.209369  |

  @invalidWitnessTest @it-20
  Scenario: Sending a Tx and receiving from the server an invalid signature error (IT-20)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000 |
    And The transaction fees are "0.640003"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see an invalid signature error message

  @it-42
  Scenario: User can't send funds with incorrect Spending password (IT-42)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000 |
    And The transaction fees are "0.640003"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password      |
      | WrongPassword |
    And I submit the wallet send form
    Then I should see an incorrect wallet password error message

  @it-53
  Scenario: Sending a Tx changing a valid address for an invalid one (IT-53)
    Given There is a wallet stored named many-tx-wallet
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
    Given There is a wallet stored named empty-wallet
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000 |
    Then I should see a not enough ada error

  @it-59
  Scenario: Display warning if wallet changes during confirmation (IT-59)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 2.000000 |
    And The transaction fees are "0.460004"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    Then A successful tx gets sent from my wallet from another client
    Then I should see a warning block
    # cancelling the transaction and trying again should get rid of the rror
    Then I click the back button
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    Then I should see no warning block
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the summary screen

  @it-60
  Scenario: User can send a tx after invalid password attempt (IT-60)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000 |
    And The transaction fees are "0.640003"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password      |
      | WrongPassword |
    And I submit the wallet send form
    Then I should see an incorrect wallet password error message
    And I clear the wallet password WrongPassword
    And I enter the wallet password:
      | password      |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the summary screen

  @it-61
  Scenario: Display warning if wallet changes during send screen (IT-61)
    Given There is a wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 2.000000 |
    And The transaction fees are "0.460004"
    Then A pending tx gets sent from my wallet from another client
    Then I should see a warning block
