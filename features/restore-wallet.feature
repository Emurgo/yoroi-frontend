Feature: Restore Wallet

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Restore wallet"
    And There is no wallet stored

  Scenario: Successfully restoring an empty wallet
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                             |
    | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    And I enter the restored wallet password:
    | password  | repeatedPassword |
    | Secret123 | Secret123        |
    And I click the "Restore Wallet" button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZL9umCSr3hxiV9ETByJQDne3u6tHKd4cec9hyvkYLoFkX6KBQ |

  Scenario: Successfully restoring a simple wallet
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                   |
    | shoe rose battle fine shoulder address kite coffee jaguar proof practice area party sphere train |
    And I enter the restored wallet password:
    | password  | repeatedPassword |
    | Secret123 | Secret123        |
    And I click the "Restore Wallet" button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEYyiwxP7APP28UotYKobqvRt5XjnAKRLPD5WXeKXAmsiz8gbyF |
    | Ae2tdPwUPEYxj1a3XxQmUcN2gmv5CZdLcVzRCDLHewBthv4HtYbY4Uxoq9X |

  Scenario: Successfully restoring a complex wallet
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                        |
    | offer liberty horror emerge twice behind tag agree october dismiss vehicle obtain anchor endorse town |
    And I enter the restored wallet password:
    | password  | repeatedPassword |
    | Secret123 | Secret123        |
    And I click the "Restore Wallet" button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZ3Wm1NkX2L8aGTrcSABn4Zn5n1DFRKqA7Zt3B1j1UmCqFY1fd |
    | Ae2tdPwUPEZF1ZWG6Yot71VMxEyvX13zmeH1m78dp63Z3fxzogJfvCLXg9g |
    | Ae2tdPwUPEZ6f5E7UZ5Ke28CRZjv5VnAX1NBhedwVLdmuyamUt4E7oPBsJw |
    | Ae2tdPwUPEZMkq24yQkF1fVvvCq4dHLqagiubgivBcTzWHxZzWTN6wPFMsy |

  Scenario: Fail to completely restore a wallet with wrongly generated addresses
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                 |
    | grace saddle snake vocal amateur coin inside ginger leopard place liar patrol usual joy around |
    And I enter the restored wallet password:
    | password  | repeatedPassword |
    | Secret123 | Secret123        |
    And I click the "Restore Wallet" button
    Then I should see the opened wallet with name "Restored Wallet"
    And I go to the receive screen
    And I should see the addresses exactly list them
    | address                                                     |
    | Ae2tdPwUPEZ4GbKB9wjsEeCtsfct2Q8shuh4rEB8VDHatJ1KXWT2FcbSW6i |

  Scenario: Fail to restore a Daedalus wallet
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                 |
    | forum salon region tent laugh agree spirit share damage observe captain suffer |
    And I enter the restored wallet password:
    | password  | repeatedPassword |
    | Secret123 | Secret123        |
    And I click the "Restore Wallet" button
    Then I should see an "Invalid recovery phrase" error message

  Scenario: Fail to restore due to incomplete fields
    When I click the restore button
    And I enter the name "Restored Wallet"
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster |
    And I enter the restored wallet password:
    | password  | repeatedPassword |
    | Secret123 | Secret123        |
    And I clear the name "Restored Wallet"
    And I clear the recovery phrase
    And I clear the restored wallet password Secret123
    And I click the "Restore Wallet" button
    Then I should stay in the restore wallet dialog
