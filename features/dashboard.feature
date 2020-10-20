
Feature: Yoroi delegation dashboard

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    
  @it-155
  Scenario: User can withdraw rewards from the dashboard w/ deregister (IT-155)
    Given There is a Shelley wallet stored named shelley-delegated
    And I have a wallet with funds
    And I go to the dashboard screen
    Then I should rewards in the history
    When I click on the withdraw button
    Then I click on the checkbox
    And I click the next button
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1u9tdkhx53zwggygdfh5scr2s8dgms3xm8ehas7v3ywyetwcufngyf | 5000000    |
    And I see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6YAgYJYIDZ36Gx7ppmv3BzVfULyRvhvaa79dgJQBqx4MT+tK7ohAAGBglg5AfiMMmOcqBWRIjRN6CEig4T8YKJcOWtIDaUVnSFW21zUiJyEEQ1N6QwNUDtRuETbPm/YeZEjiZW7GgCV8ZcCGgACpOkDGhH+lM0EgYIBggBYHFbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsFoVgd4VbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsaAExLQKEAgoJYIDHFsozgC4AMMNymh4uSd8Xls6VSRnf9Dxv6kiJPzsubWEDeymxh6IEQKI51A9krNH9zkI8E6r+yQhyKpgVMn318UvFlJ7PWkEA/UN5ttCRe+/8lHy6Vl9Dhu4RBHZ47Mu0Hglgg6cWNnhkPKitPspqy3T6+Lqi2VU1F/s8JE36FUprlBHBYQCyphTpHmP5U443IIuVOntgb8KaXTjazElk9hm6GFMebbuNWYuv907Ci+JvN7kk9wbO0R6ZKcA9pEgbbmlBYrA32"
    When I confirm Yoroi transfer funds
    Then I should see the dashboard screen

  @it-156
  Scenario: User can withdraw Trezor rewards from the dashboard w/ deregister (IT-156)
    Given I connected Trezor device 6495958994A4025BB5EE1DB1
    When I select a Shelley-era Trezor device
    And I restore the Trezor device
    Then I should see the summary screen
    Then I should see a plate PALP-0076
    And I have a wallet with funds
    And I go to the dashboard screen
    When I click on the withdraw button
    Then I click on the checkbox
    And I click the next button
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1u9tdkhx53zwggygdfh5scr2s8dgms3xm8ehas7v3ywyetwcufngyf | 5000000    |
    And I see the deregistration for the transaction
    Given The expected transaction is "g6YAgYJYIDZ36Gx7ppmv3BzVfULyRvhvaa79dgJQBqx4MT+tK7ohAAGBglg5AfiMMmOcqBWRIjRN6CEig4T8YKJcOWtIDaUVnSFW21zUiJyEEQ1N6QwNUDtRuETbPm/YeZEjiZW7GgCV8ZcCGgACpOkDGhH+lM0EgYIBggBYHFbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsFoVgd4VbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsaAExLQKEAgoJYIDHFsozgC4AMMNymh4uSd8Xls6VSRnf9Dxv6kiJPzsubWEDeymxh6IEQKI51A9krNH9zkI8E6r+yQhyKpgVMn318UvFlJ7PWkEA/UN5ttCRe+/8lHy6Vl9Dhu4RBHZ47Mu0Hglgg6cWNnhkPKitPspqy3T6+Lqi2VU1F/s8JE36FUprlBHBYQCyphTpHmP5U443IIuVOntgb8KaXTjazElk9hm6GFMebbuNWYuv907Ci+JvN7kk9wbO0R6ZKcA9pEgbbmlBYrA32"
    When I confirm Yoroi transfer funds
    Then I should see the dashboard screen

  @it-157
  Scenario: User can withdraw Ledger rewards from the dashboard w/ deregister (IT-157)
    Given I connected Ledger device 707fa118bf6b84
    When I select a Shelley-era Ledger device
    And I restore the Ledger device
    Then I should see the summary screen
    Then I should see a plate DDBZ-0107
    And I have a wallet with funds
    And I go to the dashboard screen
    When I click on the withdraw button
    Then I click on the checkbox
    And I click the next button
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1u80tp0xvht8gv38vhwet36ulc7ntpeecp68sr86yxexaqcqnl9kg3 | 5000000    |
    And I see the deregistration for the transaction
    Given The expected transaction is "g6YAgYJYIDZ36Gx7ppmv3BzVfULyRvhvaa79dgJQBqx4MT+tK7ohAAGBglg5AfiMMmOcqBWRIjRN6CEig4T8YKJcOWtIDaUVnSFW21zUiJyEEQ1N6QwNUDtRuETbPm/YeZEjiZW7GgCV8ZcCGgACpOkDGhH+lM0EgYIBggBYHFbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsFoVgd4VbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsaAExLQKEAgoJYIDHFsozgC4AMMNymh4uSd8Xls6VSRnf9Dxv6kiJPzsubWEDeymxh6IEQKI51A9krNH9zkI8E6r+yQhyKpgVMn318UvFlJ7PWkEA/UN5ttCRe+/8lHy6Vl9Dhu4RBHZ47Mu0Hglgg6cWNnhkPKitPspqy3T6+Lqi2VU1F/s8JE36FUprlBHBYQCyphTpHmP5U443IIuVOntgb8KaXTjazElk9hm6GFMebbuNWYuv907Ci+JvN7kk9wbO0R6ZKcA9pEgbbmlBYrA32"
    When I confirm Yoroi transfer funds
    Then I should see the dashboard screen