Feature: Wallet UI FAQ

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    And I should see the FAQ button

@faq-1
  Scenario: Press FAQ button
    When I click on FAQ button
    Then I should see a new tab opened with address https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi

