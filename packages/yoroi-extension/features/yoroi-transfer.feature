Feature: Transfer Yoroi Wallet funds

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    And I switched to the advanced level
    Then I should see the Create wallet screen

  @it-114
  Scenario: Yoroi transfer fails when user transfers from an empty wallet (IT-114)
    Given There is a Byron wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the Byron 15-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | remind style lunch result accuse upgrade atom eight limit glance frequent eternal fashion borrow monster |
    And I proceed with the recovery
    Then I should see a plate XJOD-1073
    Then I click the next button
    Then I should see the Yoroi transfer error screen
  
  @it-111
  Scenario: User can transfer funds from another Yoroi wallet (IT-111)
    # The recovery phrase and its balance(s) are defined in 
    # /features/mock-chain/TestWallets.js and
    # /features/mock-chain/mockImporter.js
    Given There is a Byron wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the Byron 15-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | dragon mango general very inmate idea rabbit pencil element bleak term cart critic kite pill |
    And I proceed with the recovery
    Then I should see a plate EDAO-9229
    Then I click the next button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |   
    | Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV | 1234567898765    |
    Given The expected transaction is "g6QAgYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11AQGBglgrgtgYWCGDWBwoHaM1MYhgfLim8H41W1iW2HF0vHYAe5aqHlfRoAAaC5i61BsAAAEfcfib8AIaAAKKnQMaEf6UzaECgYRYIN55/74OwKqI0JZwK19fblZHm+7JEsg8OLft70zu5izcWEDAuojJWVNYQ6FC1IlHrP2WunBGRikOrUxIeyTbobos/wUiR2CQNaOAbnqeGMTQpp+41FA7+JApvvIwS5t6eOsFWCBrIXiD9bpMpYOCltkXhx8TKeoGjp/lukIOg9Xs/MUkKkGg9g=="
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen
    
  @it-112
  Scenario: Yoroi transfer should be disabled when user hasn't created a wallet (IT-112)
    And I am on the transfer start screen
    Then I should see the transfer screen disabled

  @it-113
  Scenario: Wallet changes after transaction is generated (IT-113)
    Given There is a Byron wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the Byron 15-word option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                            |
    | final autumn bacon fold horse scissors act pole country focus task blush basket move view |
    And I proceed with the recovery
    Then I should see a plate ZKTZ-4614
    Then I click the next button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount |   
    | Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr | 4      |
    | Ae2tdPwUPEYzkKjrqPw1GHUty25Cj5fWrBVsWxiQYCxfoe2d9iLjTnt34Aj | 1      |
    | Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3 | 820000 |
    | Ae2tdPwUPEZJZPsFg8w5bXA4brfu8peYy5prmrFiYPACb7DX64iiBY8WvHD | 820000 |
    | Ae2tdPwUPEZHG9AGUYWqFcM5zFn74qdEx2TqyZxuU68CQ33EBodWAVJ523w | 820000 |
    | Ae2tdPwUPEZ7VKG9jy6jJTxQCWNXoMeL2Airvzjv3dc3WCLhSBA7XbSMhKd | 650000 |
    Then A successful tx gets sent from my wallet from another client
    When I confirm Yoroi transfer funds
    Then I should see wallet changed notice
    And I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |
    | Ae2tdPwUPEZLcUx5AGMACPyLAuVXHisVyNBuiSk3Ru7qddYyn9ujDp1Ejwr | 4      |
    | Ae2tdPwUPEYzkKjrqPw1GHUty25Cj5fWrBVsWxiQYCxfoe2d9iLjTnt34Aj | 1      |
    | Ae2tdPwUPEZJZPsFg8w5bXA4brfu8peYy5prmrFiYPACb7DX64iiBY8WvHD | 820000 |
    | Ae2tdPwUPEZHG9AGUYWqFcM5zFn74qdEx2TqyZxuU68CQ33EBodWAVJ523w | 820000 |
    | Ae2tdPwUPEZ7VKG9jy6jJTxQCWNXoMeL2Airvzjv3dc3WCLhSBA7XbSMhKd | 650000 |
    Given The expected transaction is "g6QAiIJYILcTzA1jEGw4BrGnB3zDeilPzKDkefJqrGTlHgmugI11AIJYIGBJO/JuYLC5jxQ2R2E74uwcb1C9X8FaFKL/UY9fo2vgAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AIJYIAoHNmmEX+pK6DzUQYoLT9VmEAl6iWAagWtYkfZn40lsAIJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI1xAYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgmugI11AYJYIAoHNmmEX+pK6DzUQYoLT9VmEAl6iWAagWtYkfZn40lsAQGBglgrgtgYWCGDWBwoHaM1MYhgfLim8H41W1iW2HF0vHYAe5aqHlfRoAAaC5i61BoAH93oAhoAAxNtAxoR/pTNoQKFhFggXnGsSYUyhwTHwB1G9f7mkd9iHoKwNvA477DkhDTXmX5YQFrUhsiUMcRyhw6Uf/XRqPjhixUrVz92rwhXZHZSL5M4G/fgFzBOJLALQhRFFDkPr2Pdp0N1Oj666bs1wDg+4ARYIO23hdKX7dxt3V0Cchr8MLvy1UwjID2hIegQ0F2VF6vHQaCEWCCrz2wieKqlEL0JsQicx3naLrAb0qgH4COJ/AE3AZvCd1hAX1ZN6WNFs3O5VtOekVCE06XVhz718ICbIDvlSbk5pDEaMw9H0PFG3FtoS0DMo+sneAOPmYEaj/SrbpRqOsbrAlggXsJ5mvWuSD0y///s18T45fzDjpah0vqXB3erntI0INFBoIRYIOx7+AYOSniTUHVqDkzhtFF7b1HM/9BBkw6++m8Q+/SzWEAzoliU3eXhzZ2azuzPRtQ7zsxOvP4Wq8L272TXHVUkh1Hu/cJiPnvnUqBql5Q4Lj63dBCKKMNWVIBJgyJ8dwMFWCBWM2zqwExuk/gcTouvBpcmhtN2NEKb5aluF5K/hwZh2EGghFggzHvtZR+ntErMZIIgbq2uQ2B/jHt0TTIZ2j1JzMH2HTtYQESoTbBXvd+NWw8RLCeijbeiCyvo8diOudi+GxLwCslfIzps9cONpo4qiVvWp+/wDyNbm7035lnQBZoUtQMcdQBYIFiANkZLmGZ3Oe+LI3Q8iACb9dHcrlZN4L/sajTg+7+/QaCEWCC5TTZuZiJW+mD46uJ/IIwwoYvtsvdGnWfNR4HzHKY/BlhAA3+rED2TO7YnkQBoj1X7aiJ2Wz0QFxcpDe5dgo4oLYD/mKqsk0XsUmFzo7SG34OZCeN7nKHoBtFn8HDf7oCcAFggrsddVEovzNzpsw4Y3PHrjzmP9bkBd+LCRWEJPOQv66VBoPY="
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen

  @it-115
  Scenario: User can transfer funds from a trezor wallet (IT-115)
    Given There is a Byron wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the trezor option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | dragon mango general very inmate idea rabbit pencil element bleak term cart critic kite pill |
    And I proceed with the recovery
    Then I should see a plate EDAO-9229
    Then I click the next button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |
    | Ae2tdPwUPEYx2dK1AMzRN1GqNd2eY7GCd7Z6aikMPJL3EkqqugoFQComQnV | 1234567898765    |
    Given The expected transaction is "g6QAgYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11AQGBglgrgtgYWCGDWBwoHaM1MYhgfLim8H41W1iW2HF0vHYAe5aqHlfRoAAaC5i61BsAAAEfcfib8AIaAAKKnQMaEf6UzaECgYRYIN55/74OwKqI0JZwK19fblZHm+7JEsg8OLft70zu5izcWEDAuojJWVNYQ6FC1IlHrP2WunBGRikOrUxIeyTbobos/wUiR2CQNaOAbnqeGMTQpp+41FA7+JApvvIwS5t6eOsFWCBrIXiD9bpMpYOCltkXhx8TKeoGjp/lukIOg9Xs/MUkKkGg9g=="
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen

  @it-141
  Scenario: User can transfer funds from a ledger wallet (IT-141)
    Given There is a Byron wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the ledger option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art |
    And I proceed with the recovery
    Then I should see a plate JSKA-2258
    Then I click the next button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |
    | Ae2tdPwUPEYyHfxoQYGPhyHuAfLHKfLubzo4kxyw2XDnLsLmACtjufaBs33 | 1638497    |
    Given The expected transaction is "g6QAgYJYIBZt/eWxg7fglIOvu/zntB59b+00tAXMEEG0XyfosF1HAAGBglgrgtgYWCGDWBwoHaM1MYhgfLim8H41W1iW2HF0vHYAe5aqHlfRoAAaC5i61BoAFnZ0AhoAAontAxoR/pTNoQKBhFgg8elBZl4BQGla+Tli4OXssZO+OKu0a4uE90ZUlPqOjApYQCIaUi4RVqYE2XMDwYgShwXSGep65x8SEjkpAeAnfmALNjfQ3jNXB43Gr8gn8ga+F5YIcZe5Z0c5knITeHOzDQ1YINNT5ssGb8HUyAOT9k5hdlJG+NKzPSnWME87YabidYnjQaD2"
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen

  @it-82
  Scenario: User can transfer funds from another Yoroi paper wallet (IT-82)
    # The recovery phrase and its balance(s) are defined in 
    # /features/mock-chain/TestWallets.js and
    # /features/mock-chain/mockImporter.js
    Given There is a Byron wallet stored named empty-wallet
    And I am on the transfer start screen
    When I click on the byron button on the transfer screen
    When I click on the icarus tab
    Then I select the yoroi paper wallet option
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | mushroom expose slogan wagon uphold train absurd fix snake unable rescue curious escape member resource garbage enemy champion airport matrix year |
    And I enter the paper wallet password "cool password"
    And I proceed with the recovery
    Then I should see a plate KOTZ-1730
    Then I click the next button
    Then I should see on the Yoroi transfer summary screen:
    | fromAddress                                                 | amount           |   
    | Ae2tdPwUPEZ7TQpzbJZCbA5BjW4zWYFn47jKo43ouvfe4EABoCfvEjwYvJr | 2000000    |
    Given The expected transaction is "g6QAgYJYILcTzA1jEGw4BrWnB3zDeilPzKDkefJqrGTlHgSugI11CwGBglgrgtgYWCGDWBwoHaM1MYhgfLim8H41W1iW2HF0vHYAe5aqHlfRoAAaC5i61BoAG/qTAhoAAontAxoR/pTNoQKBhFgg18n9dDSQAQOaCZv45nr6Siugpa1UECrB4PoeJf11D51YQGW1xr8X1ZlQUInliQFbAZkysvSOUyc6DfeeckohKXXhNfCYtusb4mJL3v6xEbqmhRR4jpodgrZQSEjWX/L8IAtYIHos8jfmh7thEmh9Z4iWlGgVLpvfY779btjkhmBoW8dQQaD2"
    When I confirm Yoroi transfer funds
    Then I should see the Yoroi transfer success screen

  @it-146
  Scenario: User can claim Shelley rewards w/ deregister (IT-146)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the Shelley 15-word option
    Then I accept the prompt
    Then I click on the checkbox
    And I click the next button
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    And I proceed with the recovery
    Then I should see a plate ZDDC-9858
    Then I click the next button
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1ux2436tfe25727kul3qtnyr7k72rvw6ep7h59ll53suwhzq05v5j9 | 5000000    |
    And I see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6YAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgC8F+cCGgACpDkDGhH+lM0EgYIBggBYHJVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gFoVgd4ZVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gaAExLQKEAgoJYIMyYCZRBUMAPORPNKxA+m0L+YkP8NqdvnrgAaS4r2j8uWECS1+tbK3tpoKvXsIOw2gRb4KpSKTzXTj/mWzq/mfraAIY9AM0NgLHfEiI1oXY27NRXdvGkZ+xAX/U8MUQk/vAJglggYWJ2UyDJOtPILMKLlXi+MaeR8Do33K4FY0PMJbvLOzFYQE8XIDQhaNToTahlPCrgcUtxhfNt0aJ5Z6vsLe5kiPv3jdQhJ6ckiiW2d/s0iX93PfkYFicBfu2qN6nHTB5YAQ72"
    When I confirm Yoroi transfer funds
    Then I should see the summary screen

  @it-147
  Scenario: User can claim Shelley rewards w/ keep (IT-147)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the Shelley 15-word option
    Then I accept the prompt
    Then I keep the staking key
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | eight country switch draw meat scout mystery blade tip drift useless good keep usage title |
    And I proceed with the recovery
    Then I should see a plate ZDDC-9858
    Then I click the next button
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1ux2436tfe25727kul3qtnyr7k72rvw6ep7h59ll53suwhzq05v5j9 | 5000000    |
    And I do not see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6UAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgCdmZcCGgACngkDGhH+lM0FoVgd4ZVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gaAExLQKEAgoJYIMyYCZRBUMAPORPNKxA+m0L+YkP8NqdvnrgAaS4r2j8uWEDrHc3MU1A1Ld4wBuDlQNaLHjLyslTryHo17+6pwBijc5gHDsZdpGdHlAJ4sYEU5xhtEWcdKZJ47S/5SbW+IewEglggYWJ2UyDJOtPILMKLlXi+MaeR8Do33K4FY0PMJbvLOzFYQKgMvF2J23ta3vQDlNyQNe88f4uwUUauI8MVy5gViMXrw7Z8Oe4csDRFhMvxnpRLWRtPJ+z8j2/rL+MvY3BtAQ32"
    When I confirm Yoroi transfer funds
    Then I should see the summary screen

  @it-150
  Scenario: User can claim Shelley rewards w/ unencrypted root key (IT-150)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the private key option
    Then I accept the prompt
    Then I keep the staking key
    Given I enter the key "c065afd2832cd8b087c4d9ab7011f481ee1e0721e78ea5dd609f3ab3f156d245d176bd8fd4ec60b4731c3918a2a72a0226c0cd119ec35b47e4d55884667f552a23f7fdcd4a10c6cd2c7393ac61d877873e248f417634aa3d812af327ffe9d620"
    # And I enter the decryption password
    And I proceed with the recovery
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1ux2436tfe25727kul3qtnyr7k72rvw6ep7h59ll53suwhzq05v5j9 | 5000000    |
    And I do not see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6UAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgCdmZcCGgACngkDGhH+lM0FoVgd4ZVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gaAExLQKEAgoJYIMyYCZRBUMAPORPNKxA+m0L+YkP8NqdvnrgAaS4r2j8uWEDrHc3MU1A1Ld4wBuDlQNaLHjLyslTryHo17+6pwBijc5gHDsZdpGdHlAJ4sYEU5xhtEWcdKZJ47S/5SbW+IewEglggYWJ2UyDJOtPILMKLlXi+MaeR8Do33K4FY0PMJbvLOzFYQKgMvF2J23ta3vQDlNyQNe88f4uwUUauI8MVy5gViMXrw7Z8Oe4csDRFhMvxnpRLWRtPJ+z8j2/rL+MvY3BtAQ32"
    When I confirm Yoroi transfer funds
    Then I should see the summary screen

  @it-151
  Scenario: User can claim Shelley rewards w/ encrypted root key (IT-151)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the private key option
    Then I accept the prompt
    Then I keep the staking key
    Given I enter the key "ea8241c2cc3de36d6f4d297332b2859f13335872ea7dae1638ecae1df7bcc211f658c9fa1673241800714e24681bd11e625a332ecb6bd8db06c941c3b0f3cc43c84bb7ce44bcf3c0069e7bdc62aa4154cd93d5313af4fd2a51d95fa4861fcb193f9ccf411e282569e72ace40d2a8f666c4ce692930863a53a1222173a82b71ef63adb5a75cad388edff07d41e059b7458e09d1e596edd48d4c86d40f"
    And I enter the decryption password "asdfasdfasdf"
    And I proceed with the recovery
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1ux2436tfe25727kul3qtnyr7k72rvw6ep7h59ll53suwhzq05v5j9 | 5000000    |
    And I do not see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6UAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgCdmZcCGgACngkDGhH+lM0FoVgd4ZVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gaAExLQKEAgoJYIMyYCZRBUMAPORPNKxA+m0L+YkP8NqdvnrgAaS4r2j8uWEDrHc3MU1A1Ld4wBuDlQNaLHjLyslTryHo17+6pwBijc5gHDsZdpGdHlAJ4sYEU5xhtEWcdKZJ47S/5SbW+IewEglggYWJ2UyDJOtPILMKLlXi+MaeR8Do33K4FY0PMJbvLOzFYQKgMvF2J23ta3vQDlNyQNe88f4uwUUauI8MVy5gViMXrw7Z8Oe4csDRFhMvxnpRLWRtPJ+z8j2/rL+MvY3BtAQ32"
    When I confirm Yoroi transfer funds
    Then I should see the summary screen

  @it-152
  Scenario: User can claim Shelley rewards w/ unencrypted staking key (IT-152)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the private key option
    Then I accept the prompt
    Then I keep the staking key
    Given I enter the key "f874f575cb9b7dabfd5487e9151c759fffc66d6915f86f8b08a4e21f0957d245cd81a43dc6716e6d7fd574b31e7e91c1b3a6968e4aa69e880712f196500a2713"
    # And I enter the decryption password "asdfasdfasdf"
    And I proceed with the recovery
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1ux2436tfe25727kul3qtnyr7k72rvw6ep7h59ll53suwhzq05v5j9 | 5000000    |
    And I do not see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6UAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgCdmZcCGgACngkDGhH+lM0FoVgd4ZVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gaAExLQKEAgoJYIMyYCZRBUMAPORPNKxA+m0L+YkP8NqdvnrgAaS4r2j8uWEDrHc3MU1A1Ld4wBuDlQNaLHjLyslTryHo17+6pwBijc5gHDsZdpGdHlAJ4sYEU5xhtEWcdKZJ47S/5SbW+IewEglggYWJ2UyDJOtPILMKLlXi+MaeR8Do33K4FY0PMJbvLOzFYQKgMvF2J23ta3vQDlNyQNe88f4uwUUauI8MVy5gViMXrw7Z8Oe4csDRFhMvxnpRLWRtPJ+z8j2/rL+MvY3BtAQ32"
    When I confirm Yoroi transfer funds
    Then I should see the summary screen

  @it-153
  Scenario: User can claim Shelley rewards w/ encrypted staking key (IT-153)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the private key option
    Then I accept the prompt
    Then I keep the staking key
    Given I enter the key "2bdf5cef8eda749f705f18607adbc3ff8e5d0b5bcd92513108b9006370ccaff67fbc9935dfe2deeb8e9a445476150990c526f5d1a653bb323c1d4e309fbcaadbfa0bb19cbeaf36cdc940df1249713d7037654689d16bf3b3b681d66fa8398d954124185fb51f5cbac9530df068b29ebe59936d5e07a2595f092c16ad"
    And I enter the decryption password "asdfasdfasdf"
    And I proceed with the recovery
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1ux2436tfe25727kul3qtnyr7k72rvw6ep7h59ll53suwhzq05v5j9 | 5000000    |
    And I do not see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6UAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgCdmZcCGgACngkDGhH+lM0FoVgd4ZVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gaAExLQKEAgoJYIMyYCZRBUMAPORPNKxA+m0L+YkP8NqdvnrgAaS4r2j8uWEDrHc3MU1A1Ld4wBuDlQNaLHjLyslTryHo17+6pwBijc5gHDsZdpGdHlAJ4sYEU5xhtEWcdKZJ47S/5SbW+IewEglggYWJ2UyDJOtPILMKLlXi+MaeR8Do33K4FY0PMJbvLOzFYQKgMvF2J23ta3vQDlNyQNe88f4uwUUauI8MVy5gViMXrw7Z8Oe4csDRFhMvxnpRLWRtPJ+z8j2/rL+MvY3BtAQ32"
    When I confirm Yoroi transfer funds
    Then I should see the summary screen

  @it-154
  Scenario: User can claim Shelley rewards w/ paper wallet (IT-154)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the Shelley paper wallet option
    Then I accept the prompt
    Then I keep the staking key
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | insane shaft lava open minute kitten record oil discover capital slogan room crane child happy join razor company nephew usage air |
    And I enter the paper wallet password "paper-password"
    And I proceed with the recovery
    Then I should see a plate ZDDC-9858
    Then I click the next button
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1ux2436tfe25727kul3qtnyr7k72rvw6ep7h59ll53suwhzq05v5j9 | 5000000    |
    And I do not see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6UAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgCdmZcCGgACngkDGhH+lM0FoVgd4ZVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gaAExLQKEAgoJYIMyYCZRBUMAPORPNKxA+m0L+YkP8NqdvnrgAaS4r2j8uWEDrHc3MU1A1Ld4wBuDlQNaLHjLyslTryHo17+6pwBijc5gHDsZdpGdHlAJ4sYEU5xhtEWcdKZJ47S/5SbW+IewEglggYWJ2UyDJOtPILMKLlXi+MaeR8Do33K4FY0PMJbvLOzFYQKgMvF2J23ta3vQDlNyQNe88f4uwUUauI8MVy5gViMXrw7Z8Oe4csDRFhMvxnpRLWRtPJ+z8j2/rL+MvY3BtAQ32"
    When I confirm Yoroi transfer funds
    Then I should see the summary screen

  @it-158
  Scenario: Claiming Shelley rewards fails if no rewards and unregistered (IT-158)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the Shelley 15-word option
    Then I accept the prompt
    Then I keep the staking key
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | cup casino sign casual north still envelope rack avocado sadness motor problem lunar east monitor |
    And I proceed with the recovery
    Then I should see a plate TNHH-3713
    Then I click the next button
    Then I should see the Yoroi transfer error screen

  @it-159
  Scenario: Claiming Shelley rewards fails if no rewards but registered w/ keep (IT-159)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the Shelley 15-word option
    Then I accept the prompt
    Then I keep the staking key
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | pig organ result afraid abstract arrest brass kangaroo hub cube crunch return vibrant core make |
    And I proceed with the recovery
    Then I should see a plate TDDO-4310
    Then I click the next button
    Then I should see the Yoroi transfer error screen

  @it-160
  Scenario: Claiming Shelley rewards fails if no rewards but registered w/ deregister (IT-160)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I am on the transfer start screen
    When I click on the shelley button on the transfer screen
    Then I select the Shelley 15-word option
    Then I accept the prompt
    Then I click on the checkbox
    And I click the next button
    And I enter the recovery phrase:
    | recoveryPhrase                                                                                           |
    | pig organ result afraid abstract arrest brass kangaroo hub cube crunch return vibrant core make |
    And I proceed with the recovery
    Then I should see a plate TDDO-4310
    Then I click the next button
    And I see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6UAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgBv0y8CGgACnbEDGhH+lM0EgYIBggBYHHVsMspvo8GlXypDW5P6AAkVsR41Lg4sbWgEAFShAIKCWCDMmAmUQVDADzkTzSsQPptC/mJD/Danb564AGkuK9o/LlhAX7Ac7du9tpQs/zExXmDd3Tbb8O7P14P+KHUUkFvi3fCkdcawCvmhDCVRaqc5WnxndOp/2o+WKUikmvu73xoPCIJYIPOlcWS3t2uMM0elCy5Y8VhUv0SFmwE0b4nY9XZQ10F2WEBPr5pZpIE01H1wshcmhhtGB5zwfnrqdv+e78pxRtgS2IIe+wGCoSqJ2xgrifzSxSSvhtqnCYvi/7zZq2ZcaP4J9g=="
    When I confirm Yoroi transfer funds
    Then I should see the summary screen