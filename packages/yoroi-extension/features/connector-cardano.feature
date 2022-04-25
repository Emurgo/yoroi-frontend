@dApp
Feature: dApp connector data signing

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp

@dApp-1000
  Scenario: dApp can get balance (DAPP-1000)
    And I request anonymous access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    Then The dApp should see balance 5500000

@dApp-1001
  Scenario: dApp can sign Cardano transaction, anonymous wallet (DAPP-1001)
    And I request anonymous access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    Then I request signing the transaction:
    | amount | toAddress                                                                                               |
    | 3      | addr1q97xu8uvdgjpqum6sjv9vptzulkc53x7tk69vj2lynywxppq3e92djqml4tjxz2avcgem3u8z7r54yvysm20qasxx5gqyx8evw |
    Then I should see the connector popup
    And I should see the transaction amount data:
    | amount | fee      |
    | 3      | 0.168317 |
    And I should see the transaction addresses info:
    | fromAddress   | fromAddressAmount | toAddress     | toAddressAmount |
    | addr1...ajfkn | -5.5              | addr1...x8evw | 3               |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    Then The signing transaction API should return a10081825820cc9809944150c00f3913cd2b103e9b42fe6243fc36a76f9eb800692e2bda3f2e5840f601303c9cce7307e7aeac1b4c37f52758bf0ae8ba67dd1c1619d007aa4922a69e1516e1c4319d533ce4894ab16cd2de48a8c0e490e66470d9431fdee12ae207

@dApp-1002
  Scenario: dApp can sign Cardano transaction, request auth (DAPP-1002)
    And I request access to Yoroi
    Then I should see the connector popup
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    Then I request signing the transaction:
      | amount | toAddress                                                                                               |
      | 3      | addr1q97xu8uvdgjpqum6sjv9vptzulkc53x7tk69vj2lynywxppq3e92djqml4tjxz2avcgem3u8z7r54yvysm20qasxx5gqyx8evw |
    Then I should see the connector popup
    And I should see the transaction amount data:
      | amount | fee      |
      | 3      | 0.168317 |
    And I should see the transaction addresses info:
      | fromAddress   | fromAddressAmount | toAddress     | toAddressAmount |
      | addr1...ajfkn | -5.5              | addr1...x8evw | 3               |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    Then The signing transaction API should return a10081825820cc9809944150c00f3913cd2b103e9b42fe6243fc36a76f9eb800692e2bda3f2e5840f601303c9cce7307e7aeac1b4c37f52758bf0ae8ba67dd1c1619d007aa4922a69e1516e1c4319d533ce4894ab16cd2de48a8c0e490e66470d9431fdee12ae207
