Feature: Trezor wallet emulator

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @hw-trezor-001
  Scenario: Connect wallet
    Given I connected Trezor emulator device
    Then I should see the dashboard screen
    Then I should see a plate PXCA-2349
