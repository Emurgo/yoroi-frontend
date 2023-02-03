@dApp
Feature: dApp connector get collateral

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    
    
  @dApp-1023
  Scenario: dApp, anonymous wallet, get collateral (DAPP-1023)
    Given There is a Shelley wallet stored named shelley-collateral
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-collateral with 2 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-collateral is connected to the website localhost
    Then The dApp should see collateral: {"utxo_id":"021657dfc7f9e33d0ca9cb33b0487138d2f74286e9e00f19946f27e9a8c6f6071","tx_hash":"021657dfc7f9e33d0ca9cb33b0487138d2f74286e9e00f19946f27e9a8c6f607","tx_index":1,"receiver":"addr1q9nv4vttp9f00pttk2unp4jhprd67sgffkg9ak0sawvxa68vfz8ymjd9j2vdea8088ut8jpx4c6tr08dwuzs07leyrtsuc6l06","amount":"1000000","assets":[]} for 1000000

  @dApp-1024
  Scenario: dApp, authorized wallet, get collateral (DAPP-1024)
    Given There is a Shelley wallet stored named shelley-collateral
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab
    And I request access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-collateral with 2 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-collateral is connected to the website localhost
    Then The dApp should see collateral: {"utxo_id":"021657dfc7f9e33d0ca9cb33b0487138d2f74286e9e00f19946f27e9a8c6f6071","tx_hash":"021657dfc7f9e33d0ca9cb33b0487138d2f74286e9e00f19946f27e9a8c6f607","tx_index":1,"receiver":"addr1q9nv4vttp9f00pttk2unp4jhprd67sgffkg9ak0sawvxa68vfz8ymjd9j2vdea8088ut8jpx4c6tr08dwuzs07leyrtsuc6l06","amount":"1000000","assets":[]} for 1000000

  @dApp-1025
  Scenario: dApp, authorized wallet, get collateral, connector popup (DAPP-1025)
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab
    And I request access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I ask to get Collateral for 1 ADA
    Then I should see the connector popup to Add Collateral with fee info
      | fee   |
      | 0.171177 |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    Then The dApp should receive collateral
      | amount  | receiver |
      | 1000000 | addr1qy245684mdhpwzs0p37jz8pymn5g9v37rqjy78c59f06xau4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqdqef6t |

  @dApp-1026
  Scenario: dApp, anonymous wallet, get collateral, connector popup (DAPP-1026)
    Given There is a Shelley wallet stored named shelley-simple-15
    Then Revamp. I switch to revamp version
    Then I open the mock dApp tab
    And I request anonymous access to Yoroi
    Then I should see the connector popup for connection
    And I select the only wallet named shelley-simple-15 with 5.5 balance
    Then The popup window should be closed
    And The access request should succeed
    And The wallet shelley-simple-15 is connected to the website localhost
    Then I ask to get Collateral for 1 ADA
    Then I should see the connector popup to Add Collateral with fee info
      | fee   |
      | 0.171177 |
    Then I enter the spending password asdfasdfasdf and click confirm
    Then The popup window should be closed
    Then The dApp should receive collateral
      | amount  | receiver |
      | 1000000 | addr1qy245684mdhpwzs0p37jz8pymn5g9v37rqjy78c59f06xau4tr5knj4fu4adelzqhxg8adu5xca4jra0gtllfrpcawyqdqef6t |