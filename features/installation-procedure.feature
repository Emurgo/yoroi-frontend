Feature: Installation procedure

  @it-98
  Scenario: User Selects Language at first launch (IT-98)
    Given I have opened the extension
    And I am on the language selection screen
    And I open language selection dropdown
    And I select Japanese language
    When I submit the language selection form
    Then I should not see the language selection screen anymore
    And I should have Japanese language set

  @it-51
  Scenario: Terms of Use are not accepted if user didn’t confirm it and close/reload the browser page (IT-51)
    Given I have opened the extension
    And I have selected English language
    Given I am on the "Terms of use" screen
    When I refresh the page
    And I click on "I agree with the terms of use" checkbox
    When I submit the "Terms of use" form
    Then I should not see the "Terms of use" screen anymore
    And I should have "Terms of use" accepted