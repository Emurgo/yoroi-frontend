Feature: Transfer Daedalus Wallet funds

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Given There is a Byron wallet stored named empty-wallet

  @it-99
  Scenario: Daedalus transfer fails when user type invalid mnemonic phrase (IT-99)
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I select the 12-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster |
    Then I should see an "Invalid recovery phrase" error message
  
  @it-84
  Scenario: Daedalus transfer should fail to recover wallet if connection was lost (IT-84)
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I select the 12-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                          |
    | leaf immune metal phrase river cool domain snow year below result three |
    And I proceed with the recovery
    Then I should see an Error screen
    And I should see 'Connection lost' error message

  @it-35
  Scenario: Ensure user can not add more than 12 words to the Daedalus recovery phrase (IT-35)
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I select the 12-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                          |
    | leaf immune metal phrase river cool domain snow year below result three |
    Then I enter one more word to the recovery phrase field:
    | word   |
    | gadget |

  @withWebSocketConnection @it-45
  Scenario: User can transfer Daedalus funds to Yoroi using 12-word mnemonic phrase (IT-45)
    And My Daedalus wallet has funds
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I select the 12-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                          |
    | leaf immune metal phrase river cool domain snow year below result three |
    And I proceed with the recovery
    Then I should wait until funds are recovered:
    | fromAddress                                                                                              | amount |   
    | DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb | 2000000 |
    | DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm | 2000000 |
    Given The expected transaction is "g6QAgoJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11CYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11CgGBglgrgtgYWCGDWBwoHaM1MYhgfLim8H41W1iW2HF0vHYAe5aqHlfRoAAaC5i61BoAOlWnAhoAArNZAxoR/pTNoQKChFggYl7pBU3amzE1pil1r1ST2mJ5DvV9yGTU4Y1ChQ9DVOZYQK2lw7lqfAiCe9TJxrps+r9jpXlTTuiNJGPLfOSmsPs6UGk5WdKMcZi4TMqp+oGmMziZ9D8MiOiXa/sxA3DfwwFYIFmMawkFtjRm2CxVuEFZJ57SV8Pxo/rmi1W73FTfMNSOWCKhAVgeWBypg7XhsgcTZ7wcnJCT4Ge537janRgFqjmR+aGyhFgg8yfLKHBscpfqq7TpUh4rWj5tSofEZ3UgHmA4yo4dCExYQC8mLLrUKNi15ttjP5IrKSl4oiAPq0uWtudSqr2fbxEHUz+ssAo2MEzhOS/zarHww7510AFvuZpiB11wL96JfAJYIHS37xxfMSPsLLV88sfVa4xwz+PdhlDaPoXmQM6TX7OqWCKhAVgeWBypg7XhsgcTNtAHZpBr3/PspPxn2cLst4Q2lh9t9g=="
    When I confirm Daedalus transfer funds
    Then I should see the summary screen
    
  @withWebSocketConnection @it-80
  Scenario: Daedalus transfer should fail if the 12-words mnemonics corresponds to an empty Daedalus wallet (IT-80)
    And My Daedalus wallet has no funds
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I select the 12-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                          |
    | leaf immune metal phrase river cool domain snow year below result three |
    And I proceed with the recovery
    Then I should see an Error screen
    And I should see 'Daedalus wallet without funds' error message

  @withWebSocketConnection @it-19
  Scenario: User can transfer Daedalus funds to Yoroi using master key (IT-19)
    And My Daedalus wallet has funds
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the transfer funds from Daedalus master key button
    # enter private key for following mnemonic
    # leaf immune metal phrase river cool domain snow year below result three
    And I enter the master key:
    | masterKey |
    | 50d1b52581adefa3e99025ade8f7189318e1e9ac2f0a1d66d9a1c86f3908ca5fe1a5e08866b500a9a0e11d48c41dbb4957c550b418e7b5c6c9a531ab37037c35d0e9ecaab457c8dea556bb2ef43ec59cc943b12adb39c9d38d4d90563b9014a7 |
    And I proceed with the recovery
    Then I should wait until funds are recovered:
    | fromAddress                                                                                          | amount |   
    | DdzFFzCqrhstBgE23pfNLvukYhpTPUKgZsXWLN5GsawqFZd4Fq3aVuGEHk11LhfMfmfBCFCBGrdZHVExjiB4FY5Jkjj1EYcqfTTNcczb | 2000000 |
    | DdzFFzCqrht74dr7DYmiyCobGFQcfLCsHJCCM6nEBTztrsEk5kwv48EWKVMFU9pswAkLX9CUs4yVhVxqZ7xCVDX1TdatFwX5W39cohvm | 2000000 |
    Given The expected transaction is "g6QAgoJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11CYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11CgGBglgrgtgYWCGDWBwoHaM1MYhgfLim8H41W1iW2HF0vHYAe5aqHlfRoAAaC5i61BoAOlWnAhoAArNZAxoR/pTNoQKChFggYl7pBU3amzE1pil1r1ST2mJ5DvV9yGTU4Y1ChQ9DVOZYQK2lw7lqfAiCe9TJxrps+r9jpXlTTuiNJGPLfOSmsPs6UGk5WdKMcZi4TMqp+oGmMziZ9D8MiOiXa/sxA3DfwwFYIFmMawkFtjRm2CxVuEFZJ57SV8Pxo/rmi1W73FTfMNSOWCKhAVgeWBypg7XhsgcTZ7wcnJCT4Ge537janRgFqjmR+aGyhFgg8yfLKHBscpfqq7TpUh4rWj5tSofEZ3UgHmA4yo4dCExYQC8mLLrUKNi15ttjP5IrKSl4oiAPq0uWtudSqr2fbxEHUz+ssAo2MEzhOS/zarHww7510AFvuZpiB11wL96JfAJYIHS37xxfMSPsLLV88sfVa4xwz+PdhlDaPoXmQM6TX7OqWCKhAVgeWBypg7XhsgcTNtAHZpBr3/PspPxn2cLst4Q2lh9t9g=="
    When I confirm Daedalus transfer funds
    Then I should see the summary screen