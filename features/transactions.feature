Feature: Send transaction

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @it-54
  Scenario Outline: User can send funds from one Yoroi wallet to another (IT-54)
    Given There is a Byron wallet stored named many-tx-wallet
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
    Given The expected transaction is <expectedTx>
    And I submit the wallet send form
    Then I should see the summary screen

    Examples:
      | amount              | fee       | expectedTx |
      | 1.000000            | 0.640003  | "g6QAhYJYILcTzA1jEGw4BrGnB3zDeilPzKDkefJqrGTlHgmugI11AIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAD0JAAhoACcQDAxoR/pTNoQKDhFggXnGsSYUyhwTHwB1G9f7mkd9iHoKwNvA477DkhDTXmX5YQGysuAsWMrUoYD6f5n5k2vmnVr2jWdoeFuanaxW8pk/F2kBfv7IPOpOwIvTVWuUknxJtJ11amUkNnHpX5GSRMQRYIO23hdKX7dxt3V0Cchr8MLvy1UwjID2hIegQ0F2VF6vHQaCEWCCPBkfbIHjkWa3BQgOfZnSx2uNRXSeHf/3Dr6sioCh8qlhANGxtDeRnQfiiCPFaWuvN/hiItSZxBk0NSGaQ5k4GPG3nFQdYatQrUqBCgqTcLz+3OG935IbMoHAIAnNlbcNeBlggRYcsb5A2HZ+Idr1h/VYzDe7f0Gt4E0SVRIi2VqWKcA5BoIRYIOx7+AYOSniTUHVqDkzhtFF7b1HM/9BBkw6++m8Q+/SzWEDqP1LXZUyJhvy/JouWNtcm8m9Ot0yejTfqvC7Wcjl4LXB7j+KJEl5DrLIXHij4ZBPHxOJc1n/bC7PJb7nRJ4APWCBWM2zqwExuk/gcTouvBpcmhtN2NEKb5aluF5K/hwZh2EGg9g==" |
      | 2.000000            | 0.460004  | "g6QAh4JYILcTzA1jEGw4BrGnB3zDeilPzKDkefJqrGTlHgmugI11AIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAHoSAAhoABwTkAxoR/pTNoQKEhFggXnGsSYUyhwTHwB1G9f7mkd9iHoKwNvA477DkhDTXmX5YQPWw5EUQVR9Y0dpzBWAYt0qh24YUZDGLVyjx7xro2LUHyrY0OY6cIxzaxMfYKa0mtABRJnaMvfxZWoP8NBVKxghYIO23hdKX7dxt3V0Cchr8MLvy1UwjID2hIegQ0F2VF6vHQaCEWCCPBkfbIHjkWa3BQgOfZnSx2uNRXSeHf/3Dr6sioCh8qlhAE6jTe/dfPba0aRJ8UdimHG6quEaw3FfCSInH8RAz1SZqRN16ZbbHHKXmxwKxDxEqc4zUZGEnOjXFjnmFt9ynA1ggRYcsb5A2HZ+Idr1h/VYzDe7f0Gt4E0SVRIi2VqWKcA5BoIRYIOx7+AYOSniTUHVqDkzhtFF7b1HM/9BBkw6++m8Q+/SzWEDepjjJbs6tU03PMrQMi+pFuq/trlwj0XK5m/pAncaCWEe7zRl0fEz1y4I/PgUzVZD0IuasCqKtcO/wEWZh0MwLWCBWM2zqwExuk/gcTouvBpcmhtN2NEKb5aluF5K/hwZh2EGghFggzHvtZR+ntErMZIIgbq2uQ2B/jHt0TTIZ2j1JzMH2HTtYQOzHvkEeFMuENCAvK2BcEeduNcIteaV+ptOBphyadkg2102rQPi1VZF2wzyTWjWk6hC4FDb7wbk5J2jsi43xOA1YIFiANkZLmGZ3Oe+LI3Q8iACb9dHcrlZN4L/sajTg+7+/QaD2" |

  @it-90
  Scenario Outline: Spending Password should be case-sensitive [Transaction confirmation] (IT-90)
    Given There is a Byron wallet stored named many-tx-wallet
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
    Given There is a Byron wallet stored named many-tx-wallet
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
    Given There is a Byron wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                    | amount   | |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMC | 0.001000 | Some characters in address has been changed and removed|
    Then I should see an invalid address error
    And I should not be able to submit

  @it-47
  Scenario: User can't send more funds than he has (IT-47)
    Given There is a Byron wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount     |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 9007199255 |
    Then I should see a not enough ada error
    And I should not be able to submit

  @it-55
  Scenario Outline: User can send all funds from one Yoroi wallet to another (IT-55)
    Given There is a Byron wallet stored named many-tx-wallet
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
    Given The expected transaction is <expectedTx>
    And I submit the wallet send form
    Then I should see the summary screen

    Examples:
      | fee       | expectedTx |
      | 0.209369  | "g6QAiYJYILcTzA1jEGw4BrGnB3zDeilPzKDkefJqrGTlHgmugI11AIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AYJYIAoHNmmEX+pK6DzUQYoLT9VmEAl6iWAagWtYkfZn40lsAIJYIAoHNmmEX+pK6DzUQYoLT9VmEAl6iWAagWtYkfZn40lsAQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoALEKcAhoAAzHZAxoR/pTNoQKGhFggXnGsSYUyhwTHwB1G9f7mkd9iHoKwNvA477DkhDTXmX5YQODmGgT0+wEVelFubPQ7ktVrqHfziBoSJMc2ANg4taa8NbSiDdHFC8dZszJ4gEBmYI4L9bGrk2Vuy2IfNOJxxglYIO23hdKX7dxt3V0Cchr8MLvy1UwjID2hIegQ0F2VF6vHQaCEWCCPBkfbIHjkWa3BQgOfZnSx2uNRXSeHf/3Dr6sioCh8qlhA0/hhhZJs9+rR0aOHjsxWzSAvnn9hqreu9Knwxv6CqPGaFIk0QMXR08rP1PnruqsG5kgB5hb0lS+Y/y62QAGHAlggRYcsb5A2HZ+Idr1h/VYzDe7f0Gt4E0SVRIi2VqWKcA5BoIRYIOx7+AYOSniTUHVqDkzhtFF7b1HM/9BBkw6++m8Q+/SzWECcRWG/biKz8QIRihjCDtT5z9pV4U3Klu8xSm6+sk7Y4Ki3IfB3Mbq+B3n+Xh/j0u1hzdlqrw81AUadXukJCnEDWCBWM2zqwExuk/gcTouvBpcmhtN2NEKb5aluF5K/hwZh2EGghFggzHvtZR+ntErMZIIgbq2uQ2B/jHt0TTIZ2j1JzMH2HTtYQEW4KDdgVlD9ZjTxZ1SPrt5hQkJLI3zrdNUOj6kn3QbNw8sindwpGU22PF5zidKbFD7+Sd/d7kq7xWeNN5evzglYIFiANkZLmGZ3Oe+LI3Q8iACb9dHcrlZN4L/sajTg+7+/QaCEWCCrz2wieKqlEL0JsQicx3naLrAb0qgH4COJ/AE3AZvCd1hAnzF8mVAY2lyGzQSM1ItvnfIWFeTR/vpqWrluSDgiCdOr+khs0G1yBwPzHKC6Bwn8JXOGOlxI7+ZJ4i81JGM4B1ggXsJ5mvWuSD0y///s18T45fzDjpah0vqXB3erntI0INFBoIRYILlNNm5mIlb6YPjq4n8gjDChi+2y90adZ81HgfMcpj8GWEAiN1aBsY5is/h6lzQKZjiUlsH/cuo1LHIjPhKzfRIwOqIj7Z7pppu2pYysIs1Hu6jEByM7qNDMDYC0pSma9lcEWCCux11USi/M3OmzDhjc8euPOY/1uQF34sJFYQk85C/rpUGg9g==" |

  @invalidWitnessTest @it-20
  Scenario: Sending a Tx and receiving from the server an invalid signature error (IT-20)
    Given There is a Byron wallet stored named many-tx-wallet
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
    Given There is a Byron wallet stored named many-tx-wallet
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
    Given There is a Byron wallet stored named many-tx-wallet
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
    Given There is a Byron wallet stored named empty-wallet
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000 |
    Then I should see a not enough ada error

  @it-59
  Scenario: Display warning if wallet changes during confirmation (IT-59)
    Given There is a Byron wallet stored named many-tx-wallet
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
    Given The expected transaction is "g6QAiIJYILcTzA1jEGw4BrGnB3zDeilPzKDkefJqrGTlHgmugI11AIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AYJYIAoHNmmEX+pK6DzUQYoLT9VmEAl6iWAagWtYkfZn40lsAIJYIAoHNmmEX+pK6DzUQYoLT9VmEAl6iWAagWtYkfZn40lsAQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAHoSAAhoABGzVAxoR/pTNoQKFhFggXnGsSYUyhwTHwB1G9f7mkd9iHoKwNvA477DkhDTXmX5YQEeb8ZgfkuchaWdmsZDIgu9Ne7EJVqJXuuI42ZKVxMRj91gmestk6pmBB32kKNj0GcLrynJ/McozqJJ4Vqp10AtYIO23hdKX7dxt3V0Cchr8MLvy1UwjID2hIegQ0F2VF6vHQaCEWCDse/gGDkp4k1B1ag5M4bRRe29RzP/QQZMOvvpvEPv0s1hAuN3MeNWhhiHRPMfQtVjdDUjLodew3LHPulO8TSjqxlfjLGl39sfmQ55tRDjZg79jDfLaAkxzWbXJ6WMaPmrWDVggVjNs6sBMbpP4HE6LrwaXJobTdjRCm+WpbheSv4cGYdhBoIRYIMx77WUfp7RKzGSCIG6trkNgf4x7dE0yGdo9SczB9h07WEAJTFdcHXI7gUmQmE1L/iO5MUNHHGjX3IqWk90nIKtuEzZWzcnsZC4/c8XLFclp++Zt++VffPyDWUkibAstP34EWCBYgDZGS5hmdznviyN0PIgAm/XR3K5WTeC/7Go04Pu/v0GghFggq89sIniqpRC9CbEInMd52i6wG9KoB+AjifwBNwGbwndYQBfx8lWIAaMnuv8fYEnZ7V5knrDaCPLfMzxkqhIPbQNRAfK5SIrlCh4PYdsFTpZOTrjKvoAz+ZDYESdn5I4cvgVYIF7CeZr1rkg9Mv//7NfE+OX8w46WodL6lwd3q57SNCDRQaCEWCC5TTZuZiJW+mD46uJ/IIwwoYvtsvdGnWfNR4HzHKY/BlhAo8VaQ1EYi/XnNGyr7sHCYADHCLv8sl7Vqge3qoS2bZ3oLMfDVXt1zVyOwvywfVVRTNYRosp35AhV/YClViAdCFggrsddVEovzNzpsw4Y3PHrjzmP9bkBd+LCRWEJPOQv66VBoPY="
    And I submit the wallet send form
    Then I should see the summary screen

  @it-60
  Scenario: User can send a tx after invalid password attempt (IT-60)
    Given There is a Byron wallet stored named many-tx-wallet
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
    Given The expected transaction is "g6QAhYJYILcTzA1jEGw4BrGnB3zDeilPzKDkefJqrGTlHgmugI11AIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAD0JAAhoACcQDAxoR/pTNoQKDhFggXnGsSYUyhwTHwB1G9f7mkd9iHoKwNvA477DkhDTXmX5YQGysuAsWMrUoYD6f5n5k2vmnVr2jWdoeFuanaxW8pk/F2kBfv7IPOpOwIvTVWuUknxJtJ11amUkNnHpX5GSRMQRYIO23hdKX7dxt3V0Cchr8MLvy1UwjID2hIegQ0F2VF6vHQaCEWCCPBkfbIHjkWa3BQgOfZnSx2uNRXSeHf/3Dr6sioCh8qlhANGxtDeRnQfiiCPFaWuvN/hiItSZxBk0NSGaQ5k4GPG3nFQdYatQrUqBCgqTcLz+3OG935IbMoHAIAnNlbcNeBlggRYcsb5A2HZ+Idr1h/VYzDe7f0Gt4E0SVRIi2VqWKcA5BoIRYIOx7+AYOSniTUHVqDkzhtFF7b1HM/9BBkw6++m8Q+/SzWEDqP1LXZUyJhvy/JouWNtcm8m9Ot0yejTfqvC7Wcjl4LXB7j+KJEl5DrLIXHij4ZBPHxOJc1n/bC7PJb7nRJ4APWCBWM2zqwExuk/gcTouvBpcmhtN2NEKb5aluF5K/hwZh2EGg9g=="
    And I submit the wallet send form
    Then I should see the summary screen

  @it-61
  Scenario: Display warning if wallet changes during send screen (IT-61)
    Given There is a Byron wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 2.000000 |
    And The transaction fees are "0.460004"
    Then A pending tx gets sent from my wallet from another client
    Then I should see a warning block

  @it-137
  Scenario: Test Shelley wallet delegation (IT-137)
     Given There is a Shelley wallet stored named shelley-simple-15
     Given I go to the delegation by id screen
     And I fill the delegation id form:
       | stakePoolId                                              |
       | df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207 |
     Then I see the stakepool ticker "YOROI"
     And I click on the next button in the delegation by id
     And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
     Then I see the delegation confirmation dialog
     Given The expected transaction is "g6UAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgAyvn8CGgACqWEDGhH+lM0EgoIAggBYHJVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464iDAoIAWByVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIWBzfF1Dfmy3yhfz7UPR0BlehjuOvQnJ9QQw3uGIHoQCCglggzJgJlEFQwA85E80rED6bQv5iQ/w2p2+euABpLivaPy5YQGfqZRTXJdAwSfWuC5mfNFtpH7E0mrFYIo9EkwHFno9OXTvKQyyIBF4YUReZSwlm6aPPdaTb797o+07O435voQ6CWCBhYnZTIMk608gswouVeL4xp5HwOjfcrgVjQ8wlu8s7MVhAa1BrgcAgZG4iJWlm5NjyeMGbOhB/Vx2k49c1GkLi/riW0yjZ+XGSLQeYYf9PEFH7hmHc1G+sYj6XuqEyKCAnBfY="
     Then I submit the wallet send form
     Given I click on see dashboard
     Then I should see the dashboard screen

  @it-161
  Scenario: Test Shelley wallet delegations with incorrect Spending password (IT-161)
    Given There is a Shelley wallet stored named shelley-simple-15
    Given I go to the delegation by id screen
    And I fill the delegation id form:
      | stakePoolId                                              |
      | df1750df9b2df285fcfb50f4740657a18ee3af42727d410c37b86207 |
    Then I see the stakepool ticker "YOROI"
    And I click on the next button in the delegation by id
    And I enter the wallet password:
    | password   |
    | qwerqwerqwer |
    Then I see the delegation confirmation dialog
    Then I submit the wallet send form
    Then I should see an delegation incorrect wallet password error message

  @it-162
  Scenario Outline: Send from an ergo wallet (IT-162)
    When I click the restore button for ergo
    Then I select bip44 15-word wallet
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                             |
    | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    And I enter the restored wallet password:
    | password   | repeatedPassword |
    | asdfasdfasdf | asdfasdfasdf       |
    And I click the "Restore Wallet" button
    Then I should see a plate CXTP-1821
    Then I click the next button
    Then I should see the opened wallet with name "Restored Wallet"
    When I go to the send transaction screen
    And I fill the form:
      | address                        | amount   |
      | <address>                      | <amount> |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I see CONFIRM TRANSACTION Pop up:
      | address   | amount    |fee      |
      | <address> | <amount>  |<fee>    |
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the summary screen

    Examples:
      | address                                             | amount       |fee         |
      | 9guxMsa2S1Z4xzr5JHUHZesznThjZ4BMM9Ra5Lfx2E9duAnxEmv | 5.000000000  |0.001100000 | 
  
  @it-163
  Scenario: Send all from an ergo wallet (IT-163)
    When I click the restore button for ergo
    Then I select bip44 15-word wallet
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                             |
    | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    And I enter the restored wallet password:
    | password   | repeatedPassword |
    | asdfasdfasdf | asdfasdfasdf       |
    And I click the "Restore Wallet" button
    Then I should see a plate CXTP-1821
    Then I click the next button
    Then I should see the opened wallet with name "Restored Wallet"
    When I go to the send transaction screen
    And I click on "Send all my ADA" checkbox
    And I fill the address of the form:
      | address                                                     |
      | 9guxMsa2S1Z4xzr5JHUHZesznThjZ4BMM9Ra5Lfx2E9duAnxEmv         |
    And The transaction fees are "0.001100000"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the summary screen
