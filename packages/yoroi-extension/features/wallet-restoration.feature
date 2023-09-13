Feature: Restore Wallet

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    And There is no wallet stored
    Then I should see the Create wallet screen
    Then Revamp. I switch to revamp version
    And I click the "Restore Wallet" button

  @it-6 @restore-wallet
  Scenario: Restoring an empty wallet (IT-6)
    Then I select 15-word wallet
    And I enter the recovery phrase:
      | recoveryPhrase                                                                             |
      | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    And I enter the restored wallet details:
      | walletName      | password     | repeatPassword |
      | Restored Wallet | asdfasdfasdf | asdfasdfasdf   |
    Then I should see a plate ZDDC-9858
    Then I click the "Restore" button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
      | address                                                                                                 |
      | addr1qy245684mdhpwzs0p37jz8pymn5g9v37rqjy78c59f06xau4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqdqef6t |
      | addr1qyv7qlaucathxkwkc503ujw0rv9lfj2rkj96feyst2rs9ey4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqzajfkn |

  @it-11 @restore-wallet
  Scenario: Fail to completely restore a wallet with addresses generated not following gap from BIP44 protocol (IT-11)
    Then I select 15-word wallet
    And I enter the recovery phrase:
      | recoveryPhrase                                                                                 |
      | grace saddle snake vocal amateur coin inside ginger leopard place liar patrol usual joy around |
    And I enter the restored wallet details:
      | walletName      | password     | repeatPassword |
      | Restored Wallet | asdfasdfasdf | asdfasdfasdf   |
    Then I should see a plate PNHH-3365
    And I click the "Restore" button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
      | address                                                                                                 |
      | addr1qymqlsf2aent7ddr4l8zh34rl3qgk79gav8rr8c7r72vwdrjlv3qxt89y5f3yya3mnw0zx67whft2n73ulm2wtha2r9q20asqp |

  @it-10 @restore-wallet
  Scenario: (IT-10) Mnemonic words can be cleared by pressing "Clear all"
    Then I select 15-word wallet
    And I enter the recovery phrase, not clicking next:
      | recoveryPhrase                                                                             |
      | eight country switch draw meat scout mystery blade tip drift useless good keep usage usage |
    Then I delete recovery phrase by clicking "Clear all"

  @it-13 @restore-wallet
  Scenario: (IT-13) Mnemonic words can be cleared by deleting each word on wallet restoration screen
    Then I select 15-word wallet
    And I enter the recovery phrase, not clicking next:
      | recoveryPhrase                                                                             |
      | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    Then I delete recovery phrase

  @it-26 @restore-wallet
  Scenario: Wallet can't be restored without entering password (IT-26)
    Then I select 15-word wallet
    And I enter the recovery phrase:
      | recoveryPhrase                                                                                           |
      | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster |
    And I enter the restored wallet details:
      | walletName      | password     | repeatPassword |
      | Restored Wallet | asdfasdfasdf | asdfasdfasdf   |
    And I clear the restored wallet password asdfasdfasdf
    Then I see the "Restore" button is disabled
    And I should stay in the restore wallet dialog

  @it-70 @restore-wallet
  Scenario Outline: Wallet restoration Recovery Phrase test (IT-70)
    Then I select 15-word wallet
    And I enter the recovery phrase, not clicking next:
      | recoveryPhrase   |
      | <recoveryPhrase> |
    Then I see the "Next" button is disabled
    And I should stay in the restore wallet dialog
    And I should see an "Invalid recovery phrase" error message

    Examples:
      | recoveryPhrase                                                                                           |                    |
      | atom remind style monster lunch result upgrade fashion eight limit glance frequent eternal borrow accuse | invalid word order |

  @it-71 @restore-wallet
  Scenario Outline: Ensure user can not add more than 15 words to the Yoroi Wallet Recovery Phrase (IT-71)
    And I click the restore button for cardano
    Then I select Byron-era 15-word wallet
    And I enter the name "Restored Wallet"
    And I can't enter more then 15 words from the recovery phrase:
      | recoveryPhrase   |
      | <recoveryPhrase> |
    Then I don't see last word of <recoveryPhrase> in recovery phrase field
    Examples:
      | recoveryPhrase                                                                                                  |                 |
      | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster galaxy | 16-words phrase |

  @it-73 @restore-wallet
  Scenario Outline: Wallet restoration Recovery Phrase with less than 15 words (IT-73)
    And I click the restore button for cardano
    Then I select Byron-era 15-word wallet
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
      | recoveryPhrase   |
      | <recoveryPhrase> |
    Then I should see an "1 words left" error message:
      | message                                               |
      | wallet.restore.dialog.form.errors.shortRecoveryPhrase |

    Examples:
      | recoveryPhrase                                                                                   |                 |
      | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow | 14-words phrase |

  @it-86 @restore-wallet
  Scenario: Successfully restoring a simple wallet (IT-86)
    When I click the restore button for cardano
    Then I select Byron-era 15-word wallet
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
      | recoveryPhrase                                                                                   |
      | shoe rose battle fine shoulder address kite coffee jaguar proof practice area party sphere train |
    And I enter the restored wallet password:
      | password     | repeatedPassword |
      | asdfasdfasdf | asdfasdfasdf     |
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

  @it-87 @restore-wallet
  Scenario: Ensure that wallet addresses are restored correctly (IT-87)
    When I click the restore button for cardano
    Then I select Byron-era 15-word wallet
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
      | recoveryPhrase                                                                                        |
      | offer liberty horror emerge twice behind tag agree october dismiss vehicle obtain anchor endorse town |
    And I enter the restored wallet password:
      | password     | repeatedPassword |
      | asdfasdfasdf | asdfasdfasdf     |
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

  @it-95 @restore-wallet
  Scenario: Create & delete (1 wallet) (IT-95)
    # copy the DB
    Given I capture DB state snapshot
    # wallet 1
    When I click the restore button for cardano
    Then I select Byron-era 15-word wallet
    And I enter the name "shelley-delegated"
    And I enter the recovery phrase:
      | recoveryPhrase                                                                                   |
      | parrot offer switch thank film high drop salute task train squirrel coral consider coyote evolve |
    And I enter the restored wallet password:
      | password     | repeatedPassword |
      | asdfasdfasdf | asdfasdfasdf     |
    And I click the "Restore Wallet" button
    Then I should see a plate BENZ-3270
    Then I click the next button
    Then I should see the opened wallet with name "shelley-delegated"
    # give some time for the wallet to fully sync
    Given I sleep for 2500
    # remove wallet #1
    Then I navigate to the general settings screen
    And I click on secondary menu "wallet" item
    When I click on remove wallet
    Then I click on the checkbox
    And I click the next button
    # wait for page to reload
    Given I sleep for 5000
    # check removing didn't affect other wallets
    Then I compare to DB state snapshot
    And I should see the Create wallet screen

  @it-117 @restore-wallet
  Scenario: Switch wallets (IT-117)
    # wallet 1
    Given There is a Byron wallet stored named many-tx-wallet
    # prep adding 2nd wallet
    Then I unselect the wallet
    And I click to add an additional wallet
    # wallet 2 (same as wallet 1)
    Given There is a Byron wallet stored named small-single-tx
    # switch to wallet #1
    Then I switch to "many-tx-wallet" from the dropdown
    Then I should see the opened wallet with name "many-tx-wallet"

  @it-132 @restore-wallet
  Scenario: Restoring a shelley 15-word wallet (IT-132)
    When I click the restore button for cardano
    Then I select Shelley-era 15-word wallet
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
      | recoveryPhrase                                                                             |
      | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    And I enter the restored wallet password:
      | password     | repeatedPassword |
      | asdfasdfasdf | asdfasdfasdf     |
    And I click the "Restore Wallet" button
    Then I should see a plates
      | plate     |
      | ZDDC-9858 |
      | EAJD-7036 |
    Then I click the next button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
      | address                                                                                                 |
      | addr1qy245684mdhpwzs0p37jz8pymn5g9v37rqjy78c59f06xau4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqdqef6t |
      | addr1qyv7qlaucathxkwkc503ujw0rv9lfj2rkj96feyst2rs9ey4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqzajfkn |

  @it-133 @restore-wallet
  Scenario: Restoring a shelley 24-word wallet (IT-133)
    When I click the restore button for cardano
    Then I select Shelley-era 24-word wallet
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
      | recoveryPhrase                                                                                                                                                          |
      | reunion walnut update express purse defense slice barrel estate olympic february flock give team alert coast luggage exhaust notable bag december split furnace sponsor |
    And I enter the restored wallet password:
      | password     | repeatedPassword |
      | asdfasdfasdf | asdfasdfasdf     |
    And I click the "Restore Wallet" button
    Then I should see a plate DSKC-9213
    Then I click the next button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
      | address                                                                                                 |
      | addr1qx9d2x5e9exhup6xlf5macv3c78qw66mru3tl7m3yn9je0qncaqpmszl9y4jl8vgqvhg6n3ad5td5m74fu4un65ayshqx479hd |
