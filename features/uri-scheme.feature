Feature: URI scheme

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    And There is a wallet stored named empty-wallet

  @it-107
  Scenario: Ensure user can generate a wallet URI and copy it to clipboard (IT-107)
    When I go to the receive screen
    Then I should see the Receive screen
    When I click on "generate payment URL" button
    And I generate a URI for 10 ADA
    Then I should see the URI displayed in a new dialog
    When I click on the copy to clipboard icon
    Then I should see URI "copied" tooltip message:
    | message                                            |
    | global.copyTooltipMessage |

  @it-108
  Scenario: Ensure user can send a tx from a URI link (IT-108)
    When I open a cardano URI for address Ae2tdPwUPEZKmwoy3AU3cXb5Chnasj6mvVNxV1H11997q3VW5ihbSfQwGpm and 10 ADA
    Then I should see and accept a warning dialog
    Then I should see a dialog with the transaction details
    | address                                                     | amount |
    | Ae2tdPwUPEZKmwoy3AU3cXb5Chnasj6mvVNxV1H11997q3VW5ihbSfQwGpm | 10     |
    When I confirm the URI transaction details
    Then I should land on send wallet screen with prefilled parameters
    | address                                                     | amount     |
    | Ae2tdPwUPEZKmwoy3AU3cXb5Chnasj6mvVNxV1H11997q3VW5ihbSfQwGpm | 10.000000  |

  @it-109
  Scenario: Invalid URI leads user to warning dialog (IT-109)
    When I open an invalid cardano URI
    Then I should see an "invalid URI" dialog
