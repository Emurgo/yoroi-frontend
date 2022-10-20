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
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen
    

    Examples:
      | amount              | fee       | expectedTx |
      | 1.000000            | 0.640000  | "g6QAgoJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAD0JAAhoACcQAAxoR/pTNoQKChFggjwZH2yB45FmtwUIDn2Z0sdrjUV0nh3/9w6+rIqAofKpYQJnz4URZfjl5AOpaEjMTWdF1lsFXPE+IKC0puBMdBjkWaqk6BIzW8VZ7pu7f8J/Mv8E3lRFiBVX7BnDQNYlT7g1YIEWHLG+QNh2fiHa9Yf1WMw3u39BreBNElUSItlalinAOQaCEWCDse/gGDkp4k1B1ag5M4bRRe29RzP/QQZMOvvpvEPv0s1hASaHptgaRcfgiyLBN80gqUIAueQBKkwSLu9iAd+UIN7PELThmN5ItmVzMeZIevE/7eS7wFX15sax9ap5ihK/1ClggVjNs6sBMbpP4HE6LrwaXJobTdjRCm+WpbheSv4cGYdhBoPY=" |
      | 2.000000            | 0.460000  | "g6QAg4JYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAHoSAAhoABwTgAxoR/pTNoQKDhFggjwZH2yB45FmtwUIDn2Z0sdrjUV0nh3/9w6+rIqAofKpYQLM12LTh1NoxSUm0bbVTQfygHhTVh6bLYXlVC4cnlUPGu45AojcnGEqZTE/+vItV7EvsBBlKTapopZofryrXrA5YIEWHLG+QNh2fiHa9Yf1WMw3u39BreBNElUSItlalinAOQaCEWCDse/gGDkp4k1B1ag5M4bRRe29RzP/QQZMOvvpvEPv0s1hAwPcLKhKTeclUAgVMRh7EHv2F+jv6zQ7fpsQwbSucHpESYz+8QamNsB45zU8ocp5K4WDesTR7nxE7I9lvBc0jAlggVjNs6sBMbpP4HE6LrwaXJobTdjRCm+WpbheSv4cGYdhBoIRYIMx77WUfp7RKzGSCIG6trkNgf4x7dE0yGdo9SczB9h07WEBwOJ1TbOoaNh9Uf+erO5luL5/5sIvddiala/3VB2vFJXbohZnvvrJvQoi5Cc0AthRftjupDgna8dmSt25s7WYFWCBYgDZGS5hmdznviyN0PIgAm/XR3K5WTeC/7Go04Pu/v0Gg9g==" |

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
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000  |0.199117 |

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
    And I fill the address of the form:
      | address                                                     |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv |
    And I open the amount dropdown and select send all
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is <expectedTx>
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

    Examples:
      | fee       | expectedTx |
      | 0.209237  | "g6QAiYJYILcTzA1jEGw4BrGnB3zDeilPzKDkefJqrGTlHgmugI11AIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AYJYIAoHNmmEX+pK6DzUQYoLT9VmEAl6iWAagWtYkfZn40lsAIJYIAoHNmmEX+pK6DzUQYoLT9VmEAl6iWAagWtYkfZn40lsAQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoALENMAhoAAzEpAxoR/pTNoQKGhFggXnGsSYUyhwTHwB1G9f7mkd9iHoKwNvA477DkhDTXmX5YQOgqSLhR8sUADEtWnvr6NjvmTSgZecfPXL4Rbu7TIp2UmflUqzzfx1vZ3J9wyB/h6smfq8mlqlqNVyNfO6j07A5YIO23hdKX7dxt3V0Cchr8MLvy1UwjID2hIegQ0F2VF6vHQaCEWCCPBkfbIHjkWa3BQgOfZnSx2uNRXSeHf/3Dr6sioCh8qlhAoi4s6bvzxVwn4Gkdsyewl2mPghpInwoRfQnmQIbGPcI1JoQpB64cB1cd9+f/w+uAt/t2aSU8DSFgkRkWddj9A1ggRYcsb5A2HZ+Idr1h/VYzDe7f0Gt4E0SVRIi2VqWKcA5BoIRYIOx7+AYOSniTUHVqDkzhtFF7b1HM/9BBkw6++m8Q+/SzWEDSvpZpGjk74C0E4gieWGRuFWhdnP4640l259qPRUzr5TnkUhc5BRq/ubxVC6LBqDd11PZa/g8XWGoFUJiY+toAWCBWM2zqwExuk/gcTouvBpcmhtN2NEKb5aluF5K/hwZh2EGghFggzHvtZR+ntErMZIIgbq2uQ2B/jHt0TTIZ2j1JzMH2HTtYQOCCXW2Lo0iUC+HsPqg/MgSbR3Rb+Z/WLxDhQ4t9qeZYnoXUDPOZWMOz9ToWLibo+75g5IzTK+CNWtrgM5BtmAdYIFiANkZLmGZ3Oe+LI3Q8iACb9dHcrlZN4L/sajTg+7+/QaCEWCCrz2wieKqlEL0JsQicx3naLrAb0qgH4COJ/AE3AZvCd1hATLVkXVaSCrYGXA3jOCO9JSZiqhyRYLG1IZaSVETBS9Xb9ovg+kCCX8V43NxNuwLVQ5udSiJKv5Sbf9CUhpfyAVggXsJ5mvWuSD0y///s18T45fzDjpah0vqXB3erntI0INFBoIRYILlNNm5mIlb6YPjq4n8gjDChi+2y90adZ81HgfMcpj8GWEDjpBRrBC2WEwVLLgI0qgXRYmxNAtjRcPdEaFKTugqQ0/vup0jP1r4wMq6rqkqMWOWdaodtClZs3KBIW1cXWv0FWCCux11USi/M3OmzDhjc8euPOY/1uQF34sJFYQk85C/rpUGg9g==" |

  @invalidWitnessTest @it-20
  Scenario: Sending a Tx and receiving from the server an invalid signature error (IT-20)
    Given There is a Byron wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000 |
    And The transaction fees are "0.640000"
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
    And The transaction fees are "0.640000"
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
    And The transaction fees are "0.460000"
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
    Given The expected transaction is "g6QAg4JYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AYJYIAoHNmmEX+pK6DzUQYoLT9VmEAl6iWAagWtYkfZn40lsAQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAHoSAAhoABGzQAxoR/pTNoQKDhFgg7Hv4Bg5KeJNQdWoOTOG0UXtvUcz/0EGTDr76bxD79LNYQJgmViCF11mg1pQBlxk5WmjKSs335DeKn3nsuX34oYLm25fA7GEios1jIGV+DVc5TCvhR9taKi5BImTCR56izgNYIFYzbOrATG6T+BxOi68GlyaG03Y0QpvlqW4Xkr+HBmHYQaCEWCDMe+1lH6e0SsxkgiBura5DYH+Me3RNMhnaPUnMwfYdO1hA2eLKUK3aour0AVVuH9n8iplfXanW6IR4KpRrPT03y0a5wCR9LBoyZKIvAI0VhZChXHZUqm7wxy6O5eD6mLpICFggWIA2RkuYZnc574sjdDyIAJv10dyuVk3gv+xqNOD7v79BoIRYILlNNm5mIlb6YPjq4n8gjDChi+2y90adZ81HgfMcpj8GWEAdrzsYU4XXFWKVSukTrZoSKmwL9O5BFooOSPuLB3XUpVQz9jW4TIa1jRIPBnfiVzvASIzc+7YdJ4EPfEhkjPgKWCCux11USi/M3OmzDhjc8euPOY/1uQF34sJFYQk85C/rpUGg9g=="
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

  @it-60
  Scenario: User can send a tx after invalid password attempt (IT-60)
    Given There is a Byron wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 1.000000 |
    And The transaction fees are "0.640000"
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
    Given The expected transaction is "g6QAgoJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAQGBglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAD0JAAhoACcQAAxoR/pTNoQKChFggjwZH2yB45FmtwUIDn2Z0sdrjUV0nh3/9w6+rIqAofKpYQJnz4URZfjl5AOpaEjMTWdF1lsFXPE+IKC0puBMdBjkWaqk6BIzW8VZ7pu7f8J/Mv8E3lRFiBVX7BnDQNYlT7g1YIEWHLG+QNh2fiHa9Yf1WMw3u39BreBNElUSItlalinAOQaCEWCDse/gGDkp4k1B1ag5M4bRRe29RzP/QQZMOvvpvEPv0s1hASaHptgaRcfgiyLBN80gqUIAueQBKkwSLu9iAd+UIN7PELThmN5ItmVzMeZIevE/7eS7wFX15sax9ap5ihK/1ClggVjNs6sBMbpP4HE6LrwaXJobTdjRCm+WpbheSv4cGYdhBoPY="
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

  @it-61
  Scenario: Display warning if wallet changes during send screen (IT-61)
    Given There is a Byron wallet stored named many-tx-wallet
    And I have a wallet with funds
    When I go to the send transaction screen
    And I fill the form:
      | address                                                     | amount   |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 2.000000 |
    And The transaction fees are "0.460000"
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
     Given The expected transaction is "g6UAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgAyvy8CGgACqLEDGhH+lM0EgoIAggBYHJVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464iDAoIAWByVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIWBzfF1Dfmy3yhfz7UPR0BlehjuOvQnJ9QQw3uGIHoQCCglggzJgJlEFQwA85E80rED6bQv5iQ/w2p2+euABpLivaPy5YQHEdUseECOD2uvaPsvnqa7qokE+koErqhMlU7SoRpEBgZwCbQsCLASGtkX9RfQneivUNZ59qdoz/srdWvcs3lA2CWCBhYnZTIMk608gswouVeL4xp5HwOjfcrgVjQ8wlu8s7MVhA473MwzWGlnDrg/XveIWkW2T8d0MPr3wOHo5pY94l7F/D3cDiFu6LQANl8WRGBAlDvSoVaW4PIQRjuoLRFw9VCfY="
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
    Given There is an Ergo wallet stored named ergo-simple-wallet
    And I have an ERGO wallet with funds
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
    Then I should see the successfully sent page
    And I click the transaction page button
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
    And I fill the address of the form:
      | address                                                     |
      | 9guxMsa2S1Z4xzr5JHUHZesznThjZ4BMM9Ra5Lfx2E9duAnxEmv         |
    And I open the amount dropdown and select send all
    And The transaction fees are "0.001100000"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

  @it-164
  Scenario Outline: Can receive & send funds from enterprise address (IT-164)
    Given There is a Shelley wallet stored named shelley-enterprise
    And I have a wallet with funds
    And I go to the receive screen
    When I click on the enterprise external tab
    And I should see the addresses exactly list them
    | address                                                    |
    | addr1vyhs6c286p4eanrech8876gkhqdy98pd3rdqr0u69p24hyq75uyuw |
    | addr1vxmlzg3gg6tc9fgkqw2ymj09axadhjkc0kkk7whuu9fkrvqpdrama |
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
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

    Examples:
      | amount              | fee       | expectedTx |
      | 1.000000            | 0.167657  | "g6QAgYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11FgGCglgrgtgYWCGDWBxA66wjgpZH9bPPW9JExWBcIUqKGMmxBlNBcCzWoAAa8oZfOxoAD0JAglg5Af0wLcvG6+RrU5YfLU0x/8kfm6HbRxOuVhSWZr6F4UOa5bEdhsrcaqLcJ6I+wLsaSX6JnAGqOfdrGgCGxVcCGgACjukDGhH+lM2hAIGCWCAosn+8mv+rxG+osiOOtkzZqx67+DrT7IF+s0fWbhA6bFhAokhEoNLBWrk60+zXT7fcdHwV5A6j6BUyd8x2g52AGEjx6ckVVBpKSUWLfMCYiuz2m6Z+6zV7lMvgR/QL9qFDBvY=" |

  @it-165
  Scenario: Can receive & unmangle utxo entries (IT-165)
    Given There is a Shelley wallet stored named shelley-mangled
    And I have a wallet with funds
    And I go to the receive screen
    When I click on the base mangled tab
    And I should see the addresses exactly list them
    | address                                                    |
    | addr1q8sm64ehfue7m7xrlh2zfu4uj9tn3z3yrzfdaly52gs667qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhzdk70 |
    When I click on the unmangle button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | recoveredBalance           | fees |
    | addr1q8sm64ehfue7m7xrlh2zfu4uj9tn3z3yrzfdaly52gs667qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhzdk70 | 10 | 0.165457 |
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6QAgYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11FwGBglg5ATFf/lO+USTb83qMl8g53oV7XmMSuklF3gfHb8kex9YZS/n0WTCduT05oFTkplWcw+TU0UvasV/VGgCWEFsCGgAChiUDGhH+lM2hAIGCWCCxG2517QHEmTBkk1BC3zBriToLyq4PxNikr8LCc0V+jFhA0LkC9dcwcE8kORl7Oo4D4lql/IEmb+pFM9JXsKFjTXpKLIftor3/GXjnZRZh9TWkoQhBFisxgf65tR2Pfsq+AfY="
    When I confirm Yoroi transfer funds
    Then I should see the summary screen
    And I should see 1 pending transactions

  @it-170
  Scenario Outline: Can send some of a custom token (IT-170)
    Given There is an Ergo wallet stored named ergo-token-wallet
    And I have an ERGO wallet with funds
    When I go to the send transaction screen
    And I open the token selection dropdown
    And I select token "USD"
    And I fill the form:
      | address                        | amount   |
      | <address>                      | <amount> |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I see CONFIRM TRANSACTION Pop up:
      | address   | amount    |fee      |
      | <address> | 0.010000000  |<fee>    |
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

    Examples:
      | address                                             | amount       |fee         |
      | 9guxMsa2S1Z4xzr5JHUHZesznThjZ4BMM9Ra5Lfx2E9duAnxEmv | 123  |0.001100000 |

  @it-171
  Scenario: Can send all of a custom token (IT-171)
    Given There is an Ergo wallet stored named ergo-token-wallet
    And I have an ERGO wallet with funds
    When I go to the send transaction screen
    And I open the token selection dropdown
    And I select token "USD"
    And I fill the address of the form:
      | address                                                     |
      | 9guxMsa2S1Z4xzr5JHUHZesznThjZ4BMM9Ra5Lfx2E9duAnxEmv         |
    And I open the amount dropdown and select send all
    And The transaction fees are "0.001100000"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

  @it-178
  Scenario Outline: Can send some of a custom Cardano token (IT-178)
    Given There is a Shelley wallet stored named cardano-token-wallet
    And I have a wallet with funds
    When I go to the send transaction screen

    And I open the token selection dropdown
    And I select token "nicoin"

    And I fill the form:
      | address                        | amount   |
      | <address>                      | <amount> |
    And The transaction fees are "<fee>"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I see CONFIRM TRANSACTION Pop up:
      | address   | amount    |fee      |
      | <address> | 1.444443  |<fee>    |
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6QAgYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11GBoBgoJYK4LYGFghg1gcQOusI4KWR/Wzz1vSRMVgXCFKihjJsQZTQXAs1qAAGvKGXzuCGgAWCluhWBzScZdoLXGQXAh8XDthsQ5tdG2wub7zUQFNdbsmoUZuaWNvaW4YGIJYOQHCOXo7AskuPwKPyvBLXitN1JhK7qw3sfYP1+4O5sPVeGnk6yzmr8YYpWzAu4tvCIuHO8+8BgeUQIIaACRhIKFYHNJxl2gtcZBcCHxcO2GxDm10bbC5vvNRAU11uyahRm5pY29pbhhMAhoAAp2FAxoR/pTNoQCBglgg2ryVo6+TyYjX+sqaAvK82tVCDycATBUMC9wANgPth/VYQHlZXPNDWElwk6ywyZArA/tp/mEDLqKxszGV0d4MQSckziOR/NlT5M5u+XmYr3ntX+dUwy9hvRn5X/jnpLpRYwH2"
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen

    Examples:
      | address                                             | amount       |fee         |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv | 24  |0.171397 |

  @it-179
  Scenario: Can send all of a custom Cardano token (IT-179)
    Given There is a Shelley wallet stored named cardano-token-wallet
    And I have a wallet with funds
    When I go to the send transaction screen

    And I open the token selection dropdown
    And I select token "nicoin"

    And I open the amount dropdown and select send all
    And I fill the address of the form:
      | address                                                     |
      | Ae2tdPwUPEZ3HUU7bmfexrUzoZpAZxuyt4b4bn7fus7RHfXoXRightdgMCv         |
    And The transaction fees are "0.169637"
    And I click on the next button in the wallet send form
    And I see send money confirmation dialog
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6QAgYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11GBoBgoJYK4LYGFghg1gcQOusI4KWR/Wzz1vSRMVgXCFKihjJsQZTQXAs1qAAGvKGXzuCGgAWCluhWBzScZdoLXGQXAh8XDthsQ5tdG2wub7zUQFNdbsmoUZuaWNvaW4YZIJYOQHCOXo7AskuPwKPyvBLXitN1JhK7qw3sfYP1+4O5sPVeGnk6yzmr8YYpWzAu4tvCIuHO8+8BgeUQIIaACRoAKACGgAClqUDGhH+lM2hAIGCWCDavJWjr5PJiNf6ypoC8rza1UIPJwBMFQwL3AA2A+2H9VhAod8QFO11FtfoTJ1Y0ZpeN1e6OFphVJpgjKTSXI+FMw3CV5UIr4eMIIHcxwEgJiOtiYIGIIZyVZAdQbJnSmeTBPY="
    And I submit the wallet send form
    Then I should see the successfully sent page
    And I click the transaction page button
    Then I should see the summary screen
