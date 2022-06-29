Feature: Trezor wallet emulator

  Background:
    Given I have opened the extension
    And I have completed the basic setup

  @hw-trezor-001
  Scenario: Connect wallet
    Given I connected Trezor emulator device
