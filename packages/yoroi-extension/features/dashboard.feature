
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
    And I see the deregistration for the transaction
    Then I should see on the Yoroi withdrawal transfer summary screen:
      | fromAddress                                                 | reward | fees     |
      | stake1u9tdkhx53zwggygdfh5scr2s8dgms3xm8ehas7v3ywyetwcufngyf | 5      | 0.173157 |
    And I enter the wallet password:
      | password     |
      | asdfasdfasdf |
    Given The expected transaction is "hKYAgYJYIDZ36Gx7ppmv3BzVfULyRvhvaa79dgJQBqx4MT+tK7ohAAGBglg5AfiMMmOcqBWRIjRN6CEig4T8YKJcOWtIDaUVnSFW21zUiJyEEQ1N6QwNUDtRuETbPm/YeZEjiZW7GgCV8hsCGgACpGUDGhH+lM0EgYIBggBYHFbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsFoVgd4VbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsaAExLQKEAgoJYIDHFsozgC4AMMNymh4uSd8Xls6VSRnf9Dxv6kiJPzsubWEAXpQuoGfhAzvgfp0H9ouqVNr4ZQPpQnFG9frwUkkyzA7dLIl1GmIuFbkJFMp3AakfKpXSZ9s+3dpaw9hYFkKgLglgg6cWNnhkPKitPspqy3T6+Lqi2VU1F/s8JE36FUprlBHBYQICDQmLn20i7qEzQSnFGhJv3Yp2qiAFF/6XxaqOeIvva6u/jxDYC/CFoA3UV4B6thf4QFJZ9owY9EsOhQuu14A319g=="
    When I confirm Yoroi transfer funds
    Then I should see the dashboard screen

  @it-156
  Scenario: User can withdraw Trezor rewards from the dashboard w/ deregister (IT-156)
    Given I connected Trezor device 6495958994A4025BB5EE1DB1
    When I select a Shelley-era Trezor device
    And I restore the Trezor device
    Then I should see the dashboard screen
    Then I should see a plate PALP-0076
    And I have a wallet with funds
    And I go to the dashboard screen
    When I click on the withdraw button
    Then I click on the checkbox
    And I click the next button
    And I see the deregistration for the transaction
    Then I should see on the Yoroi withdrawal transfer summary screen:
      | fromAddress                                                 | reward | fees     |
      | stake1u9tdkhx53zwggygdfh5scr2s8dgms3xm8ehas7v3ywyetwcufngyf | 5      | 0.173157 |
#    Given The expected transaction is "hKYAgYJYIDZ36Gx7ppmv3BzVfULyRvhvaa79dgJQBqx4MT+tK7ohAAGBglg5AfiMMmOcqBWRIjRN6CEig4T8YKJcOWtIDaUVnSFW21zUiJyEEQ1N6QwNUDtRuETbPm/YeZEjiZW7GgCV8hsCGgACpGUDGhH+lM0EgYIBggBYHFbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsFoVgd4VbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsaAExLQKEAgoJYIDHFsozgC4AMMNymh4uSd8Xls6VSRnf9Dxv6kiJPzsubWEAXpQuoGfhAzvgfp0H9ouqVNr4ZQPpQnFG9frwUkkyzA7dLIl1GmIuFbkJFMp3AakfKpXSZ9s+3dpaw9hYFkKgLglgg6cWNnhkPKitPspqy3T6+Lqi2VU1F/s8JE36FUprlBHBYQICDQmLn20i7qEzQSnFGhJv3Yp2qiAFF/6XxaqOeIvva6u/jxDYC/CFoA3UV4B6thf4QFJZ9owY9EsOhQuu14A319g=="
    When I confirm Yoroi transfer funds
    Then I should see the dashboard screen

  @it-157
  Scenario: User can withdraw Ledger rewards from the dashboard w/ deregister (IT-157)
    Given I connected Ledger device 707fa118bf6b84
    When I select a Shelley-era Ledger device
    And I restore the Ledger device
    Then I should see the dashboard screen
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
    Given The expected transaction is "g6YAgYJYIDZ36Gx7ppmv3BzVfULyRvhvaa79dgJQBqx4MT+tK7ohAAGBglg5AfiMMmOcqBWRIjRN6CEig4T8YKJcOWtIDaUVnSFW21zUiJyEEQ1N6QwNUDtRuETbPm/YeZEjiZW7GgCV8kcCGgACpDkDGhH+lM0EgYIBggBYHFbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsFoVgd4VbbXNSInIQRDU3pDA1QO1G4RNs+b9h5kSOJlbsaAExLQKEAgoJYIDHFsozgC4AMMNymh4uSd8Xls6VSRnf9Dxv6kiJPzsubWEAd3HanTLSyDKwCsumQcfnUVXaupHr7ozsqYR/GMEzFvF/099CFY8K8lbcr+RJbECvDCDucXXiqmgvsqvw11EYKglgg6cWNnhkPKitPspqy3T6+Lqi2VU1F/s8JE36FUprlBHBYQI/U3TR7lVdU73V2AUPVBA4kSbEwNv+S+HOjgakFxsp9AXTOI6JkNeSW2GyperZx1Zmpk0G6UMPLrgmtwcHUkQT2"
    When I confirm Yoroi transfer funds
    Then I should see the dashboard screen

  @it-166
  Scenario: Can unmangled from the dashboard (IT-166)
    Given There is a Shelley wallet stored named shelley-mangled
    And I have a wallet with funds
    And I go to the dashboard screen
    When I click on the unmangle warning
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |   
    | addr1q8sm64ehfue7m7xrlh2zfu4uj9tn3z3yrzfdaly52gs667qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhzdk70 | 10000000    |
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6QAgYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11FwGBglg5ATFf/lO+USTb83qMl8g53oV7XmMSuklF3gfHb8kex9YZS/n0WTCduT05oFTkplWcw+TU0UvasV/VGgCWEFsCGgAChiUDGhH+lM2hAIGCWCCxG2517QHEmTBkk1BC3zBriToLyq4PxNikr8LCc0V+jFhA0LkC9dcwcE8kORl7Oo4D4lql/IEmb+pFM9JXsKFjTXpKLIftor3/GXjnZRZh9TWkoQhBFisxgf65tR2Pfsq+AfY="
    When I confirm Yoroi transfer funds
    Then I should see the summary screen
    And I should see 1 pending transactions
