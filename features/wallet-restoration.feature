Feature: Restore Wallet

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    And There is no wallet stored

  @it-6
  Scenario: Restoring an empty wallet (IT-6)
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                             |
    | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    And I enter the restored wallet password:
    | password   | repeatedPassword |
    | asdfasdfasdf | asdfasdfasdf       |
    And I click the "Restore Wallet" button
    Then I should see a plate EAJD-7036
    Then I click the next button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc |

  @it-13
  Scenario: Mnemonic words can be cleared by pressing "x" sign for each word on wallet restoration screen (IT-13)
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                             |
    | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    Then I delete recovery phrase by clicking "x" signs
  
  @it-86
  Scenario: Successfully restoring a simple wallet (IT-86)
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                   |
    | shoe rose battle fine shoulder address kite coffee jaguar proof practice area party sphere train |
    And I enter the restored wallet password:
    | password   | repeatedPassword |
    | asdfasdfasdf | asdfasdfasdf       |
    And I click the "Restore Wallet" button
    Then I should see a plate SETH-7545
    Then I click the next button
    Then I should see the opened wallet with name "Restored Wallet"
    Given There are 2 generated addresses
    And I go to the receive screen
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZ7sn3AQhUFGHXiWuG5aU3XnMi2SNKeh94S9Pp17igo1RwzodB |
    | Ae2tdPwUPEZ73Nh3ALXKwtt9Wmb8bQHa9owoXtkvGEWK3AX6kXNHBK1D261 |

  @it-87
  Scenario: Ensure that wallet addresses are restored correctly (IT-87)
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                        |
    | offer liberty horror emerge twice behind tag agree october dismiss vehicle obtain anchor endorse town |
    And I enter the restored wallet password:
    | password   | repeatedPassword |
    | asdfasdfasdf | asdfasdfasdf       |
    And I click the "Restore Wallet" button
    Then I should see a plate DADJ-4614
    Then I click the next button
    Then I should see the opened wallet with name "Restored Wallet"
    Given There are 6 generated addresses
    And I go to the receive screen
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEYz5p78UtoKpzeQV8DMEHf8nM9TNJGu1xwF9ez26Zx26wupZ2v |
    | Ae2tdPwUPEZ7RZHyqo5P7LMcFny5PLpJJax9Xma8QqdTV5PeYeGwivdwGNq |
    | Ae2tdPwUPEZ5jDsa81F9tjv9QunxzBLsrV8XNjYdt5CdNtuAUKgroxTxZdP |
    | Ae2tdPwUPEYy4sHipF5wCMmFhsz9asT5HdEarYcguJimUnVebcTKnfViLak |
    | Ae2tdPwUPEZBdh5hX9QMWCeiihXf3onFAgx6KzKBtm7nj4wwyN8eoroTWqF |
    | Ae2tdPwUPEYzErSRwThtfVfBbhM87NCXDwkGHRqSYJcRVP4GS8Lgx3AxAXd |

  @it-11
  Scenario: Fail to completely restore a wallet with addresses generated not following gap from BIP44 protocol (IT-11)
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                 |
    | grace saddle snake vocal amateur coin inside ginger leopard place liar patrol usual joy around |
    And I enter the restored wallet password:
    | password   | repeatedPassword |
    | asdfasdfasdf | asdfasdfasdf       |
    And I click the "Restore Wallet" button
    Then I should see a plate HNHT-5379
    Then I click the next button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZLzYQaqFk1U9VWBeY9AfQ2hKBWZjxtfwWVE46sy6u5ZZAeFu1 |

    @it-26
    Scenario: Wallet can't be restored without entering password (IT-26)
    And I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster |
    And I enter the restored wallet password:
    | password   | repeatedPassword |
    | asdfasdfasdf | asdfasdfasdf       |
    And I clear the restored wallet password asdfasdfasdf
    Then I see the submit button is disabled
    And I should stay in the restore wallet dialog
    
    @it-70
    Scenario Outline: Wallet restoration Recovery Phrase test (IT-70)
    And I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase   |
    | <recoveryPhrase> |
    And I enter the restored wallet password:
    | password   | repeatedPassword |
    | asdfasdfasdf | asdfasdfasdf       |
    Then I see the submit button is disabled
    And I should stay in the restore wallet dialog
    And I should see an "Invalid recovery phrase" error message:
    | message                                                 |
    | wallet.restore.dialog.form.errors.invalidRecoveryPhrase |
    Examples:
    | recoveryPhrase                                                                                           |                    |
    | atom remind style monster lunch result upgrade fashion eight limit glance frequent eternal borrow accuse | invalid word order |

    @it-71
    Scenario Outline: Ensure user can not add more than 15 words to the Yoroi Wallet Recovery Phrase (IT-71)
    And I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase   |
    | <recoveryPhrase> |
    Then I don't see last word of <recoveryPhrase> in recovery phrase field
    Examples:
    | recoveryPhrase                                                                                                  |                    |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster galaxy | 16-words phrase    |

    @it-72
    Scenario: Restoring a paper wallet (IT-72)
      When I click the restore paper wallet button
      And I enter the name "Restored Wallet"
      And I enter the recovery phrase:
      | recoveryPhrase                                                                                        |
      | mushroom expose slogan wagon uphold train absurd fix snake unable rescue curious escape member resource garbage enemy champion airport matrix year |
      And I enter the paper wallet password "cool password"
      And I enter the restored wallet password:
      | password   | repeatedPassword |
      | asdfasdfasdf | asdfasdfasdf       |
      And I click the "Restore Wallet" button
      Then I should see a plate KOTZ-1730
      Then I click the next button
      Then I should see the opened wallet with name "Restored Wallet"
      And I go to the receive screen
      And I should see the addresses exactly list them
      | address                                                     |
      | Ae2tdPwUPEZ7TQpzbJZCbA5BjW4zWYFn47jKo43ouvfe4EABoCfvEjwYvJr |

    @it-73
    Scenario Outline: Wallet restoration Recovery Phrase with less than 15 words (IT-73)
    And I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase   |
    | <recoveryPhrase> |
    Then I should see an "X words left" error message:
    | message                                                 |
    | wallet.restore.dialog.form.errors.shortRecoveryPhrase |
    Examples:
    | recoveryPhrase                                                                                           |                    |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow         | 14-words phrase    |
