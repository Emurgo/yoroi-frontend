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
    | Ae2tdPwUPEZGLVbFwK5EnWiFxwWwLjVtV3CNzy7Hu7tB5nqFxS31uGjjhoc |

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
    | Ae2tdPwUPEZ7sn3AQhUFGHXiWuG5aU3XnMi2SNKeh94S9Pp17igo1RwzodB |
    | Ae2tdPwUPEZ73Nh3ALXKwtt9Wmb8bQHa9owoXtkvGEWK3AX6kXNHBK1D261 |

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
    | Ae2tdPwUPEYz5p78UtoKpzeQV8DMEHf8nM9TNJGu1xwF9ez26Zx26wupZ2v |
    | Ae2tdPwUPEZ7RZHyqo5P7LMcFny5PLpJJax9Xma8QqdTV5PeYeGwivdwGNq |
    | Ae2tdPwUPEZ5jDsa81F9tjv9QunxzBLsrV8XNjYdt5CdNtuAUKgroxTxZdP |
    | Ae2tdPwUPEYy4sHipF5wCMmFhsz9asT5HdEarYcguJimUnVebcTKnfViLak |
    | Ae2tdPwUPEZBdh5hX9QMWCeiihXf3onFAgx6KzKBtm7nj4wwyN8eoroTWqF |
    | Ae2tdPwUPEYzErSRwThtfVfBbhM87NCXDwkGHRqSYJcRVP4GS8Lgx3AxAXd |

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
    | Ae2tdPwUPEZLzYQaqFk1U9VWBeY9AfQ2hKBWZjxtfwWVE46sy6u5ZZAeFu1 |

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
