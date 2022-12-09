
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
