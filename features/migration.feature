Feature: Migration

  Background:
    Given I have opened the extension
    
  @it-83
  Scenario: Version set on first launch (IT-83)
    And I am on the language selection screen
    Then Last launch version is updated

    # refreshing language select page causes the language to be unset
    # to avoid this, move to next page
    Then I submit the language selection form
    And I am on the "Terms of use" screen

    Then I decrease last launch version
    # need to refresh to trigger migration (only happens on app load)
    Given I refresh the page

    # wait for refresh to finish
    Given I am on the "Terms of use" screen
    Then The Japanese language should be selected
    And Last launch version is updated
