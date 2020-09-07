
Feature: Yoroi delegation dashboard

  Background:
    Given I have opened the extension
    And I have completed the basic setup
    Then I should see the Create wallet screen
    
  @it-155
  Scenario: User can withdraw rewards from the dashboard w/ deregister (IT-155)
    Given There is a Shelley wallet stored named shelley-simple-15
    And I have a wallet with funds
    And I go to the dashboard screen

    Then I click on the checkbox
    And I click the next button
    Then I should see on the Yoroi withdrawal transfer summary screen:
    | fromAddress                                                | amount           |
    | stake1ux2436tfe25727kul3qtnyr7k72rvw6ep7h59ll53suwhzq05v5j9 | 5000000    |
    And I see the deregistration for the transaction
    And I enter the wallet password:
      | password   |
      | asdfasdfasdf |
    Given The expected transaction is "g6YAgYJYIDZ351x7ppm/3GzVfULyRvhvY679dgJQBqx4MT+tK7ohAQGBglg5Aceyi86pDUQLVFWmoConylm4aW8Gf8GWf0f5M+eVWOlpyqnletz8QLmQfreUNjtZD69C//SMOOuIGgC8FzcCGgACpOkDGhH+lM0EgYIBggBYHJVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gFoVgd4ZVY6WnKqeV63PxAuZB+t5Q2O1kPr0L/9Iw464gaAExLQKEAgoJYIMyYCZRBUMAPORPNKxA+m0L+YkP8NqdvnrgAaS4r2j8uWEB+/T0K3fmSzX6Flv7+EqQHqgh9Qy+bd89jrnq8kroN9RKb1Q8UyaAXuaAjKobtTPEHP0GAzZG93zv1/YKk+9IOglggYWJ2UyDJOtPILMKLlXi+MaeR8Do33K4FY0PMJbvLOzFYQG97rxjHKgHC5jQI7STQogD1onSv3m4steJANSWOsgRskvt9J2q2fVpUXJ7AOBteJfKM679/ru7Kj0LtIhR8qwf2"
    When I confirm Yoroi transfer funds
    Then I should see the summary screen