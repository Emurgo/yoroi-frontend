Feature: Wallet UI Support

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    And I should see the Support button

@support-1
  Scenario: Contact Support successful
    When I click on Support button
    And I send a new Support request with text "Autotests. This is the test message from the extension."
    Then I see the message was sent to support
    And I check the email inbox for validation