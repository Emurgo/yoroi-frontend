Feature: Transfer Daedalus Wallet

  Background:
    Given I have opened the chrome extension
    And I have completed the basic setup
    And I am testing "Transfer Daedalus Screen"

  Scenario: Go to the Create wallet screen
    Given I am on the Daedalus Transfer screen
    When I click on the create Icarus wallet button
    Then I should see the Create wallet screen

  Scenario: Go to the Receive screen
    Given There is a wallet stored named Test
    And I am on the Daedalus Transfer screen
    When I click on the go to the Receive screen button
    Then I should see the Receive screen

  Scenario: Transfer funds from Daedalus wallet
    Given There is a wallet stored named Test
    And I am on the Daedalus Transfer screen
    When I click on the transfer funds from Daedalus button
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster |