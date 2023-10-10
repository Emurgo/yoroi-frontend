Feature: Restore Wallet

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    And There is no wallet stored
    Then I should see the Create wallet screen
    And Revamp. I switch to revamp version

  @it-6 @restore-wallet
  Scenario: (IT-6) Restoring an empty wallet
    Then I click the "Restore Wallet" button
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
  Scenario: (IT-11) Fail to completely restore a wallet with addresses generated not following gap from BIP44 protocol
    Then I click the "Restore Wallet" button
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
    Then I click the "Restore Wallet" button
    Then I select 15-word wallet
    And I enter the recovery phrase, not clicking next:
      | recoveryPhrase                                                                             |
      | eight country switch draw meat scout mystery blade tip drift useless good keep usage usage |
    Then I delete recovery phrase by clicking "Clear all"

  @it-13 @restore-wallet
  Scenario: (IT-13) Mnemonic words can be cleared by deleting each word on wallet restoration screen
    Then I click the "Restore Wallet" button
    Then I select 15-word wallet
    And I enter the recovery phrase, not clicking next:
      | recoveryPhrase                                                                             |
      | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    Then I delete recovery phrase

  @it-26 @restore-wallet
  Scenario: (IT-26) Wallet can't be restored without entering password
    Then I click the "Restore Wallet" button
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
  Scenario Outline: (IT-70) Wallet restoration Recovery Phrase test
    Then I click the "Restore Wallet" button
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

  @it-73 @restore-wallet
  Scenario Outline: (IT-73) Wallet restoration Recovery Phrase with less than 15 words
    Then I click the "Restore Wallet" button
    Then I select 15-word wallet
    And I enter the recovery phrase, not clicking next:
      | recoveryPhrase   |
      | <recoveryPhrase> |
    Then I see the "Next" button is disabled
    And I should stay in the restore wallet dialog

    Examples:
      | recoveryPhrase                                                                                   |                 |
      | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow | 14-words phrase |

  @it-87 @restore-wallet
  Scenario: (IT-87) Ensure that wallet addresses are restored correctly
    Then I click the "Restore Wallet" button
    Then I select 15-word wallet
    And I enter the recovery phrase:
      | recoveryPhrase                                                                                        |
      | offer liberty horror emerge twice behind tag agree october dismiss vehicle obtain anchor endorse town |
    And I enter the restored wallet details:
      | walletName      | password     | repeatPassword |
      | Restored Wallet | asdfasdfasdf | asdfasdfasdf   |
    Then I should see a plate EKOZ-2975
    Then I click the "Restore" button
    Then I should see the opened wallet with name "Restored Wallet"
    Given There are 6 generated addresses
    And I go to the receive screen
    And I should see the addresses exactly list them
      | address                                                                                                 |
      | addr1qxj8k49qfq2kyrmmd4txql2qydnedpktp4t50333f05sa9xgwspvglncuydd5s5ljdzhlzdjtmqwcwls3pcmlcxmhlnq230arf |
      | addr1qxs4zjle0wpwf9cencjmkqqkehmvnyann7n9hnxvvll7cdkgwspvglncuydd5s5ljdzhlzdjtmqwcwls3pcmlcxmhlnqwww7j6 |
      | addr1qylzfcwny5a9nczjkpl3rpg6g4zcsztkkfxzq5utj5dxuy7gwspvglncuydd5s5ljdzhlzdjtmqwcwls3pcmlcxmhlnq4j7dha |
      | addr1qyvxdd2nzhqpuglmmkdkle7wz5mstl9jcwvs6cdasucvv0xgwspvglncuydd5s5ljdzhlzdjtmqwcwls3pcmlcxmhlnqmlrnmx |
      | addr1qxyr8tm03gzdwmfp37uyk6ay4xvlz0a6xkaafcam48xmvnxgwspvglncuydd5s5ljdzhlzdjtmqwcwls3pcmlcxmhlnq9wdpye |
      | addr1q8see75c59fjn4gcshvr0jm0mfsyw904djp2fpc8efte97wgwspvglncuydd5s5ljdzhlzdjtmqwcwls3pcmlcxmhlnqf6ldxq |

  @it-95 @restore-wallet
  Scenario: (IT-95) Restore & delete (1 wallet)
    Then I click the "Restore Wallet" button
    # wallet 1
    Then I select 15-word wallet
    And I enter the recovery phrase:
      | recoveryPhrase                                                                                   |
      | parrot offer switch thank film high drop salute task train squirrel coral consider coyote evolve |
    And I enter the restored wallet details:
      | walletName        | password     | repeatPassword |
      | shelley-delegated | asdfasdfasdf | asdfasdfasdf   |
    Then I should see a plate PALP-0076
    And I click the "Restore" button
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
    Given I sleep for 1000
    And Revamp. I should see the Create wallet screen

  @it-117 @restore-wallet
  Scenario: (IT-117) Switch wallets
    # wallet 1
    Given There is a Shelley wallet stored named many-tx-wallet
    # prep adding 2nd wallet
    And I click to add an additional wallet
    # wallet 2 (same as wallet 1)
    Given There is a Shelley wallet stored named small-single-tx
    Then I should see the opened wallet with name "small-single-tx"
    # switch to wallet #1
    Then I switch to "many-tx-wallet" from the dropdown
    Then I should see the opened wallet with name "many-tx-wallet"

  @it-133 @restore-wallet
  Scenario: (IT-133) Restoring a shelley 24-word wallet
    Then I click the "Restore Wallet" button
    Then I select 24-word wallet
    And I enter the recovery phrase:
      | recoveryPhrase                                                                                                                                                          |
      | reunion walnut update express purse defense slice barrel estate olympic february flock give team alert coast luggage exhaust notable bag december split furnace sponsor |
    And I enter the restored wallet details:
      | walletName      | password     | repeatPassword |
      | Restored Wallet | asdfasdfasdf | asdfasdfasdf   |
    And I should see a plate DSKC-9213
    Then I click the "Restore" button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
      | address                                                                                                 |
      | addr1qx9d2x5e9exhup6xlf5macv3c78qw66mru3tl7m3yn9je0qncaqpmszl9y4jl8vgqvhg6n3ad5td5m74fu4un65ayshqx479hd |
